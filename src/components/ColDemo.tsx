import React from "react";
import { useSelector } from "react-redux";

import AlertMessages from "@/components/AlertMessages";
import ButtonConnect from "@/components/Button/Connect";
import ButtonDisconnect from "@/components/Button/Disconnect";
import ButtonRequestRtpStream from "@/components/Button/RequestRtpStream";
import ButtonResetRtpStream from "@/components/Button/ResetRtpStream";
import ButtonStartRecording from "@/components/Button/StartRecording";
import ButtonStopRecording from "@/components/Button/StopRecording";
import FormAudio from "@/components/Form/Audio";
import FormAudioBitRate from "@/components/Form/AudioBitRate";
import FormAudioCodecType from "@/components/Form/AudioCodecType";
import FormAudioInput from "@/components/Form/AudioInput";
import FormAudioOutput from "@/components/Form/AudioOutput";
import FormAutoGainControl from "@/components/Form/AutoGainControl";
import FormChannelId from "@/components/Form/ChannelId";
import FormEchoCancellation from "@/components/Form/EchoCancellation";
import FormEchoCancellationType from "@/components/Form/EchoCancellationType";
import FormEnabledMetadata from "@/components/Form/EnabledMetadata";
import FormFrameRate from "@/components/Form/FrameRate";
import FormMediaType from "@/components/Form/MediaType";
import FormMetadata from "@/components/Form/Metadata";
import FormNoiseSuppression from "@/components/Form/NoiseSuppression";
import FormResolution from "@/components/Form/Resolution";
import FormSimulcastRid from "@/components/Form/SimulcastRid";
import FormSpotlight from "@/components/Form/Spotlight";
import FormSpotlightNumber from "@/components/Form/SpotlightNumber";
import FormVideo from "@/components/Form/Video";
import FormVideoBitRate from "@/components/Form/VideoBitRate";
import FormVideoCodecType from "@/components/Form/VideoCodecType";
import FormVideoInput from "@/components/Form/VideoInput";
import RemoteVideos from "@/components/RemoteVideos";
import SelfConnection from "@/components/SelfConnection";
import { SoraDemoState } from "@/slice";
import { ConnectType, EnabledParameters } from "@/utils";

type Props = {
  connectType: ConnectType;
  multistream?: boolean;
  simulcast?: boolean;
  spotlight?: boolean;
  enabledParameters: EnabledParameters;
};
const ColDemo: React.FC<Props> = (props) => {
  const { debug, enabledMetadata } = useSelector((state: SoraDemoState) => state);
  return (
    <div className={debug ? "col-demo col-6" : "col-demo col-12"}>
      <AlertMessages />
      <div className="form-row align-items-center">
        {props.enabledParameters.channelId ? <FormChannelId /> : null}
        {props.enabledParameters.metadata ? <FormEnabledMetadata /> : null}
        {props.enabledParameters.spotlight ? <FormSpotlight /> : null}
        {props.enabledParameters.spotlightNumber ? <FormSpotlightNumber /> : null}
        {props.enabledParameters.mediaType ? <FormMediaType /> : null}
      </div>
      <div className="form-row align-items-center">
        {props.enabledParameters.metadata && enabledMetadata ? <FormMetadata /> : null}
      </div>
      <div className="form-row align-items-center">
        {props.enabledParameters.video ? <FormVideo /> : null}
        {props.enabledParameters.videoCodecType ? <FormVideoCodecType /> : null}
        {props.enabledParameters.videoBitRate ? <FormVideoBitRate /> : null}
        {props.enabledParameters.resolution ? <FormResolution /> : null}
        {props.enabledParameters.frameRate ? <FormFrameRate /> : null}
        {props.enabledParameters.simulcastRid ? <FormSimulcastRid /> : null}
      </div>
      <div className="form-row align-items-center">
        {props.enabledParameters.audio ? <FormAudio /> : null}
        {props.enabledParameters.audioCodecType ? <FormAudioCodecType /> : null}
        {props.enabledParameters.audioBitRate ? <FormAudioBitRate /> : null}
        {props.enabledParameters.autoGainControl ? <FormAutoGainControl /> : null}
        {props.enabledParameters.noiseSuppression ? <FormNoiseSuppression /> : null}
        {props.enabledParameters.echoCancellation ? <FormEchoCancellation /> : null}
        {props.enabledParameters.echoCancellationType ? <FormEchoCancellationType /> : null}
      </div>
      <div className="form-row align-items-center">
        {props.enabledParameters.audioInput ? <FormAudioInput /> : null}
        {props.enabledParameters.videoInput ? <FormVideoInput /> : null}
        {props.enabledParameters.audioOutput ? <FormAudioOutput /> : null}
      </div>
      <div className="form-row align-items-center">
        <ButtonConnect
          connectType={props.connectType}
          multistream={props.multistream ? true : false}
          spotlight={props.spotlight ? true : false}
          simulcast={props.simulcast ? true : false}
        />
        <ButtonDisconnect />
        <ButtonStartRecording />
        <ButtonStopRecording />
        {!props.spotlight && props.simulcast && props.connectType !== "sendonly" ? (
          <>
            <ButtonRequestRtpStream rid={"r0"} />
            <ButtonRequestRtpStream rid={"r1"} />
            <ButtonRequestRtpStream rid={"r2"} />
          </>
        ) : null}
        {props.spotlight && props.simulcast && props.connectType !== "sendonly" ? (
          <>
            <ButtonRequestRtpStream rid={"r0"} />
            <ButtonRequestRtpStream rid={"r1"} />
            <ButtonRequestRtpStream rid={"r2"} />
            <ButtonResetRtpStream />
          </>
        ) : null}
      </div>
      <SelfConnection connectType={props.connectType} />
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

export default ColDemo;
