import { ErrorBoundary, LocationProvider, Route, Router } from "preact-iso";
import { afterEach, assert, test, vi } from "vite-plus/test";
import { render } from "vitest-browser-preact";

import { setDebug, setDebugType } from "@/app/actions";
import { resetState } from "@/app/signals";
import DevTools from "@/DevTools";
import Sessions from "@/routes/Sessions";

import { SessionsButton } from "./SessionsButton";

// 本番と同じ境界: LocationProvider 配下でボタンは Router 外、ページは Router 内
function RoutingHarness() {
  return (
    <LocationProvider>
      <SessionsButton />
      <ErrorBoundary>
        <Router>
          <Route path="/" component={DevTools} />
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
  assert.equal(
    screen.getByRole("button", { name: "Sessions" }).element().getAttribute("aria-pressed"),
    "true",
  );

  await vi.waitFor(
    () => {
      assert.isNotNull(screen.getByRole("heading", { name: "Sessions", exact: true }).element());
      assert.isNotNull(screen.getByTestId("sessions-privacy-notice").element());
    },
    { timeout: 5000 },
  );
});

test("SessionsButton: /sessions 上でもう一度クリックすると / に戻る", async () => {
  globalThis.history.replaceState(null, "", "/sessions");
  const screen = render(<RoutingHarness />);

  await vi.waitFor(
    () => {
      assert.isNotNull(screen.getByRole("heading", { name: "Sessions", exact: true }).element());
    },
    { timeout: 5000 },
  );

  await screen.getByRole("button", { name: "Sessions" }).click();

  assert.equal(globalThis.location.pathname, "/");
  assert.equal(
    screen.getByRole("button", { name: "Sessions" }).element().getAttribute("aria-pressed"),
    "false",
  );
});
