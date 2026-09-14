import { test } from "@playwright/test";
import type { Page } from "@playwright/test";

const BASE_URL = "http://localhost:3333";
const CONNECT_BUTTON_SELECTOR = 'button[name="connect"]';

// footer が通常フローで画面下端に収まり、main と隙間なく接していることを検証する
// 満たさない場合に throw するので、この関数の呼び出しでテストが失敗する
async function expectFooterLayout(page: Page): Promise<void> {
  // footer が通常フローで配置され、レイアウトに寄与して高さを持っていること
  const footer = page.locator("footer");
  await footer.waitFor({ timeout: 5000 });
  const footerBox = await footer.boundingBox();
  if (footerBox === null) {
    throw new Error("expected footer boundingBox, got null");
  }
  if (footerBox.height < 20) {
    throw new Error(`expected footer height >= 20px, got ${footerBox.height}px`);
  }

  // footer 内のナビゲーションバーが固定配置でないこと
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

test("フッター: デスクトップ表示で main と footer の間に隙間がなく footer が画面下端に収まる", async ({
  page,
}) => {
  await page.goto(`${BASE_URL}/`);
  await page.locator(CONNECT_BUTTON_SELECTOR).waitFor({ timeout: 5000 });

  await expectFooterLayout(page);
});

test("フッター: デバッグペイン表示時も main と footer の間に隙間がない", async ({ page }) => {
  await page.goto(`${BASE_URL}/?debug=true`);
  await page.locator(CONNECT_BUTTON_SELECTOR).waitFor({ timeout: 5000 });

  await expectFooterLayout(page);
});

test("フッター: セッションズページでも main と footer の間に隙間がない", async ({ page }) => {
  await page.goto(`${BASE_URL}/sessions`);
  await page.getByTestId("sessions-privacy-notice").waitFor({ timeout: 5000 });

  await expectFooterLayout(page);
});
