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
import type { EnabledParameters } from "@/types";

type Props = {
  enabledParameters: EnabledParameters;
};
export const ColDemo: React.FC<Props> = (props) => {
  const debug = useAppSelector((state) => state.debug);
  const role = useAppSelector((state) => state.role);
  const spotlight = useAppSelector((state) => state.spotlight);
  const simulcast = useAppSelector((state) => state.simulcast);
  return (
    <div className={debug ? "col-demo col-6" : "col-demo col-12"}>
      <AlertMessages />
      {props.enabledParameters.mediaType ? <FormRowMediaType /> : null}
      {props.enabledParameters.channelId ? <FormRowChannelId /> : null}
      {props.enabledParameters.audio ? <FormRowAudioSettings enabledParameters={props.enabledParameters} /> : null}
      {props.enabledParameters.video ? <FormRowVideoSettings enabledParameters={props.enabledParameters} /> : null}
      {props.enabledParameters.spotlightNumber ? (
        <FormRowSpotlightSettings enabledParameters={props.enabledParameters} />
      ) : null}
      <FormRowDevices enabledParameters={props.enabledParameters} />
      <FormRowMediaDevices enabledParameters={props.enabledParameters} />
      <FormRowOptions enabledParameters={props.enabledParameters} />

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
