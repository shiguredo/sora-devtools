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
import { ConnectType, EnabledParameters } from "@/utils";

type Props = {
  connectType: ConnectType;
  multistream?: boolean;
  simulcast?: boolean;
  spotlight?: boolean;
  enabledParameters: EnabledParameters;
};
export const ColDemo: React.FC<Props> = (props) => {
  const debug = useAppSelector((state) => state.debug);
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
        <Connect
          connectType={props.connectType}
          multistream={props.multistream ? true : false}
          spotlight={props.spotlight ? true : false}
          simulcast={props.simulcast ? true : false}
        />
        <Disconnect />
        <StartRecording />
        <StopRecording />
        {!props.spotlight && props.simulcast && props.connectType !== "sendonly" ? (
          <>
            <RequestRtpStream rid={"r0"} />
            <RequestRtpStream rid={"r1"} />
            <RequestRtpStream rid={"r2"} />
          </>
        ) : null}
        {props.spotlight && props.simulcast && props.connectType !== "sendonly" ? (
          <>
            <RequestRtpStream rid={"r0"} />
            <RequestRtpStream rid={"r1"} />
            <RequestRtpStream rid={"r2"} />
            <ResetRtpStream />
          </>
        ) : null}
      </div>
      <LocalVideo connectType={props.connectType} />
      {props.connectType === "recvonly" || props.connectType === "sendrecv" ? (
        <RemoteVideos
          multistream={props.multistream === true}
          simulcast={props.simulcast === true}
          spotlight={props.spotlight === true}
        />
      ) : null}
    </div>
  );
};
