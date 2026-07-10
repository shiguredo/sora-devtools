import { expect, test } from "@playwright/test";

import { requireSoraConnectionEnv } from "./helpers/env.ts";
import {
  awaitSessionDatabaseReady,
  cleanupSessionDatabase,
  listWebrtcStatsRows,
  waitForEndedAt,
  waitForWebrtcStats,
} from "./helpers/sessionDatabase.ts";
import { DevtoolsPage } from "./pages/DevtoolsPage.ts";

// OPFS 上の DB はオリジン共有のため、永続化テスト同士の並列実行を禁止する
test.describe.configure({ mode: "serial" });

test.describe("webrtc stats persistence", () => {
  test.beforeEach(async ({ page }) => {
    await cleanupSessionDatabase(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupSessionDatabase(page);
  });

  test("切断後に webrtc_stats が DuckDB へ保存されリロード後も残る", async ({ page }) => {
    const env = requireSoraConnectionEnv();
    const channelId = `${env.channelIdPrefix}session-db-stats-persist`;

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

    // 1 秒間隔の getStats が少なくとも 1 回走る猶予
    await page.waitForTimeout(1500);
    await devtools.disconnect();
    const { session, connection } = await waitForEndedAt(page, { connectionId });

    const statsRows = await waitForWebrtcStats(page, {
      connectionId,
      sessionDbId: session.id,
      channelId,
      minCount: 1,
    });
    expect(statsRows.length).toBeGreaterThanOrEqual(1);
    expect(statsRows.every((row) => row.session_db_id === session.id)).toBe(true);
    expect(statsRows.every((row) => row.connection_id === connectionId)).toBe(true);
    expect(statsRows.every((row) => row.channel_id === channelId)).toBe(true);
    expect(statsRows.every((row) => row.stats_type !== null && row.stats_type !== "")).toBe(true);
    // session_id は connection.session_id と一致する（null の場合は両方 null）
    expect(statsRows.every((row) => row.session_id === connection.session_id)).toBe(true);

    const beforeReloadCount = statsRows.length;

    await devtools.navigate({
      role: "sendrecv",
      channelId,
      signalingUrlCandidates: [env.signalingUrl],
      accessToken: env.accessToken,
      videoCodecType: "VP9",
    });
    await awaitSessionDatabaseReady(page);

    const afterReload = await listWebrtcStatsRows(page);
    const matched = afterReload.filter((row) => row.connection_id === connectionId);
    expect(matched.length).toBeGreaterThanOrEqual(beforeReloadCount);
  });
});
