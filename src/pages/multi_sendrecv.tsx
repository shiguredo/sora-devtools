import React, { useEffect } from "react";

import { useAppDispatch } from "@/app/hooks";
import { disconnectSora, setInitialParameter, setMediaDevices } from "@/app/slice";
import { ColDebug } from "@/components/ColDebug";
import { ColDemo } from "@/components/ColDemo";
import { Footer } from "@/components/Footer";
import { Head } from "@/components/Head";
import { Header } from "@/components/Header";
import { getDefaultVideoCodecType } from "@/utils";

const MultiSendrecv: React.FC = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(
      setInitialParameter({
        role: "sendrecv",
        multistream: true,
        simulcast: false,
        spotlight: false,
        audioCodecType: "OPUS",
        videoCodecType: getDefaultVideoCodecType("VP9"),
        videoBitRate: "1000",
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
      <Head title={"multi sendrecv"} />
      <Header pageName="multi sendrecv" />
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
export default MultiSendrecv;
