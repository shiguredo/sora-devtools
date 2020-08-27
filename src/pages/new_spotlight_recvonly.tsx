import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import Alert from "@/components/Alert";
import ColDebug from "@/components/ColDebug";
import ColDemo from "@/components/ColDemo";
import Forms from "@/components/Forms";
import Head from "@/components/Head";
import Header from "@/components/Header";
import RemoteVideos from "@/components/RemoteVideos";
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
  enabledAudio: true,
  enabledAudioCodecType: true,
  enabledAudioOutput: true,
  enabledChannelId: true,
  enabledVideo: true,
  enabledVideoCodecType: true,
  enabledSpotlightNumber: true,
};

const SpotlightRecvonly: React.FC = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setResolution("HD"));
    dispatch(setSpotlight("true"));
    dispatch(setVideoCodecType("VP8"));
    dispatch(setVideoBitRate("3000"));
    dispatch(setInitialParameter(ENABLED_PARAMETERS));
    dispatch(setMediaDevices());
    return () => {
      dispatch(disconnectSora());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Head title={"spotlight recvonly"} />
      <Header pageName="spotlight recvonly" />
      <main role="main">
        <div className="container">
          <div className="row">
            <ColDemo>
              <Alert />
              <Forms
                connectType="recvonly"
                connectOptionMultistream={true}
                connectOptionSpotlight={true}
                connectOptionSimulcast={true}
              />
              <RemoteVideos />
            </ColDemo>
            <ColDebug />
          </div>
        </div>
      </main>
    </>
  );
};

export default SpotlightRecvonly;
