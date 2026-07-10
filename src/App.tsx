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
import { createSessionDatabase } from "@/sessionDatabase";

import DevTools from "./DevTools.tsx";

const Sessions = lazy(async () => import("./routes/Sessions.tsx"));

// タブ閉鎖・リロード時に Sora 切断を試行する
// sessionDatabase.close() は呼ばない（beforeunload での close 競合を避ける方針）
// 非同期完了は保証できない。ended_at 更新は disconnectSora 先頭の fire-and-forget に寄せる
function handleBeforeUnload(): void {
  void disconnectSora();
}

function App() {
  useEffect(() => {
    void setInitialParameter();
    void setMediaDevices();
    void unregisterServiceWorker();
    // セッション永続化 DB の初期化を非同期で開始する（Connect を待たない）
    void createSessionDatabase();
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
