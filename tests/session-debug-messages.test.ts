import { expect, test } from "@playwright/test";

import { requireSoraConnectionEnv } from "./helpers/env.ts";
import {
  awaitSessionDatabaseReady,
  callDeleteSession,
  cleanupSessionDatabase,
  countMessageRows,
  waitForEndedAt,
  waitForMessageRows,
} from "./helpers/sessionDatabase.ts";
import { DevtoolsPage } from "./pages/DevtoolsPage.ts";

const BASE_URL = "http://localhost:3333";

// OPFS 上の DB はオリジン共有のため永続化テストは直列実行する
test.describe.configure({ mode: "serial" });

test.describe("session debug message persistence", () => {
  test.beforeEach(async ({ page }) => {
    await cleanupSessionDatabase(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupSessionDatabase(page);
  });

  test("接続切断後に timeline / signaling が保存され /sessions 詳細と delete で確認できる", async ({
    page,
  }) => {
    // 必須環境変数が無い場合は即 fail する
    const env = requireSoraConnectionEnv();
    const channelId = `${env.channelIdPrefix}session-db-debug-messages`;

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

    await page.waitForTimeout(1000);
    await devtools.disconnect();
    const { session } = await waitForEndedAt(page, { connectionId });

    // 接続試行中に記録された timeline / signaling が 1 件以上あること
    await waitForMessageRows(page, "timeline_messages", session.id, 1, 10_000);
    await waitForMessageRows(page, "signaling_messages", session.id, 1, 10_000);

    // notify は環境によっては出ないことがあるため必須にはしない
    const notifyCount = await countMessageRows(page, "notify_messages", session.id);
    // ログだけ出して柔らく確認する（0 件でもテストは続行）
    // eslint 禁止のためコメントで意図を残す
    void notifyCount;

    // リロード後も /sessions 詳細のメッセージ UI から読めること
    await page.goto(`${BASE_URL}/sessions`);
    await page.getByTestId(`session-row-${session.id}`).click();
    await page.getByTestId("session-detail").waitFor({ timeout: 10_000 });
    await page.getByTestId("session-messages-tab-timeline").click();
    await expect(page.getByTestId("session-messages-list")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("session-messages-empty")).toHaveCount(0, { timeout: 10_000 });
    await expect(page.getByTestId("session-messages-list").locator("tbody tr").first()).toBeVisible(
      { timeout: 10_000 },
    );

    await page.getByTestId("session-messages-tab-signaling").click();
    await expect(page.getByTestId("session-messages-list")).toBeVisible({ timeout: 10_000 });

    // deleteSession 後は 5 メッセージテーブルいずれも 0 件
    await callDeleteSession(page, session.id);
    expect(await countMessageRows(page, "timeline_messages", session.id)).toBe(0);
    expect(await countMessageRows(page, "notify_messages", session.id)).toBe(0);
    expect(await countMessageRows(page, "signaling_messages", session.id)).toBe(0);
    expect(await countMessageRows(page, "log_messages", session.id)).toBe(0);
    expect(await countMessageRows(page, "push_messages", session.id)).toBe(0);
  });
});
