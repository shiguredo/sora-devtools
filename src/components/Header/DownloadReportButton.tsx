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
    autoGainControl: state.autoGainControl,
    bundleId: state.bundleId,
    clientId: state.clientId,
    channelId: state.channelId,
    googCpuOveruseDetection: state.googCpuOveruseDetection,
    debug: state.debug,
    dataChannelSignaling: state.dataChannelSignaling,
    dataChannels: state.dataChannels,
    displayResolution: state.displayResolution,
    e2ee: state.e2ee,
    echoCancellation: state.echoCancellation,
    echoCancellationType: state.echoCancellationType,
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
    ignoreDisconnectWebSocket: state.ignoreDisconnectWebSocket,
    mediaType: state.mediaType,
    metadata: state.metadata,
    multistream: state.multistream,
    noiseSuppression: state.noiseSuppression,
    reconnect: state.reconnect,
    resizeMode: state.resizeMode,
    resolution: state.resolution,
    simulcast: state.simulcast,
    spotlight: state.spotlight,
    signalingNotifyMetadata: state.signalingNotifyMetadata,
    signalingUrlCandidates: state.signalingUrlCandidates,
    simulcastRid: state.simulcastRid,
    spotlightNumber: state.spotlightNumber,
    spotlightFocusRid: state.spotlightFocusRid,
    spotlightUnfocusRid: state.spotlightUnfocusRid,
    video: state.video,
    videoBitRate: state.videoBitRate,
    videoCodecType: state.videoCodecType,
    videoContentHint: state.videoContentHint,
    videoInput: state.videoInput,
    videoInputDevices: state.videoInputDevices,
    cameraDevice: state.cameraDevice,
    videoTrack: state.videoTrack,
    micDevice: state.micDevice,
    audioTrack: state.audioTrack,
    role: state.role,
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
