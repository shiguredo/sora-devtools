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
import {
  deleteFocusedSpotlightConnectionId,
  getState,
  removeAllRemoteClients,
  removeRemoteClient,
  resetState,
  setAPIErrorAlertMessage,
  setApiUrl,
  setAspectRatio,
  setAudio,
  setAudioBitRate,
  setAudioCodecType,
  setAudioContentHint,
  setAudioInput,
  setAudioInputDevices,
  setAudioOutput,
  setAudioOutputDevices,
  setAudioStreamingLanguageCode,
  setAudioTrack,
  setAutoGainControl,
  setBlurRadius,
  setBundleId,
  setCameraDevice as setCameraDeviceStore,
  setChannelId,
  setClientId,
  setDataChannelMessage,
  setDataChannelSignaling,
  setDataChannels,
  setDebug,
  setDebugApiUrl,
  setDebugType,
  setDisplayResolution,
  setEchoCancellation,
  setEchoCancellationType,
  setEnabledAudioStreamingLanguageCode,
  setEnabledBundleId,
  setEnabledClientId,
  setEnabledDataChannel,
  setEnabledDataChannels,
  setEnabledForwardingFilter,
  setEnabledForwardingFilters,
  setEnabledMetadata,
  setEnabledSignalingNotifyMetadata,
  setEnabledSignalingUrlCandidates,
  setEnabledVideoAV1Params,
  setEnabledVideoH264Params,
  setEnabledVideoH265Params,
  setEnabledVideoVP9Params,
  setFacingMode,
  setFakeContentsGainNode,
  setFakeVolume,
  setFocusedSpotlightConnectionId,
  setForceStereoOutput,
  setForwardingFilter,
  setForwardingFilters,
  setFrameRate,
  setGoogCpuOveruseDetection,
  setIgnoreDisconnectWebSocket,
  setInitialFakeContents,
  setLocalMediaStream,
  setLogMessages,
  setMediaProcessorsNoiseSuppression,
  setMediaStats,
  setMediaType,
  setMetadata,
  setMicDevice as setMicDeviceStore,
  setMute,
  setNoiseSuppression,
  setNotifyMessages,
  setPushMessages,
  setReconnect,
  setRemoteClient,
  setResizeMode,
  setResolution,
  setRole,
  setShowStats,
  setSignalingMessage,
  setSignalingNotifyMetadata,
  setSignalingUrlCandidates,
  setSimulcast,
  setSimulcastRequestRid,
  setSimulcastRid,
  setSora,
  setSoraClientId,
  setSoraConnectionId,
  setSoraConnectionStatus,
  setSoraDataChannels,
  setSoraErrorAlertMessage,
  setSoraInfoAlertMessage,
  setSoraReconnecting,
  setSoraReconnectingTrials,
  setSoraRemoteClientId,
  setSoraSessionId,
  setSoraTurnUrl,
  setSpotlight,
  setSpotlightFocusRid,
  setSpotlightNumber,
  setSpotlightUnfocusRid,
  setStatsReport as setStatsReportStore,
  setTimelineMessage,
  setUnFocusedSpotlightConnectionId,
  setVideo,
  setVideoAV1Params,
  setVideoBitRate,
  setVideoCodecType,
  setVideoContentHint,
  setVideoH264Params,
  setVideoH265Params,
  setVideoInput,
  setVideoInputDevices,
  setVideoTrack,
  setVideoVP9Params,
} from "./store.ts";

// ページ初期化処理
export const setInitialParameter = async (): Promise<void> => {
  resetState();

  const qsParams = parseQueryString(new URLSearchParams(location.search));
  if (qsParams.audio !== undefined) {
    setAudio(qsParams.audio);
  }
  if (qsParams.audioBitRate !== undefined) {
    setAudioBitRate(qsParams.audioBitRate);
  }
  if (qsParams.audioCodecType !== undefined) {
    setAudioCodecType(qsParams.audioCodecType);
  }
  // 存在しない Device の場合はセットしない
  const deviceInfos = await getDevices();
  // audioinput
  const audioInputDevice = deviceInfos.find(
    (d) => d.kind === "audioinput" && d.deviceId === qsParams.audioInput,
  );
  if (audioInputDevice !== undefined) {
    setAudioInput(audioInputDevice.deviceId);
  }
  // audiooutput
  const audioOutputDevice = deviceInfos.find(
    (d) => d.kind === "audiooutput" && d.deviceId === qsParams.audioOutput,
  );
  if (audioOutputDevice !== undefined) {
    setAudioOutput(audioOutputDevice.deviceId);
  }
  // videoinput
  const videoInputDevice = deviceInfos.find(
    (d) => d.kind === "videoinput" && d.deviceId === qsParams.videoInput,
  );
  if (videoInputDevice !== undefined) {
    setVideoInput(videoInputDevice.deviceId);
  }
  if (qsParams.autoGainControl !== undefined) {
    setAutoGainControl(qsParams.autoGainControl);
  }
  if (qsParams.channelId !== undefined) {
    setChannelId(qsParams.channelId);
  }
  if (qsParams.displayResolution !== undefined) {
    setDisplayResolution(qsParams.displayResolution);
  }
  if (qsParams.echoCancellation !== undefined) {
    setEchoCancellation(qsParams.echoCancellation);
  }
  if (qsParams.echoCancellationType !== undefined) {
    setEchoCancellationType(qsParams.echoCancellationType);
  }
  if (qsParams.mediaStats !== undefined) {
    setMediaStats(qsParams.mediaStats);
  }
  if (qsParams.mediaType !== undefined) {
    setMediaType(qsParams.mediaType);
  }
  if (qsParams.facingMode !== undefined) {
    setFacingMode(qsParams.facingMode);
  }
  if (qsParams.fakeVolume !== undefined) {
    setFakeVolume(qsParams.fakeVolume);
  }
  if (qsParams.frameRate !== undefined) {
    setFrameRate(qsParams.frameRate);
  }
  if (qsParams.noiseSuppression !== undefined) {
    setNoiseSuppression(qsParams.noiseSuppression);
  }
  if (qsParams.resolution !== undefined) {
    setResolution(qsParams.resolution);
  }
  if (qsParams.showStats !== undefined) {
    setShowStats(qsParams.showStats);
  }
  if (qsParams.simulcast !== undefined) {
    setSimulcast(qsParams.simulcast);
  }
  if (qsParams.simulcastRid !== undefined) {
    setSimulcastRid(qsParams.simulcastRid);
  }
  if (qsParams.simulcastRequestRid !== undefined) {
    setSimulcastRequestRid(qsParams.simulcastRequestRid);
  }
  if (qsParams.spotlight !== undefined) {
    setSpotlight(qsParams.spotlight);
  }
  if (qsParams.spotlightNumber !== undefined) {
    setSpotlightNumber(qsParams.spotlightNumber);
  }
  if (qsParams.spotlightFocusRid !== undefined) {
    setSpotlightFocusRid(qsParams.spotlightFocusRid);
  }
  if (qsParams.spotlightUnfocusRid !== undefined) {
    setSpotlightUnfocusRid(qsParams.spotlightUnfocusRid);
  }
  if (qsParams.video !== undefined) {
    setVideo(qsParams.video);
  }
  if (qsParams.videoBitRate !== undefined) {
    setVideoBitRate(qsParams.videoBitRate);
  }
  if (qsParams.videoCodecType !== undefined) {
    setVideoCodecType(qsParams.videoCodecType);
  }
  if (qsParams.videoVP9Params !== undefined) {
    setVideoVP9Params(qsParams.videoVP9Params);
  }
  if (qsParams.videoH264Params !== undefined) {
    setVideoH264Params(qsParams.videoH264Params);
  }
  if (qsParams.videoH265Params !== undefined) {
    setVideoH265Params(qsParams.videoH265Params);
  }
  if (qsParams.videoAV1Params !== undefined) {
    setVideoAV1Params(qsParams.videoAV1Params);
  }
  if (qsParams.debug !== undefined) {
    setDebug(qsParams.debug);
  }
  if (qsParams.debugType !== undefined) {
    setDebugType(qsParams.debugType);
  }
  if (qsParams.debugApiUrl !== undefined) {
    setDebugApiUrl(qsParams.debugApiUrl);
  }
  if (qsParams.mute !== undefined) {
    setMute(qsParams.mute);
  }
  if (qsParams.dataChannelSignaling !== undefined) {
    setDataChannelSignaling(qsParams.dataChannelSignaling);
  }
  if (qsParams.ignoreDisconnectWebSocket !== undefined) {
    setIgnoreDisconnectWebSocket(qsParams.ignoreDisconnectWebSocket);
  }
  if (qsParams.micDevice !== undefined) {
    setMicDeviceStore(qsParams.micDevice);
  }
  if (qsParams.cameraDevice !== undefined) {
    setCameraDeviceStore(qsParams.cameraDevice);
  }
  if (qsParams.audioTrack !== undefined) {
    setAudioTrack(qsParams.audioTrack);
  }
  if (qsParams.videoTrack !== undefined) {
    setVideoTrack(qsParams.videoTrack);
  }
  if (qsParams.googCpuOveruseDetection !== undefined && qsParams.googCpuOveruseDetection !== null) {
    setGoogCpuOveruseDetection(qsParams.googCpuOveruseDetection);
  }
  if (qsParams.bundleId !== undefined) {
    setBundleId(qsParams.bundleId);
  }
  if (qsParams.clientId !== undefined) {
    setClientId(qsParams.clientId);
  }
  if (qsParams.metadata !== undefined) {
    setMetadata(qsParams.metadata);
  }
  if (qsParams.signalingNotifyMetadata !== undefined) {
    setSignalingNotifyMetadata(qsParams.signalingNotifyMetadata);
  }
  if (qsParams.signalingUrlCandidates !== undefined) {
    setSignalingUrlCandidates(qsParams.signalingUrlCandidates);
  }
  if (qsParams.forwardingFilters !== undefined) {
    setForwardingFilters(qsParams.forwardingFilters);
  }
  if (qsParams.forwardingFilter !== undefined) {
    setForwardingFilter(qsParams.forwardingFilter);
  }
  if (qsParams.dataChannels !== undefined) {
    setDataChannels(qsParams.dataChannels);
  }
  if (qsParams.audioContentHint !== undefined) {
    setAudioContentHint(qsParams.audioContentHint);
  }
  if (qsParams.videoContentHint !== undefined) {
    setVideoContentHint(qsParams.videoContentHint);
  }
  if (qsParams.reconnect !== undefined) {
    setReconnect(qsParams.reconnect);
  }
  if (qsParams.aspectRatio !== undefined) {
    setAspectRatio(qsParams.aspectRatio);
  }
  if (qsParams.resizeMode !== undefined) {
    setResizeMode(qsParams.resizeMode);
  }
  if (qsParams.blurRadius !== undefined) {
    setBlurRadius(qsParams.blurRadius);
  }
  if (qsParams.mediaProcessorsNoiseSuppression !== undefined) {
    setMediaProcessorsNoiseSuppression(qsParams.mediaProcessorsNoiseSuppression);
  }
  if (qsParams.apiUrl !== undefined && qsParams.apiUrl !== null) {
    setApiUrl(qsParams.apiUrl);
  }
  if (qsParams.role !== undefined) {
    setRole(qsParams.role);
  }
  if (qsParams.audioStreamingLanguageCode !== undefined) {
    setAudioStreamingLanguageCode(qsParams.audioStreamingLanguageCode);
  }
  if (qsParams.forceStereoOutput !== undefined) {
    setForceStereoOutput(qsParams.forceStereoOutput);
  }
  setInitialFakeContents();

  const state = getState();
  const {
    audioStreamingLanguageCode,
    bundleId,
    clientId,
    dataChannelSignaling,
    dataChannels,
    ignoreDisconnectWebSocket,
    metadata,
    signalingNotifyMetadata,
    signalingUrlCandidates,
    forwardingFilters,
    forwardingFilter,
    videoVP9Params,
    videoH264Params,
    videoH265Params,
    videoAV1Params,
  } = state;
  // bundleId が存在した場合は enabledBundleId をセットする
  if (bundleId !== "") {
    setEnabledBundleId(true);
  }
  // clientId が存在した場合は enabledClientId をセットする
  if (clientId !== "") {
    setEnabledClientId(true);
  }
  // metadata が存在した場合は enabledMetadata をセットする
  if (metadata !== "") {
    setEnabledMetadata(true);
  }
  // signalingNotifyMetadata が存在した場合は enabledSignalingNotifyMetadata をセットする
  if (signalingNotifyMetadata !== "") {
    setEnabledSignalingNotifyMetadata(true);
  }
  // signalingUrlCandidates が存在した場合は enabledSignalingUrlCandidates をセットする
  if (signalingUrlCandidates.length > 0) {
    setEnabledSignalingUrlCandidates(true);
  }
  // forwardingFilters が存在した場合は enabledForwardingFilters をセットする
  if (forwardingFilters !== "") {
    setEnabledForwardingFilters(true);
  }
  // forwardingFilter が存在した場合は enabledForwardingFilter をセットする
  if (forwardingFilter !== "") {
    setEnabledForwardingFilter(true);
  }
  // dataChannelSignaling または ignoreDisconnectWebSocket が存在した場合は enabledDataChannel をセットする
  if (dataChannelSignaling !== "" || ignoreDisconnectWebSocket !== "") {
    setEnabledDataChannel(true);
  }
  // dataChannels が存在した場合は enabledDataChannels をセットする
  if (dataChannels !== "") {
    setEnabledDataChannels(true);
  }
  // audioStreamingLanguageCode が存在した場合は enabledAudioStreamingLanguageCode をセットする
  if (audioStreamingLanguageCode !== "") {
    setEnabledAudioStreamingLanguageCode(true);
  }
  // videoVP9Params が存在した場合は enabledVideoVP9Params をセットする
  if (videoVP9Params !== "") {
    setEnabledVideoVP9Params(true);
  }
  // videoH264Params が存在した場合は enabledH264Params をセットする
  if (videoH264Params !== "") {
    setEnabledVideoH264Params(true);
  }
  // videoH265Params が存在した場合は enabledH265Params をセットする
  if (videoH265Params !== "") {
    setEnabledVideoH265Params(true);
  }
  // videoAV1Params が存在した場合は enabledVideoAV1Params をセットする
  if (videoAV1Params !== "") {
    setEnabledVideoAV1Params(true);
  }
  setSoraConnectionStatus("disconnected");
};

// URL をクリップボードにコピーする
export const copyURL = (): void => {
  const state = getState();
  const appendAudioVideoParams = state.role !== "recvonly";
  const appendReceiverParams = state.role !== "sendonly";
  const parameters: Partial<QueryStringParameters> = {
    channelId: state.channelId,
    role: state.role,
    audio: state.audio,
    video: state.video,
    debug: state.debug,
    // debug が true の場合のみ debugType を含める
    debugType: state.debug && state.debugType !== "timeline" ? state.debugType : undefined,
    // debug が true の場合のみ debugApiUrl を含める
    debugApiUrl:
      state.debug && state.debugApiUrl !== "http://localhost:3000" ? state.debugApiUrl : undefined,
    // URL の長さ短縮のため初期値と同じ場合は query string に含めない
    mediaType: state.mediaType !== "getUserMedia" ? state.mediaType : undefined,
    // URL の長さ短縮のため空文字列は query string に含めない
    audioBitRate:
      appendAudioVideoParams && state.audioBitRate !== "" ? state.audioBitRate : undefined,
    audioCodecType:
      appendAudioVideoParams && state.audioCodecType !== "" ? state.audioCodecType : undefined,
    videoBitRate:
      appendAudioVideoParams && state.videoBitRate !== "" ? state.videoBitRate : undefined,
    videoCodecType:
      appendAudioVideoParams && state.videoCodecType !== "" ? state.videoCodecType : undefined,
    videoVP9Params:
      appendAudioVideoParams && state.videoVP9Params !== "" && state.enabledVideoVP9Params
        ? state.videoVP9Params
        : undefined,
    videoH264Params:
      appendAudioVideoParams && state.videoH264Params !== "" && state.enabledVideoH264Params
        ? state.videoH264Params
        : undefined,
    videoH265Params:
      appendAudioVideoParams && state.videoH265Params !== "" && state.enabledVideoH265Params
        ? state.videoH265Params
        : undefined,
    videoAV1Params:
      appendAudioVideoParams && state.videoAV1Params !== "" && state.enabledVideoAV1Params
        ? state.videoAV1Params
        : undefined,
    forceStereoOutput: appendReceiverParams && state.forceStereoOutput === true ? true : undefined,
    audioContentHint: state.audioContentHint !== "" ? state.audioContentHint : undefined,
    autoGainControl: state.autoGainControl !== "" ? state.autoGainControl : undefined,
    noiseSuppression: state.noiseSuppression !== "" ? state.noiseSuppression : undefined,
    echoCancellation: state.echoCancellation !== "" ? state.echoCancellation : undefined,
    echoCancellationType:
      state.echoCancellationType !== "" ? state.echoCancellationType : undefined,
    videoContentHint: state.videoContentHint !== "" ? state.videoContentHint : undefined,
    resolution: state.resolution !== "" ? state.resolution : undefined,
    facingMode: state.facingMode !== "" ? state.facingMode : undefined,
    frameRate: state.frameRate !== "" ? state.frameRate : undefined,
    aspectRatio: state.aspectRatio !== "" ? state.aspectRatio : undefined,
    resizeMode: state.resizeMode !== "" ? state.resizeMode : undefined,
    blurRadius: state.blurRadius !== "" ? state.blurRadius : undefined,
    simulcast: state.simulcast !== "" ? state.simulcast : undefined,
    simulcastRid: state.simulcastRid !== "" ? state.simulcastRid : undefined,
    simulcastRequestRid: state.simulcastRequestRid !== "" ? state.simulcastRequestRid : undefined,
    spotlight: state.spotlight !== "" ? state.spotlight : undefined,
    spotlightNumber: state.spotlightNumber !== "" ? state.spotlightNumber : undefined,
    spotlightFocusRid: state.spotlightFocusRid !== "" ? state.spotlightFocusRid : undefined,
    spotlightUnfocusRid: state.spotlightUnfocusRid !== "" ? state.spotlightUnfocusRid : undefined,
    audioInput:
      state.mediaType === "getUserMedia" && state.audioInput !== "" ? state.audioInput : undefined,
    audioOutput: state.audioOutput !== "" ? state.audioOutput : undefined,
    videoInput:
      state.mediaType === "getUserMedia" && state.videoInput !== "" ? state.videoInput : undefined,
    displayResolution: state.displayResolution !== "" ? state.displayResolution : undefined,
    // URL の長さ短縮のため true 以外は query string に含めない
    mediaStats: state.mediaStats === true ? true : undefined,
    bundleId: state.bundleId !== "" && state.enabledBundleId ? state.bundleId : undefined,
    clientId: state.clientId !== "" && state.enabledClientId ? state.clientId : undefined,
    metadata: state.metadata !== "" && state.enabledMetadata ? state.metadata : undefined,
    signalingNotifyMetadata:
      state.signalingNotifyMetadata !== "" && state.enabledSignalingNotifyMetadata
        ? state.signalingNotifyMetadata
        : undefined,
    forwardingFilters:
      state.forwardingFilters !== "" && state.enabledForwardingFilters
        ? state.forwardingFilters
        : undefined,
    forwardingFilter:
      state.forwardingFilter !== "" && state.enabledForwardingFilter
        ? state.forwardingFilter
        : undefined,
    dataChannelSignaling:
      state.dataChannelSignaling !== "" && state.enabledDataChannel
        ? state.dataChannelSignaling
        : undefined,
    ignoreDisconnectWebSocket:
      state.ignoreDisconnectWebSocket !== "" && state.enabledDataChannel
        ? state.ignoreDisconnectWebSocket
        : undefined,
    dataChannels:
      state.dataChannels !== "" && state.enabledDataChannels ? state.dataChannels : undefined,
    // URL の長さ短縮のため true 以外は query string に含めない
    reconnect: state.reconnect === true ? true : undefined,
    mediaProcessorsNoiseSuppression:
      state.mediaProcessorsNoiseSuppression === true ? true : undefined,
    // URL の長さ短縮のため false 以外は query string に含めない
    micDevice: state.micDevice === false ? false : undefined,
    cameraDevice: state.cameraDevice === false ? false : undefined,
    audioTrack: state.audioTrack === false ? false : undefined,
    videoTrack: state.videoTrack === false ? false : undefined,
    // signalingUrlCandidates
    signalingUrlCandidates:
      state.signalingUrlCandidates.length > 0 && state.enabledSignalingUrlCandidates
        ? state.signalingUrlCandidates
        : undefined,
    // apiUrl
    apiUrl: state.apiUrl !== null ? state.apiUrl : undefined,
    // fakeVolume
    fakeVolume: state.mediaType === "fakeMedia" ? state.fakeVolume : undefined,
    // mute
    mute: state.mute === true ? true : undefined,
    // audioStreamingLanguageCode
    audioStreamingLanguageCode:
      appendAudioVideoParams &&
      state.audioStreamingLanguageCode !== "" &&
      state.enabledAudioStreamingLanguageCode
        ? state.audioStreamingLanguageCode
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
  copy2clipboard(`${location.origin}${location.pathname}?${queryStrings.join("&")}`);
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
    setLogMessages({
      title: LOG_TITLE,
      description: JSON.stringify(mediaConstraints),
    });
    setTimelineMessage(createSoraDevtoolsTimelineMessage("media-constraints", mediaConstraints));
    const stream = await navigator.mediaDevices.getDisplayMedia(mediaConstraints);
    setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-get-display-media"));
    for (const track of stream.getVideoTracks()) {
      if (track.contentHint !== undefined) {
        track.contentHint = state.videoContentHint;
      }
      track.enabled = state.videoTrack;
      setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", track));
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
    setLogMessages({ title: LOG_TITLE, description: JSON.stringify(constraints) });
    setTimelineMessage(createSoraDevtoolsTimelineMessage("media-constraints", constraints));
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
      setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", track));
    }
    for (const track of mediaStream.getAudioTracks()) {
      if (track.contentHint !== undefined) {
        track.contentHint = state.audioContentHint;
      }
      track.enabled = state.audioTrack;
      setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", track));
    }
    setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-create-fake-media"));
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
    setLogMessages({
      title: LOG_TITLE,
      description: JSON.stringify(mediaStreamConstraints),
    });
    setTimelineMessage(
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
      setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", audioTrack));
      if (state.mediaProcessorsNoiseSuppression && NoiseSuppressionProcessor.isSupported()) {
        if (state.noiseSuppressionProcessor === null) {
          throw new Error(
            "Failed to start NoiseSuppressionProcessor. NoiseSuppressionProcessor is 'null'",
          );
        }
        state.noiseSuppressionProcessor.stopProcessing();
        audioTrack = await state.noiseSuppressionProcessor.startProcessing(audioTrack);
      }
      setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-audio-get-user-media"));
      mediaStream.addTrack(audioTrack);
    }
    if (videoConstraints) {
      let videoTrack = gumMediaStream.getVideoTracks()[0];
      setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", videoTrack));
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
      setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-video-get-user-media"));
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
function setSoraCallbacks(sora: ConnectionPublisher | ConnectionSubscriber): void {
  sora.on("log", (title: string, description: Json) => {
    setLogMessages({
      title: title,
      description: JSON.stringify(description),
    });
  });
  sora.on("notify", (message: SoraNotifyMessage, transportType: TransportType) => {
    if (message.event_type === "spotlight.focused" && typeof message.connection_id === "string") {
      setFocusedSpotlightConnectionId(message.connection_id);
    }
    if (message.event_type === "spotlight.unfocused" && typeof message.connection_id === "string") {
      setUnFocusedSpotlightConnectionId(message.connection_id);
    }
    if (
      message.event_type === "connection.destroyed" &&
      typeof message.connection_id === "string"
    ) {
      deleteFocusedSpotlightConnectionId(message.connection_id);
    }
    const { soraContents } = getState();
    if (
      message.event_type === "connection.created" &&
      typeof message.connection_id === "string" &&
      // notify の connection_id と offer で受け取った自身の connection id が一致すること
      message.connection_id === soraContents.sora?.connectionId
    ) {
      if (typeof message.session_id === "string") {
        setSoraSessionId(message.session_id);
      }
      if (typeof message.connection_id === "string") {
        setSoraConnectionId(message.connection_id);
      }
      if (typeof message.client_id === "string") {
        setSoraClientId(message.client_id);
      }
      // 接続時点で存在する remote client の client_id を保存する
      if (Array.isArray(message.data)) {
        for (const remoteClient of message.data) {
          if (
            typeof remoteClient.connection_id === "string" &&
            typeof remoteClient.client_id === "string"
          ) {
            setSoraRemoteClientId({
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
        setSoraRemoteClientId({
          connectionId: message.connection_id,
          clientId: message.client_id,
        });
      }
    }
    setNotifyMessages({
      timestamp: Date.now(),
      message: message,
      transportType: transportType,
    });
  });
  sora.on("push", (message: SoraPushMessage, transportType: TransportType) => {
    setPushMessages({
      timestamp: Date.now(),
      message: message,
      transportType: transportType,
    });
  });
  sora.on("track", (event: RTCTrackEvent) => {
    setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-track"));
    const { soraContents } = getState();
    const mediaStream = soraContents.remoteClients.find(
      (client) => client.connectionId === event.streams[0].id,
    );
    if (!mediaStream) {
      for (const track of event.streams[0].getTracks()) {
        setTimelineMessage(
          createSoraDevtoolsTimelineMessage(
            `remote-${track.kind}-mediastream-track`,
            getMediaStreamTrackProperties(track),
          ),
        );
      }
      setRemoteClient({
        mediaStream: event.streams[0],
        connectionId: event.streams[0].id,
        clientId: null,
      });
    }
  });
  sora.on("removetrack", (event: MediaStreamTrackEvent) => {
    setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-removetrack"));
    const { soraContents } = getState();
    const remoteClient = soraContents.remoteClients.find((client) => {
      if (event?.target) {
        return client.connectionId === (event.target as MediaStream).id;
      }
      return false;
    });
    if (remoteClient) {
      removeRemoteClient(remoteClient.connectionId);
    }
  });
  sora.on("disconnect", (event) => {
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
    setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-disconnect", message));
    const {
      fakeContents,
      soraContents,
      reconnect,
      virtualBackgroundProcessor,
      noiseSuppressionProcessor,
    } = getState();
    const { localMediaStream, remoteClients } = soraContents;
    // media processor は同期処理で停止する
    const originalTrack = stopVideoProcessors(virtualBackgroundProcessor);
    // video track は停止の際に非同期処理が必要なため、最小限の処理に絞って非同期処理にする
    (async () => {
      // ローカルの MediaStream の Track と MediaProcessor を止める
      await stopLocalVideoTrack(localMediaStream, originalTrack);
    })();
    stopLocalAudioTrack(localMediaStream, noiseSuppressionProcessor);
    remoteClients.forEach((client) => {
      client.mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
    });
    if (fakeContents.worker) {
      fakeContents.worker.postMessage({ type: "stop" });
    }
    setSora(null);
    setSoraSessionId(null);
    setSoraConnectionId(null);
    setSoraClientId(null);
    setSoraTurnUrl(null);
    setSoraConnectionStatus("disconnected");
    setLocalMediaStream(null);
    removeAllRemoteClients();
    setSoraInfoAlertMessage("Disconnect Sora.");
    setTimelineMessage(createSoraDevtoolsTimelineMessage("disconnected"));
    if (event.type === "abend" && reconnect) {
      // 再接続処理開始フラグ
      setSoraReconnecting(true);
    }
  });
  sora.on("timeline", (event) => {
    const message = {
      timestamp: Date.now(),
      type: event.type,
      data: event.data,
      dataChannelId: event.dataChannelId,
      dataChannelLabel: event.dataChannelLabel,
      logType: event.logType,
    };
    setTimelineMessage(message);
    if (event.data && typeof event.data === "object" && "sdp" in event.data) {
      setTimelineMessage(createSoraDevtoolsTimelineMessage(`${event.type}-sdp`, event.data.sdp));
    }
  });
  sora.on("signaling", (event) => {
    const message = {
      timestamp: Date.now(),
      transportType: event.transportType,
      type: event.type,
      data: event.data,
    };
    setSignalingMessage(message);
  });
  sora.on("message", (event) => {
    setDataChannelMessage({
      timestamp: Date.now(),
      label: event.label,
      data: event.data,
    });
  });
  sora.on("datachannel", (event) => {
    setSoraDataChannels(event.datachannel);
  });
  sora.on("switched", (message) => {
    setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-switched", message));
  });
  sora.on("connected", (message) => {
    setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-connected", message));
  });
}

// SoraDevtoolsState から ConnectionOptionsState を生成する
function pickConnectionOptionsState(state: SoraDevtoolsState): ConnectionOptionsState {
  return {
    audio: state.audio,
    audioBitRate: state.audioBitRate,
    audioCodecType: state.audioCodecType,
    audioStreamingLanguageCode: state.audioStreamingLanguageCode,
    bundleId: state.bundleId,
    clientId: state.clientId,
    dataChannelSignaling: state.dataChannelSignaling,
    dataChannels: state.enabledDataChannels ? state.dataChannels : "",
    enabledAudioStreamingLanguageCode: state.enabledAudioStreamingLanguageCode,
    enabledBundleId: state.enabledBundleId,
    enabledClientId: state.enabledClientId,
    enabledDataChannel: state.enabledDataChannel,
    enabledSignalingNotifyMetadata: state.enabledSignalingNotifyMetadata,
    enabledForwardingFilters: state.enabledForwardingFilters,
    enabledForwardingFilter: state.enabledForwardingFilter,
    enabledVideoVP9Params: state.enabledVideoVP9Params,
    enabledVideoH264Params: state.enabledVideoH264Params,
    enabledVideoH265Params: state.enabledVideoH265Params,
    enabledVideoAV1Params: state.enabledVideoAV1Params,
    ignoreDisconnectWebSocket: state.ignoreDisconnectWebSocket,
    signalingNotifyMetadata: state.signalingNotifyMetadata,
    forwardingFilters: state.forwardingFilters,
    forwardingFilter: state.forwardingFilter,
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
    videoVP9Params: state.videoVP9Params,
    videoH264Params: state.videoH264Params,
    videoH265Params: state.videoH265Params,
    videoAV1Params: state.videoAV1Params,
    forceStereoOutput: state.forceStereoOutput,
    role: state.role,
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
async function setStatsReport(sora: ConnectionPublisher | ConnectionSubscriber): Promise<void> {
  if (sora.pc && sora.pc?.iceConnectionState !== "closed") {
    const stats = await sora.pc.getStats();
    const statsReport: RTCStats[] = [];
    const localCandidateStats: RTCIceLocalCandidateStats[] = [];
    for (const s of stats.values()) {
      const stat = s as RTCStats;
      statsReport.push(stat);
      if (stat.type === "local-candidate") {
        localCandidateStats.push(stat as RTCIceLocalCandidateStats);
      }
    }

    setStatsReportStore(statsReport);

    // local-candidate の最初に出現する TURN サーバーの URL を取得
    for (const s of localCandidateStats) {
      const localCandidate = s as RTCIceLocalCandidateStats;
      if (localCandidate.url !== undefined) {
        setSoraTurnUrl(localCandidate.url);
        break;
      }
    }
  }
}

export const requestMedia = async (): Promise<void> => {
  const LOG_TITLE = "REQUEST_MEDIA";
  const state = getState();
  let mediaStream: undefined | MediaStream;
  let gainNode: undefined | GainNode | null;
  try {
    [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
      throw error;
    });
  } catch (error) {
    if (error instanceof Error) {
      setLogMessages({
        title: LOG_TITLE,
        description: JSON.stringify(error.message),
      });
      setAPIErrorAlertMessage(`Failed to get user devices. ${error.message}`);
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
      setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    } else if (mediaStream) {
      mediaStream.getVideoTracks().forEach((track) => {
        track.stop();
        setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
      });
    }

    if (state.noiseSuppressionProcessor?.isProcessing()) {
      const originalTrack = state.noiseSuppressionProcessor.getOriginalTrack();
      if (originalTrack) {
        originalTrack.stop();
        setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
      }
      state.noiseSuppressionProcessor.stopProcessing();
    } else if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.stop();
        setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
      });
    }
    throw error;
  }
  if (gainNode) {
    setFakeContentsGainNode(gainNode);
  }
  setLocalMediaStream(mediaStream);
};

export const disposeMedia = async (): Promise<void> => {
  const { fakeContents, soraContents, noiseSuppressionProcessor, virtualBackgroundProcessor } =
    getState();
  const { localMediaStream } = soraContents;
  let originalTrack: MediaStreamTrack | undefined;
  if (virtualBackgroundProcessor?.isProcessing()) {
    originalTrack = virtualBackgroundProcessor.getOriginalTrack();
    virtualBackgroundProcessor.stopProcessing();
  }
  if (originalTrack !== undefined) {
    originalTrack.stop();
    localMediaStream?.removeTrack(originalTrack);
    setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
  } else if (localMediaStream) {
    localMediaStream.getVideoTracks().forEach((track) => {
      track.stop();
      localMediaStream.removeTrack(track);
      setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }

  if (noiseSuppressionProcessor?.isProcessing()) {
    const originalTrack = noiseSuppressionProcessor.getOriginalTrack();
    if (originalTrack) {
      originalTrack.stop();
      localMediaStream?.removeTrack(originalTrack);
      setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    }
    noiseSuppressionProcessor.stopProcessing();
  } else if (localMediaStream) {
    localMediaStream.getAudioTracks().forEach((track) => {
      track.stop();
      localMediaStream.removeTrack(track);
      setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }
  if (fakeContents.worker) {
    fakeContents.worker.postMessage({ type: "stop" });
  }
  setLocalMediaStream(null);
};

export const connectSora = async (): Promise<void> => {
  setTimelineMessage(createSoraDevtoolsTimelineMessage("start-connection"));
  setSoraConnectionStatus("preparing");
  const state = getState();
  // 強制的に state.soraContents.localMediaStream を作り直すかどうか
  let forceCreateMediaStream = false;
  // 接続中の場合は切断する
  if (state.soraContents.sora) {
    await state.soraContents.sora.disconnect();
    // 接続中の再接続の場合は、MediaStream を作り直し、state.soraContents.localMediaStream を更新する
    forceCreateMediaStream = true;
  }
  // シグナリング候補のURLリストを作成する
  const signalingUrlCandidates = createSignalingURL(
    state.enabledSignalingUrlCandidates,
    state.signalingUrlCandidates,
  );
  setLogMessages({
    title: "SIGNALING_URL",
    description: JSON.stringify(signalingUrlCandidates),
  });
  const connection = Sora.connection(signalingUrlCandidates, state.debug);
  const connectionOptionsState = pickConnectionOptionsState(state);
  const connectionOptions = createConnectOptions(connectionOptionsState);
  const metadata = parseMetadata(state.enabledMetadata, state.metadata);
  let sora: undefined | ConnectionPublisher | ConnectionSubscriber;
  let mediaStream: undefined | MediaStream;
  let gainNode: undefined | GainNode | null;
  try {
    if (state.role === "sendonly") {
      sora = connection.sendonly(state.channelId, null, connectionOptions);
      sora.metadata = metadata;
      // Chrome 独自のオプションを使用して CPU の負荷が高い場合に解像度を下げる処理の設定を入れる
      if (typeof state.googCpuOveruseDetection === "boolean") {
        sora.constraints = {
          optional: [{ googCpuOveruseDetection: state.googCpuOveruseDetection }],
        };
      }
      setSoraCallbacks(sora);
      if (!forceCreateMediaStream && state.soraContents.localMediaStream) {
        mediaStream = state.soraContents.localMediaStream;
      } else {
        [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
          setSoraErrorAlertMessage(error.toString());
          setSoraConnectionStatus("disconnected");
          throw error;
        });
      }
      setSoraConnectionStatus("connecting");
      // 先に setSora で state を参照できるようにしておかないと connection.created の notify が来た時に処理に困るため
      setSora(sora);
      await sora.connect(mediaStream);
    } else if (state.role === "sendrecv") {
      sora = connection.sendrecv(state.channelId, null, connectionOptions);
      sora.metadata = metadata;
      // Chrome 独自のオプションを使用して CPU の負荷が高い場合に解像度を下げる処理の設定を入れる
      if (typeof state.googCpuOveruseDetection === "boolean") {
        sora.constraints = {
          optional: [{ googCpuOveruseDetection: state.googCpuOveruseDetection }],
        };
      }
      setSoraCallbacks(sora);
      if (!forceCreateMediaStream && state.soraContents.localMediaStream) {
        mediaStream = state.soraContents.localMediaStream;
      } else {
        [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
          setSoraErrorAlertMessage(error.toString());
          setSoraConnectionStatus("disconnected");
          throw error;
        });
      }
      // 先に setSora で state を参照できるようにしておかないと connection.created の notify が来た時に処理に困るため
      setSora(sora);
      await sora.connect(mediaStream);
    } else if (state.role === "recvonly") {
      sora = connection.recvonly(state.channelId, null, connectionOptions);
      sora.metadata = metadata;
      setSoraCallbacks(sora);
      setSoraConnectionStatus("connecting");
      // 先に setSora で state を参照できるようにしておかないと connection.created の notify が来た時に処理に困るため
      setSora(sora);
      await sora.connect();
    }
  } catch (error) {
    // 先に setSora で state を参照できるようにした state の参照を削除
    setSora(null);
    if (error instanceof Error) {
      setSoraErrorAlertMessage(`Failed to connect Sora. ${error.message}`);
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
      setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    } else if (mediaStream) {
      mediaStream.getVideoTracks().forEach((track) => {
        track.stop();
        setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
      });
    }

    if (state.noiseSuppressionProcessor?.isProcessing()) {
      const originalTrack = state.noiseSuppressionProcessor.getOriginalTrack();
      if (originalTrack) {
        originalTrack.stop();
        setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
      }
      state.noiseSuppressionProcessor.stopProcessing();
    } else if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.stop();
        setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
      });
    }
    setSoraConnectionStatus("disconnected");
    throw error;
  }
  if (sora === undefined) {
    throw new Error("Failed to connect Sora. Connection object is 'undefined'");
  }
  setSoraInfoAlertMessage("Succeeded to connect Sora.");
  await setStatsReport(sora);
  const timerId = setInterval(async () => {
    const { soraContents } = getState();
    if (soraContents.sora) {
      await setStatsReport(soraContents.sora);
    } else {
      clearInterval(timerId);
    }
  }, 1000);
  // disconnect 時に stream を止めないためのハック
  sora.stream = null;
  if (mediaStream && (state.soraContents.localMediaStream === null || forceCreateMediaStream)) {
    setLocalMediaStream(mediaStream);
  }
  if (gainNode) {
    setFakeContentsGainNode(gainNode);
  }
  setSoraConnectionStatus("connected");
  setTimelineMessage(createSoraDevtoolsTimelineMessage("connected"));
};

export const reconnectSora = async (): Promise<void> => {
  setTimelineMessage(createSoraDevtoolsTimelineMessage("start-reconnect"));
  setSoraConnectionStatus("connecting");
  const state = getState();
  // 接続中の場合は切断する
  if (state.soraContents.sora && state.soraContents.connectionStatus === "connected") {
    await state.soraContents.sora.disconnect();
  }
  // シグナリング候補のURLリストを作成する
  const signalingUrlCandidates = createSignalingURL(
    state.enabledSignalingUrlCandidates,
    state.signalingUrlCandidates,
  );
  setLogMessages({
    title: "SIGNALING_URL",
    description: JSON.stringify(signalingUrlCandidates),
  });
  const connection = Sora.connection(signalingUrlCandidates, state.debug);
  const connectionOptionsState = pickConnectionOptionsState(state);
  const connectionOptions = createConnectOptions(connectionOptionsState);
  const metadata = parseMetadata(state.enabledMetadata, state.metadata);
  let sora: undefined | ConnectionPublisher | ConnectionSubscriber;
  let mediaStream: undefined | MediaStream;
  let gainNode: undefined | GainNode | null;
  if (state.role === "sendonly" || state.role === "sendrecv") {
    [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
      setSoraErrorAlertMessage(error.toString());
      setSoraConnectionStatus("disconnected");
      throw error;
    });
  }
  for (let i = 1; i <= 10; i++) {
    const { soraContents } = getState();
    if (soraContents.reconnecting === false) {
      break;
    }
    setSoraReconnectingTrials(i);
    try {
      if (state.role === "sendonly") {
        sora = connection.sendonly(state.channelId, null, connectionOptions);
        sora.metadata = metadata;
        // Chrome 独自のオプションを使用して CPU の負荷が高い場合に解像度を下げる処理の設定を入れる
        if (typeof state.googCpuOveruseDetection === "boolean") {
          sora.constraints = {
            optional: [{ googCpuOveruseDetection: state.googCpuOveruseDetection }],
          };
        }
        setSoraCallbacks(sora);
        if (mediaStream) {
          await sora.connect(mediaStream);
        }
      } else if (state.role === "sendrecv") {
        sora = connection.sendrecv(state.channelId, null, connectionOptions);
        sora.metadata = metadata;
        // Chrome 独自のオプションを使用して CPU の負荷が高い場合に解像度を下げる処理の設定を入れる
        if (typeof state.googCpuOveruseDetection === "boolean") {
          sora.constraints = {
            optional: [{ googCpuOveruseDetection: state.googCpuOveruseDetection }],
          };
        }
        setSoraCallbacks(sora);
        if (mediaStream) {
          await sora.connect(mediaStream);
        }
      } else if (state.role === "recvonly") {
        sora = connection.recvonly(state.channelId, null, connectionOptions);
        sora.metadata = metadata;
        setSoraCallbacks(sora);
        await sora.connect();
      }
    } catch (error) {
      if (error instanceof Error) {
        setSoraErrorAlertMessage(`(trials ${i}) Failed to connect Sora. ${error.message}`);
      }
      sora = undefined;
    }
    if (sora !== undefined) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, i * 500 + 500));
  }
  if (sora === undefined) {
    setSoraErrorAlertMessage("Failed to reconnect Sora.");
    setSoraConnectionStatus("disconnected");
    setSoraReconnecting(false);
    return;
  }
  setSoraInfoAlertMessage("Succeeded to reconnect Sora.");
  await setStatsReport(sora);
  const timerId = setInterval(async () => {
    const { soraContents } = getState();
    if (soraContents.sora) {
      await setStatsReport(soraContents.sora);
    } else {
      clearInterval(timerId);
    }
  }, 1000);
  setSora(sora);
  if (mediaStream) {
    setLocalMediaStream(mediaStream);
  }
  if (gainNode) {
    setFakeContentsGainNode(gainNode);
  }
  setSoraConnectionStatus("connected");
  setTimelineMessage(createSoraDevtoolsTimelineMessage("connected"));
  setSoraReconnecting(false);
};

// Sora との切断処理
export const disconnectSora = async (): Promise<void> => {
  const { soraContents } = getState();

  if (soraContents.sora && soraContents.connectionStatus === "connected") {
    setSoraConnectionStatus("disconnecting");
    await soraContents.sora.disconnect();
    setSoraConnectionStatus("disconnected");
  }
};

// デバイス一覧を取得
export const setMediaDevices = async (): Promise<void> => {
  const deviceInfos = await getDevices();
  const audioInputDevices: MediaDeviceInfo[] = [];
  const videoInputDevices: MediaDeviceInfo[] = [];
  const audioOutputDevices: MediaDeviceInfo[] = [];
  deviceInfos.forEach((deviceInfo) => {
    if (deviceInfo.deviceId === "") {
      return;
    }
    if (deviceInfo.kind === "audioinput") {
      audioInputDevices.push(deviceInfo.toJSON());
    } else if (deviceInfo.kind === "audiooutput") {
      audioOutputDevices.push(deviceInfo.toJSON());
    } else if (deviceInfo.kind === "videoinput") {
      videoInputDevices.push(deviceInfo.toJSON());
    }
  });
  setAudioInputDevices(audioInputDevices);
  setVideoInputDevices(videoInputDevices);
  setAudioOutputDevices(audioOutputDevices);
};

export const unregisterServiceWorker = async (): Promise<void> => {
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const registration of registrations) {
    await registration.unregister();
  }
};

// デバイスの変更時などに Sora との接続を維持したまま MediaStream のみ更新
export const updateMediaStream = async (): Promise<void> => {
  const state = getState();
  if (!state.soraContents.localMediaStream) {
    return;
  }
  if (state.virtualBackgroundProcessor?.isProcessing()) {
    const originalTrack = state.virtualBackgroundProcessor.getOriginalTrack();
    if (originalTrack) {
      originalTrack.stop();
      setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    }
    state.virtualBackgroundProcessor.stopProcessing();
  } else if (state.soraContents.localMediaStream) {
    state.soraContents.localMediaStream.getVideoTracks().forEach((track) => {
      track.stop();
      setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }

  if (state.noiseSuppressionProcessor?.isProcessing()) {
    const originalTrack = state.noiseSuppressionProcessor.getOriginalTrack();
    if (originalTrack) {
      originalTrack.stop();
      setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    }
    state.noiseSuppressionProcessor.stopProcessing();
  } else if (state.soraContents.localMediaStream) {
    state.soraContents.localMediaStream.getAudioTracks().forEach((track) => {
      track.stop();
      setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }
  const [mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
    setSoraErrorAlertMessage(error.toString());
    setSoraConnectionStatus("disconnected");
    throw error;
  });
  mediaStream.getTracks().forEach((track) => {
    if (!state.soraContents.sora || !state.soraContents.sora.pc) {
      return;
    }
    const sender = state.soraContents.sora.pc.getSenders().find((s) => {
      if (!s.track) {
        return false;
      }
      return s.track.kind === track.kind;
    });
    if (sender) {
      sender.replaceTrack(track);
    }
  });
  setLocalMediaStream(mediaStream);
  setFakeContentsGainNode(gainNode);
};

export const setMicDevice = async (micDevice: boolean): Promise<void> => {
  const state = getState();
  if (!state.soraContents.localMediaStream || !state.soraContents.sora) {
    setMicDeviceStore(micDevice);
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
      setSoraErrorAlertMessage(error.toString());
      throw error;
    });
    if (mediaStream.getAudioTracks().length > 0) {
      if (
        state.soraContents.sora &&
        state.soraContents.connectionStatus === "connected" &&
        state.soraContents.localMediaStream
      ) {
        // Sora 接続中の場合
        await state.soraContents.sora.replaceAudioTrack(
          state.soraContents.localMediaStream,
          mediaStream.getAudioTracks()[0],
        );
      } else if (state.soraContents.localMediaStream) {
        // Sora は未接続で media access での表示を行っている場合
        // 現在の AudioTrack を停止、削除してから、新しい AudioTrack を追加する
        state.soraContents.localMediaStream.getAudioTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
          state.soraContents.localMediaStream?.removeTrack(track);
        });
        state.soraContents.localMediaStream.addTrack(mediaStream.getAudioTracks()[0]);
      }
      setFakeContentsGainNode(gainNode);
    }
  } else if (
    state.soraContents.sora &&
    state.soraContents.connectionStatus === "connected" &&
    state.soraContents.localMediaStream
  ) {
    // Sora 接続中の場合
    stopLocalAudioTrack(state.soraContents.localMediaStream, state.noiseSuppressionProcessor);
    state.soraContents.sora.stopAudioTrack(state.soraContents.localMediaStream);
  } else if (state.soraContents.localMediaStream) {
    // Sora は未接続で media access での表示を行っている場合
    // localMediaStream の AudioTrack を停止して MediaStream から Track を削除する
    stopLocalAudioTrack(state.soraContents.localMediaStream, state.noiseSuppressionProcessor);
  }
  setMicDeviceStore(micDevice);
};

export const setCameraDevice = async (cameraDevice: boolean): Promise<void> => {
  const state = getState();
  if (
    !state.soraContents.localMediaStream &&
    !state.soraContents.sora &&
    state.soraContents.connectionStatus !== "connected"
  ) {
    setCameraDeviceStore(cameraDevice);
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
      setSoraErrorAlertMessage(error.toString());
      throw error;
    });
    if (mediaStream.getVideoTracks().length > 0) {
      if (
        state.soraContents.sora &&
        state.soraContents.connectionStatus === "connected" &&
        state.soraContents.localMediaStream
      ) {
        // Sora 接続中の場合
        state.soraContents.sora.replaceVideoTrack(
          state.soraContents.localMediaStream,
          mediaStream.getVideoTracks()[0],
        );
      } else if (state.soraContents.localMediaStream) {
        // Sora は未接続で media access での表示を行っている場合
        // 現在の VideoTrack を停止、削除してから、新しい VideoTrack を追加する
        state.soraContents.localMediaStream.getVideoTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
          state.soraContents.localMediaStream?.removeTrack(track);
        });
        state.soraContents.localMediaStream.addTrack(mediaStream.getVideoTracks()[0]);
      }
      setFakeContentsGainNode(gainNode);
    }
  } else if (
    state.soraContents.sora &&
    state.soraContents.connectionStatus === "connected" &&
    state.soraContents.localMediaStream
  ) {
    // Sora 接続中の場合
    const originalTrack = stopVideoProcessors(state.virtualBackgroundProcessor);
    await stopLocalVideoTrack(state.soraContents.localMediaStream, originalTrack);
    state.soraContents.sora.stopVideoTrack(state.soraContents.localMediaStream);
  } else if (state.soraContents.localMediaStream) {
    // Sora は未接続で media access での表示を行っている場合
    // localMediaStream の VideoTrack を停止して MediaStream から Track を削除する
    const originalTrack = stopVideoProcessors(state.virtualBackgroundProcessor);
    await stopLocalVideoTrack(state.soraContents.localMediaStream, originalTrack);
  }
  setCameraDeviceStore(cameraDevice);
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
  localMediaStream: MediaStream | null,
  originalTrack?: MediaStreamTrack,
): Promise<void> => {
  if (originalTrack !== undefined) {
    originalTrack.enabled = false;
    // track enabled = false から sleep を sleep を入れないと配信側にカメラの最後のコマが残る問題へのハック
    // safari はこれで対応できるが firefox は残ってしまう
    await new Promise((resolve) => setTimeout(resolve, 100));
    originalTrack.stop();
    localMediaStream?.removeTrack(originalTrack);
    setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
  } else {
    if (!localMediaStream) {
      return;
    }
    localMediaStream.getVideoTracks().forEach((track) => {
      track.enabled = false;
    });
    // track enabled = false から sleep を sleep を入れないと配信側にカメラの最後のコマが残る問題へのハック
    // safari はこれで対応できるが firefox は残ってしまう
    await new Promise((resolve) => setTimeout(resolve, 100));
    localMediaStream.getVideoTracks().forEach((track) => {
      track.stop();
      localMediaStream.removeTrack(track);
      setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }
};

/**
 * devtools のローカルにもっている MediaStream のうち Audio Track と
 * 映像処理を行っている MediaProcessor の停止を行う関数
 * MediaStream から Track の削除も行う
 */
const stopLocalAudioTrack = (
  localMediaStream: MediaStream | null,
  noiseSuppressionProcessor: NoiseSuppressionProcessor | null,
): void => {
  if (noiseSuppressionProcessor?.isProcessing()) {
    const originalTrack = noiseSuppressionProcessor.getOriginalTrack();
    if (originalTrack) {
      originalTrack.stop();
      localMediaStream?.removeTrack(originalTrack);
      setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    }
    noiseSuppressionProcessor.stopProcessing();
  } else if (localMediaStream) {
    localMediaStream.getAudioTracks().forEach((track) => {
      track.stop();
      localMediaStream.removeTrack(track);
      setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    });
  }
};

// Re-export store functions for backward compatibility
export {
  clearApiObjects,
  clearDataChannelMessages,
  clearRpcObjects,
  deleteAlertMessage,
  getState,
  setAPIErrorAlertMessage,
  setAPIInfoAlertMessage,
  setApiObject,
  setAspectRatio,
  setAudio,
  setAudioBitRate,
  setAudioCodecType,
  setAudioContentHint,
  setAudioInput,
  setAudioOutput,
  setAudioStreamingLanguageCode,
  setAudioTrack,
  setAutoGainControl,
  setBlurRadius,
  setBundleId,
  setChannelId,
  setClientId,
  setDataChannelSignaling,
  setDataChannels,
  setDebug,
  setDebugApiUrl,
  setDebugFilterText,
  setDebugType,
  setDisplayResolution,
  setEchoCancellation,
  setEchoCancellationType,
  setEnabledAudioStreamingLanguageCode,
  setEnabledBundleId,
  setEnabledClientId,
  setEnabledDataChannel,
  setEnabledDataChannels,
  setEnabledForwardingFilter,
  setEnabledForwardingFilters,
  setEnabledMetadata,
  setEnabledSignalingNotifyMetadata,
  setEnabledSignalingUrlCandidates,
  setEnabledVideoAV1Params,
  setEnabledVideoH264Params,
  setEnabledVideoH265Params,
  setEnabledVideoVP9Params,
  setFacingMode,
  setFakeVolume,
  setForceStereoOutput,
  setForwardingFilter,
  setForwardingFilters,
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
  setResolution,
  setRole,
  setRPCErrorAlertMessage,
  setRpcObject,
  setShowStats,
  setSignalingNotifyMetadata,
  setSignalingUrlCandidates,
  setSimulcast,
  setSimulcastRequestRid,
  setSimulcastRid,
  setSora,
  setSoraErrorAlertMessage,
  setSoraInfoAlertMessage,
  setSoraReconnecting,
  setSpotlight,
  setSpotlightFocusRid,
  setSpotlightNumber,
  setSpotlightUnfocusRid,
  setVideo,
  setVideoAV1Params,
  setVideoBitRate,
  setVideoCodecType,
  setVideoContentHint,
  setVideoH264Params,
  setVideoH265Params,
  setVideoInput,
  setVideoTrack,
  setVideoVP9Params,
  store,
} from "./store.ts";
