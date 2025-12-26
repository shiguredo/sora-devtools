import { NoiseSuppressionProcessor } from "@shiguredo/noise-suppression";
import { VirtualBackgroundProcessor } from "@shiguredo/virtual-background";
import type { ConnectionPublisher, ConnectionSubscriber, TransportType } from "sora-js-sdk";
import Sora from "sora-js-sdk";

import type {
  ConnectionOptionsState,
  Json,
  QueryStringParameters,
  RTCIceLocalCandidateStats,
  SoraDevtoolsState,
  SoraNotifyMessage,
  SoraPushMessage,
  TimelineMessage,
} from "./../types.ts";
import {
  copy2clipboard,
  createAudioConstraints,
  createConnectOptions,
  createFakeMediaConstraints,
  createFakeMediaStream,
  createGetDisplayMediaAudioConstraints,
  createGetDisplayMediaVideoConstraints,
  createSignalingURL,
  createVideoConstraints,
  drawFakeCanvas,
  getBlurRadiusNumber,
  getDevices,
  getMediaStreamTrackProperties,
  parseMetadata,
  parseQueryString,
} from "./../utils.ts";
import { loadSignalingUrlCandidates } from "./../opfs.ts";
import * as signals from "./signals.ts";

// ページ初期化処理
export const setInitialParameter = async (): Promise<void> => {
  signals.resetState();

  const qsParams = parseQueryString(new URLSearchParams(location.search));
  if (qsParams.audio !== undefined) {
    signals.setAudio(qsParams.audio);
  }
  if (qsParams.audioBitRate !== undefined) {
    signals.setAudioBitRate(qsParams.audioBitRate);
  }
  if (qsParams.audioCodecType !== undefined) {
    signals.setAudioCodecType(qsParams.audioCodecType);
  }
  // 存在しない Device の場合はセットしない
  const deviceInfos = await getDevices();
  // audioinput
  const audioInputDevice = deviceInfos.find(
    (d) => d.kind === "audioinput" && d.deviceId === qsParams.audioInput,
  );
  if (audioInputDevice !== undefined) {
    signals.setAudioInput(audioInputDevice.deviceId);
  }
  // audiooutput
  const audioOutputDevice = deviceInfos.find(
    (d) => d.kind === "audiooutput" && d.deviceId === qsParams.audioOutput,
  );
  if (audioOutputDevice !== undefined) {
    signals.setAudioOutput(audioOutputDevice.deviceId);
  }
  // videoinput
  const videoInputDevice = deviceInfos.find(
    (d) => d.kind === "videoinput" && d.deviceId === qsParams.videoInput,
  );
  if (videoInputDevice !== undefined) {
    signals.setVideoInput(videoInputDevice.deviceId);
  }
  if (qsParams.autoGainControl !== undefined) {
    signals.setAutoGainControl(qsParams.autoGainControl);
  }
  if (qsParams.channelId !== undefined) {
    signals.setChannelId(qsParams.channelId);
  }
  if (qsParams.displayResolution !== undefined) {
    signals.setDisplayResolution(qsParams.displayResolution);
  }
  if (qsParams.echoCancellation !== undefined) {
    signals.setEchoCancellation(qsParams.echoCancellation);
  }
  if (qsParams.echoCancellationType !== undefined) {
    signals.setEchoCancellationType(qsParams.echoCancellationType);
  }
  if (qsParams.mediaStats !== undefined) {
    signals.setMediaStats(qsParams.mediaStats);
  }
  if (qsParams.mediaType !== undefined) {
    signals.setMediaType(qsParams.mediaType);
  }
  if (qsParams.facingMode !== undefined) {
    signals.setFacingMode(qsParams.facingMode);
  }
  if (qsParams.fakeVolume !== undefined) {
    signals.setFakeVolume(qsParams.fakeVolume);
  }
  if (qsParams.frameRate !== undefined) {
    signals.setFrameRate(qsParams.frameRate);
  }
  if (qsParams.noiseSuppression !== undefined) {
    signals.setNoiseSuppression(qsParams.noiseSuppression);
  }
  if (qsParams.resolution !== undefined) {
    signals.setResolution(qsParams.resolution);
  }
  if (qsParams.showStats !== undefined) {
    signals.setShowStats(qsParams.showStats);
  }
  if (qsParams.simulcast !== undefined) {
    signals.setSimulcast(qsParams.simulcast);
  }
  if (qsParams.simulcastRid !== undefined) {
    signals.setSimulcastRid(qsParams.simulcastRid);
  }
  if (qsParams.simulcastRequestRid !== undefined) {
    signals.setSimulcastRequestRid(qsParams.simulcastRequestRid);
  }
  if (qsParams.spotlight !== undefined) {
    signals.setSpotlight(qsParams.spotlight);
  }
  if (qsParams.spotlightNumber !== undefined) {
    signals.setSpotlightNumber(qsParams.spotlightNumber);
  }
  if (qsParams.spotlightFocusRid !== undefined) {
    signals.setSpotlightFocusRid(qsParams.spotlightFocusRid);
  }
  if (qsParams.spotlightUnfocusRid !== undefined) {
    signals.setSpotlightUnfocusRid(qsParams.spotlightUnfocusRid);
  }
  if (qsParams.video !== undefined) {
    signals.setVideo(qsParams.video);
  }
  if (qsParams.videoBitRate !== undefined) {
    signals.setVideoBitRate(qsParams.videoBitRate);
  }
  if (qsParams.videoCodecType !== undefined) {
    signals.setVideoCodecType(qsParams.videoCodecType);
  }
  if (qsParams.videoVP9Params !== undefined) {
    signals.setVideoVP9Params(qsParams.videoVP9Params);
  }
  if (qsParams.videoH264Params !== undefined) {
    signals.setVideoH264Params(qsParams.videoH264Params);
  }
  if (qsParams.videoH265Params !== undefined) {
    signals.setVideoH265Params(qsParams.videoH265Params);
  }
  if (qsParams.videoAV1Params !== undefined) {
    signals.setVideoAV1Params(qsParams.videoAV1Params);
  }
  if (qsParams.debug !== undefined) {
    signals.setDebug(qsParams.debug);
  }
  if (qsParams.debugType !== undefined) {
    signals.setDebugType(qsParams.debugType);
  }
  if (qsParams.debugApiUrl !== undefined) {
    signals.setDebugApiUrl(qsParams.debugApiUrl);
  }
  if (qsParams.mute !== undefined) {
    signals.setMute(qsParams.mute);
  }
  if (qsParams.dataChannelSignaling !== undefined) {
    signals.setDataChannelSignaling(qsParams.dataChannelSignaling);
  }
  if (qsParams.ignoreDisconnectWebSocket !== undefined) {
    signals.setIgnoreDisconnectWebSocket(qsParams.ignoreDisconnectWebSocket);
  }
  if (qsParams.micDevice !== undefined) {
    signals.setMicDevice(qsParams.micDevice);
  }
  if (qsParams.cameraDevice !== undefined) {
    signals.setCameraDevice(qsParams.cameraDevice);
  }
  if (qsParams.audioTrack !== undefined) {
    signals.setAudioTrack(qsParams.audioTrack);
  }
  if (qsParams.videoTrack !== undefined) {
    signals.setVideoTrack(qsParams.videoTrack);
  }
  if (qsParams.googCpuOveruseDetection !== undefined && qsParams.googCpuOveruseDetection !== null) {
    signals.setGoogCpuOveruseDetection(qsParams.googCpuOveruseDetection);
  }
  if (qsParams.bundleId !== undefined) {
    signals.setBundleId(qsParams.bundleId);
  }
  if (qsParams.clientId !== undefined) {
    signals.setClientId(qsParams.clientId);
  }
  if (qsParams.metadata !== undefined) {
    signals.setMetadata(qsParams.metadata);
  }
  if (qsParams.signalingNotifyMetadata !== undefined) {
    signals.setSignalingNotifyMetadata(qsParams.signalingNotifyMetadata);
  }
  if (qsParams.signalingUrlCandidates !== undefined) {
    signals.setSignalingUrlCandidates(qsParams.signalingUrlCandidates);
  } else {
    // query string に signalingUrlCandidates がない場合は OPFS から読み込む
    const opfsSignalingUrlCandidates = await loadSignalingUrlCandidates();
    if (opfsSignalingUrlCandidates.length > 0) {
      signals.setSignalingUrlCandidates(opfsSignalingUrlCandidates);
    }
  }
  if (qsParams.forwardingFilters !== undefined) {
    signals.setForwardingFilters(qsParams.forwardingFilters);
  }
  if (qsParams.dataChannels !== undefined) {
    signals.setDataChannels(qsParams.dataChannels);
  }
  if (qsParams.audioContentHint !== undefined) {
    signals.setAudioContentHint(qsParams.audioContentHint);
  }
  if (qsParams.videoContentHint !== undefined) {
    signals.setVideoContentHint(qsParams.videoContentHint);
  }
  if (qsParams.reconnect !== undefined) {
    signals.setReconnect(qsParams.reconnect);
  }
  if (qsParams.aspectRatio !== undefined) {
    signals.setAspectRatio(qsParams.aspectRatio);
  }
  if (qsParams.resizeMode !== undefined) {
    signals.setResizeMode(qsParams.resizeMode);
  }
  if (qsParams.blurRadius !== undefined) {
    signals.setBlurRadius(qsParams.blurRadius);
  }
  if (qsParams.mediaProcessorsNoiseSuppression !== undefined) {
    signals.setMediaProcessorsNoiseSuppression(qsParams.mediaProcessorsNoiseSuppression);
  }
  if (qsParams.apiUrl !== undefined && qsParams.apiUrl !== null) {
    signals.setApiUrl(qsParams.apiUrl);
  }
  if (qsParams.role !== undefined) {
    signals.setRole(qsParams.role);
  }
  if (qsParams.audioStreamingLanguageCode !== undefined) {
    signals.setAudioStreamingLanguageCode(qsParams.audioStreamingLanguageCode);
  }
  if (qsParams.forceStereoOutput !== undefined) {
    signals.setForceStereoOutput(qsParams.forceStereoOutput);
  }
  signals.setInitialFakeContents();

  const bundleIdValue = signals.bundleId.value;
  const clientIdValue = signals.clientId.value;
  const metadataValue = signals.metadata.value;
  const signalingNotifyMetadataValue = signals.signalingNotifyMetadata.value;
  const signalingUrlCandidatesValue = signals.signalingUrlCandidates.value;
  const forwardingFiltersValue = signals.forwardingFilters.value;
  const dataChannelSignalingValue = signals.dataChannelSignaling.value;
  const ignoreDisconnectWebSocketValue = signals.ignoreDisconnectWebSocket.value;
  const dataChannelsValue = signals.dataChannels.value;
  const audioStreamingLanguageCodeValue = signals.audioStreamingLanguageCode.value;
  const videoVP9ParamsValue = signals.videoVP9Params.value;
  const videoH264ParamsValue = signals.videoH264Params.value;
  const videoH265ParamsValue = signals.videoH265Params.value;
  const videoAV1ParamsValue = signals.videoAV1Params.value;

  // bundleId が存在した場合は enabledBundleId をセットする
  if (bundleIdValue !== "") {
    signals.setEnabledBundleId(true);
  }
  // clientId が存在した場合は enabledClientId をセットする
  if (clientIdValue !== "") {
    signals.setEnabledClientId(true);
  }
  // metadata が存在した場合は enabledMetadata をセットする
  if (metadataValue !== "") {
    signals.setEnabledMetadata(true);
  }
  // signalingNotifyMetadata が存在した場合は enabledSignalingNotifyMetadata をセットする
  if (signalingNotifyMetadataValue !== "") {
    signals.setEnabledSignalingNotifyMetadata(true);
  }
  // signalingUrlCandidates が存在した場合は enabledSignalingUrlCandidates をセットする
  if (signalingUrlCandidatesValue.length > 0) {
    signals.setEnabledSignalingUrlCandidates(true);
  }
  // forwardingFilters が存在した場合は enabledForwardingFilters をセットする
  if (forwardingFiltersValue !== "") {
    signals.setEnabledForwardingFilters(true);
  }
  // dataChannelSignaling または ignoreDisconnectWebSocket が存在した場合は enabledDataChannel をセットする
  if (dataChannelSignalingValue !== "" || ignoreDisconnectWebSocketValue !== "") {
    signals.setEnabledDataChannel(true);
  }
  // dataChannels が存在した場合は enabledDataChannels をセットする
  if (dataChannelsValue !== "") {
    signals.setEnabledDataChannels(true);
  }
  // audioStreamingLanguageCode が存在した場合は enabledAudioStreamingLanguageCode をセットする
  if (audioStreamingLanguageCodeValue !== "") {
    signals.setEnabledAudioStreamingLanguageCode(true);
  }
  // videoVP9Params が存在した場合は enabledVideoVP9Params をセットする
  if (videoVP9ParamsValue !== "") {
    signals.setEnabledVideoVP9Params(true);
  }
  // videoH264Params が存在した場合は enabledH264Params をセットする
  if (videoH264ParamsValue !== "") {
    signals.setEnabledVideoH264Params(true);
  }
  // videoH265Params が存在した場合は enabledH265Params をセットする
  if (videoH265ParamsValue !== "") {
    signals.setEnabledVideoH265Params(true);
  }
  // videoAV1Params が存在した場合は enabledVideoAV1Params をセットする
  if (videoAV1ParamsValue !== "") {
    signals.setEnabledVideoAV1Params(true);
  }
  signals.setSoraConnectionStatus("disconnected");
};

// URL をクリップボードにコピーする
export const copyURL = (): void => {
  const appendAudioVideoParams = signals.role.value !== "recvonly";
  const appendReceiverParams = signals.role.value !== "sendonly";
  const parameters: Partial<QueryStringParameters> = {
    channelId: signals.channelId.value,
    role: signals.role.value,
    audio: signals.audio.value,
    video: signals.video.value,
    debug: signals.debug.value,
    // debug が true の場合のみ debugType を含める
    debugType:
      signals.debug.value && signals.debugType.value !== "timeline"
        ? signals.debugType.value
        : undefined,
    // debug が true の場合のみ debugApiUrl を含める
    debugApiUrl:
      signals.debug.value && signals.debugApiUrl.value !== "http://localhost:3000"
        ? signals.debugApiUrl.value
        : undefined,
    // URL の長さ短縮のため初期値と同じ場合は query string に含めない
    mediaType: signals.mediaType.value !== "getUserMedia" ? signals.mediaType.value : undefined,
    // URL の長さ短縮のため空文字列は query string に含めない
    audioBitRate:
      appendAudioVideoParams && signals.audioBitRate.value !== ""
        ? signals.audioBitRate.value
        : undefined,
    audioCodecType:
      appendAudioVideoParams && signals.audioCodecType.value !== ""
        ? signals.audioCodecType.value
        : undefined,
    videoBitRate:
      appendAudioVideoParams && signals.videoBitRate.value !== ""
        ? signals.videoBitRate.value
        : undefined,
    videoCodecType:
      appendAudioVideoParams && signals.videoCodecType.value !== ""
        ? signals.videoCodecType.value
        : undefined,
    videoVP9Params:
      appendAudioVideoParams &&
      signals.videoVP9Params.value !== "" &&
      signals.enabledVideoVP9Params.value
        ? signals.videoVP9Params.value
        : undefined,
    videoH264Params:
      appendAudioVideoParams &&
      signals.videoH264Params.value !== "" &&
      signals.enabledVideoH264Params.value
        ? signals.videoH264Params.value
        : undefined,
    videoH265Params:
      appendAudioVideoParams &&
      signals.videoH265Params.value !== "" &&
      signals.enabledVideoH265Params.value
        ? signals.videoH265Params.value
        : undefined,
    videoAV1Params:
      appendAudioVideoParams &&
      signals.videoAV1Params.value !== "" &&
      signals.enabledVideoAV1Params.value
        ? signals.videoAV1Params.value
        : undefined,
    forceStereoOutput:
      appendReceiverParams && signals.forceStereoOutput.value === true ? true : undefined,
    audioContentHint:
      signals.audioContentHint.value !== "" ? signals.audioContentHint.value : undefined,
    autoGainControl:
      signals.autoGainControl.value !== "" ? signals.autoGainControl.value : undefined,
    noiseSuppression:
      signals.noiseSuppression.value !== "" ? signals.noiseSuppression.value : undefined,
    echoCancellation:
      signals.echoCancellation.value !== "" ? signals.echoCancellation.value : undefined,
    echoCancellationType:
      signals.echoCancellationType.value !== "" ? signals.echoCancellationType.value : undefined,
    videoContentHint:
      signals.videoContentHint.value !== "" ? signals.videoContentHint.value : undefined,
    resolution: signals.resolution.value !== "" ? signals.resolution.value : undefined,
    facingMode: signals.facingMode.value !== "" ? signals.facingMode.value : undefined,
    frameRate: signals.frameRate.value !== "" ? signals.frameRate.value : undefined,
    aspectRatio: signals.aspectRatio.value !== "" ? signals.aspectRatio.value : undefined,
    resizeMode: signals.resizeMode.value !== "" ? signals.resizeMode.value : undefined,
    blurRadius: signals.blurRadius.value !== "" ? signals.blurRadius.value : undefined,
    simulcast: signals.simulcast.value !== "" ? signals.simulcast.value : undefined,
    simulcastRid: signals.simulcastRid.value !== "" ? signals.simulcastRid.value : undefined,
    simulcastRequestRid:
      signals.simulcastRequestRid.value !== "" ? signals.simulcastRequestRid.value : undefined,
    spotlight: signals.spotlight.value !== "" ? signals.spotlight.value : undefined,
    spotlightNumber:
      signals.spotlightNumber.value !== "" ? signals.spotlightNumber.value : undefined,
    spotlightFocusRid:
      signals.spotlightFocusRid.value !== "" ? signals.spotlightFocusRid.value : undefined,
    spotlightUnfocusRid:
      signals.spotlightUnfocusRid.value !== "" ? signals.spotlightUnfocusRid.value : undefined,
    audioInput:
      signals.mediaType.value === "getUserMedia" && signals.audioInput.value !== ""
        ? signals.audioInput.value
        : undefined,
    audioOutput: signals.audioOutput.value !== "" ? signals.audioOutput.value : undefined,
    videoInput:
      signals.mediaType.value === "getUserMedia" && signals.videoInput.value !== ""
        ? signals.videoInput.value
        : undefined,
    displayResolution:
      signals.displayResolution.value !== "" ? signals.displayResolution.value : undefined,
    // URL の長さ短縮のため true 以外は query string に含めない
    mediaStats: signals.mediaStats.value === true ? true : undefined,
    bundleId:
      signals.bundleId.value !== "" && signals.enabledBundleId.value
        ? signals.bundleId.value
        : undefined,
    clientId:
      signals.clientId.value !== "" && signals.enabledClientId.value
        ? signals.clientId.value
        : undefined,
    metadata:
      signals.metadata.value !== "" && signals.enabledMetadata.value
        ? signals.metadata.value
        : undefined,
    signalingNotifyMetadata:
      signals.signalingNotifyMetadata.value !== "" && signals.enabledSignalingNotifyMetadata.value
        ? signals.signalingNotifyMetadata.value
        : undefined,
    forwardingFilters:
      signals.forwardingFilters.value !== "" && signals.enabledForwardingFilters.value
        ? signals.forwardingFilters.value
        : undefined,
    dataChannelSignaling:
      signals.dataChannelSignaling.value !== "" && signals.enabledDataChannel.value
        ? signals.dataChannelSignaling.value
        : undefined,
    ignoreDisconnectWebSocket:
      signals.ignoreDisconnectWebSocket.value !== "" && signals.enabledDataChannel.value
        ? signals.ignoreDisconnectWebSocket.value
        : undefined,
    dataChannels:
      signals.dataChannels.value !== "" && signals.enabledDataChannels.value
        ? signals.dataChannels.value
        : undefined,
    // URL の長さ短縮のため true 以外は query string に含めない
    reconnect: signals.reconnect.value === true ? true : undefined,
    mediaProcessorsNoiseSuppression:
      signals.mediaProcessorsNoiseSuppression.value === true ? true : undefined,
    // URL の長さ短縮のため false 以外は query string に含めない
    micDevice: signals.micDevice.value === false ? false : undefined,
    cameraDevice: signals.cameraDevice.value === false ? false : undefined,
    audioTrack: signals.audioTrack.value === false ? false : undefined,
    videoTrack: signals.videoTrack.value === false ? false : undefined,
    // signalingUrlCandidates
    signalingUrlCandidates:
      signals.signalingUrlCandidates.value.length > 0 && signals.enabledSignalingUrlCandidates.value
        ? signals.signalingUrlCandidates.value
        : undefined,
    // apiUrl
    apiUrl: signals.apiUrl.value !== null ? signals.apiUrl.value : undefined,
    // fakeVolume
    fakeVolume: signals.mediaType.value === "fakeMedia" ? signals.fakeVolume.value : undefined,
    // mute
    mute: signals.mute.value === true ? true : undefined,
    // audioStreamingLanguageCode
    audioStreamingLanguageCode:
      appendAudioVideoParams &&
      signals.audioStreamingLanguageCode.value !== "" &&
      signals.enabledAudioStreamingLanguageCode.value
        ? signals.audioStreamingLanguageCode.value
        : undefined,
  };
  const queryStrings = Object.keys(parameters)
    .map((key) => {
      const value = (parameters as Record<string, unknown>)[key];
      if (value === undefined) {
        return undefined;
      }
      // signalingUrlCandidates は Array なので JSON.stringify する
      if (key === "signalingUrlCandidates") {
        return `${key}=${encodeURIComponent(JSON.stringify(value))}`;
      }
      return `${key}=${encodeURIComponent(value as string)}`;
    })
    .filter((value) => value !== undefined);
  void copy2clipboard(`${location.origin}${location.pathname}?${queryStrings.join("&")}`);
  window.history.replaceState(null, "", `${location.pathname}?${queryStrings.join("&")}`);
};

// State に応じて MediaStream インスタンスを生成する
// Fake の場合には volume control 用の GainNode も同時に生成する
type createMediaStreamPickedState = Pick<
  SoraDevtoolsState,
  | "aspectRatio"
  | "audio"
  | "audioInput"
  | "audioTrack"
  | "audioContentHint"
  | "autoGainControl"
  | "blurRadius"
  | "cameraDevice"
  | "echoCancellation"
  | "echoCancellationType"
  | "facingMode"
  | "fakeContents"
  | "fakeVolume"
  | "frameRate"
  | "mediaProcessorsNoiseSuppression"
  | "mediaType"
  | "mp4MediaStream"
  | "micDevice"
  | "noiseSuppression"
  | "noiseSuppressionProcessor"
  | "resizeMode"
  | "resolution"
  | "video"
  | "videoContentHint"
  | "videoInput"
  | "videoTrack"
  | "virtualBackgroundProcessor"
>;

function getStateForMediaStream(): createMediaStreamPickedState {
  return {
    aspectRatio: signals.aspectRatio.value,
    audio: signals.audio.value,
    audioInput: signals.audioInput.value,
    audioTrack: signals.audioTrack.value,
    audioContentHint: signals.audioContentHint.value,
    autoGainControl: signals.autoGainControl.value,
    blurRadius: signals.blurRadius.value,
    cameraDevice: signals.cameraDevice.value,
    echoCancellation: signals.echoCancellation.value,
    echoCancellationType: signals.echoCancellationType.value,
    facingMode: signals.facingMode.value,
    fakeContents: signals.fakeContents.value,
    fakeVolume: signals.fakeVolume.value,
    frameRate: signals.frameRate.value,
    mediaProcessorsNoiseSuppression: signals.mediaProcessorsNoiseSuppression.value,
    mediaType: signals.mediaType.value,
    mp4MediaStream: signals.mp4MediaStream.value,
    micDevice: signals.micDevice.value,
    noiseSuppression: signals.noiseSuppression.value,
    noiseSuppressionProcessor: signals.noiseSuppressionProcessor.value,
    resizeMode: signals.resizeMode.value,
    resolution: signals.resolution.value,
    video: signals.video.value,
    videoContentHint: signals.videoContentHint.value,
    videoInput: signals.videoInput.value,
    videoTrack: signals.videoTrack.value,
    virtualBackgroundProcessor: signals.virtualBackgroundProcessor.value,
  };
}

async function createMediaStream(
  state: createMediaStreamPickedState,
): Promise<[MediaStream, GainNode | null]> {
  const LOG_TITLE = "MEDIA_CONSTRAINTS";
  if (state.mediaType === "getDisplayMedia") {
    if (!state.video || !state.cameraDevice) {
      return [new MediaStream(), null];
    }
    if (navigator.mediaDevices === undefined) {
      throw new Error("Failed to call getUserMedia. Make sure domain is secure");
    }
    const mediaConstraints = {
      // getDisplayMedia では配信する画面の音声を利用するため、デバイス指定 (audioInput) は使わない
      audio: createGetDisplayMediaAudioConstraints({
        audio: state.audio,
        autoGainControl: state.autoGainControl,
        noiseSuppression: state.noiseSuppression,
        echoCancellation: state.echoCancellation,
        echoCancellationType: state.echoCancellationType,
      }),
      video: createGetDisplayMediaVideoConstraints({
        frameRate: state.frameRate,
        resolution: state.resolution,
        aspectRatio: state.aspectRatio,
        resizeMode: state.resizeMode,
      }),
    };
    signals.setLogMessages({
      title: LOG_TITLE,
      description: JSON.stringify(mediaConstraints),
    });
    signals.setTimelineMessage(
      createSoraDevtoolsTimelineMessage("media-constraints", mediaConstraints),
    );
    const stream = await navigator.mediaDevices.getDisplayMedia(mediaConstraints);
    signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-get-display-media"));
    for (const track of stream.getVideoTracks()) {
      if (track.contentHint !== undefined) {
        track.contentHint = state.videoContentHint;
      }
      track.enabled = state.videoTrack;
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", track));
    }
    return [stream, null];
  }
  if (state.mediaType === "fakeMedia" && state.fakeContents.worker) {
    const constraints = createFakeMediaConstraints({
      audio: state.audio && state.micDevice,
      video: state.video && state.cameraDevice,
      frameRate: state.frameRate,
      resolution: state.resolution,
      volume: state.fakeVolume,
      aspectRatio: state.aspectRatio,
      resizeMode: state.resizeMode,
    });
    signals.setLogMessages({
      title: LOG_TITLE,
      description: JSON.stringify(constraints),
    });
    signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("media-constraints", constraints));
    const { canvas, mediaStream, gainNode } = createFakeMediaStream(constraints);
    if (canvas !== null) {
      state.fakeContents.worker.onmessage = (event) => {
        const data = event.data;
        if (data.type !== "update") {
          return;
        }
        drawFakeCanvas(
          canvas,
          state.fakeContents.colorCode,
          constraints.fontSize,
          data.counter.toString(),
        );
      };
      state.fakeContents.worker.postMessage({ type: "stop" });
      state.fakeContents.worker.postMessage({
        type: "start",
        interval: 1000 / constraints.frameRate,
      });
    }
    for (const track of mediaStream.getVideoTracks()) {
      if (track.contentHint !== undefined) {
        track.contentHint = state.videoContentHint;
      }
      track.enabled = state.videoTrack;
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", track));
    }
    for (const track of mediaStream.getAudioTracks()) {
      if (track.contentHint !== undefined) {
        track.contentHint = state.audioContentHint;
      }
      track.enabled = state.audioTrack;
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", track));
    }
    signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-create-fake-media"));
    return [mediaStream, gainNode];
  }
  if (state.mediaType === "mp4Media") {
    if (state.mp4MediaStream === null) {
      throw new Error("No MP4 file has been selected");
    }

    // 指定の MP4 を再生するための MediaStream を返す
    // DevTools ではいったん常に繰り返し再生にしておく
    return [await state.mp4MediaStream.play({ repeat: true }), null];
  }
  if (navigator.mediaDevices === undefined) {
    throw new Error("Failed to call getUserMedia. Make sure domain is secure");
  }
  const mediaStream = new MediaStream();
  const audioConstraints = createAudioConstraints({
    audio: state.audio && state.micDevice,
    autoGainControl: state.autoGainControl,
    noiseSuppression: state.noiseSuppression,
    echoCancellation: state.echoCancellation,
    echoCancellationType: state.echoCancellationType,
    audioInput: state.audioInput,
  });
  const videoConstraints = createVideoConstraints({
    aspectRatio: state.aspectRatio,
    frameRate: state.frameRate,
    resizeMode: state.resizeMode,
    resolution: state.resolution,
    video: state.video && state.cameraDevice,
    videoInput: state.videoInput,
    facingMode: state.facingMode,
  });
  if (audioConstraints || videoConstraints) {
    const mediaStreamConstraints: MediaStreamConstraints = {};
    if (audioConstraints) {
      mediaStreamConstraints.audio = audioConstraints;
    }
    if (videoConstraints) {
      mediaStreamConstraints.video = videoConstraints;
    }
    signals.setLogMessages({
      title: LOG_TITLE,
      description: JSON.stringify(mediaStreamConstraints),
    });
    signals.setTimelineMessage(
      createSoraDevtoolsTimelineMessage("media-constraints", mediaStreamConstraints),
    );
    const gumMediaStream = await navigator.mediaDevices
      .getUserMedia(mediaStreamConstraints)
      .catch((error) => {
        // video track の getUserMedia が失敗した場合には audio track が存在している可能性があるので止める
        mediaStream.getTracks().forEach((t) => {
          t.stop();
        });
        throw error;
      });
    if (audioConstraints) {
      let audioTrack = gumMediaStream.getAudioTracks()[0];
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", audioTrack));
      if (state.mediaProcessorsNoiseSuppression && NoiseSuppressionProcessor.isSupported()) {
        if (state.noiseSuppressionProcessor === null) {
          throw new Error(
            "Failed to start NoiseSuppressionProcessor. NoiseSuppressionProcessor is 'null'",
          );
        }
        state.noiseSuppressionProcessor.stopProcessing();
        audioTrack = await state.noiseSuppressionProcessor.startProcessing(audioTrack);
      }
      signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-audio-get-user-media"));
      mediaStream.addTrack(audioTrack);
    }
    if (videoConstraints) {
      let videoTrack = gumMediaStream.getVideoTracks()[0];
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", videoTrack));
      if (state.blurRadius !== "" && VirtualBackgroundProcessor.isSupported()) {
        if (state.virtualBackgroundProcessor === null) {
          throw new Error(
            "Failed to start VirtualBackgroundProcessor. VirtualBackgroundProcessor is 'null'",
          );
        }
        const options = {
          blurRadius: getBlurRadiusNumber(state.blurRadius),
        };
        state.virtualBackgroundProcessor.stopProcessing();
        videoTrack = await state.virtualBackgroundProcessor.startProcessing(videoTrack, options);
      }
      signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-video-get-user-media"));
      mediaStream.addTrack(videoTrack);
    }
  }
  for (const track of mediaStream.getVideoTracks()) {
    if (track.contentHint !== undefined) {
      track.contentHint = state.videoContentHint;
    }
    track.enabled = state.videoTrack;
  }
  for (const track of mediaStream.getAudioTracks()) {
    if (track.contentHint !== undefined) {
      track.contentHint = state.audioContentHint;
    }
    track.enabled = state.audioTrack;
  }
  return [mediaStream, null];
}

// Sora connection オブジェクトに callback をセットする
function setSoraCallbacks(soraConnection: ConnectionPublisher | ConnectionSubscriber): void {
  soraConnection.on("log", (title: string, description: Json) => {
    signals.setLogMessages({
      title: title,
      description: JSON.stringify(description),
    });
  });
  soraConnection.on("notify", (message: SoraNotifyMessage, transportType: TransportType) => {
    if (message.event_type === "spotlight.focused" && typeof message.connection_id === "string") {
      signals.setFocusedSpotlightConnectionId(message.connection_id);
    }
    if (message.event_type === "spotlight.unfocused" && typeof message.connection_id === "string") {
      signals.setUnFocusedSpotlightConnectionId(message.connection_id);
    }
    if (
      message.event_type === "connection.destroyed" &&
      typeof message.connection_id === "string"
    ) {
      signals.deleteFocusedSpotlightConnectionId(message.connection_id);
    }
    const soraValue = signals.sora.value;
    if (
      message.event_type === "connection.created" &&
      typeof message.connection_id === "string" &&
      // notify の connection_id と offer で受け取った自身の connection id が一致すること
      message.connection_id === soraValue?.connectionId
    ) {
      if (typeof message.session_id === "string") {
        signals.setSoraSessionId(message.session_id);
      }
      if (typeof message.connection_id === "string") {
        signals.setSoraConnectionId(message.connection_id);
      }
      if (typeof message.client_id === "string") {
        signals.setSoraClientId(message.client_id);
      }
      // 接続時点で存在する remote client の client_id を保存する
      if (Array.isArray(message.data)) {
        for (const remoteClient of message.data) {
          if (
            typeof remoteClient.connection_id === "string" &&
            typeof remoteClient.client_id === "string"
          ) {
            signals.setSoraRemoteClientId({
              connectionId: remoteClient.connection_id,
              clientId: remoteClient.client_id,
            });
          }
        }
      }
    } else if (
      message.event_type === "connection.created" &&
      typeof message.connection_id === "string"
    ) {
      // 自身以外の notify
      if (typeof message.client_id === "string") {
        signals.setSoraRemoteClientId({
          connectionId: message.connection_id,
          clientId: message.client_id,
        });
      }
    }
    signals.setNotifyMessages({
      timestamp: Date.now(),
      message: message,
      transportType: transportType,
    });
  });
  soraConnection.on("push", (message: SoraPushMessage, transportType: TransportType) => {
    signals.setPushMessages({
      timestamp: Date.now(),
      message: message,
      transportType: transportType,
    });
  });
  soraConnection.on("track", (event: RTCTrackEvent) => {
    signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-track"));
    const remoteClientsValue = signals.remoteClients.value;
    const mediaStream = remoteClientsValue.find(
      (client) => client.connectionId === event.streams[0].id,
    );
    if (!mediaStream) {
      for (const track of event.streams[0].getTracks()) {
        signals.setTimelineMessage(
          createSoraDevtoolsTimelineMessage(
            `remote-${track.kind}-mediastream-track`,
            getMediaStreamTrackProperties(track),
          ),
        );
      }
      signals.setRemoteClient({
        mediaStream: event.streams[0],
        connectionId: event.streams[0].id,
        clientId: null,
      });
    }
  });
  soraConnection.on("removetrack", (event: MediaStreamTrackEvent) => {
    signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-removetrack"));
    const remoteClientsValue = signals.remoteClients.value;
    const remoteClient = remoteClientsValue.find((client) => {
      if (event?.target) {
        return client.connectionId === (event.target as MediaStream).id;
      }
      return false;
    });
    if (remoteClient) {
      signals.removeRemoteClient(remoteClient.connectionId);
    }
  });
  soraConnection.on("disconnect", (event) => {
    const message: Record<string, unknown> = {
      type: event.type,
      title: event.title,
    };
    if (event.code !== undefined) {
      message.code = event.code;
    }
    if (event.reason !== undefined) {
      message.reason = event.reason;
    }
    if (event.params !== undefined) {
      message.params = event.params;
    }
    signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-disconnect", message));
    const fakeContentsValue = signals.fakeContents.value;
    const localMediaStreamValue = signals.localMediaStream.value;
    const remoteClientsValue = signals.remoteClients.value;
    const reconnectValue = signals.reconnect.value;
    const virtualBackgroundProcessorValue = signals.virtualBackgroundProcessor.value;
    const noiseSuppressionProcessorValue = signals.noiseSuppressionProcessor.value;
    // media processor は同期処理で停止する
    const originalTrack = stopVideoProcessors(virtualBackgroundProcessorValue);
    // video track は停止の際に非同期処理が必要なため、最小限の処理に絞って非同期処理にする
    void (async () => {
      // ローカルの MediaStream の Track と MediaProcessor を止める
      await stopLocalVideoTrack(localMediaStreamValue, originalTrack);
    })();
    stopLocalAudioTrack(localMediaStreamValue, noiseSuppressionProcessorValue);
    remoteClientsValue.forEach((client) => {
      client.mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
    });
    if (fakeContentsValue.worker) {
      fakeContentsValue.worker.postMessage({ type: "stop" });
    }
    signals.setSora(null);
    signals.setSoraSessionId(null);
    signals.setSoraConnectionId(null);
    signals.setSoraClientId(null);
    signals.setSoraTurnUrl(null);
    signals.setSoraConnectionStatus("disconnected");
    signals.setLocalMediaStream(null);
    signals.removeAllRemoteClients();
    signals.setSoraInfoAlertMessage("Disconnect Sora.");
    signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("disconnected"));
    if (event.type === "abend" && reconnectValue) {
      // 再接続処理開始フラグ
      signals.setSoraReconnecting(true);
    }
  });
  soraConnection.on("timeline", (event) => {
    const message = {
      timestamp: Date.now(),
      type: event.type,
      data: event.data,
      dataChannelId: event.dataChannelId,
      dataChannelLabel: event.dataChannelLabel,
      logType: event.logType,
    };
    signals.setTimelineMessage(message);
    if (event.data && typeof event.data === "object" && "sdp" in event.data) {
      signals.setTimelineMessage(
        createSoraDevtoolsTimelineMessage(`${event.type}-sdp`, event.data.sdp),
      );
    }
  });
  soraConnection.on("signaling", (event) => {
    const message = {
      timestamp: Date.now(),
      transportType: event.transportType,
      type: event.type,
      data: event.data,
    };
    signals.setSignalingMessage(message);
  });
  soraConnection.on("message", (event) => {
    signals.setDataChannelMessage({
      timestamp: Date.now(),
      label: event.label,
      data: event.data,
    });
  });
  soraConnection.on("datachannel", (event) => {
    signals.setSoraDataChannels(event.datachannel);
  });
  soraConnection.on("switched", (message) => {
    signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-switched", message));
  });
  soraConnection.on("connected", (message) => {
    signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-connected", message));
  });
}

// Signal 状態から ConnectionOptionsState を生成する
function pickConnectionOptionsState(): ConnectionOptionsState {
  return {
    audio: signals.audio.value,
    audioBitRate: signals.audioBitRate.value,
    audioCodecType: signals.audioCodecType.value,
    audioStreamingLanguageCode: signals.audioStreamingLanguageCode.value,
    bundleId: signals.bundleId.value,
    clientId: signals.clientId.value,
    dataChannelSignaling: signals.dataChannelSignaling.value,
    dataChannels: signals.enabledDataChannels.value ? signals.dataChannels.value : "",
    enabledAudioStreamingLanguageCode: signals.enabledAudioStreamingLanguageCode.value,
    enabledBundleId: signals.enabledBundleId.value,
    enabledClientId: signals.enabledClientId.value,
    enabledDataChannel: signals.enabledDataChannel.value,
    enabledSignalingNotifyMetadata: signals.enabledSignalingNotifyMetadata.value,
    enabledForwardingFilters: signals.enabledForwardingFilters.value,
    enabledVideoVP9Params: signals.enabledVideoVP9Params.value,
    enabledVideoH264Params: signals.enabledVideoH264Params.value,
    enabledVideoH265Params: signals.enabledVideoH265Params.value,
    enabledVideoAV1Params: signals.enabledVideoAV1Params.value,
    ignoreDisconnectWebSocket: signals.ignoreDisconnectWebSocket.value,
    signalingNotifyMetadata: signals.signalingNotifyMetadata.value,
    forwardingFilters: signals.forwardingFilters.value,
    simulcast: signals.simulcast.value,
    simulcastRid: signals.simulcastRid.value,
    simulcastRequestRid: signals.simulcastRequestRid.value,
    spotlight: signals.spotlight.value,
    spotlightFocusRid: signals.spotlightFocusRid.value,
    spotlightNumber: signals.spotlightNumber.value,
    spotlightUnfocusRid: signals.spotlightUnfocusRid.value,
    video: signals.video.value,
    videoBitRate: signals.videoBitRate.value,
    videoCodecType: signals.videoCodecType.value,
    videoVP9Params: signals.videoVP9Params.value,
    videoH264Params: signals.videoH264Params.value,
    videoH265Params: signals.videoH265Params.value,
    videoAV1Params: signals.videoAV1Params.value,
    forceStereoOutput: signals.forceStereoOutput.value,
    role: signals.role.value,
  };
}

function createSoraDevtoolsTimelineMessage(type: string, data?: unknown): TimelineMessage {
  return {
    type: type,
    logType: "sora-devtools",
    timestamp: Date.now(),
    data: data,
  };
}

function createSoraDevtoolsMediaStreamTrackLog(
  action: "start" | "stop",
  track: MediaStreamTrack,
): TimelineMessage {
  const properties = getMediaStreamTrackProperties(track);
  return createSoraDevtoolsTimelineMessage(`${action}-${track.kind}-mediastream-track`, properties);
}

// statsReport を更新
async function setStatsReportInternal(
  soraConnection: ConnectionPublisher | ConnectionSubscriber,
): Promise<void> {
  if (soraConnection.pc && soraConnection.pc?.iceConnectionState !== "closed") {
    const stats = await soraConnection.pc.getStats();
    const statsReportData: RTCStats[] = [];
    const localCandidateStats: RTCIceLocalCandidateStats[] = [];
    for (const s of stats.values()) {
      const stat = s as RTCStats;
      statsReportData.push(stat);
      if (stat.type === "local-candidate") {
        localCandidateStats.push(stat as RTCIceLocalCandidateStats);
      }
    }

    signals.setStatsReport(statsReportData);

    // local-candidate の最初に出現する TURN サーバーの URL を取得
    for (const s of localCandidateStats) {
      const localCandidate = s as RTCIceLocalCandidateStats;
      if (localCandidate.url !== undefined) {
        signals.setSoraTurnUrl(localCandidate.url);
        break;
      }
    }
  }
}

export const requestMedia = async (): Promise<void> => {
  const LOG_TITLE = "REQUEST_MEDIA";
  const state = getStateForMediaStream();
  let mediaStream: undefined | MediaStream;
  let gainNode: undefined | GainNode | null;
  try {
    [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
      throw error;
    });
  } catch (error) {
    if (error instanceof Error) {
      signals.setLogMessages({
        title: LOG_TITLE,
        description: JSON.stringify(error.message),
      });
      signals.setAPIErrorAlertMessage(`Failed to get user devices. ${error.message}`);
    }
    let originalTrack: MediaStreamVideoTrack | undefined;
    if (state.virtualBackgroundProcessor?.isProcessing()) {
      if (originalTrack === undefined) {
        originalTrack = state.virtualBackgroundProcessor.getOriginalTrack();
      }
      state.virtualBackgroundProcessor.stopProcessing();
    }
    if (originalTrack) {
      originalTrack.stop();
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    } else if (mediaStream) {
      mediaStream.getVideoTracks().forEach((track) => {
        track.stop();
        signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
      });
    }

    if (state.noiseSuppressionProcessor?.isProcessing()) {
      const originalTrack = state.noiseSuppressionProcessor.getOriginalTrack();
      if (originalTrack) {
        originalTrack.stop();
        signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
      }
      state.noiseSuppressionProcessor.stopProcessing();
    } else if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.stop();
        signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
      });
    }
    throw error;
  }
  if (gainNode) {
    signals.setFakeContentsGainNode(gainNode);
  }
  signals.setLocalMediaStream(mediaStream);
};

export const disposeMedia = async (): Promise<void> => {
  const fakeContentsValue = signals.fakeContents.value;
  const localMediaStreamValue = signals.localMediaStream.value;
  const noiseSuppressionProcessorValue = signals.noiseSuppressionProcessor.value;
  const virtualBackgroundProcessorValue = signals.virtualBackgroundProcessor.value;
  let originalTrack: MediaStreamTrack | undefined;
  if (virtualBackgroundProcessorValue?.isProcessing()) {
    originalTrack = virtualBackgroundProcessorValue.getOriginalTrack();
    virtualBackgroundProcessorValue.stopProcessing();
  }
  if (originalTrack !== undefined) {
    originalTrack.stop();
    localMediaStreamValue?.removeTrack(originalTrack);
    signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
  } else if (localMediaStreamValue) {
    localMediaStreamValue.getVideoTracks().forEach((track) => {
      track.stop();
      localMediaStreamValue.removeTrack(track);
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }

  if (noiseSuppressionProcessorValue?.isProcessing()) {
    const originalTrack = noiseSuppressionProcessorValue.getOriginalTrack();
    if (originalTrack) {
      originalTrack.stop();
      localMediaStreamValue?.removeTrack(originalTrack);
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    }
    noiseSuppressionProcessorValue.stopProcessing();
  } else if (localMediaStreamValue) {
    localMediaStreamValue.getAudioTracks().forEach((track) => {
      track.stop();
      localMediaStreamValue.removeTrack(track);
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }
  if (fakeContentsValue.worker) {
    fakeContentsValue.worker.postMessage({ type: "stop" });
  }
  signals.setLocalMediaStream(null);
};

export const connectSora = async (): Promise<void> => {
  signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("start-connection"));
  signals.setSoraConnectionStatus("preparing");
  const state = getStateForMediaStream();
  // 強制的に state.soraContents.localMediaStream を作り直すかどうか
  let forceCreateMediaStream = false;
  // 接続中の場合は切断する
  const soraValue = signals.sora.value;
  if (soraValue) {
    await soraValue.disconnect();
    // 接続中の再接続の場合は、MediaStream を作り直し、state.soraContents.localMediaStream を更新する
    forceCreateMediaStream = true;
  }
  // シグナリング候補のURLリストを作成する
  const signalingUrlCandidates = createSignalingURL(
    signals.enabledSignalingUrlCandidates.value,
    signals.signalingUrlCandidates.value,
  );
  signals.setLogMessages({
    title: "SIGNALING_URL",
    description: JSON.stringify(signalingUrlCandidates),
  });
  const connection = Sora.connection(signalingUrlCandidates, signals.debug.value);
  const connectionOptionsState = pickConnectionOptionsState();
  const connectionOptions = createConnectOptions(connectionOptionsState);
  const metadata = parseMetadata(signals.enabledMetadata.value, signals.metadata.value);
  let soraConnection: undefined | ConnectionPublisher | ConnectionSubscriber;
  let mediaStream: undefined | MediaStream;
  let gainNode: undefined | GainNode | null;
  const roleValue = signals.role.value;
  const channelIdValue = signals.channelId.value;
  const googCpuOveruseDetectionValue = signals.googCpuOveruseDetection.value;
  const localMediaStreamValue = signals.localMediaStream.value;
  try {
    if (roleValue === "sendonly") {
      soraConnection = connection.sendonly(channelIdValue, null, connectionOptions);
      soraConnection.metadata = metadata;
      // Chrome 独自のオプションを使用して CPU の負荷が高い場合に解像度を下げる処理の設定を入れる
      if (typeof googCpuOveruseDetectionValue === "boolean") {
        soraConnection.constraints = {
          optional: [{ googCpuOveruseDetection: googCpuOveruseDetectionValue }],
        };
      }
      setSoraCallbacks(soraConnection);
      if (!forceCreateMediaStream && localMediaStreamValue) {
        mediaStream = localMediaStreamValue;
      } else {
        [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
          signals.setSoraErrorAlertMessage(error.toString());
          signals.setSoraConnectionStatus("disconnected");
          throw error;
        });
      }
      signals.setSoraConnectionStatus("connecting");
      // 先に setSora で state を参照できるようにしておかないと connection.created の notify が来た時に処理に困るため
      signals.setSora(soraConnection);
      await soraConnection.connect(mediaStream);
    } else if (roleValue === "sendrecv") {
      soraConnection = connection.sendrecv(channelIdValue, null, connectionOptions);
      soraConnection.metadata = metadata;
      // Chrome 独自のオプションを使用して CPU の負荷が高い場合に解像度を下げる処理の設定を入れる
      if (typeof googCpuOveruseDetectionValue === "boolean") {
        soraConnection.constraints = {
          optional: [{ googCpuOveruseDetection: googCpuOveruseDetectionValue }],
        };
      }
      setSoraCallbacks(soraConnection);
      if (!forceCreateMediaStream && localMediaStreamValue) {
        mediaStream = localMediaStreamValue;
      } else {
        [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
          signals.setSoraErrorAlertMessage(error.toString());
          signals.setSoraConnectionStatus("disconnected");
          throw error;
        });
      }
      // 先に setSora で state を参照できるようにしておかないと connection.created の notify が来た時に処理に困るため
      signals.setSora(soraConnection);
      await soraConnection.connect(mediaStream);
    } else if (roleValue === "recvonly") {
      soraConnection = connection.recvonly(channelIdValue, null, connectionOptions);
      soraConnection.metadata = metadata;
      setSoraCallbacks(soraConnection);
      signals.setSoraConnectionStatus("connecting");
      // 先に setSora で state を参照できるようにしておかないと connection.created の notify が来た時に処理に困るため
      signals.setSora(soraConnection);
      await soraConnection.connect();
    }
  } catch (error) {
    // 先に setSora で state を参照できるようにした state の参照を削除
    signals.setSora(null);
    if (error instanceof Error) {
      signals.setSoraErrorAlertMessage(`Failed to connect Sora. ${error.message}`);
    }
    let originalTrack: MediaStreamVideoTrack | undefined;
    if (state.virtualBackgroundProcessor?.isProcessing()) {
      if (originalTrack === undefined) {
        originalTrack = state.virtualBackgroundProcessor.getOriginalTrack();
      }
      state.virtualBackgroundProcessor.stopProcessing();
    }
    if (originalTrack) {
      originalTrack.stop();
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    } else if (mediaStream) {
      mediaStream.getVideoTracks().forEach((track) => {
        track.stop();
        signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
      });
    }

    if (state.noiseSuppressionProcessor?.isProcessing()) {
      const originalTrack = state.noiseSuppressionProcessor.getOriginalTrack();
      if (originalTrack) {
        originalTrack.stop();
        signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
      }
      state.noiseSuppressionProcessor.stopProcessing();
    } else if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.stop();
        signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
      });
    }
    signals.setSoraConnectionStatus("disconnected");
    throw error;
  }
  if (soraConnection === undefined) {
    throw new Error("Failed to connect Sora. Connection object is 'undefined'");
  }
  signals.setSoraInfoAlertMessage("Succeeded to connect Sora.");
  await setStatsReportInternal(soraConnection);
  const timerId = setInterval(async () => {
    const soraValue = signals.sora.value;
    if (soraValue) {
      await setStatsReportInternal(soraValue);
    } else {
      clearInterval(timerId);
    }
  }, 1000);
  // disconnect 時に stream を止めないためのハック
  soraConnection.stream = null;
  if (mediaStream && (localMediaStreamValue === null || forceCreateMediaStream)) {
    signals.setLocalMediaStream(mediaStream);
  }
  if (gainNode) {
    signals.setFakeContentsGainNode(gainNode);
  }
  signals.setSoraConnectionStatus("connected");
  signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("connected"));
};

export const reconnectSora = async (): Promise<void> => {
  signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("start-reconnect"));
  signals.setSoraConnectionStatus("connecting");
  const state = getStateForMediaStream();
  const soraValue = signals.sora.value;
  const connectionStatusValue = signals.connectionStatus.value;
  // 接続中の場合は切断する
  if (soraValue && connectionStatusValue === "connected") {
    await soraValue.disconnect();
  }
  // シグナリング候補のURLリストを作成する
  const signalingUrlCandidates = createSignalingURL(
    signals.enabledSignalingUrlCandidates.value,
    signals.signalingUrlCandidates.value,
  );
  signals.setLogMessages({
    title: "SIGNALING_URL",
    description: JSON.stringify(signalingUrlCandidates),
  });
  const connection = Sora.connection(signalingUrlCandidates, signals.debug.value);
  const connectionOptionsState = pickConnectionOptionsState();
  const connectionOptions = createConnectOptions(connectionOptionsState);
  const metadata = parseMetadata(signals.enabledMetadata.value, signals.metadata.value);
  let soraConnection: undefined | ConnectionPublisher | ConnectionSubscriber;
  let mediaStream: undefined | MediaStream;
  let gainNode: undefined | GainNode | null;
  const roleValue = signals.role.value;
  const channelIdValue = signals.channelId.value;
  const googCpuOveruseDetectionValue = signals.googCpuOveruseDetection.value;
  if (roleValue === "sendonly" || roleValue === "sendrecv") {
    [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
      signals.setSoraErrorAlertMessage(error.toString());
      signals.setSoraConnectionStatus("disconnected");
      throw error;
    });
  }
  for (let i = 1; i <= 10; i++) {
    const reconnectingValue = signals.reconnecting.value;
    if (reconnectingValue === false) {
      break;
    }
    signals.setSoraReconnectingTrials(i);
    try {
      if (roleValue === "sendonly") {
        soraConnection = connection.sendonly(channelIdValue, null, connectionOptions);
        soraConnection.metadata = metadata;
        // Chrome 独自のオプションを使用して CPU の負荷が高い場合に解像度を下げる処理の設定を入れる
        if (typeof googCpuOveruseDetectionValue === "boolean") {
          soraConnection.constraints = {
            optional: [{ googCpuOveruseDetection: googCpuOveruseDetectionValue }],
          };
        }
        setSoraCallbacks(soraConnection);
        if (mediaStream) {
          await soraConnection.connect(mediaStream);
        }
      } else if (roleValue === "sendrecv") {
        soraConnection = connection.sendrecv(channelIdValue, null, connectionOptions);
        soraConnection.metadata = metadata;
        // Chrome 独自のオプションを使用して CPU の負荷が高い場合に解像度を下げる処理の設定を入れる
        if (typeof googCpuOveruseDetectionValue === "boolean") {
          soraConnection.constraints = {
            optional: [{ googCpuOveruseDetection: googCpuOveruseDetectionValue }],
          };
        }
        setSoraCallbacks(soraConnection);
        if (mediaStream) {
          await soraConnection.connect(mediaStream);
        }
      } else if (roleValue === "recvonly") {
        soraConnection = connection.recvonly(channelIdValue, null, connectionOptions);
        soraConnection.metadata = metadata;
        setSoraCallbacks(soraConnection);
        await soraConnection.connect();
      }
    } catch (error) {
      if (error instanceof Error) {
        signals.setSoraErrorAlertMessage(`(trials ${i}) Failed to connect Sora. ${error.message}`);
      }
      soraConnection = undefined;
    }
    if (soraConnection !== undefined) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, i * 500 + 500));
  }
  if (soraConnection === undefined) {
    signals.setSoraErrorAlertMessage("Failed to reconnect Sora.");
    signals.setSoraConnectionStatus("disconnected");
    signals.setSoraReconnecting(false);
    return;
  }
  signals.setSoraInfoAlertMessage("Succeeded to reconnect Sora.");
  await setStatsReportInternal(soraConnection);
  const timerId = setInterval(async () => {
    const soraValue = signals.sora.value;
    if (soraValue) {
      await setStatsReportInternal(soraValue);
    } else {
      clearInterval(timerId);
    }
  }, 1000);
  signals.setSora(soraConnection);
  if (mediaStream) {
    signals.setLocalMediaStream(mediaStream);
  }
  if (gainNode) {
    signals.setFakeContentsGainNode(gainNode);
  }
  signals.setSoraConnectionStatus("connected");
  signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("connected"));
  signals.setSoraReconnecting(false);
};

// Sora との切断処理
export const disconnectSora = async (): Promise<void> => {
  const soraValue = signals.sora.value;
  const connectionStatusValue = signals.connectionStatus.value;
  if (soraValue && connectionStatusValue === "connected") {
    signals.setSoraConnectionStatus("disconnecting");
    await soraValue.disconnect();
    signals.setSoraConnectionStatus("disconnected");
  }
};

// デバイス一覧を取得
export const setMediaDevices = async (): Promise<void> => {
  const deviceInfos = await getDevices();
  const audioInputDevicesData: MediaDeviceInfo[] = [];
  const videoInputDevicesData: MediaDeviceInfo[] = [];
  const audioOutputDevicesData: MediaDeviceInfo[] = [];
  deviceInfos.forEach((deviceInfo) => {
    if (deviceInfo.deviceId === "") {
      return;
    }
    if (deviceInfo.kind === "audioinput") {
      audioInputDevicesData.push(deviceInfo.toJSON());
    } else if (deviceInfo.kind === "audiooutput") {
      audioOutputDevicesData.push(deviceInfo.toJSON());
    } else if (deviceInfo.kind === "videoinput") {
      videoInputDevicesData.push(deviceInfo.toJSON());
    }
  });
  signals.setAudioInputDevices(audioInputDevicesData);
  signals.setVideoInputDevices(videoInputDevicesData);
  signals.setAudioOutputDevices(audioOutputDevicesData);
};

export const unregisterServiceWorker = async (): Promise<void> => {
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const registration of registrations) {
    await registration.unregister();
  }
};

// デバイスの変更時などに Sora との接続を維持したまま MediaStream のみ更新
export const updateMediaStream = async (): Promise<void> => {
  const state = getStateForMediaStream();
  const localMediaStreamValue = signals.localMediaStream.value;
  const soraValue = signals.sora.value;
  const virtualBackgroundProcessorValue = signals.virtualBackgroundProcessor.value;
  const noiseSuppressionProcessorValue = signals.noiseSuppressionProcessor.value;
  if (!localMediaStreamValue) {
    return;
  }
  if (virtualBackgroundProcessorValue?.isProcessing()) {
    const originalTrack = virtualBackgroundProcessorValue.getOriginalTrack();
    if (originalTrack) {
      originalTrack.stop();
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    }
    virtualBackgroundProcessorValue.stopProcessing();
  } else if (localMediaStreamValue) {
    localMediaStreamValue.getVideoTracks().forEach((track) => {
      track.stop();
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }

  if (noiseSuppressionProcessorValue?.isProcessing()) {
    const originalTrack = noiseSuppressionProcessorValue.getOriginalTrack();
    if (originalTrack) {
      originalTrack.stop();
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    }
    noiseSuppressionProcessorValue.stopProcessing();
  } else if (localMediaStreamValue) {
    localMediaStreamValue.getAudioTracks().forEach((track) => {
      track.stop();
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }
  const [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
    signals.setSoraErrorAlertMessage(error.toString());
    signals.setSoraConnectionStatus("disconnected");
    throw error;
  });
  mediaStream.getTracks().forEach((track) => {
    if (!soraValue || !soraValue.pc) {
      return;
    }
    const sender = soraValue.pc.getSenders().find((s) => {
      if (!s.track) {
        return false;
      }
      return s.track.kind === track.kind;
    });
    if (sender) {
      void sender.replaceTrack(track);
    }
  });
  signals.setLocalMediaStream(mediaStream);
  signals.setFakeContentsGainNode(gainNode);
};

export const setMicDeviceAction = async (micDevice: boolean): Promise<void> => {
  const state = getStateForMediaStream();
  const localMediaStreamValue = signals.localMediaStream.value;
  const soraValue = signals.sora.value;
  const connectionStatusValue = signals.connectionStatus.value;
  const noiseSuppressionProcessorValue = signals.noiseSuppressionProcessor.value;
  if (!localMediaStreamValue || !soraValue) {
    signals.setMicDevice(micDevice);
    return;
  }
  if (micDevice) {
    const pickedState = {
      aspectRatio: state.aspectRatio,
      audio: state.audio,
      audioContentHint: state.audioContentHint,
      audioInput: state.audioInput,
      audioTrack: state.audioTrack,
      autoGainControl: state.autoGainControl,
      blurRadius: state.blurRadius,
      cameraDevice: state.cameraDevice,
      echoCancellation: state.echoCancellation,
      echoCancellationType: state.echoCancellationType,
      facingMode: state.facingMode,
      fakeContents: state.fakeContents,
      fakeVolume: state.fakeVolume,
      frameRate: state.frameRate,
      mediaProcessorsNoiseSuppression: state.mediaProcessorsNoiseSuppression,
      mediaType: state.mediaType,
      mp4MediaStream: state.mp4MediaStream,
      micDevice: micDevice,
      noiseSuppression: state.noiseSuppression,
      noiseSuppressionProcessor: state.noiseSuppressionProcessor,
      resizeMode: state.resizeMode,
      resolution: state.resolution,
      video: false,
      videoContentHint: state.videoContentHint,
      videoInput: state.videoInput,
      videoTrack: state.videoTrack,
      virtualBackgroundProcessor: state.virtualBackgroundProcessor,
    };
    const [mediaStream, gainNode] = await createMediaStream(pickedState).catch((error) => {
      signals.setSoraErrorAlertMessage(error.toString());
      throw error;
    });
    if (mediaStream.getAudioTracks().length > 0) {
      if (soraValue && connectionStatusValue === "connected" && localMediaStreamValue) {
        // Sora 接続中の場合
        await soraValue.replaceAudioTrack(localMediaStreamValue, mediaStream.getAudioTracks()[0]);
      } else if (localMediaStreamValue) {
        // Sora は未接続で media access での表示を行っている場合
        // 現在の AudioTrack を停止、削除してから、新しい AudioTrack を追加する
        localMediaStreamValue.getAudioTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
          localMediaStreamValue?.removeTrack(track);
        });
        localMediaStreamValue.addTrack(mediaStream.getAudioTracks()[0]);
      }
      signals.setFakeContentsGainNode(gainNode);
    }
  } else if (soraValue && connectionStatusValue === "connected" && localMediaStreamValue) {
    // Sora 接続中の場合
    stopLocalAudioTrack(localMediaStreamValue, noiseSuppressionProcessorValue);
    void soraValue.stopAudioTrack(localMediaStreamValue);
  } else if (localMediaStreamValue) {
    // Sora は未接続で media access での表示を行っている場合
    // localMediaStream の AudioTrack を停止して MediaStream から Track を削除する
    stopLocalAudioTrack(localMediaStreamValue, noiseSuppressionProcessorValue);
  }
  signals.setMicDevice(micDevice);
};

export const setCameraDeviceAction = async (cameraDevice: boolean): Promise<void> => {
  const state = getStateForMediaStream();
  const localMediaStreamValue = signals.localMediaStream.value;
  const soraValue = signals.sora.value;
  const connectionStatusValue = signals.connectionStatus.value;
  const virtualBackgroundProcessorValue = signals.virtualBackgroundProcessor.value;
  if (!localMediaStreamValue && !soraValue && connectionStatusValue !== "connected") {
    signals.setCameraDevice(cameraDevice);
    return;
  }
  if (cameraDevice) {
    const pickedState = {
      aspectRatio: state.aspectRatio,
      audio: false,
      audioContentHint: state.audioContentHint,
      audioInput: state.audioInput,
      audioTrack: state.audioTrack,
      autoGainControl: state.autoGainControl,
      blurRadius: state.blurRadius,
      cameraDevice: cameraDevice,
      echoCancellation: state.echoCancellation,
      echoCancellationType: state.echoCancellationType,
      facingMode: state.facingMode,
      fakeContents: state.fakeContents,
      fakeVolume: state.fakeVolume,
      frameRate: state.frameRate,
      mediaProcessorsNoiseSuppression: state.mediaProcessorsNoiseSuppression,
      mediaType: state.mediaType,
      mp4MediaStream: state.mp4MediaStream,
      micDevice: state.micDevice,
      noiseSuppression: state.noiseSuppression,
      noiseSuppressionProcessor: state.noiseSuppressionProcessor,
      resizeMode: state.resizeMode,
      resolution: state.resolution,
      video: state.video,
      videoContentHint: state.videoContentHint,
      videoInput: state.videoInput,
      videoTrack: state.videoTrack,
      virtualBackgroundProcessor: state.virtualBackgroundProcessor,
    };
    const [mediaStream, gainNode] = await createMediaStream(pickedState).catch((error) => {
      signals.setSoraErrorAlertMessage(error.toString());
      throw error;
    });
    if (mediaStream.getVideoTracks().length > 0) {
      if (soraValue && connectionStatusValue === "connected" && localMediaStreamValue) {
        // Sora 接続中の場合
        void soraValue.replaceVideoTrack(localMediaStreamValue, mediaStream.getVideoTracks()[0]);
      } else if (localMediaStreamValue) {
        // Sora は未接続で media access での表示を行っている場合
        // 現在の VideoTrack を停止、削除してから、新しい VideoTrack を追加する
        localMediaStreamValue.getVideoTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
          localMediaStreamValue?.removeTrack(track);
        });
        localMediaStreamValue.addTrack(mediaStream.getVideoTracks()[0]);
      }
      signals.setFakeContentsGainNode(gainNode);
    }
  } else if (soraValue && connectionStatusValue === "connected" && localMediaStreamValue) {
    // Sora 接続中の場合
    const originalTrack = stopVideoProcessors(virtualBackgroundProcessorValue);
    await stopLocalVideoTrack(localMediaStreamValue, originalTrack);
    void soraValue.stopVideoTrack(localMediaStreamValue);
  } else if (localMediaStreamValue) {
    // Sora は未接続で media access での表示を行っている場合
    // localMediaStream の VideoTrack を停止して MediaStream から Track を削除する
    const originalTrack = stopVideoProcessors(virtualBackgroundProcessorValue);
    await stopLocalVideoTrack(localMediaStreamValue, originalTrack);
  }
  signals.setCameraDevice(cameraDevice);
};

/**
 * 設定されている media processor が実行中の場合は停止し、使用されていた MediaStreamTrack を返す
 * media processor が実行中でない場合は undefined を返す
 */
const stopVideoProcessors = (
  virtualBackgroundProcessor: VirtualBackgroundProcessor | null,
): MediaStreamTrack | undefined => {
  let originalTrack: MediaStreamVideoTrack | undefined;
  if (virtualBackgroundProcessor?.isProcessing()) {
    originalTrack = virtualBackgroundProcessor.getOriginalTrack();
    virtualBackgroundProcessor.stopProcessing();
  }
  return originalTrack;
};

/**
 * devtools のローカルにもっている MediaStream のうち Video Track の停止を行う関数
 * MediaStream から Track の削除も行う
 * originalTrack の引数は stopVideoProcessors を呼び出し取得した MediaStreamTrack を渡す
 */
const stopLocalVideoTrack = async (
  localMediaStreamValue: MediaStream | null,
  originalTrack?: MediaStreamTrack,
): Promise<void> => {
  if (originalTrack !== undefined) {
    originalTrack.enabled = false;
    // track enabled = false から sleep を sleep を入れないと配信側にカメラの最後のコマが残る問題へのハック
    // safari はこれで対応できるが firefox は残ってしまう
    await new Promise((resolve) => setTimeout(resolve, 100));
    originalTrack.stop();
    localMediaStreamValue?.removeTrack(originalTrack);
    signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
  } else {
    if (!localMediaStreamValue) {
      return;
    }
    localMediaStreamValue.getVideoTracks().forEach((track) => {
      track.enabled = false;
    });
    // track enabled = false から sleep を sleep を入れないと配信側にカメラの最後のコマが残る問題へのハック
    // safari はこれで対応できるが firefox は残ってしまう
    await new Promise((resolve) => setTimeout(resolve, 100));
    localMediaStreamValue.getVideoTracks().forEach((track) => {
      track.stop();
      localMediaStreamValue.removeTrack(track);
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }
};

/**
 * devtools のローカルにもっている MediaStream のうち Audio Track と
 * 映像処理を行っている MediaProcessor の停止を行う関数
 * MediaStream から Track の削除も行う
 */
const stopLocalAudioTrack = (
  localMediaStreamValue: MediaStream | null,
  noiseSuppressionProcessor: NoiseSuppressionProcessor | null,
): void => {
  if (noiseSuppressionProcessor?.isProcessing()) {
    const originalTrack = noiseSuppressionProcessor.getOriginalTrack();
    if (originalTrack) {
      originalTrack.stop();
      localMediaStreamValue?.removeTrack(originalTrack);
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    }
    noiseSuppressionProcessor.stopProcessing();
  } else if (localMediaStreamValue) {
    localMediaStreamValue.getAudioTracks().forEach((track) => {
      track.stop();
      localMediaStreamValue.removeTrack(track);
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }
};

// Re-export all actions from signals for backward compatibility
export {
  clearApiObjects,
  clearDataChannelMessages,
  clearRpcObjects,
  deleteAlertMessage,
  setAPIErrorAlertMessage,
  setAPIInfoAlertMessage,
  setRPCErrorAlertMessage,
  setAspectRatio,
  setAudio,
  setAudioBitRate,
  setAudioCodecType,
  setAudioContentHint,
  setAudioInput,
  setAudioOutput,
  setAudioTrack,
  setAutoGainControl,
  setBlurRadius,
  setBundleId,
  setChannelId,
  setClientId,
  setDataChannels,
  setDataChannelSignaling,
  setDebug,
  setDebugApiUrl,
  setDebugFilterText,
  setDebugType,
  setDisplayResolution,
  setEchoCancellation,
  setEchoCancellationType,
  setEnabledBundleId,
  setEnabledClientId,
  setEnabledDataChannels,
  setEnabledDataChannel,
  setEnabledForwardingFilters,
  setEnabledMetadata,
  setEnabledSignalingNotifyMetadata,
  setEnabledSignalingUrlCandidates,
  setEnabledVideoVP9Params,
  setEnabledVideoH264Params,
  setEnabledVideoH265Params,
  setEnabledVideoAV1Params,
  setAudioStreamingLanguageCode,
  setEnabledAudioStreamingLanguageCode,
  setFakeVolume,
  setFacingMode,
  setForceStereoOutput,
  setFrameRate,
  setIgnoreDisconnectWebSocket,
  setLocalMediaStream,
  setLogMessages,
  setMediaProcessorsNoiseSuppression,
  setMediaStats,
  setMediaType,
  setMetadata,
  setMp4MediaStream,
  setNoiseSuppression,
  setNotifyMessages,
  setReconnect,
  setResizeMode,
  setRole,
  setResolution,
  setApiObject,
  setRpcObject,
  setSignalingNotifyMetadata,
  setSignalingUrlCandidates,
  setForwardingFilters,
  setSimulcast,
  setSimulcastRid,
  setSimulcastRequestRid,
  setSora,
  setSoraReconnecting,
  setSoraErrorAlertMessage,
  setSoraInfoAlertMessage,
  setSpotlight,
  setSpotlightFocusRid,
  setSpotlightNumber,
  setSpotlightUnfocusRid,
  setVideo,
  setVideoBitRate,
  setVideoCodecType,
  setVideoContentHint,
  setVideoInput,
  setVideoTrack,
  setVideoVP9Params,
  setVideoH264Params,
  setVideoH265Params,
  setVideoAV1Params,
} from "./signals.ts";
