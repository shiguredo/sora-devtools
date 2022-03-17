import { Dispatch } from "@reduxjs/toolkit";

import type { QueryStringParameters, SoraDevtoolsState } from "@/types";
import { copy2clipboard } from "@/utils";

export const copyURL = () => {
  return (_: Dispatch, getState: () => SoraDevtoolsState): void => {
    const state = getState();
    const parameters: Partial<QueryStringParameters> = {
      // URL の長さ短縮のため初期値と同じ場合は query string に含めない
      mediaType: state.mediaType !== "getUserMedia" ? state.mediaType : undefined,
      channelId: state.channelId,
      audio: state.audio,
      video: state.video,
      audioBitRate: state.audioBitRate,
      audioCodecType: state.audioCodecType,
      videoBitRate: state.videoBitRate,
      videoCodecType: state.videoCodecType,
      // URL の長さ短縮のため空文字列は query string に含めない
      audioContentHint: state.audioContentHint !== "" ? state.audioContentHint : undefined,
      autoGainControl: state.autoGainControl !== "" ? state.autoGainControl : undefined,
      noiseSuppression: state.noiseSuppression !== "" ? state.noiseSuppression : undefined,
      echoCancellation: state.echoCancellation !== "" ? state.echoCancellation : undefined,
      echoCancellationType: state.echoCancellationType,
      videoContentHint: state.videoContentHint !== "" ? state.videoContentHint : undefined,
      resolution: state.resolution !== "" ? state.resolution : undefined,
      frameRate: state.frameRate !== "" ? state.frameRate : undefined,
      aspectRatio: state.aspectRatio !== "" ? state.aspectRatio : undefined,
      resizeMode: state.resizeMode !== "" ? state.resizeMode : undefined,
      blurRadius: state.blurRadius !== "" ? state.blurRadius : undefined,
      multistream: state.multistream !== "" ? state.multistream : undefined,
      simulcast: state.simulcast !== "" ? state.simulcast : undefined,
      simulcastRid: state.simulcastRid !== "" ? state.simulcastRid : undefined,
      spotlight: state.spotlight !== "" ? state.spotlight : undefined,
      spotlightNumber: state.spotlightNumber !== "" ? state.spotlightNumber : undefined,
      spotlightFocusRid: state.spotlightFocusRid !== "" ? state.spotlightFocusRid : undefined,
      spotlightUnfocusRid: state.spotlightUnfocusRid !== "" ? state.spotlightUnfocusRid : undefined,
      audioInput: state.audioInput !== "" ? state.audioInput : undefined,
      audioOutput: state.audioOutput !== "" ? state.audioOutput : undefined,
      videoInput: state.videoInput !== "" ? state.videoInput : undefined,
      displayResolution: state.displayResolution !== "" ? state.displayResolution : undefined,
      // URL の長さ短縮のため true 以外は query string に含めない
      mediaProcessorsNoiseSuppression: state.mediaProcessorsNoiseSuppression === true ? true : undefined,
      micDevice: state.micDevice === true ? true : undefined,
      cameraDevice: state.cameraDevice === true ? true : undefined,
      audioTrack: state.audioTrack === true ? true : undefined,
      videoTrack: state.videoTrack === true ? true : undefined,
      // spotlight
      // options
      e2ee: state.e2ee,
      clientId: state.clientId,
      metadata: state.metadata,
      signalingNotifyMetadata: state.signalingNotifyMetadata,
      dataChannelSignaling: state.dataChannelSignaling,
      ignoreDisconnectWebSocket: state.ignoreDisconnectWebSocket,
      signalingUrlCandidates: state.signalingUrlCandidates,
      dataChannels: state.dataChannels,
      reconnect: state.reconnect,
      debug: state.debug,
      fakeVolume: state.mediaType === "fakeMedia" ? state.fakeVolume : undefined,
      // apiUrl
      apiUrl: state.apiUrl !== null ? state.apiUrl : undefined,
    };
    const queryStrings = Object.keys(parameters)
      .map((key) => {
        const value = (parameters as Record<string, unknown>)[key];
        if (value === undefined) {
          return;
        }
        // signalingUrlCandidates は Array なので JSON.stringify する
        if (key === "signalingUrlCandidates") {
          return `${key}=${encodeURIComponent(JSON.stringify(value))}`;
        }
        return `${key}=${encodeURIComponent(value as string)}`;
      })
      .filter((value) => value !== undefined);
    copy2clipboard(`${location.origin}${location.pathname}?${queryStrings.join("&")}`);
  };
};
