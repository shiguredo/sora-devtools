import { expect, test } from "@playwright/test";

import { requireSoraConnectionEnv } from "./helpers/env.ts";
import {
  awaitSessionDatabaseReady,
  callDeleteSession,
  callResetSessionDatabase,
  cleanupSessionDatabase,
  countMessageRows,
  listConnectionRows,
  listSessionRows,
  listWebrtcStatsRows,
  waitForEndedAt,
  waitForWebrtcStats,
} from "./helpers/sessionDatabase.ts";
import { DevtoolsPage } from "./pages/DevtoolsPage.ts";

// OPFS 上の DB ファイルはオリジン共有のため、永続化テスト同士の並列実行を禁止する
test.describe.configure({ mode: "serial" });

test.describe("session database persistence", () => {
  test.beforeEach(async ({ page }) => {
    // 前テストの残骸を消してから開始する
    await cleanupSessionDatabase(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupSessionDatabase(page);
  });

  test("接続確立後に sessions / connections が保存され切断で ended_at が埋まる", async ({
    page,
  }) => {
    // 必須環境変数を取得する。未設定なら Error を throw してテストを失敗させる
    const env = requireSoraConnectionEnv();
    const channelId = `${env.channelIdPrefix}session-db-persist`;

    const devtools = new DevtoolsPage(page);
    await devtools.navigate({
      role: "sendrecv",
      channelId,
      signalingUrlCandidates: [env.signalingUrl],
      accessToken: env.accessToken,
      videoCodecType: "VP9",
    });

    // 未初期化 no-op によるフレークを防ぐ
    await awaitSessionDatabaseReady(page);

    await devtools.connect();
    await devtools.waitForConnection();
    const connectionId = await devtools.getConnectionId();
    expect(connectionId).toBeTruthy();
    if (!connectionId) {
      return;
    }

    await page.waitForTimeout(1000);
    await devtools.disconnect();

    // close が書き込みキューを待ってから読むため、ended_at 反映をポーリングする
    const { session: latestSession, connection: latestConnection } = await waitForEndedAt(page, {
      connectionId,
    });

    expect(latestSession.channel_id).toBe(channelId);
    expect(latestSession.role).toBe("sendrecv");
    expect(latestSession.session_id).toBeTruthy();
    expect(latestSession.connection_id).toBe(connectionId);
    expect(latestSession.ended_at).toBeTruthy();

    expect(latestConnection.session_db_id).toBe(latestSession.id);
    expect(latestConnection.connection_id).toBe(connectionId);
    expect(latestConnection.ended_at).toBeTruthy();
  });

  test("リロード後も sessions / connections が残る", async ({ page }) => {
    const env = requireSoraConnectionEnv();
    const channelId = `${env.channelIdPrefix}session-db-reload`;

    const devtools = new DevtoolsPage(page);
    await devtools.navigate({
      role: "sendrecv",
      channelId,
      signalingUrlCandidates: [env.signalingUrl],
      accessToken: env.accessToken,
      videoCodecType: "VP9",
    });
    await awaitSessionDatabaseReady(page);
    await devtools.connect();
    await devtools.waitForConnection();
    const connectionId = await devtools.getConnectionId();
    expect(connectionId).toBeTruthy();
    if (!connectionId) {
      return;
    }
    await page.waitForTimeout(1000);
    await devtools.disconnect();
    await waitForEndedAt(page, { connectionId });

    // リロード前に件数を控えるため一度読む（close される）
    const beforeReload = await listSessionRows(page);
    expect(beforeReload.length).toBeGreaterThanOrEqual(1);

    // ページを開き直す（createSessionDatabase が再実行される）
    await devtools.navigate({
      role: "sendrecv",
      channelId,
      signalingUrlCandidates: [env.signalingUrl],
      accessToken: env.accessToken,
      videoCodecType: "VP9",
    });
    await awaitSessionDatabaseReady(page);

    const afterReload = await listSessionRows(page);
    expect(afterReload.length).toBeGreaterThanOrEqual(beforeReload.length);
    const matched = afterReload.find((row) => row.connection_id === connectionId);
    expect(matched).toBeDefined();
  });

  test("同一 channelId の複数接続試行が複数 sessions 行になる", async ({ page }) => {
    const env = requireSoraConnectionEnv();
    const channelId = `${env.channelIdPrefix}session-db-multi`;

    const devtools = new DevtoolsPage(page);
    await devtools.navigate({
      role: "sendrecv",
      channelId,
      signalingUrlCandidates: [env.signalingUrl],
      accessToken: env.accessToken,
      videoCodecType: "VP9",
    });
    await awaitSessionDatabaseReady(page);

    await devtools.connect();
    await devtools.waitForConnection();
    const firstConnectionId = await devtools.getConnectionId();
    expect(firstConnectionId).toBeTruthy();
    if (!firstConnectionId) {
      return;
    }
    await page.waitForTimeout(500);
    await devtools.disconnect();
    await waitForEndedAt(page, { connectionId: firstConnectionId });

    await devtools.connect();
    await devtools.waitForConnection();
    const secondConnectionId = await devtools.getConnectionId();
    expect(secondConnectionId).toBeTruthy();
    if (!secondConnectionId) {
      return;
    }
    await page.waitForTimeout(500);
    await devtools.disconnect();
    await waitForEndedAt(page, { connectionId: secondConnectionId });

    const sessions = await listSessionRows(page);
    const sameChannel = sessions.filter((row) => row.channel_id === channelId);
    expect(sameChannel.length).toBeGreaterThanOrEqual(2);
  });

  test("reconnecting 中の disconnectSora で sessions.ended_at が更新される", async ({ page }) => {
    const env = requireSoraConnectionEnv();
    const channelId = `${env.channelIdPrefix}session-db-reconnect-stop`;

    const devtools = new DevtoolsPage(page);
    await devtools.navigate({
      role: "sendrecv",
      channelId,
      signalingUrlCandidates: [env.signalingUrl],
      accessToken: env.accessToken,
      videoCodecType: "VP9",
    });
    await awaitSessionDatabaseReady(page);
    await devtools.connect();
    await devtools.waitForConnection();
    const connectionId = await devtools.getConnectionId();
    expect(connectionId).toBeTruthy();
    if (!connectionId) {
      return;
    }
    await page.waitForTimeout(1000);

    // リトライ中を模擬して disconnectSora 明示パスを検証する
    await page.evaluate(async () => {
      const signalsUrl = "/src/app/signals.ts";
      const actionsUrl = "/src/app/actions.ts";
      const signalsLoaded: unknown = await import(/* @vite-ignore */ signalsUrl);
      const actionsLoaded: unknown = await import(/* @vite-ignore */ actionsUrl);
      const signals = signalsLoaded as {
        setSoraReconnecting: (value: boolean) => void;
      };
      const actions = actionsLoaded as {
        disconnectSora: () => Promise<void>;
      };
      signals.setSoraReconnecting(true);
      await actions.disconnectSora();
    });

    const { session: latest } = await waitForEndedAt(page, { connectionId });
    expect(latest.channel_id).toBe(channelId);
    expect(latest.ended_at).toBeTruthy();
  });

  test("deleteSession は関連 connections / webrtc_stats を消し current は拒否する", async ({
    page,
  }) => {
    const env = requireSoraConnectionEnv();
    const channelId = `${env.channelIdPrefix}session-db-delete`;

    const first = await (async () => {
      const devtools = new DevtoolsPage(page);
      await devtools.navigate({
        role: "sendrecv",
        channelId,
        signalingUrlCandidates: [env.signalingUrl],
        accessToken: env.accessToken,
        videoCodecType: "VP9",
      });
      await awaitSessionDatabaseReady(page);
      await devtools.connect();
      await devtools.waitForConnection();
      const connectionId = await devtools.getConnectionId();
      expect(connectionId).toBeTruthy();
      if (!connectionId) {
        throw new Error("expected non-empty connection ID");
      }
      await page.waitForTimeout(1500);
      await devtools.disconnect();
      const ended = await waitForEndedAt(page, { connectionId });
      await waitForWebrtcStats(page, {
        connectionId,
        sessionDbId: ended.session.id,
        channelId,
        minCount: 1,
      });
      return ended.session.id;
    })();

    const second = await (async () => {
      const devtools = new DevtoolsPage(page);
      await devtools.navigate({
        role: "sendrecv",
        channelId,
        signalingUrlCandidates: [env.signalingUrl],
        accessToken: env.accessToken,
        videoCodecType: "VP9",
      });
      await awaitSessionDatabaseReady(page);
      await devtools.connect();
      await devtools.waitForConnection();
      const connectionId = await devtools.getConnectionId();
      expect(connectionId).toBeTruthy();
      if (!connectionId) {
        throw new Error("expected non-empty connection ID");
      }
      await page.waitForTimeout(1500);
      await devtools.disconnect();
      const ended = await waitForEndedAt(page, { connectionId });
      await waitForWebrtcStats(page, {
        connectionId,
        sessionDbId: ended.session.id,
        channelId,
        minCount: 1,
      });
      return ended.session.id;
    })();

    expect(second).not.toBe(first);

    await callDeleteSession(page, first);

    const sessions = await listSessionRows(page);
    expect(sessions.find((row) => row.id === first)).toBeUndefined();
    expect(sessions.find((row) => row.id === second)).toBeTruthy();

    const connections = await listConnectionRows(page);
    expect(connections.filter((row) => row.session_db_id === first)).toHaveLength(0);

    const stats = await listWebrtcStatsRows(page);
    expect(stats.filter((row) => row.session_db_id === first)).toHaveLength(0);

    // メッセージテーブルも session_db_id 単位で消えていること
    expect(await countMessageRows(page, "timeline_messages", first)).toBe(0);
    expect(await countMessageRows(page, "notify_messages", first)).toBe(0);
    expect(await countMessageRows(page, "signaling_messages", first)).toBe(0);
    expect(await countMessageRows(page, "log_messages", first)).toBe(0);
    expect(await countMessageRows(page, "push_messages", first)).toBe(0);

    // 接続中の current 拒否
    const live = new DevtoolsPage(page);
    await live.navigate({
      role: "sendrecv",
      channelId: `${channelId}-live`,
      signalingUrlCandidates: [env.signalingUrl],
      accessToken: env.accessToken,
      videoCodecType: "VP9",
    });
    await awaitSessionDatabaseReady(page);
    await live.connect();
    await live.waitForConnection();
    const liveConnectionId = await live.getConnectionId();
    expect(liveConnectionId).toBeTruthy();

    const currentId = await page.evaluate(async (moduleUrl) => {
      const loaded: unknown = await import(/* @vite-ignore */ moduleUrl);
      const mod = loaded as { getCurrentSessionDbId: () => number | null };
      return mod.getCurrentSessionDbId();
    }, "/src/sessionDatabase.ts");
    expect(currentId).not.toBeNull();
    if (currentId === null) {
      throw new Error("expected current session id");
    }

    let rejected = false;
    let deleteMessage = "";
    try {
      await callDeleteSession(page, currentId);
    } catch (error) {
      rejected = true;
      if (error instanceof Error) {
        deleteMessage = error.message;
      }
    }
    expect(rejected).toBe(true);
    expect(deleteMessage).toContain(
      `Cannot delete session: sessionDbId ${currentId} is the current session`,
    );

    let resetRejected = false;
    let resetMessage = "";
    try {
      await callResetSessionDatabase(page);
    } catch (error) {
      resetRejected = true;
      if (error instanceof Error) {
        resetMessage = error.message;
      }
    }
    expect(resetRejected).toBe(true);
    expect(resetMessage).toContain("Cannot reset session database: a session is in progress");

    await live.disconnect();
  });

  test("resetSessionDatabase 後は空になり再接続で記録できる", async ({ page }) => {
    const env = requireSoraConnectionEnv();
    const channelId = `${env.channelIdPrefix}session-db-reset`;

    const devtools = new DevtoolsPage(page);
    await devtools.navigate({
      role: "sendrecv",
      channelId,
      signalingUrlCandidates: [env.signalingUrl],
      accessToken: env.accessToken,
      videoCodecType: "VP9",
    });
    await awaitSessionDatabaseReady(page);
    await devtools.connect();
    await devtools.waitForConnection();
    const connectionId = await devtools.getConnectionId();
    expect(connectionId).toBeTruthy();
    if (!connectionId) {
      throw new Error("expected non-empty connection ID");
    }
    await page.waitForTimeout(1500);
    await devtools.disconnect();
    await waitForEndedAt(page, { connectionId });

    const before = await listSessionRows(page);
    expect(before.length).toBeGreaterThanOrEqual(1);

    await callResetSessionDatabase(page);

    const afterResetSessions = await listSessionRows(page);
    expect(afterResetSessions).toHaveLength(0);
    const afterResetConnections = await listConnectionRows(page);
    expect(afterResetConnections).toHaveLength(0);
    const afterResetStats = await listWebrtcStatsRows(page);
    expect(afterResetStats).toHaveLength(0);

    await devtools.navigate({
      role: "sendrecv",
      channelId: `${channelId}-again`,
      signalingUrlCandidates: [env.signalingUrl],
      accessToken: env.accessToken,
      videoCodecType: "VP9",
    });
    await awaitSessionDatabaseReady(page);
    await devtools.connect();
    await devtools.waitForConnection();
    const againConnectionId = await devtools.getConnectionId();
    expect(againConnectionId).toBeTruthy();
    if (!againConnectionId) {
      throw new Error("expected non-empty connection ID");
    }
    await page.waitForTimeout(1000);
    await devtools.disconnect();
    const again = await waitForEndedAt(page, { connectionId: againConnectionId });
    expect(again.session.id).toBeTruthy();
  });
});
