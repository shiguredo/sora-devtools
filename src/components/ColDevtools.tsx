import React from "react";

import { useAppSelector } from "@/app/hooks";
import { AlertMessages } from "@/components/AlertMessages";
import { Connect } from "@/components/Button/Connect";
import { Disconnect } from "@/components/Button/Disconnect";
import { RequestRtpStream } from "@/components/Button/RequestRtpStream";
import { ResetRtpStream } from "@/components/Button/ResetRtpStream";
import { StartRecording } from "@/components/Button/StartRecording";
import { StopRecording } from "@/components/Button/StopRecording";
import { FormRowAudioSettings } from "@/components/Form/RowAudioSettings";
import { FormRowChannelId } from "@/components/Form/RowChannelId";
import { FormRowDevices } from "@/components/Form/RowDevices";
import { FormRowMediaDevices } from "@/components/Form/RowMediaDevices";
import { FormRowMediaType } from "@/components/Form/RowMediaType";
import { FormRowOptions } from "@/components/Form/RowOptions";
import { FormRowSpotlightSettings } from "@/components/Form/RowSpotlightSettings";
import { FormRowVideoSettings } from "@/components/Form/RowVideoSettings";
import { LocalVideo } from "@/components/Video/LocalVideo";
import { RemoteVideos } from "@/components/Video/RemoteVideos";

export const ColDevtools: React.FC = () => {
  const debug = useAppSelector((state) => state.debug);
  const role = useAppSelector((state) => state.role);
  const spotlight = useAppSelector((state) => state.spotlight);
  const simulcast = useAppSelector((state) => state.simulcast);
  const displaySettings = useAppSelector((state) => state.displaySettings);
  return (
    <div className={debug ? "col-devtools col-6" : "col-devtools col-12"}>
      <AlertMessages />
      {displaySettings.mediaType ? <FormRowMediaType /> : null}
      <FormRowChannelId />
      <FormRowAudioSettings />
      <FormRowVideoSettings />
      <FormRowSpotlightSettings />
      <FormRowDevices />
      <FormRowMediaDevices />
      <FormRowOptions />

      <div className="row">
        <Connect />
        <Disconnect />
        <StartRecording />
        <StopRecording />
        {!spotlight && simulcast && role !== "sendonly" ? (
          <>
            <RequestRtpStream rid={"r0"} />
            <RequestRtpStream rid={"r1"} />
            <RequestRtpStream rid={"r2"} />
          </>
        ) : null}
        {spotlight && simulcast && role !== "sendonly" ? (
          <>
            <RequestRtpStream rid={"r0"} />
            <RequestRtpStream rid={"r1"} />
            <RequestRtpStream rid={"r2"} />
            <ResetRtpStream />
          </>
        ) : null}
      </div>
      <LocalVideo />
      {role === "recvonly" || role === "sendrecv" ? <RemoteVideos /> : null}
    </div>
  );
};
