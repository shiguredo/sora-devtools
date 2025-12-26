import { useEffect } from "react";

import {
  disconnectSora,
  setInitialParameter,
  setMediaDevices,
  unregisterServiceWorker,
} from "@/app/actions";
import { DebugPane } from "@/components/DebugPane";
import { DevtoolsPane } from "@/components/DevtoolsPane";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

function Devtools() {
  useEffect(() => {
    void setInitialParameter();
    void setMediaDevices();
    void unregisterServiceWorker();
    return () => {
      void disconnectSora();
    };
  }, []);
  return (
    <>
      <Header />
      <main>
        <div className="container">
          <div className="row">
            <DevtoolsPane />
            <DebugPane />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Devtools;
