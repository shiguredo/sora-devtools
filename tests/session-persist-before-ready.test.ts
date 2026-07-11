import { expect, test } from "@playwright/test";

import { requireSoraConnectionEnv } from "./helpers/env.ts";
import {
  awaitSessionDatabaseReady,
  cleanupSessionDatabase,
  waitForEndedAt,
} from "./helpers/sessionDatabase.ts";
import { DevtoolsPage } from "./pages/DevtoolsPage.ts";

// OPFS 上の DB はオリジン共有のため直列実行する
test.describe.configure({ mode: "serial" });

const BASE_URL = "http://localhost:3333";

test.describe("session persist before database ready", () => {
  test.beforeEach(async ({ page }) => {
    await cleanupSessionDatabase(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupSessionDatabase(page);
  });

  // DuckDB 初期化完了を待たずに Connect しても sessions が残ることを確認する
  test("初期化完了前の接続でも /sessions 一覧に残る", async ({ page }) => {
    const env = requireSoraConnectionEnv();
    const channelId = `${env.channelIdPrefix}session-persist-before-ready`;
    const devtools = new DevtoolsPage(page);

    await devtools.navigate({
      role: "sendrecv",
      channelId,
      signalingUrlCandidates: [env.signalingUrl],
      accessToken: env.accessToken,
      videoCodecType: "VP9",
    });

    // whenReady を待たずにすぐ接続する（初期化との競合を再現する）
    await page.locator('button[name="connect"]').waitFor({ timeout: 10_000 });
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
    await awaitSessionDatabaseReady(page);

    await page.goto(`${BASE_URL}/sessions`);
    await page.getByTestId("session-list").waitFor({ timeout: 10_000 });
    await expect(page.getByTestId("session-list")).toContainText(channelId);
  });
});
