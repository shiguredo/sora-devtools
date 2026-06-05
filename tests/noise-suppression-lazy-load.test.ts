import { expect, test } from "@playwright/test";

// noise-suppression 関連のリクエスト URL かどうかを判定する
function isNoiseSuppressionRequestUrl(url: string): boolean {
  return /noise-suppression|rnnoise|\.wasm/iu.test(url);
}

// 収集したリクエスト URL から noise-suppression 関連のみを抽出する
function filterNoiseSuppressionRequestUrls(requestUrls: string[]): string[] {
  return requestUrls.filter((url) => isNoiseSuppressionRequestUrl(url));
}

test("mediaProcessorsNoiseSuppression を有効にした時点で noise-suppression を読み込む", async ({
  page,
}) => {
  const requestUrls: string[] = [];

  page.on("request", (request) => {
    requestUrls.push(request.url());
  });

  await page.goto("http://localhost:3333/devtools/");

  await page.waitForSelector('button:has-text("request media")', { timeout: 5000 });

  // 初回ページロード時点では noise-suppression は読み込まれない
  expect(filterNoiseSuppressionRequestUrls(requestUrls)).toHaveLength(0);

  // Media options を展開して mediaProcessorsNoiseSuppression を有効にする
  await page.getByRole("link", { name: "Media options" }).click();

  // チェック ON で noise-suppression の動的 import が走る
  const noiseSuppressionResponsePromise = page.waitForResponse(
    (response) => /noise-suppression/iu.test(response.url()),
    { timeout: 10_000 },
  );
  await page.locator("#mediaProcessorsNoiseSuppression").check();
  const noiseSuppressionResponse = await noiseSuppressionResponsePromise;

  expect(noiseSuppressionResponse.ok()).toBe(true);

  const noiseSuppressionRequestUrls = filterNoiseSuppressionRequestUrls(requestUrls);
  const hasNoiseSuppressionModuleRequest = noiseSuppressionRequestUrls.some((url) =>
    /noise-suppression/iu.test(url),
  );
  expect(hasNoiseSuppressionModuleRequest).toBe(true);
});
