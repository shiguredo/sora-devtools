import { useEffect } from "preact/hooks";
import { ErrorBoundary, lazy, Route, Router } from "preact-iso";

import {
  disconnectSora,
  setInitialParameter,
  setMediaDevices,
  unregisterServiceWorker,
} from "@/app/actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

import DevTools from "./DevTools.tsx";

const Sessions = lazy(async () => import("./routes/Sessions.tsx"));

// タブ閉鎖・リロード時に Sora 切断を試行する
function handleBeforeUnload(): void {
  void disconnectSora();
}

function App() {
  useEffect(() => {
    void setInitialParameter();
    void setMediaDevices();
    void unregisterServiceWorker();
    globalThis.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      globalThis.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <>
      <Header />
      <ErrorBoundary>
        <Router>
          <Route path="/" component={DevTools} />
          <Route path="/sessions" component={Sessions} />
          <Route default component={DevTools} />
        </Router>
      </ErrorBoundary>
      <Footer />
    </>
  );
}

export default App;
