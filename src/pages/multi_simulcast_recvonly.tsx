import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import Alert from "@/components/Alert";
import ColDebug from "@/components/ColDebug";
import ColDemo from "@/components/ColDemo";
import Forms from "@/components/Forms";
import Head from "@/components/Head";
import Header from "@/components/Header";
import RemoteVideos from "@/components/RemoteVideos";
import { disconnectSora, setInitialParameter, setMediaDevices, setVideoCodecType } from "@/slice";

const ENABLED_PARAMETERS = {
  enabledAudio: true,
  enabledAudioCodecType: true,
  enabledAudioOutput: true,
  enabledChannelId: true,
  enabledSimulcastQuality: true,
  enabledVideo: true,
  enabledVideoCodecType: true,
};

const MultiSimulcastRecvonly: React.FC = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setVideoCodecType("VP8"));
    dispatch(setInitialParameter(ENABLED_PARAMETERS));
    dispatch(setMediaDevices());
    return () => {
      dispatch(disconnectSora());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Head title={"multi simulcast recvonly"} />
      <Header pageName="multi simulcast recvonly" />
      <main role="main">
        <div className="container">
          <div className="row">
            <ColDemo>
              <Alert />
              <Forms connectType="recvonly" connectOptionMultistream={true} connectOptionSimulcast={true} />
              <RemoteVideos />
            </ColDemo>
            <ColDebug />
          </div>
        </div>
      </main>
    </>
  );
};

export default MultiSimulcastRecvonly;
