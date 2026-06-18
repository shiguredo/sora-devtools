import { expect, test } from "@playwright/test";

// mp4-media-stream 関連のリクエスト URL かどうかを判定する
// WASM は data URI (data:application/wasm;base64,...) として JS に埋め込まれているため
// JS チャンクのリクエストのみを捕捉する
function isMp4MediaStreamRequestUrl(url: string): boolean {
  return /mp4-media-stream|mp4_media_stream/iu.test(url);
}

// 収集したリクエスト URL から mp4-media-stream 関連のみを抽出する
function filterMp4MediaStreamRequestUrls(requestUrls: string[]): string[] {
  return requestUrls.filter((url) => isMp4MediaStreamRequestUrl(url));
}

test("mp4-media-stream は MP4 ファイル選択時のみ遅延ダウンロードされる", async ({ page }) => {
  const requestUrls: string[] = [];

  page.on("request", (request) => {
    requestUrls.push(request.url());
  });

  await page.goto("http://localhost:3333/devtools/");

  await page.waitForSelector('button:has-text("request media")', { timeout: 5000 });

  // 初回ページロード時点では mp4-media-stream は読み込まれない
  expect(filterMp4MediaStreamRequestUrls(requestUrls)).toHaveLength(0);

  // mediaType を mp4Media に変更してもリクエストは発生しない
  await page.locator("#mp4Media").check();

  // Mp4FileForm のファイル入力が表示されるのを待つ
  await page.waitForSelector('input[type="file"]', { timeout: 5000 });

  // mediaType 変更時点でも mp4-media-stream は読み込まれない
  expect(filterMp4MediaStreamRequestUrls(requestUrls)).toHaveLength(0);

  // MP4 ファイルを選択する
  const mp4MediaStreamResponsePromise = page.waitForResponse(
    (response) => /mp4-media-stream/iu.test(response.url()),
    { timeout: 10_000 },
  );

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.locator('input[type="file"]').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles("tests/fixtures/test.mp4");

  const mp4MediaStreamResponse = await mp4MediaStreamResponsePromise;
  expect(mp4MediaStreamResponse.ok()).toBe(true);

  const mp4MediaStreamRequestUrls = filterMp4MediaStreamRequestUrls(requestUrls);
  expect(mp4MediaStreamRequestUrls.length).toBeGreaterThan(0);
});
