import { expect, test } from "@playwright/test";

import { requireSoraConnectionEnv } from "./helpers/env.ts";
import {
  awaitSessionDatabaseReady,
  cleanupSessionDatabase,
  listSessionRows,
  reopenAppSessionDatabase,
  waitForEndedAt,
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
    // list / wait で close した DB をアプリ側で開き直す
    await reopenAppSessionDatabase(page);

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
});
