import { test } from "@playwright/test";

import { getSoraConnectionEnv } from "./helpers/env.ts";
import { DevtoolsPage } from "./pages/DevtoolsPage.ts";

test("recvonly", async ({ page }) => {
  // 環境変数を取得する。未設定時は空文字を含む既定値となり、[""] 経路で接続が失敗する
  const env = getSoraConnectionEnv() ?? {
    signalingUrl: "",
    channelIdPrefix: "",
    accessToken: "",
  };

  const devtools = new DevtoolsPage(page);
  await devtools.navigate({
    role: "recvonly",
    channelId: `${env.channelIdPrefix}recvonly`,
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
