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
  setVideoBitRate,
  setVideoCodecType,
} from "@/slice";

const ENABLED_PARAMETERS = {
  audio: true,
  audioBitRate: true,
  audioCodecType: true,
  audioInput: true,
  audioOutput: true,
  autoGainControl: true,
  channelId: true,
  echoCancellation: true,
  echoCancellationType: true,
  fake: true,
  frameRate: true,
  getDisplayMedia: true,
  noiseSuppression: true,
  resolution: true,
  video: true,
  videoBitRate: true,
  videoCodecType: true,
  videoInput: true,
};

const SimulcastSendonly: React.FC = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setVideoCodecType("VP8"));
    dispatch(setVideoBitRate("3000"));
    dispatch(setResolution("HD"));
    dispatch(setInitialParameter());
    dispatch(setMediaDevices());
    return () => {
      dispatch(disconnectSora());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Head title={"simulcast sendonly"} />
      <Header pageName="simulcast sendonly" enabledParameters={ENABLED_PARAMETERS} />
      <main role="main">
        <div className="container">
          <div className="row">
            <ColDemo connectType="sendonly" simulcast enabledParameters={ENABLED_PARAMETERS} />
            <ColDebug />
          </div>
        </div>
      </main>
    </>
  );
};

export default SimulcastSendonly;
