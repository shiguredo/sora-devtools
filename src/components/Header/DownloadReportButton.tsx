import { useRef } from "preact/hooks";
import Sora from "sora-js-sdk";

import { Button } from "@/components/ui";

import {
  aspectRatio,
  audio,
  audioBitRate,
  audioCodecType,
  audioContentHint,
  audioInput,
  audioInputDevices,
  audioOutput,
  audioOutputDevices,
  audioStreamingLanguageCode,
  audioTrack,
  autoGainControl,
  bundleId,
  cameraDevice,
  channelId,
  clientId,
  dataChannelSignaling,
  dataChannels,
  debug,
  debugApiUrl,
  displayResolution,
  echoCancellation,
  echoCancellationType,
  enabledAudioStreamingLanguageCode,
  enabledBundleId,
  enabledClientId,
  enabledDataChannel,
  enabledDataChannels,
  enabledForwardingFilters,
  enabledMetadata,
  enabledSignalingNotifyMetadata,
  enabledSignalingUrlCandidates,
  enabledVideoAV1Params,
  enabledVideoH264Params,
  enabledVideoH265Params,
  enabledVideoVP9Params,
  facingMode,
  fakeVideoShowChannelId,
  fakeVolume,
  forceStereoOutput,
  forwardingFilters,
  frameRate,
  googCpuOveruseDetection,
  ignoreDisconnectWebSocket,
  mediaStats,
  mediaType,
  metadata,
  micDevice,
  noiseSuppression,
  notifyMessages,
  reconnect,
  resizeMode,
  resolution,
  role,
  signalingNotifyMetadata,
  signalingUrlCandidates,
  simulcast,
  simulcastRequestRid,
  simulcastRid,
  soraContents,
  spotlight,
  spotlightFocusRid,
  spotlightNumber,
  spotlightUnfocusRid,
  timelineMessages,
  version,
  video,
  videoAV1Params,
  videoBitRate,
  videoCodecType,
  videoContentHint,
  videoH264Params,
  videoH265Params,
  videoInput,
  videoInputDevices,
  videoTrack,
  videoVP9Params,
} from "@/app/signals";
import type { DownloadReport, DownloadReportParameters } from "@/types";

function createDownloadReport(): DownloadReport {
  const parameters: DownloadReportParameters = {
    aspectRatio: aspectRatio.value,
    audio: audio.value,
    audioBitRate: audioBitRate.value,
    audioCodecType: audioCodecType.value,
    audioContentHint: audioContentHint.value,
    audioInput: audioInput.value,
    audioInputDevices: audioInputDevices.value,
    audioOutput: audioOutput.value,
    audioOutputDevices: audioOutputDevices.value,
    audioStreamingLanguageCode: audioStreamingLanguageCode.value,
    audioTrack: audioTrack.value,
    autoGainControl: autoGainControl.value,
    bundleId: bundleId.value,
    cameraDevice: cameraDevice.value,
    channelId: channelId.value,
    clientId: clientId.value,
    dataChannelSignaling: dataChannelSignaling.value,
    dataChannels: dataChannels.value,
    debug: debug.value,
    debugApiUrl: debugApiUrl.value,
    displayResolution: displayResolution.value,
    echoCancellation: echoCancellation.value,
    echoCancellationType: echoCancellationType.value,
    enabledAudioStreamingLanguageCode: enabledAudioStreamingLanguageCode.value,
    enabledBundleId: enabledBundleId.value,
    enabledClientId: enabledClientId.value,
    enabledDataChannel: enabledDataChannel.value,
    enabledDataChannels: enabledDataChannels.value,
    enabledForwardingFilters: enabledForwardingFilters.value,
    enabledMetadata: enabledMetadata.value,
    enabledSignalingNotifyMetadata: enabledSignalingNotifyMetadata.value,
    enabledSignalingUrlCandidates: enabledSignalingUrlCandidates.value,
    enabledVideoVP9Params: enabledVideoVP9Params.value,
    enabledVideoH264Params: enabledVideoH264Params.value,
    enabledVideoH265Params: enabledVideoH265Params.value,
    enabledVideoAV1Params: enabledVideoAV1Params.value,
    facingMode: facingMode.value,
    fakeVideoShowChannelId: fakeVideoShowChannelId.value,
    fakeVolume: fakeVolume.value,
    forceStereoOutput: forceStereoOutput.value,
    forwardingFilters: forwardingFilters.value,
    frameRate: frameRate.value,
    googCpuOveruseDetection: googCpuOveruseDetection.value,
    ignoreDisconnectWebSocket: ignoreDisconnectWebSocket.value,
    mediaType: mediaType.value,
    metadata: metadata.value,
    micDevice: micDevice.value,
    noiseSuppression: noiseSuppression.value,
    reconnect: reconnect.value,
    resizeMode: resizeMode.value,
    resolution: resolution.value,
    mediaStats: mediaStats.value,
    role: role.value,
    signalingNotifyMetadata: signalingNotifyMetadata.value,
    signalingUrlCandidates: signalingUrlCandidates.value,
    simulcast: simulcast.value,
    simulcastRid: simulcastRid.value,
    simulcastRequestRid: simulcastRequestRid.value,
    spotlight: spotlight.value,
    spotlightFocusRid: spotlightFocusRid.value,
    spotlightNumber: spotlightNumber.value,
    spotlightUnfocusRid: spotlightUnfocusRid.value,
    video: video.value,
    videoBitRate: videoBitRate.value,
    videoCodecType: videoCodecType.value,
    videoContentHint: videoContentHint.value,
    videoInput: videoInput.value,
    videoInputDevices: videoInputDevices.value,
    videoTrack: videoTrack.value,
    videoVP9Params: videoVP9Params.value,
    videoH264Params: videoH264Params.value,
    videoH265Params: videoH265Params.value,
    videoAV1Params: videoAV1Params.value,
  };
  const report = {
    userAgent: navigator.userAgent,
    "sora-devtools": version.value,
    "sora-js-sdk": Sora.version(),
    parameters,
    timeline: timelineMessages.value.map((message) => ({
      timestamp: message.timestamp,
      message,
    })),
    notify: notifyMessages.value,
    stats: soraContents.value.statsReport,
  };
  return report;
}

export function DownloadReportButton() {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const onClick = (): void => {
    const report = createDownloadReport();
    const data = JSON.stringify(report);
    const blob = new Blob([data], { type: "text/plain" });
    // 対象ブラウザはすべて URL.createObjectURL をネイティブサポート済みのため webkitURL fallback は不要
    if (anchorRef.current) {
      const datetimeString = new Date().toISOString().replaceAll(":", "_").replaceAll(".", "_");
      anchorRef.current.download = `sora-devtools-report-${datetimeString}.json`;
      anchorRef.current.href = globalThis.URL.createObjectURL(blob);
      anchorRef.current.click();
    }
  };
  return (
    <>
      <Button variant="light" size="sm" className="ml-1" onClick={onClick}>
        Download report
      </Button>
      {/* プログラムからファイルダウンロードを行うための非表示アンカー */}
      <a ref={anchorRef} style={{ display: "none" }} />
    </>
  );
}
