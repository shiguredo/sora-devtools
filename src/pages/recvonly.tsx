import React, { useEffect } from "react";

import { useAppDispatch } from "@/app/hooks";
import { disconnectSora, setInitialParameter, setMediaDevices } from "@/app/slice";
import { DebugPane } from "@/components/DebugPane";
import { DevtoolsPane } from "@/components/DevtoolsPane";
import { Footer } from "@/components/Footer";
import { Head } from "@/components/Head";
import { Header } from "@/components/Header";

const Recvonly: React.FC = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setInitialParameter());
    dispatch(setMediaDevices());
    return () => {
      dispatch(disconnectSora());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Head title={"recvonly"} />
      <Header pageName="recvonly" />
      <main role="main">
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
};

// eslint-disable-next-line import/no-default-export
export default Recvonly;
