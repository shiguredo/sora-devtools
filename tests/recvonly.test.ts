import { test } from "@playwright/test";

test("recvonly", async ({ page }) => {
  // TODO: 複数に対応したい
  const signalingUrl = process.env.E2E_TEST_SORA_SIGNALING_URL;
  const channelIdPrefix = process.env.E2E_TEST_SORA_CHANNEL_ID_PREFIX;
  const accessToken = process.env.E2E_TEST_ACCESS_TOKEN;

  const channelId = `${channelIdPrefix}recvonly`;

  const params = new URLSearchParams({
    channelId: channelId,
    signalingUrlCandidates: JSON.stringify([signalingUrl]),
    multistream: "true",
    role: "recvonly",
    videoCodecType: "VP9",
    metadata: JSON.stringify({ access_token: accessToken }),
  });

  await page.goto(`http://localhost:3333/devtools/?${params.toString()}`);

  await page.click('input[name="connect"]');

  // '#local-video-connection-id' が表示されるまで待つ
  await page.waitForSelector("#local-video-connection-id", { timeout: 5000 });

  // '#local-video-connection-id' のテキストコンテンツを取得する
  const connectionId = await page.textContent("#local-video-connection-id");

  // 取得したテキストコンテンツをコンソールに出力する
  console.log("Connection ID:", connectionId);

  // 3 秒待つ
  await page.waitForTimeout(3000);

  await page.click('input[name="disconnect"]');
});
