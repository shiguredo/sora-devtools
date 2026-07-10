import { ErrorBoundary, LocationProvider, Route, Router } from "preact-iso";
import { afterEach, assert, test, vi } from "vite-plus/test";
import { render } from "vitest-browser-preact";

import { setDebug, setDebugType } from "@/app/actions";
import { resetState } from "@/app/signals";
import Sessions from "@/routes/Sessions";

import { SessionsButton } from "./SessionsButton";

// 本番と同じ境界: LocationProvider 配下でボタンは Router 外、Sessions は Router 内
function RoutingHarness() {
  return (
    <LocationProvider>
      <SessionsButton />
      <ErrorBoundary>
        <Router>
          {/* @ts-expect-error preact-iso Route の型定義が JSX 戻り値と不一致 */}
          <Route path="/sessions" component={Sessions} />
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  );
}

afterEach(() => {
  setDebug(false);
  setDebugType("timeline");
  resetState();
  globalThis.history.replaceState(null, "", "/");
});

test("SessionsButton: クリックで /sessions に遷移し Sessions ページを表示する", async () => {
  const screen = render(<RoutingHarness />);

  await screen.getByRole("button", { name: "Sessions" }).click();

  assert.equal(globalThis.location.pathname, "/sessions");

  await vi.waitFor(
    () => {
      assert.isNotNull(screen.getByRole("heading", { name: "Sessions", exact: true }).element());
      assert.isNotNull(screen.getByTestId("sessions-privacy-notice").element());
    },
    { timeout: 5000 },
  );
});
