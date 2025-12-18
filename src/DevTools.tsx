import type { FunctionComponent } from "preact";
import { useEffect } from "preact/hooks";
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

const Devtools: FunctionComponent = () => {
  useEffect(() => {
    setInitialParameter();
    setMediaDevices();
    unregisterServiceWorker();
    return () => {
      disconnectSora();
    };
  }, []);

  return (
    <>
      <Header />
      <main className="main-container">
        <DevtoolsPane />
        <DebugPane />
      </main>
      <Footer />
    </>
  );
};

export default Devtools;
