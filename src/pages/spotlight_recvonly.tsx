import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import ColDebug from "@/components/ColDebug";
import ColDemo from "@/components/ColDemo";
import Head from "@/components/Head";
import Header from "@/components/Header";
import {
  disconnectSora,
  setInitialParameter,
  setMediaDevices,
  setResolution,
  setSpotlight,
  setVideoBitRate,
  setVideoCodecType,
} from "@/slice";

const ENABLED_PARAMETERS = {
  audio: true,
  audioCodecType: true,
  audioOutput: true,
  channelId: true,
  video: true,
  videoCodecType: true,
  spotlightNumber: true,
};

const SpotlightRecvonly: React.FC = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setResolution("HD"));
    dispatch(setSpotlight("true"));
    dispatch(setVideoCodecType("VP8"));
    dispatch(setVideoBitRate("3000"));
    dispatch(setInitialParameter());
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
            <ColDemo
              connectType="recvonly"
              multistream={true}
              spotlight={true}
              simulcast={true}
              enabledParameters={ENABLED_PARAMETERS}
            />
            <ColDebug />
          </div>
        </div>
      </main>
    </>
  );
};

export default SpotlightRecvonly;
