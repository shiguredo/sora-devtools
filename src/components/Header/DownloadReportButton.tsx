import type { FunctionComponent } from "preact";
import { useRef } from "preact/hooks";
import Sora from "sora-js-sdk";

import { getState } from "@/app/store";
import type { DownloadReport, DownloadReportParameters } from "@/types";

function createDownloadReport(): DownloadReport {
  const state = getState();
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
    debugApiUrl: state.debugApiUrl,
    displayResolution: state.displayResolution,
    echoCancellation: state.echoCancellation,
    echoCancellationType: state.echoCancellationType,
    enabledAudioStreamingLanguageCode: state.enabledAudioStreamingLanguageCode,
    enabledBundleId: state.enabledBundleId,
    enabledClientId: state.enabledClientId,
    enabledDataChannel: state.enabledDataChannel,
    enabledDataChannels: state.enabledDataChannels,
    enabledForwardingFilters: state.enabledForwardingFilters,
    enabledForwardingFilter: state.enabledForwardingFilter,
    enabledMetadata: state.enabledMetadata,
    enabledSignalingNotifyMetadata: state.enabledSignalingNotifyMetadata,
    enabledSignalingUrlCandidates: state.enabledSignalingUrlCandidates,
    enabledVideoVP9Params: state.enabledVideoVP9Params,
    enabledVideoH264Params: state.enabledVideoH264Params,
    enabledVideoH265Params: state.enabledVideoH265Params,
    enabledVideoAV1Params: state.enabledVideoAV1Params,
    facingMode: state.facingMode,
    fakeVolume: state.fakeVolume,
    forceStereoOutput: state.forceStereoOutput,
    forwardingFilters: state.forwardingFilters,
    forwardingFilter: state.forwardingFilter,
    frameRate: state.frameRate,
    googCpuOveruseDetection: state.googCpuOveruseDetection,
    ignoreDisconnectWebSocket: state.ignoreDisconnectWebSocket,
    mediaType: state.mediaType,
    metadata: state.metadata,
    micDevice: state.micDevice,
    noiseSuppression: state.noiseSuppression,
    reconnect: state.reconnect,
    resizeMode: state.resizeMode,
    resolution: state.resolution,
    mediaStats: state.mediaStats,
    role: state.role,
    signalingNotifyMetadata: state.signalingNotifyMetadata,
    signalingUrlCandidates: state.signalingUrlCandidates,
    simulcast: state.simulcast,
    simulcastRid: state.simulcastRid,
    simulcastRequestRid: state.simulcastRequestRid,
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
    videoVP9Params: state.videoVP9Params,
    videoH264Params: state.videoH264Params,
    videoH265Params: state.videoH265Params,
    videoAV1Params: state.videoAV1Params,
  };
  const report = {
    userAgent: navigator.userAgent,
    "sora-devtools": state.version,
    "sora-js-sdk": Sora.version(),
    parameters: parameters,
    timeline: state.timelineMessages.map((message) => {
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

export const DownloadReportButton: FunctionComponent = () => {
  const anchorRef = useRef<HTMLAnchorElement>(null);

  const onClick = (): void => {
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
      <button type="button" className="btn btn-sm btn-outline" onClick={onClick}>
        Report
      </button>
      {/* biome-ignore lint/a11y/useAnchorContent: Hidden anchor for file download */}
      {/* biome-ignore lint/a11y/useValidAnchor: Hidden anchor for file download */}
      <a ref={anchorRef} style={{ display: "none" }} />
    </>
  );
};
