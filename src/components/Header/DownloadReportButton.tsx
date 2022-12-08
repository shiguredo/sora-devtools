import React, { useRef } from "react";
import Sora from "sora-js-sdk";

import { store } from "@/app/store";
import { DownloadReport, DownloadReportParameters } from "@/types";

function createDownloadReport(): DownloadReport {
  const state = store.getState();
  const parameters: DownloadReportParameters = {
    aspectRatio: state.aspectRatio,
    audio: state.audio,
    audioBitRate: state.audioBitRate,
    audioCodecType: state.audioCodecType,
    audioContentHint: state.audioContentHint,
    audioInput: state.audioInput,
    audioInputDevices: state.audioInputDevices,
    audioOutput: state.audioOutput,
    audioOutputDevices: state.audioOutputDevices,
    audioStreamingLanguageCode: state.audioStreamingLanguageCode,
    audioTrack: state.audioTrack,
    autoGainControl: state.autoGainControl,
    bundleId: state.bundleId,
    cameraDevice: state.cameraDevice,
    channelId: state.channelId,
    clientId: state.clientId,
    dataChannelSignaling: state.dataChannelSignaling,
    dataChannels: state.dataChannels,
    debug: state.debug,
    displayResolution: state.displayResolution,
    e2ee: state.e2ee,
    echoCancellation: state.echoCancellation,
    echoCancellationType: state.echoCancellationType,
    enabledAudioStreamingLanguageCode: state.enabledAudioStreamingLanguageCode,
    enabledBundleId: state.enabledBundleId,
    enabledClientId: state.enabledClientId,
    enabledDataChannel: state.enabledDataChannel,
    enabledDataChannels: state.enabledDataChannels,
    enabledMetadata: state.enabledMetadata,
    enabledSignalingNotifyMetadata: state.enabledSignalingNotifyMetadata,
    enabledSignalingUrlCandidates: state.enabledSignalingUrlCandidates,
    facingMode: state.facingMode,
    fakeVolume: state.fakeVolume,
    frameRate: state.frameRate,
    googCpuOveruseDetection: state.googCpuOveruseDetection,
    ignoreDisconnectWebSocket: state.ignoreDisconnectWebSocket,
    mediaType: state.mediaType,
    metadata: state.metadata,
    micDevice: state.micDevice,
    multistream: state.multistream,
    noiseSuppression: state.noiseSuppression,
    reconnect: state.reconnect,
    resizeMode: state.resizeMode,
    resolution: state.resolution,
    role: state.role,
    signalingNotifyMetadata: state.signalingNotifyMetadata,
    signalingUrlCandidates: state.signalingUrlCandidates,
    simulcast: state.simulcast,
    simulcastRid: state.simulcastRid,
    spotlight: state.spotlight,
    spotlightFocusRid: state.spotlightFocusRid,
    spotlightNumber: state.spotlightNumber,
    spotlightUnfocusRid: state.spotlightUnfocusRid,
    video: state.video,
    videoBitRate: state.videoBitRate,
    videoCodecType: state.videoCodecType,
    videoContentHint: state.videoContentHint,
    videoInput: state.videoInput,
    videoInputDevices: state.videoInputDevices,
    videoTrack: state.videoTrack,
  };
  const report = {
    userAgent: navigator.userAgent,
    "sora-devtools": state.version,
    "sora-js-sdk": Sora.version(),
    parameters: parameters,
    timeline: state.timelineMessages.map((message) => {
      // Redux non-serializable value 対応で log を string にして保存してあるため parse する
      return {
        timestamp: message.timestamp,
        message: message,
      };
    }),
    notify: state.notifyMessages,
    stats: state.soraContents.statsReport,
  };
  return report;
}

export const DownloadReportButton: React.FC = () => {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const onClick = async (): Promise<void> => {
    const report = createDownloadReport();
    const data = JSON.stringify(report);
    const blob = new Blob([data], { type: "text/plain" });
    window.URL = window.URL || window.webkitURL;
    if (anchorRef.current) {
      const datetimeString = new Date().toISOString().replaceAll(":", "_").replaceAll(".", "_");
      anchorRef.current.download = `sora-devtools-report-${datetimeString}.json`;
      anchorRef.current.href = window.URL.createObjectURL(blob);
      anchorRef.current.click();
    }
  };
  return (
    <>
      <input
        className="btn btn-light btn-sm ms-1"
        type="button"
        name="downloadReport"
        defaultValue="Download report"
        onClick={onClick}
      />
      <a ref={anchorRef} style={{ display: "none" }} />
    </>
  );
};
