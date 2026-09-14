import { test } from "@playwright/test";
import type { Page } from "@playwright/test";

const BASE_URL = "http://localhost:3333";
const CONNECT_BUTTON_SELECTOR = 'button[name="connect"]';

// footer が通常フローで画面下端に収まり、main と隙間なく接していることを検証する
// 満たさない場合に throw するので、この関数の呼び出しでテストが失敗する
async function expectFooterLayout(page: Page): Promise<void> {
  // footer が通常フロー (static) で配置されていること
  const footer = page.locator("footer");
  await footer.waitFor({ timeout: 5000 });
  const footerPosition = await footer.evaluate((element) => getComputedStyle(element).position);
  if (footerPosition !== "static") {
    throw new Error(`expected footer position "static", got "${footerPosition}"`);
  }

  // footer がレイアウトに寄与して高さを持っていること（高さ 0 でないこと）
  // 1024px 未満では GitHub リンクが非表示になり高さが小さくなるため、
  // デスクトップ決め打ちの閾値は使わない
  const footerBox = await footer.boundingBox();
  if (footerBox === null) {
    throw new Error("expected footer boundingBox, got null");
  }
  if (footerBox.height <= 0) {
    throw new Error(`expected footer height > 0, got ${footerBox.height}px`);
  }

  // footer と footer 内のナビゲーションバーの両方が固定配置でないこと
  const footerNavPosition = await footer
    .locator("nav")
    .evaluate((element) => getComputedStyle(element).position);
  if (footerNavPosition === "fixed") {
    throw new Error('expected footer nav position not "fixed", got "fixed"');
  }

  // ページスクロールが発生せず、footer がビューポート下端に収まること
  // 横方向もチェックする（横幅を超える要素があると横スクロールバーが
  // 表示され、footer がスクロールバーに重なるため）
  const metrics = await page.evaluate(() => ({
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    scrollHeight: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
  }));
  if (metrics.scrollY !== 0) {
    throw new Error(`expected scrollY 0, got ${metrics.scrollY}`);
  }
  if (metrics.scrollX !== 0) {
    throw new Error(`expected scrollX 0, got ${metrics.scrollX}`);
  }
  if (metrics.scrollHeight > metrics.innerHeight + 1) {
    throw new Error(
      `expected scrollHeight <= innerHeight + 1, got scrollHeight ${metrics.scrollHeight} / innerHeight ${metrics.innerHeight}`,
    );
  }
  if (metrics.scrollWidth > metrics.innerWidth + 1) {
    throw new Error(
      `expected scrollWidth <= innerWidth + 1, got scrollWidth ${metrics.scrollWidth} / innerWidth ${metrics.innerWidth}`,
    );
  }
  if (Math.abs(footerBox.y + footerBox.height - metrics.innerHeight) > 1) {
    throw new Error(
      `expected footer bottom near innerHeight ${metrics.innerHeight}, got ${footerBox.y + footerBox.height}`,
    );
  }

  // main の下端と footer の上端が隙間なく接していること
  const mainBox = await page.locator("main").boundingBox();
  if (mainBox === null) {
    throw new Error("expected main boundingBox, got null");
  }
  if (Math.abs(mainBox.y + mainBox.height - footerBox.y) > 1) {
    throw new Error(
      `expected main bottom near footer top, got main bottom ${mainBox.y + mainBox.height} / footer top ${footerBox.y}`,
    );
  }

  // footer の Navbar のパディングが一意に定まっていること (py-2 は上下 8px)
  const footerNavPaddingTop = await footer
    .locator("nav")
    .evaluate((element) => getComputedStyle(element).paddingTop);
  if (footerNavPaddingTop !== "8px") {
    throw new Error(`expected footer nav padding-top "8px", got "${footerNavPaddingTop}"`);
  }

  // header の Navbar のパディングが基底クラスから失われていないこと (py-2 は上下 8px)
  const headerNavPaddingTop = await page
    .locator("header nav")
    .evaluate((element) => getComputedStyle(element).paddingTop);
  if (headerNavPaddingTop !== "8px") {
    throw new Error(`expected header nav padding-top "8px", got "${headerNavPaddingTop}"`);
  }
}

// DevtoolsPane が内部スクロールコンテナとして機能していることを検証する
// overflow-y が無効化されるとページ全体のスクロールに退化し、
// footer が画面下端に収まらなくなるため
async function expectDevtoolsPaneInternalScroll(page: Page): Promise<void> {
  const pane = page.locator("main .row > div").first();
  const overflowY = await pane.evaluate((element) => getComputedStyle(element).overflowY);
  if (overflowY !== "scroll") {
    throw new Error(`expected devtools pane overflow-y "scroll", got "${overflowY}"`);
  }
  // コンテンツがペイン高さを超えていること（はみ出しを内部スクロールで吸収する）
  const paneScroll = await pane.evaluate((element) => ({
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
  }));
  if (paneScroll.scrollHeight <= paneScroll.clientHeight) {
    throw new Error(
      `expected devtools pane scrollHeight > clientHeight, got ${paneScroll.scrollHeight} / ${paneScroll.clientHeight}`,
    );
  }
}

// Sessions ページの main が内部スクロールコンテナとして機能していることを検証する
async function expectSessionsInternalScroll(page: Page): Promise<void> {
  const main = page.locator('main[data-testid="sessions-page"]');
  const overflowY = await main.evaluate((element) => getComputedStyle(element).overflowY);
  if (overflowY !== "auto") {
    throw new Error(`expected sessions main overflow-y "auto", got "${overflowY}"`);
  }
}

// footer 内の GitHub リンクが表示されていることを検証する
// （0101 で NavbarCollapse を外して常時表示にしている。
// それ以前は 1024px 未満で折りたたみ境界 (lg) により非表示だった）
async function expectFooterLinksVisible(page: Page): Promise<void> {
  const links = page.locator('footer a[href^="https://github.com/"]');
  const linkCount = await links.count();
  if (linkCount !== 2) {
    throw new Error(`expected 2 footer GitHub links, got ${linkCount}`);
  }
  for (let i = 0; i < linkCount; i++) {
    await links.nth(i).waitFor({ state: "visible", timeout: 5000 });
  }
}

test("フッター: デスクトップ表示で main と footer の間に隙間がなく footer が画面下端に収まる", async ({
  page,
}) => {
  await page.goto(`${BASE_URL}/`);
  await page.locator(CONNECT_BUTTON_SELECTOR).waitFor({ timeout: 5000 });

  await expectFooterLayout(page);
  await expectDevtoolsPaneInternalScroll(page);
  await expectFooterLinksVisible(page);
});

test("フッター: デバッグペイン表示時も main と footer の間に隙間がない", async ({ page }) => {
  await page.goto(`${BASE_URL}/?debug=true`);
  // debug の反映は非同期のため、デバッグペイン固有の要素 (タブヘッダー) の
  // 表示を待ってからレイアウトを検証する
  await page.getByRole("tablist").waitFor({ timeout: 5000 });

  await expectFooterLayout(page);
  await expectDevtoolsPaneInternalScroll(page);
  await expectFooterLinksVisible(page);

  // デバッグペインのタブコンテンツが内部スクロールすること
  const tabContentOverflowY = await page
    .locator("main .tab-content")
    .evaluate((element) => getComputedStyle(element).overflowY);
  if (tabContentOverflowY !== "auto") {
    throw new Error(`expected tab content overflow-y "auto", got "${tabContentOverflowY}"`);
  }
});

test("フッター: セッションズページでも main と footer の間に隙間がない", async ({ page }) => {
  await page.goto(`${BASE_URL}/sessions`);
  await page.getByTestId("sessions-privacy-notice").waitFor({ timeout: 5000 });

  await expectFooterLayout(page);
  await expectSessionsInternalScroll(page);
  await expectFooterLinksVisible(page);
});

// footer のレイアウトと GitHub リンク表示が幅を変えても破綻していないことを確認する
async function openAtWidth(page: Page, width: number): Promise<void> {
  await page.setViewportSize({ width, height: 720 });
  await page.goto(`${BASE_URL}/`);
  await page.locator(CONNECT_BUTTON_SELECTOR).waitFor({ timeout: 5000 });
}

test("フッター: 幅 375px でも footer が画面下端に収まる", async ({ page }) => {
  await openAtWidth(page, 375);
  await expectFooterLayout(page);
  await expectFooterLinksVisible(page);
});

test("フッター: 幅 768px でも footer が画面下端に収まる", async ({ page }) => {
  await openAtWidth(page, 768);
  await expectFooterLayout(page);
  await expectFooterLinksVisible(page);
});

test("フッター: 幅 800px でも footer が画面下端に収まる", async ({ page }) => {
  await openAtWidth(page, 800);
  await expectFooterLayout(page);
  await expectFooterLinksVisible(page);
});

test("フッター: 幅 1024px でも footer が画面下端に収まる", async ({ page }) => {
  await openAtWidth(page, 1024);
  await expectFooterLayout(page);
  await expectFooterLinksVisible(page);
});
