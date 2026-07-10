import { LocationProvider, useLocation } from "preact-iso";
import { afterEach, assert, test, vi } from "vite-plus/test";
import { render } from "vitest-browser-preact";

import { setChannelId, setDebug, setDebugType } from "@/app/actions";
import { resetState } from "@/app/signals";

import { CopyUrlButton } from "./CopyUrlButton";

// LocationProvider の内部 state を検証するためのローカルプローブ
function LocationProbe() {
  const { url } = useLocation();
  return <div data-testid="location-probe">{url}</div>;
}

function CopyUrlHarness() {
  return (
    <LocationProvider>
      <LocationProbe />
      <CopyUrlButton />
    </LocationProvider>
  );
}

afterEach(() => {
  setDebug(false);
  setDebugType("timeline");
  resetState();
  globalThis.history.replaceState(null, "", "/");
});

test("CopyUrlButton: コピー成功後に LocationProvider の url が address bar と一致する", async () => {
  setChannelId("test-channel");
  globalThis.history.replaceState(null, "", "/");

  const screen = render(<CopyUrlHarness />);

  await screen.getByRole("button", { name: "Copy URL" }).click();

  const expectedUrl = `${globalThis.location.pathname}${globalThis.location.search}`;
  const probe = screen.getByTestId("location-probe");

  await vi.waitFor(
    () => {
      assert.equal(probe.element().textContent, expectedUrl);
    },
    { timeout: 5000 },
  );
});
