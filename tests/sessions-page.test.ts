import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { requireSoraConnectionEnv } from "./helpers/env.ts";
import {
  awaitSessionDatabaseReady,
  cleanupSessionDatabase,
  listConnectionRows,
  listWebrtcStatsRows,
  waitForEndedAt,
  waitForWebrtcStats,
} from "./helpers/sessionDatabase.ts";
import { DevtoolsPage } from "./pages/DevtoolsPage.ts";

// OPFS 上の DB はオリジン共有のため、Sessions UI テストは直列実行する
test.describe.configure({ mode: "serial" });

const BASE_URL = "http://localhost:3333";

async function connectAndPersist(
  page: Page,
  channelId: string,
): Promise<{ connectionId: string; sessionDbId: number }> {
  const env = requireSoraConnectionEnv();
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
  return { connectionId, sessionDbId: ended.session.id };
}

test.describe("sessions page UI", () => {
  test.beforeEach(async ({ page }) => {
    await cleanupSessionDatabase(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupSessionDatabase(page);
  });

  test("接続切断後に一覧・フィルタ・詳細が表示され再接続で複数行を区別できる", async ({ page }) => {
    const env = requireSoraConnectionEnv();
    const channelId = `${env.channelIdPrefix}sessions-page-ui`;

    const first = await connectAndPersist(page, channelId);
    const second = await connectAndPersist(page, channelId);
    expect(second.connectionId).not.toBe(first.connectionId);
    expect(second.sessionDbId).not.toBe(first.sessionDbId);

    // /sessions で一覧を確認する
    await page.goto(`${BASE_URL}/sessions`);
    await page.getByRole("heading", { name: "Sessions", exact: true }).waitFor({ timeout: 10_000 });
    await page.getByTestId("sessions-privacy-notice").waitFor({ timeout: 5000 });
    await page.getByTestId("session-list").waitFor({ timeout: 10_000 });

    const firstRow = page.getByTestId(`session-row-${first.sessionDbId}`);
    const secondRow = page.getByTestId(`session-row-${second.sessionDbId}`);
    await firstRow.waitFor({ timeout: 10_000 });
    await secondRow.waitFor({ timeout: 10_000 });
    await expect(firstRow).toContainText(channelId);
    await expect(secondRow).toContainText(channelId);

    // 一覧に connectionId 必須カラムが無いこと
    const listHeader = page.getByTestId("session-list").locator("thead");
    await expect(listHeader).not.toContainText("connectionId");
    await expect(listHeader).not.toContainText("connection_id");

    // フィルタ QS（channelId）が効く
    await page.goto(`${BASE_URL}/sessions?channelId=${encodeURIComponent(channelId)}`);
    await page.getByTestId("session-list").waitFor({ timeout: 10_000 });
    await firstRow.waitFor({ timeout: 10_000 });
    await secondRow.waitFor({ timeout: 10_000 });

    // 詳細で集計または時系列が見える
    await secondRow.click();
    await page.getByTestId("session-detail").waitFor({ timeout: 10_000 });
    await expect(page.getByTestId("session-detail")).toHaveAttribute(
      "data-session-db-id",
      String(second.sessionDbId),
    );
    await page.getByTestId("connections-table").waitFor({ timeout: 10_000 });
    // 集計または時系列に実データが見えること（厳密な数値一致は求めない）
    await page.getByTestId("stats-aggregates").waitFor({ timeout: 10_000 });
    await page.getByTestId("stats-timeseries").waitFor({ timeout: 10_000 });
    const rawPanel = page.getByTestId("stats-raw-panel");
    const aggregatesText = await page.getByTestId("stats-aggregates").textContent();
    const hasAggregateValue = aggregatesText !== null && /\d/u.test(aggregatesText);
    const hasRawPanel = await rawPanel.isVisible().catch(() => false);
    expect(hasAggregateValue || hasRawPanel).toBe(true);
  });

  test("行削除と履歴削除が動作し確認キャンセルでは消えない", async ({ page }) => {
    const env = requireSoraConnectionEnv();
    const channelId = `${env.channelIdPrefix}sessions-page-delete`;

    const first = await connectAndPersist(page, channelId);
    const second = await connectAndPersist(page, channelId);

    await page.goto(`${BASE_URL}/sessions`);
    await page.getByTestId("session-list").waitFor({ timeout: 10_000 });
    await page.getByTestId(`session-row-${first.sessionDbId}`).waitFor({ timeout: 10_000 });
    await page.getByTestId(`session-row-${second.sessionDbId}`).waitFor({ timeout: 10_000 });

    // キャンセルでは消えない
    await page.getByTestId(`session-delete-${first.sessionDbId}`).click();
    await page.getByTestId(`session-delete-cancel-${first.sessionDbId}`).click();
    await expect(page.getByTestId(`session-row-${first.sessionDbId}`)).toBeVisible();

    // 行削除
    await page.getByTestId(`session-delete-${first.sessionDbId}`).click();
    await page.getByTestId(`session-delete-confirm-${first.sessionDbId}`).click();
    await expect(page.getByTestId(`session-row-${first.sessionDbId}`)).toHaveCount(0, {
      timeout: 10_000,
    });
    await expect(page.getByTestId(`session-row-${second.sessionDbId}`)).toBeVisible();

    // カスケード確認はシナリオ末尾で helpers を使う
    const connections = await listConnectionRows(page);
    expect(connections.filter((row) => row.session_db_id === first.sessionDbId)).toHaveLength(0);
    const stats = await listWebrtcStatsRows(page);
    expect(stats.filter((row) => row.session_db_id === first.sessionDbId)).toHaveLength(0);

    // helpers が close/reopen したあと DOM を再取得する
    await page.goto(`${BASE_URL}/sessions`);
    await page.getByTestId("session-list").waitFor({ timeout: 10_000 });
    await expect(page.getByTestId(`session-row-${second.sessionDbId}`)).toBeVisible({
      timeout: 10_000,
    });

    // 履歴削除のキャンセル
    await page.getByTestId("sessions-reset-database").click();
    await page.getByTestId("sessions-reset-cancel").click();
    await expect(page.getByTestId(`session-row-${second.sessionDbId}`)).toBeVisible();

    // 履歴削除
    await page.getByTestId("sessions-reset-database").click();
    await page.getByTestId("sessions-reset-confirm").click();
    await page.getByTestId("session-list-empty").waitFor({ timeout: 10_000 });

    // 再接続で再記録
    const again = await connectAndPersist(page, `${channelId}-again`);
    await page.goto(`${BASE_URL}/sessions`);
    await page.getByTestId(`session-row-${again.sessionDbId}`).waitFor({ timeout: 10_000 });
  });

  test("接続中は履歴削除が disabled で当該行の削除ボタンが無い", async ({ page }) => {
    const env = requireSoraConnectionEnv();
    const channelId = `${env.channelIdPrefix}sessions-page-live-delete`;

    const past = await connectAndPersist(page, channelId);

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

    const currentId = await page.evaluate(async (moduleUrl) => {
      const loaded: unknown = await import(/* @vite-ignore */ moduleUrl);
      const mod = loaded as { getCurrentSessionDbId: () => number | null };
      return mod.getCurrentSessionDbId();
    }, "/src/sessionDatabase.ts");
    expect(currentId).not.toBeNull();

    // フルリロードではなく SPA 遷移で接続状態を維持する
    await page.getByRole("button", { name: "Sessions" }).click();
    await page.getByRole("heading", { name: "Sessions", exact: true }).waitFor({ timeout: 10_000 });
    await page.getByTestId("session-list").waitFor({ timeout: 10_000 });
    await expect(page.getByTestId("sessions-reset-database")).toBeDisabled();
    if (currentId !== null) {
      await expect(page.getByTestId(`session-delete-${currentId}`)).toHaveCount(0);
    }
    await expect(page.getByTestId(`session-delete-${past.sessionDbId}`)).toBeVisible();

    await page.getByRole("link", { name: "Sora DevTools" }).click();
    await page.waitForURL((url) => url.pathname === "/", { timeout: 5000 });
    await live.disconnect();
  });
});
