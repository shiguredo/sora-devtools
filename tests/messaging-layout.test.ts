import { test } from "@playwright/test";
import type { Page } from "@playwright/test";

// Messaging タブの Debug ペインでのレイアウトを検証する e2e
//
// clear ボタンがメッセージ定義の表示と重ならず、ペインが低くても可視領域に収まること、
// タブヘッダーの右端に不要な縦スクロールバーが出ないことを確認する。

const BASE_URL = "http://localhost:3333";

// Messaging タブを開く
// query で debug とタブを指定し、タブヘッダーの表示を待ってから検証する
async function openMessagingTab(page: Page): Promise<void> {
  const query = new URLSearchParams({
    channelId: "messaging-layout-test",
    role: "sendrecv",
    debug: "true",
    debugType: "messaging",
  });
  await page.goto(`${BASE_URL}/?${query.toString()}`);
  await page.getByRole("tablist").waitFor({ timeout: 5000 });
}

// タブヘッダーに不要な縦スクロールバーが出ていないことを検証する
// タブボタンの `-mb-px` で内容の高さが枠線の分だけ超えるため、 overflow-y が
// auto のままだと右端に縦スクロールバーが表示される
async function expectTablistWithoutVerticalScrollbar(page: Page): Promise<void> {
  const tablist = page.getByRole("tablist");
  await tablist.waitFor({ timeout: 5000 });
  const { overflowX, overflowY } = await tablist.evaluate((element) => {
    const style = getComputedStyle(element);
    return { overflowX: style.overflowX, overflowY: style.overflowY };
  });
  if (overflowY !== "hidden") {
    throw new Error(`expected tablist overflow-y "hidden", got "${overflowY}"`);
  }
  // 横スクロールは残す (タブ数が多いときの退避手段)
  if (overflowX !== "auto") {
    throw new Error(`expected tablist overflow-x "auto", got "${overflowX}"`);
  }
}

// clear ボタンが可視領域に収まり、メッセージ定義の表示と重ならないことを検証する
async function expectClearButtonUsable(page: Page): Promise<void> {
  const clearButton = page.getByRole("button", { name: "clear", exact: true });
  await clearButton.waitFor({ timeout: 5000 });

  const layout = await page.evaluate(() => {
    const activePane = document.querySelector(".tab-pane.active");
    const tabContent = document.querySelector(".tab-content");
    const clear = [...document.querySelectorAll("button")].find(
      (button) => button.textContent.trim() === "clear",
    );
    if (activePane === null || tabContent === null || clear === undefined) {
      return null;
    }
    const clearRect = clear.getBoundingClientRect();
    const tabContentRect = tabContent.getBoundingClientRect();
    // メッセージ定義の表示は DataChannel を確立したときだけ描画される
    const definition = activePane.querySelector("pre");
    return {
      clearTop: clearRect.top,
      clearBottom: clearRect.bottom,
      definitionBottom: definition === null ? null : definition.getBoundingClientRect().bottom,
      visibleTop: tabContentRect.top,
      visibleBottom: tabContentRect.bottom,
    };
  });

  if (layout === null) {
    throw new Error("expected Messaging tab layout, got null");
  }

  // clear ボタンが定義の表示より下にあること (重ならずに並んでいること)
  if (layout.definitionBottom !== null && layout.clearTop < layout.definitionBottom) {
    throw new Error(
      `expected clear button top >= definition bottom, got ${layout.clearTop} < ${layout.definitionBottom}`,
    );
  }

  // clear ボタンがペインの可視領域内に収まっていること (スクロールせずに押せること)
  if (layout.clearTop < layout.visibleTop || layout.clearBottom > layout.visibleBottom) {
    throw new Error(
      `expected clear button within tab content [${layout.visibleTop}, ${layout.visibleBottom}], got [${layout.clearTop}, ${layout.clearBottom}]`,
    );
  }
}

test("Messaging タブ: タブヘッダーに不要な縦スクロールバーが出ない", async ({ page }) => {
  await openMessagingTab(page);

  await expectTablistWithoutVerticalScrollbar(page);
});

test("Messaging タブ: デスクトップの高さで clear ボタンが可視領域に収まる", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openMessagingTab(page);

  await expectClearButtonUsable(page);
});

test("Messaging タブ: ペインが低くても clear ボタンが可視領域に収まる", async ({ page }) => {
  // メッセージ定義の枠が 270px 固定だったとき、 400px の高さでは clear ボタンが
  // 可視領域の外へ押し出されていた
  await page.setViewportSize({ width: 1280, height: 400 });
  await openMessagingTab(page);

  await expectClearButtonUsable(page);
  await expectTablistWithoutVerticalScrollbar(page);
});
