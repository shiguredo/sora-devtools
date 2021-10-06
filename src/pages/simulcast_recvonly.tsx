import React, { useEffect } from "react";

import { useAppDispatch } from "@/app/hooks";
import { disconnectSora, setInitialParameter, setMediaDevices } from "@/app/slice";
import { ColDebug } from "@/components/ColDebug";
import { ColDemo } from "@/components/ColDemo";
import { Footer } from "@/components/Footer";
import { Head } from "@/components/Head";
import { Header } from "@/components/Header";
import { getDefaultVideoCodecType } from "@/utils";

const SimulcastRecvonly: React.FC = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(
      setInitialParameter({
        role: "recvonly",
        multistream: false,
        simulcast: true,
        spotlight: false,
        audioCodecType: "OPUS",
        videoCodecType: getDefaultVideoCodecType("VP8"),
        simulcastRid: "r0",
      })
    );
    dispatch(setMediaDevices());
    return () => {
      dispatch(disconnectSora());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Head title={"simulcast recvonly"} />
      <Header pageName="simulcast recvonly" />
      <main role="main">
        <div className="container">
          <div className="row">
            <ColDemo />
            <ColDebug />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default SimulcastRecvonly;
