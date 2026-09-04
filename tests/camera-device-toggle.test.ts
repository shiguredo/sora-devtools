import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const DEVTOOLS_URL = "http://localhost:3333/devtools/";

interface VideoTrackState {
  enabled: boolean;
  id: string;
  readyState: MediaStreamTrackState;
}

async function getVideoTrackStates(page: Page) {
  return page.locator("#local-video").evaluate((element) => {
    const mediaProvider = (element as HTMLVideoElement).srcObject;
    if (!(mediaProvider instanceof MediaStream)) {
      throw new Error("local video MediaStream is not set");
    }
    return mediaProvider.getVideoTracks().map((track): VideoTrackState => ({
      enabled: track.enabled,
      id: track.id,
      readyState: track.readyState,
    }));
  });
}

test("getUserMedia のカメラデバイスを切り替えると映像トラックを停止・再取得する", async ({
  page,
}) => {
  await page.goto(DEVTOOLS_URL);
  await page.getByRole("button", { name: "request media" }).click();

  const localVideo = page.locator("#local-video");
  await localVideo.waitFor({ timeout: 5000 });
  const before = await getVideoTrackStates(page);
  expect(before).toHaveLength(1);

  await page.locator("#cameraDevice").uncheck();
  await expect.poll(async () => getVideoTrackStates(page), { timeout: 5000 }).toEqual([]);

  await page.locator("#cameraDevice").check();
  await expect.poll(async () => getVideoTrackStates(page), { timeout: 5000 }).toHaveLength(1);
  const after = await getVideoTrackStates(page);
  expect(after[0]?.id).not.toBe(before[0]?.id);
  expect(after[0]?.readyState).toBe("live");
  expect(after[0]?.enabled).toBe(true);
});
