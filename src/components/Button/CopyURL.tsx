import React from "react";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/app/slice";
import { copy2clipboard } from "@/utils";
import { EnabledParameters } from "@/utils";

type Props = {
  enabledParameters: EnabledParameters;
};
export const CopyURL: React.FC<Props> = (props) => {
  const state = useSelector((state: SoraDemoState) => state);
  const onClick = (): void => {
    const parameters: string[] = [];
    if (props.enabledParameters.audio) {
      parameters.push(`audio=${state.audio}`);
    }
    if (props.enabledParameters.audioBitRate) {
      parameters.push(`audioBitRate=${state.audioBitRate}`);
    }
    if (props.enabledParameters.audioCodecType) {
      parameters.push(`audioCodecType=${state.audioCodecType}`);
    }
    if (props.enabledParameters.audioInput) {
      parameters.push(`audioInput=${state.audioInput}`);
    }
    if (props.enabledParameters.audioOutput) {
      parameters.push(`audioOutput=${state.audioOutput}`);
    }
    if (props.enabledParameters.audioTrack) {
      parameters.push(`audioTrack=${state.audioTrack}`);
    }
    if (props.enabledParameters.autoGainControl) {
      parameters.push(`autoGainControl=${state.autoGainControl}`);
    }
    if (props.enabledParameters.cameraDevice) {
      parameters.push(`cameraDevice=${state.cameraDevice}`);
    }
    if (props.enabledParameters.channelId) {
      parameters.push(`channelId=${state.channelId}`);
    }
    if (props.enabledParameters.clientId && state.enabledClientId) {
      parameters.push(`clientId=${state.clientId}`);
    }
    if (props.enabledParameters.displayResolution) {
      parameters.push(`displayResolution=${state.displayResolution}`);
    }
    if (props.enabledParameters.e2ee) {
      parameters.push(`e2ee=${state.e2ee}`);
    }
    if (props.enabledParameters.echoCancellation) {
      parameters.push(`echoCancellation=${state.echoCancellation}`);
    }
    if (props.enabledParameters.echoCancellationType) {
      parameters.push(`echoCancellationType=${state.echoCancellationType}`);
    }
    if (props.enabledParameters.frameRate) {
      parameters.push(`frameRate=${state.frameRate}`);
    }
    if (props.enabledParameters.mediaType) {
      parameters.push(`mediaType=${state.mediaType}`);
    }
    if (props.enabledParameters.metadata && state.enabledMetadata) {
      parameters.push(`metadata=${state.metadata}`);
    }
    if (props.enabledParameters.micDevice) {
      parameters.push(`micDevice=${state.micDevice}`);
    }
    if (props.enabledParameters.noiseSuppression) {
      parameters.push(`noiseSuppression=${state.noiseSuppression}`);
    }
    if (props.enabledParameters.resolution) {
      parameters.push(`resolution=${state.resolution}`);
    }
    if (props.enabledParameters.simulcastRid) {
      parameters.push(`simulcastRid=${state.simulcastRid}`);
    }
    if (props.enabledParameters.spotlight) {
      parameters.push(`spotlight=${state.spotlight}`);
    }
    if (props.enabledParameters.spotlightNumber) {
      parameters.push(`spotlightNumber=${state.spotlightNumber}`);
    }
    if (props.enabledParameters.spotlightFocusRid) {
      parameters.push(`spotlightFocusRid=${state.spotlightFocusRid}`);
    }
    if (props.enabledParameters.spotlightUnfocusRid) {
      parameters.push(`spotlightUnfocusRid=${state.spotlightUnfocusRid}`);
    }
    if (props.enabledParameters.video) {
      parameters.push(`video=${state.video}`);
    }
    if (props.enabledParameters.videoBitRate) {
      parameters.push(`videoBitRate=${state.videoBitRate}`);
    }
    if (props.enabledParameters.videoCodecType) {
      parameters.push(`videoCodecType=${state.videoCodecType}`);
    }
    if (props.enabledParameters.videoInput) {
      parameters.push(`videoInput=${state.videoInput}`);
    }
    if (props.enabledParameters.videoTrack) {
      parameters.push(`videoTrack=${state.videoTrack}`);
    }
    if (props.enabledParameters.dataChannel && state.enabledDataChannel) {
      parameters.push(`dataChannelSignaling=${state.dataChannelSignaling}`);
      parameters.push(`ignoreDisconnectWebSocket=${state.ignoreDisconnectWebSocket}`);
    }
    if (props.enabledParameters.signalingUrlCandidates && state.enabledSignalingUrlCandidates) {
      parameters.push(`signalingUrlCandidates=${JSON.stringify(state.signalingUrlCandidates)}`);
    }
    if (state.enabledDataChannelMessaging && state.dataChannelMessaging !== "") {
      parameters.push(`dataChannelMessaging=${encodeURIComponent(state.dataChannelMessaging)}`);
    }
    parameters.push(`debug=${state.debug}`);
    copy2clipboard(`${location.origin}${location.pathname}?${parameters.join("&")}`);
  };
  return (
    <input
      className="btn btn-light btn-sm ms-1"
      type="button"
      name="copyUrl"
      defaultValue="copy URL"
      onClick={onClick}
    />
  );
};
