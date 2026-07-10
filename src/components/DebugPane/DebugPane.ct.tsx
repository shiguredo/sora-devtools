import { LocationProvider, useLocation } from "preact-iso";
import { afterEach, assert, test, vi } from "vite-plus/test";
import { render } from "vitest-browser-preact";

import { setDebug, setDebugType } from "@/app/actions";
import { resetState } from "@/app/signals";

import { DebugPane } from "./index";

// LocationProvider の内部 state を検証するためのローカルプローブ
function LocationProbe() {
  const { url } = useLocation();
  return <div data-testid="location-probe">{url}</div>;
}

function DebugPaneHarness() {
  return (
    <LocationProvider>
      <LocationProbe />
      <DebugPane />
    </LocationProvider>
  );
}

afterEach(() => {
  setDebug(false);
  setDebugType("timeline");
  resetState();
  globalThis.history.replaceState(null, "", "/");
});

test("DebugPane: タブ切替後に LocationProvider の url に debugType が反映される", async () => {
  setDebug(true);
  setDebugType("timeline");
  globalThis.history.replaceState(null, "", "/?debug=true");

  const screen = render(<DebugPaneHarness />);

  await screen.getByRole("tab", { name: "Signaling" }).click();

  const probe = screen.getByTestId("location-probe");

  await vi.waitFor(
    () => {
      const { textContent } = probe.element();
      assert.include(textContent, "debugType=signaling");
    },
    { timeout: 5000 },
  );
});
