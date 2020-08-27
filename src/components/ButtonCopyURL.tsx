import React from "react";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/slice";
import { copy2clipboard } from "@/utils";

const ButtonCopyURL: React.FC = () => {
  const state = useSelector((state: SoraDemoState) => state);
  const onClick = (): void => {
    const parameters: string[] = [];
    if (state.enabledParameters.enabledAudio) {
      parameters.push(`audio=${state.audio}`);
    }
    if (state.enabledParameters.enabledAudioBitRate) {
      parameters.push(`audioBitRate=${state.audioBitRate}`);
    }
    if (state.enabledParameters.enabledAudioCodecType) {
      parameters.push(`audioCodecType=${state.audioCodecType}`);
    }
    if (state.enabledParameters.enabledAudioInput) {
      parameters.push(`audioInput=${state.audioInput}`);
    }
    if (state.enabledParameters.enabledAudioOutput) {
      parameters.push(`audioOutput=${state.audioOutput}`);
    }
    if (state.enabledParameters.enabledAutoGainControl) {
      parameters.push(`autoGainControl=${state.autoGainControl}`);
    }
    if (state.enabledParameters.enabledChannelId) {
      parameters.push(`channelId=${state.channelId}`);
    }
    if (state.enabledParameters.enabledCpuOveruseDetection) {
      parameters.push(`cpuOveruseDetection=${state.cpuOveruseDetection}`);
    }
    if (state.enabledParameters.enabledEchoCancellation) {
      parameters.push(`echoCancellation=${state.echoCancellation}`);
    }
    if (state.enabledParameters.enabledEchoCancellationType) {
      parameters.push(`echoCancellationType=${state.echoCancellationType}`);
    }
    if (state.enabledParameters.enabledFake) {
      parameters.push(`fake=${state.fake}`);
    }
    if (state.enabledParameters.enabledFrameRate) {
      parameters.push(`frameRate=${state.frameRate}`);
    }
    if (state.enabledParameters.enabledGetDisplayMedia) {
      parameters.push(`getDisplayMedia=${state.getDisplayMedia}`);
    }
    if (state.enabledParameters.enabledNoiseSuppression) {
      parameters.push(`noiseSuppression=${state.noiseSuppression}`);
    }
    if (state.enabledParameters.enabledResolution) {
      parameters.push(`resolution=${state.resolution}`);
    }
    if (state.enabledParameters.enabledSimulcastQuality) {
      parameters.push(`simulcastQuality=${state.simulcastQuality}`);
    }
    if (state.enabledParameters.enabledSpotlight) {
      parameters.push(`spotlight=${state.spotlight}`);
    }
    if (state.enabledParameters.enabledVideo) {
      parameters.push(`video=${state.video}`);
    }
    if (state.enabledParameters.enabledVideoBitRate) {
      parameters.push(`videoBitRate=${state.videoBitRate}`);
    }
    if (state.enabledParameters.enabledVideoCodecType) {
      parameters.push(`videoCodecType=${state.videoCodecType}`);
    }
    if (state.enabledParameters.enabledVideoInput) {
      parameters.push(`videoInput=${state.videoInput}`);
    }
    parameters.push(`debug=${state.debug}`);
    copy2clipboard(`${location.origin}${location.pathname}?${parameters.join("&")}`);
  };
  return (
    <input className="btn btn-light btn-sm" type="button" name="copyUrl" defaultValue="copy URL" onClick={onClick} />
  );
};

export default ButtonCopyURL;
