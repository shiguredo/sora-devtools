import React from "react";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/app/slice";
import { AlertMessages } from "@/components/AlertMessages";
import { Connect } from "@/components/Button/Connect";
import { Disconnect } from "@/components/Button/Disconnect";
import { ReloadDevices } from "@/components/Button/ReloadDevices";
import { RequestRtpStream } from "@/components/Button/RequestRtpStream";
import { ResetRtpStream } from "@/components/Button/ResetRtpStream";
import { StartRecording } from "@/components/Button/StartRecording";
import { StopRecording } from "@/components/Button/StopRecording";
import { Audio } from "@/components/Form/Audio";
import { AudioBitRate } from "@/components/Form/AudioBitRate";
import { AudioCodecType } from "@/components/Form/AudioCodecType";
import { AudioInput } from "@/components/Form/AudioInput";
import { AudioOutput } from "@/components/Form/AudioOutput";
import { AudioTrack } from "@/components/Form/AudioTrack";
import { AutoGainControl } from "@/components/Form/AutoGainControl";
import { CameraDevice } from "@/components/Form/CameraDevice";
import { ChannelId } from "@/components/Form/ChannelId";
import { ClientId } from "@/components/Form/ClientId";
import { DataChannelMessaging } from "@/components/Form/DataChannelMessaging";
import { DataChannelSignaling } from "@/components/Form/DataChannelSignaling";
import { DisplayResolution } from "@/components/Form/DisplayResolution";
import { E2EE } from "@/components/Form/E2EE";
import { EchoCancellation } from "@/components/Form/EchoCancellation";
import { EchoCancellationType } from "@/components/Form/EchoCancellationType";
import { EnabledClientId } from "@/components/Form/EnabledClientId";
import { EnabledDataChannel } from "@/components/Form/EnabledDataChannel";
import { EnabledDataChannelMessaging } from "@/components/Form/EnabledDataChannelMessaging";
import { EnabledMetadata } from "@/components/Form/EnabledMetadata";
import { EnabledSignalingNotifyMetadata } from "@/components/Form/EnabledSignalingNotifyMetadata";
import { EnabledSignalingUrlCandidates } from "@/components/Form/EnabledSignalingUrlCandidates";
import { FrameRate } from "@/components/Form/FrameRate";
import { IgnoreDisconnectWebSocket } from "@/components/Form/IgnoreDisconnectWebSocket";
import { MediaType } from "@/components/Form/MediaType";
import { Metadata } from "@/components/Form/Metadata";
import { MicDevice } from "@/components/Form/MicDevice";
import { NoiseSuppression } from "@/components/Form/NoiseSuppression";
import { Resolution } from "@/components/Form/Resolution";
import { SignalingNotifyMetadata } from "@/components/Form/SignalingNotifyMetadata";
import { SignalingUrlCandidates } from "@/components/Form/SignalingUrlCandidates";
import { SimulcastRid } from "@/components/Form/SimulcastRid";
import { Spotlight } from "@/components/Form/Spotlight";
import { SpotlightFocusRid } from "@/components/Form/SpotlightFocusRid";
import { SpotlightNumber } from "@/components/Form/SpotlightNumber";
import { SpotlightUnfocusRid } from "@/components/Form/SpotlightUnfocusRid";
import { Video } from "@/components/Form/Video";
import { VideoBitRate } from "@/components/Form/VideoBitRate";
import { VideoCodecType } from "@/components/Form/VideoCodecType";
import { VideoInput } from "@/components/Form/VideoInput";
import { VideoTrack } from "@/components/Form/VideoTrack";
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
  const debug = useSelector((state: SoraDemoState) => state.debug);
  const enabledClientId = useSelector((state: SoraDemoState) => state.enabledClientId);
  const enabledDataChannel = useSelector((state: SoraDemoState) => state.enabledDataChannel);
  const enabledDataChannelMessaging = useSelector((state: SoraDemoState) => state.enabledDataChannelMessaging);
  const enabledMetadata = useSelector((state: SoraDemoState) => state.enabledMetadata);
  const enabledSignalingNotifyMetadata = useSelector((state: SoraDemoState) => state.enabledSignalingNotifyMetadata);
  const enabledSignalingUrlCandidates = useSelector((state: SoraDemoState) => state.enabledSignalingUrlCandidates);
  return (
    <div className={debug ? "col-demo col-6" : "col-demo col-12"}>
      <AlertMessages />
      <div className="form-row align-items-center py-1">{props.enabledParameters.mediaType ? <MediaType /> : null}</div>
      <div className="form-row align-items-center">
        {props.enabledParameters.channelId ? <ChannelId /> : null}
        {props.enabledParameters.clientId ? <EnabledClientId /> : null}
        {props.enabledParameters.metadata ? <EnabledMetadata /> : null}
        {props.enabledParameters.signalingNotifyMetadata ? <EnabledSignalingNotifyMetadata /> : null}
        {props.enabledParameters.dataChannel ? <EnabledDataChannel /> : null}
        {props.enabledParameters.spotlight ? <Spotlight /> : null}
        {props.enabledParameters.spotlightNumber ? <SpotlightNumber /> : null}
        {props.enabledParameters.e2ee ? <E2EE /> : null}
        {props.enabledParameters.signalingUrlCandidates ? <EnabledSignalingUrlCandidates /> : null}
        <EnabledDataChannelMessaging />
      </div>
      <div className="form-row align-items-center">
        {props.enabledParameters.clientId && enabledClientId ? <ClientId /> : null}
      </div>
      <div className="form-row align-items-center">
        {props.enabledParameters.metadata && enabledMetadata ? <Metadata /> : null}
      </div>
      <div className="form-row align-items-center">
        {props.enabledParameters.signalingNotifyMetadata && enabledSignalingNotifyMetadata ? (
          <SignalingNotifyMetadata />
        ) : null}
      </div>
      <div className="form-row align-items-center">
        {props.enabledParameters.dataChannel && enabledDataChannel ? (
          <>
            <DataChannelSignaling />
            <IgnoreDisconnectWebSocket />
          </>
        ) : null}
      </div>
      <div className="form-row align-items-center">
        {props.enabledParameters.signalingUrlCandidates && enabledSignalingUrlCandidates ? (
          <SignalingUrlCandidates />
        ) : null}
      </div>
      <div className="form-row align-items-center">{enabledDataChannelMessaging ? <DataChannelMessaging /> : null}</div>
      <div className="form-row align-items-center">
        {props.enabledParameters.audio ? <Audio /> : null}
        {props.enabledParameters.audioCodecType ? <AudioCodecType /> : null}
        {props.enabledParameters.audioBitRate ? <AudioBitRate /> : null}
        {props.enabledParameters.autoGainControl ? <AutoGainControl /> : null}
        {props.enabledParameters.noiseSuppression ? <NoiseSuppression /> : null}
        {props.enabledParameters.echoCancellation ? <EchoCancellation /> : null}
        {props.enabledParameters.echoCancellationType ? <EchoCancellationType /> : null}
      </div>
      <div className="form-row align-items-center">
        {props.enabledParameters.video ? <Video /> : null}
        {props.enabledParameters.videoCodecType ? <VideoCodecType /> : null}
        {props.enabledParameters.videoBitRate ? <VideoBitRate /> : null}
        {props.enabledParameters.resolution ? <Resolution /> : null}
        {props.enabledParameters.frameRate ? <FrameRate /> : null}
        {props.enabledParameters.simulcastRid ? <SimulcastRid /> : null}
        {props.enabledParameters.spotlightFocusRid ? <SpotlightFocusRid /> : null}
        {props.enabledParameters.spotlightUnfocusRid ? <SpotlightUnfocusRid /> : null}
      </div>
      <div className="form-row align-items-center">
        {props.enabledParameters.audioInput ? <AudioInput /> : null}
        {props.enabledParameters.audioOutput ? <AudioOutput /> : null}
        {props.enabledParameters.videoInput ? <VideoInput /> : null}
        {props.enabledParameters.displayResolution ? <DisplayResolution /> : null}
      </div>
      <div className="form-row align-items-center py-1">
        {props.enabledParameters.micDevice ? <MicDevice /> : null}
        {props.enabledParameters.cameraDevice ? <CameraDevice /> : null}
        {props.enabledParameters.audioTrack ? <AudioTrack /> : null}
        {props.enabledParameters.videoTrack ? <VideoTrack /> : null}
      </div>
      <div className="form-row align-items-center">
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
        <ReloadDevices />
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
