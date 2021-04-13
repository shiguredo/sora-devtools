import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import ColDebug from "@/components/ColDebug";
import ColDemo from "@/components/ColDemo";
import Footer from "@/components/Footer";
import Head from "@/components/Head";
import Header from "@/components/Header";
import { disconnectSora, setInitialParameter, setMediaDevices } from "@/slice";
import { EnabledParameters } from "@/utils";

const ENABLED_PARAMETERS: EnabledParameters = {
  audio: true,
  audioOutput: true,
  channelId: true,
  clientId: true,
  displayResolution: true,
  e2ee: true,
  metadata: true,
  signalingNotifyMetadata: true,
  video: true,
  spotlightNumber: true,
  spotlightFocusRid: true,
  spotlightUnfocusRid: true,
};

const SpotlightRecvonly: React.FC = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setInitialParameter({ spotlight: "true" }));
    dispatch(setMediaDevices());
    return () => {
      dispatch(disconnectSora());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Head title={"spotlight recvonly"} />
      <Header pageName="spotlight recvonly" enabledParameters={ENABLED_PARAMETERS} />
      <main role="main">
        <div className="container">
          <div className="row">
            <ColDemo connectType="recvonly" multistream spotlight simulcast enabledParameters={ENABLED_PARAMETERS} />
            <ColDebug />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SpotlightRecvonly;
