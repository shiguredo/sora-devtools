import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { requireSoraConnectionEnv } from "./helpers/env.ts";
import {
  awaitSessionDatabaseReady,
  cleanupSessionDatabase,
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
    const rawTable = page.getByTestId("stats-raw-table");
    const aggregatesText = await page.getByTestId("stats-aggregates").textContent();
    const hasAggregateValue = aggregatesText !== null && /\d/u.test(aggregatesText);
    const hasRawRows = await rawTable.isVisible().catch(() => false);
    expect(hasAggregateValue || hasRawRows).toBe(true);
  });
});
