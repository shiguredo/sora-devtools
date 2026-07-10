import { test } from "@playwright/test";

import { requireSoraConnectionEnv } from "./helpers/env.ts";
import { DevtoolsPage } from "./pages/DevtoolsPage.ts";

test("sendonly", async ({ page }) => {
  // 必須環境変数を取得する。未設定なら test.skip() でこのテストを skip する
  const env = requireSoraConnectionEnv();

  const devtools = new DevtoolsPage(page);
  await devtools.navigate({
    role: "sendonly",
    channelId: `${env.channelIdPrefix}sendonly`,
    signalingUrlCandidates: [env.signalingUrl],
    accessToken: env.accessToken,
    videoCodecType: "VP9",
  });

  await devtools.connect();
  await devtools.waitForConnection();

  const connectionId = await devtools.getConnectionId();
  console.log("Connection ID:", connectionId);

  await page.waitForTimeout(3000);
  await devtools.disconnect();
});
