import { test } from "@playwright/test";

import { requireSoraConnectionEnv } from "./helpers/env.ts";
import { DevtoolsPage } from "./pages/DevtoolsPage.ts";

const BASE_URL = "http://localhost:3333";
const CONNECT_BUTTON_SELECTOR = 'button[name="connect"]';

test("ルーティング: / /devtools/ /devtools で DevTools が表示される", async ({ page }) => {
  await page.goto(`${BASE_URL}/`);
  await page.locator(CONNECT_BUTTON_SELECTOR).waitFor({ timeout: 5000 });

  await page.goto(`${BASE_URL}/devtools/`);
  await page.locator(CONNECT_BUTTON_SELECTOR).waitFor({ timeout: 5000 });

  await page.goto(`${BASE_URL}/devtools`);
  await page.locator(CONNECT_BUTTON_SELECTOR).waitFor({ timeout: 5000 });
});

test("ルーティング: Sessions ボタンで /sessions に遷移する", async ({ page }) => {
  await page.goto(`${BASE_URL}/devtools/`);

  await page.getByRole("button", { name: "Sessions" }).click();
  await page.getByRole("heading", { name: "Sessions", exact: true }).waitFor({ timeout: 5000 });
  await page.getByTestId("sessions-privacy-notice").waitFor({ timeout: 5000 });
  const pathname = await page.evaluate(() => globalThis.location.pathname);
  if (pathname !== "/sessions") {
    throw new Error(`expected pathname "/sessions", got "${pathname}"`);
  }
});

test("ルーティング: /sessions 直アクセスで Sessions ページが表示される", async ({ page }) => {
  await page.goto(`${BASE_URL}/sessions`);
  await page.getByRole("heading", { name: "Sessions", exact: true }).waitFor({ timeout: 5000 });
  await page.getByTestId("sessions-privacy-notice").waitFor({ timeout: 5000 });
});
test("ルーティング: 既存 query が / で復元される", async ({ page }) => {
  const devtools = new DevtoolsPage(page);
  const channelId = "routing-test-channel";

  await devtools.navigate({
    role: "sendrecv",
    channelId,
    signalingUrlCandidates: ["wss://example.example.com/signaling"],
    accessToken: "test-token",
  });

  const channelIdInput = page.getByRole("textbox", { name: "ChannelIdを指定" });
  await channelIdInput.waitFor({ timeout: 10_000 });
  const value = await channelIdInput.inputValue();
  if (value !== channelId) {
    throw new Error(`expected channelId input value "${channelId}", got "${value}"`);
  }
});

test("ルーティング: SPA 遷移中も Sora 接続が維持される", async ({ page }) => {
  const env = requireSoraConnectionEnv();
  const devtools = new DevtoolsPage(page);

  await devtools.navigate({
    role: "sendrecv",
    channelId: `${env.channelIdPrefix}routing-maintain`,
    signalingUrlCandidates: [env.signalingUrl],
    accessToken: env.accessToken,
    videoCodecType: "VP9",
  });

  await devtools.connect();
  await devtools.waitForConnection();

  const connectionId = await devtools.getConnectionId();
  if (connectionId === null || connectionId === "") {
    throw new Error("expected non-empty connection ID before SPA navigation");
  }

  const turnUrlLabel = page.locator("header p");
  await turnUrlLabel.waitFor({ timeout: 10_000 });
  const connectedTurnLabel = await turnUrlLabel.textContent();
  if (connectedTurnLabel === "TURN URL") {
    throw new Error('expected TURN URL label to change from "TURN URL" after connection');
  }

  await page.getByRole("button", { name: "Sessions" }).click();
  await page.getByRole("heading", { name: "Sessions", exact: true }).waitFor({ timeout: 5000 });

  const sessionsTurnLabel = await turnUrlLabel.textContent();
  if (sessionsTurnLabel === "TURN URL") {
    throw new Error(
      'expected connection to remain active on /sessions, but TURN URL label is "TURN URL"',
    );
  }

  await page.getByRole("link", { name: "Sora DevTools" }).click();
  await page.waitForURL((url) => url.pathname === "/", { timeout: 5000 });

  await devtools.waitForConnection();
  const restoredConnectionId = await devtools.getConnectionId();
  if (restoredConnectionId !== connectionId) {
    throw new Error(
      `expected connection ID "${connectionId}" after returning to /, got "${restoredConnectionId ?? ""}"`,
    );
  }
});
