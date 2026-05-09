import { NoiseSuppressionProcessor } from "@shiguredo/noise-suppression";
import { VirtualBackgroundProcessor } from "@shiguredo/virtual-background";
import type { ConnectionPublisher, ConnectionSubscriber, TransportType } from "sora-js-sdk";
import Sora from "sora-js-sdk";

import type {
  ConnectionOptionsState,
  Json,
  QueryStringParameters,
  RTCIceLocalCandidateStats,
  SignalingMessage,
  SoraDevtoolsState,
  SoraNotifyMessage,
  SoraPushMessage,
  TimelineMessage,
} from "./../types.ts";
import {
  copyToClipboard,
  createAudioConstraints,
  createConnectOptions,
  createFakeMediaConstraints,
  createFakeMediaStream,
  createGetDisplayMediaAudioConstraints,
  createGetDisplayMediaVideoConstraints,
  createSignalingURL,
  createVideoConstraints,
  getBlurRadiusNumber,
  getDevices,
  getMediaStreamTrackProperties,
  parseMetadata,
  parseQueryString,
} from "./../utils.ts";
import { loadUrlEntries } from "./../opfs.ts";
import * as signals from "./signals.ts";

// クエリストリングのパラメータを各 signal に設定する
function applyAudioParameters(qsParams: Partial<QueryStringParameters>): void {
  if (qsParams.audio !== undefined) {
    signals.setAudio(qsParams.audio);
  }
  if (qsParams.audioBitRate !== undefined) {
    signals.setAudioBitRate(qsParams.audioBitRate);
  }
  if (qsParams.audioCodecType !== undefined) {
    signals.setAudioCodecType(qsParams.audioCodecType);
  }
  if (qsParams.autoGainControl !== undefined) {
    signals.setAutoGainControl(qsParams.autoGainControl);
  }
  if (qsParams.noiseSuppression !== undefined) {
    signals.setNoiseSuppression(qsParams.noiseSuppression);
  }
  if (qsParams.echoCancellation !== undefined) {
    signals.setEchoCancellation(qsParams.echoCancellation);
  }
  if (qsParams.echoCancellationType !== undefined) {
    signals.setEchoCancellationType(qsParams.echoCancellationType);
  }
  if (qsParams.audioContentHint !== undefined) {
    signals.setAudioContentHint(qsParams.audioContentHint);
  }
  if (qsParams.audioTrack !== undefined) {
    signals.setAudioTrack(qsParams.audioTrack);
  }
  if (qsParams.audioStreamingLanguageCode !== undefined) {
    signals.setAudioStreamingLanguageCode(qsParams.audioStreamingLanguageCode);
  }
  if (qsParams.forceStereoOutput !== undefined) {
    signals.setForceStereoOutput(qsParams.forceStereoOutput);
  }
}

// クエリストリングの映像関連パラメータを各 signal に設定する
function applyVideoParameters(qsParams: Partial<QueryStringParameters>): void {
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
  if (qsParams.videoContentHint !== undefined) {
    signals.setVideoContentHint(qsParams.videoContentHint);
  }
  if (qsParams.videoTrack !== undefined) {
    signals.setVideoTrack(qsParams.videoTrack);
  }
  if (qsParams.resolution !== undefined) {
    signals.setResolution(qsParams.resolution);
  }
  if (qsParams.frameRate !== undefined) {
    signals.setFrameRate(qsParams.frameRate);
  }
  if (qsParams.aspectRatio !== undefined) {
    signals.setAspectRatio(qsParams.aspectRatio);
  }
  if (qsParams.resizeMode !== undefined) {
    signals.setResizeMode(qsParams.resizeMode);
  }
  if (qsParams.facingMode !== undefined) {
    signals.setFacingMode(qsParams.facingMode);
  }
  if (qsParams.blurRadius !== undefined) {
    signals.setBlurRadius(qsParams.blurRadius);
  }
}

// クエリストリングのシグナリング関連パラメータを各 signal に設定する
function applySignalingParameters(qsParams: Partial<QueryStringParameters>): void {
  if (qsParams.channelId !== undefined) {
    signals.setChannelId(qsParams.channelId);
  }
  if (qsParams.role !== undefined) {
    signals.setRole(qsParams.role);
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
  if (qsParams.forwardingFilters !== undefined) {
    signals.setForwardingFilters(qsParams.forwardingFilters);
  }
  if (qsParams.dataChannelSignaling !== undefined) {
    signals.setDataChannelSignaling(qsParams.dataChannelSignaling);
  }
  if (qsParams.ignoreDisconnectWebSocket !== undefined) {
    signals.setIgnoreDisconnectWebSocket(qsParams.ignoreDisconnectWebSocket);
  }
  if (qsParams.dataChannels !== undefined) {
    signals.setDataChannels(qsParams.dataChannels);
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
  if (qsParams.reconnect !== undefined) {
    signals.setReconnect(qsParams.reconnect);
  }
}

// クエリストリングのメディア・デバイス関連パラメータを各 signal に設定する
function applyMediaAndDeviceParameters(
  qsParams: Partial<QueryStringParameters>,
  deviceInfos: MediaDeviceInfo[],
): void {
  if (qsParams.mediaType !== undefined) {
    signals.setMediaType(qsParams.mediaType);
  }
  if (qsParams.mediaStats !== undefined) {
    signals.setMediaStats(qsParams.mediaStats);
  }
  if (qsParams.micDevice !== undefined) {
    signals.setMicDevice(qsParams.micDevice);
  }
  if (qsParams.cameraDevice !== undefined) {
    signals.setCameraDevice(qsParams.cameraDevice);
  }
  if (qsParams.displayResolution !== undefined) {
    signals.setDisplayResolution(qsParams.displayResolution);
  }
  if (qsParams.mediaProcessorsNoiseSuppression !== undefined) {
    signals.setMediaProcessorsNoiseSuppression(qsParams.mediaProcessorsNoiseSuppression);
  }
  if (qsParams.fakeVolume !== undefined) {
    signals.setFakeVolume(qsParams.fakeVolume);
  }
  if (qsParams.fakeVideoShowChannelId !== undefined) {
    signals.setFakeVideoShowChannelId(qsParams.fakeVideoShowChannelId);
  }
  // 存在しない Device の場合はセットしない
  const audioInputDevice = deviceInfos.find(
    (d) => d.kind === "audioinput" && d.deviceId === qsParams.audioInput,
  );
  if (audioInputDevice !== undefined) {
    signals.setAudioInput(audioInputDevice.deviceId);
  }
  const audioOutputDevice = deviceInfos.find(
    (d) => d.kind === "audiooutput" && d.deviceId === qsParams.audioOutput,
  );
  if (audioOutputDevice !== undefined) {
    signals.setAudioOutput(audioOutputDevice.deviceId);
  }
  const videoInputDevice = deviceInfos.find(
    (d) => d.kind === "videoinput" && d.deviceId === qsParams.videoInput,
  );
  if (videoInputDevice !== undefined) {
    signals.setVideoInput(videoInputDevice.deviceId);
  }
}

// クエリストリングのデバッグ・その他パラメータを各 signal に設定する
function applyMiscParameters(qsParams: Partial<QueryStringParameters>): void {
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
  if (qsParams.showStats !== undefined) {
    signals.setShowStats(qsParams.showStats);
  }
  if (qsParams.googCpuOveruseDetection !== undefined && qsParams.googCpuOveruseDetection !== null) {
    signals.setGoogCpuOveruseDetection(qsParams.googCpuOveruseDetection);
  }
  if (qsParams.apiUrl !== undefined && qsParams.apiUrl !== null) {
    signals.setApiUrl(qsParams.apiUrl);
  }
}

// シグナリング URL 候補を設定する（クエリストリングまたは OPFS から）
async function applySignalingUrlCandidates(
  qsParams: Partial<QueryStringParameters>,
): Promise<void> {
  if (qsParams.signalingUrlCandidates !== undefined) {
    signals.setSignalingUrlCandidates(qsParams.signalingUrlCandidates);
  } else {
    // query string に signalingUrlCandidates がない場合は OPFS から読み込む
    const urlEntries = await loadUrlEntries();
    const enabledUrls = urlEntries.filter((entry) => entry.enabled).map((entry) => entry.url);
    if (enabledUrls.length > 0) {
      signals.setSignalingUrlCandidates(enabledUrls);
    }
  }
}

// maxNotifyMessages を URL パラメータから設定する
function applyMaxNotifyMessagesParameter(): void {
  const maxNotifyMessagesParam = new URLSearchParams(location.search).get("maxNotifyMessages");
  if (maxNotifyMessagesParam !== null) {
    const maxValue = Number(maxNotifyMessagesParam);
    if (!Number.isNaN(maxValue) && maxValue > 0) {
      signals.setMaxNotifyMessages(maxValue);
    }
  }
}

// 値が存在するパラメータに対応する enabled フラグを有効にする
function activateEnabledFlags(): void {
  if (signals.bundleId.value !== "") {
    signals.setEnabledBundleId(true);
  }
  if (signals.clientId.value !== "") {
    signals.setEnabledClientId(true);
  }
  if (signals.metadata.value !== "") {
    signals.setEnabledMetadata(true);
  }
  if (signals.signalingNotifyMetadata.value !== "") {
    signals.setEnabledSignalingNotifyMetadata(true);
  }
  if (signals.signalingUrlCandidates.value.length > 0) {
    signals.setEnabledSignalingUrlCandidates(true);
  }
  if (signals.forwardingFilters.value !== "") {
    signals.setEnabledForwardingFilters(true);
  }
  if (signals.dataChannelSignaling.value !== "" || signals.ignoreDisconnectWebSocket.value !== "") {
    signals.setEnabledDataChannel(true);
  }
  if (signals.dataChannels.value !== "") {
    signals.setEnabledDataChannels(true);
  }
  if (signals.audioStreamingLanguageCode.value !== "") {
    signals.setEnabledAudioStreamingLanguageCode(true);
  }
  if (signals.videoVP9Params.value !== "") {
    signals.setEnabledVideoVP9Params(true);
  }
  if (signals.videoH264Params.value !== "") {
    signals.setEnabledVideoH264Params(true);
  }
  if (signals.videoH265Params.value !== "") {
    signals.setEnabledVideoH265Params(true);
  }
  if (signals.videoAV1Params.value !== "") {
    signals.setEnabledVideoAV1Params(true);
  }
}

// ページ初期化処理
export const setInitialParameter = async (): Promise<void> => {
  signals.resetState();

  const qsParams = parseQueryString(new URLSearchParams(location.search));
  const deviceInfos = await getDevices();

  applyAudioParameters(qsParams);
  applyVideoParameters(qsParams);
  applySignalingParameters(qsParams);
  applyMediaAndDeviceParameters(qsParams, deviceInfos);
  applyMiscParameters(qsParams);
  await applySignalingUrlCandidates(qsParams);
  applyMaxNotifyMessagesParameter();

  signals.setInitialFakeContents();
  activateEnabledFlags();
  signals.setSoraConnectionStatus("disconnected");
};

// 空文字列でなければ値を返し、空文字列であれば undefined を返す
function nonEmptyOrUndefined<T>(value: T): T | undefined {
  if (value === "") {
    return undefined;
  }
  return value;
}

// 送信側のビットレート・コーデックの URL パラメータを構築する
function buildBitrateCodecUrlParameters(
  appendAudioVideoParams: boolean,
): Partial<QueryStringParameters> {
  return {
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
    audioStreamingLanguageCode:
      appendAudioVideoParams &&
      signals.audioStreamingLanguageCode.value !== "" &&
      signals.enabledAudioStreamingLanguageCode.value
        ? signals.audioStreamingLanguageCode.value
        : undefined,
  };
}

// 送信側のコーデックパラメータ (VP9/H264/H265/AV1) の URL パラメータを構築する
function buildVideoCodecParamsUrlParameters(
  appendAudioVideoParams: boolean,
): Partial<QueryStringParameters> {
  return {
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
  };
}

// 音声・映像の制約関連の URL パラメータを構築する
function buildMediaConstraintUrlParameters(): Partial<QueryStringParameters> {
  return {
    audioContentHint: nonEmptyOrUndefined(signals.audioContentHint.value),
    autoGainControl: nonEmptyOrUndefined(signals.autoGainControl.value),
    noiseSuppression: nonEmptyOrUndefined(signals.noiseSuppression.value),
    echoCancellation: nonEmptyOrUndefined(signals.echoCancellation.value),
    echoCancellationType: nonEmptyOrUndefined(signals.echoCancellationType.value),
    videoContentHint: nonEmptyOrUndefined(signals.videoContentHint.value),
    resolution: nonEmptyOrUndefined(signals.resolution.value),
    facingMode: nonEmptyOrUndefined(signals.facingMode.value),
    frameRate: nonEmptyOrUndefined(signals.frameRate.value),
    aspectRatio: nonEmptyOrUndefined(signals.aspectRatio.value),
    resizeMode: nonEmptyOrUndefined(signals.resizeMode.value),
    blurRadius: nonEmptyOrUndefined(signals.blurRadius.value),
  };
}

// サイマルキャスト・スポットライト関連の URL パラメータを構築する
function buildSimulcastSpotlightUrlParameters(): Partial<QueryStringParameters> {
  return {
    simulcast: nonEmptyOrUndefined(signals.simulcast.value),
    simulcastRid: nonEmptyOrUndefined(signals.simulcastRid.value),
    simulcastRequestRid: nonEmptyOrUndefined(signals.simulcastRequestRid.value),
    spotlight: nonEmptyOrUndefined(signals.spotlight.value),
    spotlightNumber: nonEmptyOrUndefined(signals.spotlightNumber.value),
    spotlightFocusRid: nonEmptyOrUndefined(signals.spotlightFocusRid.value),
    spotlightUnfocusRid: nonEmptyOrUndefined(signals.spotlightUnfocusRid.value),
  };
}

// シグナリング接続の URL パラメータを構築する
function buildConnectionUrlParameters(): Partial<QueryStringParameters> {
  return {
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
    signalingUrlCandidates:
      signals.signalingUrlCandidates.value.length > 0 && signals.enabledSignalingUrlCandidates.value
        ? signals.signalingUrlCandidates.value
        : undefined,
    apiUrl: signals.apiUrl.value ?? undefined,
  };
}

// デバイス・メディアタイプの URL パラメータを構築する
function buildDeviceUrlParameters(): Partial<QueryStringParameters> {
  return {
    audioInput:
      signals.mediaType.value === "getUserMedia" && signals.audioInput.value !== ""
        ? signals.audioInput.value
        : undefined,
    audioOutput: nonEmptyOrUndefined(signals.audioOutput.value),
    videoInput:
      signals.mediaType.value === "getUserMedia" && signals.videoInput.value !== ""
        ? signals.videoInput.value
        : undefined,
    displayResolution: nonEmptyOrUndefined(signals.displayResolution.value),
    fakeVolume: signals.mediaType.value === "fakeMedia" ? signals.fakeVolume.value : undefined,
    fakeVideoShowChannelId:
      signals.mediaType.value === "fakeMedia" && !signals.fakeVideoShowChannelId.value
        ? false
        : undefined,
  };
}

// パラメータオブジェクトからクエリストリングの配列を構築する
function buildQueryStrings(parameters: Partial<QueryStringParameters>): string[] {
  return Object.keys(parameters).flatMap((key) => {
    const value = (parameters as Record<string, unknown>)[key];
    if (value === undefined) {
      return [];
    }
    // signalingUrlCandidates は Array なので JSON.stringify する
    if (key === "signalingUrlCandidates") {
      return [`${key}=${encodeURIComponent(JSON.stringify(value))}`];
    }
    return [`${key}=${encodeURIComponent(value as string)}`];
  });
}

// URL をクリップボードにコピーする。成功時 true、失敗時 false を返す
export const copyURL = async (): Promise<boolean> => {
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
    ...buildBitrateCodecUrlParameters(appendAudioVideoParams),
    ...buildVideoCodecParamsUrlParameters(appendAudioVideoParams),
    forceStereoOutput: appendReceiverParams && signals.forceStereoOutput.value ? true : undefined,
    ...buildMediaConstraintUrlParameters(),
    ...buildSimulcastSpotlightUrlParameters(),
    ...buildDeviceUrlParameters(),
    // URL の長さ短縮のため true 以外は query string に含めない
    mediaStats: signals.mediaStats.value ? true : undefined,
    ...buildConnectionUrlParameters(),
    // URL の長さ短縮のため true 以外は query string に含めない
    reconnect: signals.reconnect.value ? true : undefined,
    mediaProcessorsNoiseSuppression: signals.mediaProcessorsNoiseSuppression.value
      ? true
      : undefined,
    // URL の長さ短縮のため false 以外は query string に含めない
    micDevice: !signals.micDevice.value ? false : undefined,
    cameraDevice: !signals.cameraDevice.value ? false : undefined,
    audioTrack: !signals.audioTrack.value ? false : undefined,
    videoTrack: !signals.videoTrack.value ? false : undefined,
    // mute
    mute: signals.mute.value ? true : undefined,
  };
  const queryStrings = buildQueryStrings(parameters);
  const success = await copyToClipboard(
    `${location.origin}${location.pathname}?${queryStrings.join("&")}`,
  );
  if (!success) {
    signals.setAPIErrorAlertMessage("failed to copy URL to clipboard");
    return false;
  }
  globalThis.history.replaceState(null, "", `${location.pathname}?${queryStrings.join("&")}`);
  return true;
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

// MediaStream のトラックに contentHint と enabled を設定する
function applyTrackSettings(mediaStream: MediaStream, state: createMediaStreamPickedState): void {
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
}

// getDisplayMedia を使用して MediaStream を生成する
async function createDisplayMediaStream(
  state: createMediaStreamPickedState,
): Promise<[MediaStream, null, null]> {
  const LOG_TITLE = "MEDIA_CONSTRAINTS";
  // cameraDevice はカメラ利用フラグなので getDisplayMedia とは無関係。video のみで判定する
  if (!state.video) {
    return [new MediaStream(), null, null];
  }
  if (navigator.mediaDevices === undefined) {
    throw new Error("failed to call getUserMedia, make sure domain is secure");
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
  return [stream, null, null];
}

// フェイクメディアを使用して MediaStream を生成する
function createFakeMediaStreamFromState(
  state: createMediaStreamPickedState,
): [MediaStream, GainNode | null, AudioContext | null] {
  const LOG_TITLE = "MEDIA_CONSTRAINTS";
  const { worker } = state.fakeContents;
  if (!worker) {
    return [new MediaStream(), null, null];
  }
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
  // Chrome のハードウェアコンテキスト上限に到達しないよう、新規生成前に旧 AudioContext を close する
  // close は非同期だが Chrome は即座に上限から解放する
  signals.closeFakeContentsAudio();
  const { offscreenCanvas, mediaStream, gainNode, audioContext, frameRate } =
    createFakeMediaStream(constraints);
  if (offscreenCanvas !== null) {
    // 現在の Worker を停止
    worker.postMessage({ type: "stop" });
    // Worker に OffscreenCanvas を転送して描画を開始
    worker.postMessage(
      {
        type: "init",
        data: {
          canvas: offscreenCanvas,
          frameRate,
          channelId: signals.channelId.value,
          showChannelId: signals.fakeVideoShowChannelId.value,
        },
      },
      [offscreenCanvas],
    );
  }
  applyTrackSettings(mediaStream, state);
  for (const track of mediaStream.getVideoTracks()) {
    signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", track));
  }
  for (const track of mediaStream.getAudioTracks()) {
    signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", track));
  }
  signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-create-fake-media"));
  return [mediaStream, gainNode, audioContext];
}

// getUserMedia を使用して MediaStream を生成する
async function createUserMediaStream(
  state: createMediaStreamPickedState,
): Promise<[MediaStream, null, null]> {
  const LOG_TITLE = "MEDIA_CONSTRAINTS";
  if (navigator.mediaDevices === undefined) {
    throw new Error("failed to call getUserMedia, make sure domain is secure");
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
        for (const track of mediaStream.getTracks()) {
          track.stop();
        }
        throw error;
      });
    if (audioConstraints) {
      let [audioTrack] = gumMediaStream.getAudioTracks();
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", audioTrack));
      if (state.mediaProcessorsNoiseSuppression && NoiseSuppressionProcessor.isSupported()) {
        if (state.noiseSuppressionProcessor === null) {
          throw new Error("failed to start NoiseSuppressionProcessor, processor is null");
        }
        state.noiseSuppressionProcessor.stopProcessing();
        audioTrack = await state.noiseSuppressionProcessor.startProcessing(audioTrack);
      }
      signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-audio-get-user-media"));
      mediaStream.addTrack(audioTrack);
    }
    if (videoConstraints) {
      let [videoTrack] = gumMediaStream.getVideoTracks();
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", videoTrack));
      if (state.blurRadius !== "" && VirtualBackgroundProcessor.isSupported()) {
        if (state.virtualBackgroundProcessor === null) {
          throw new Error("failed to start VirtualBackgroundProcessor, processor is null");
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
  applyTrackSettings(mediaStream, state);
  return [mediaStream, null, null];
}

// State に応じて MediaStream インスタンスを生成する
async function createMediaStream(
  state: createMediaStreamPickedState,
): Promise<[MediaStream, GainNode | null, AudioContext | null]> {
  if (state.mediaType === "getDisplayMedia") {
    return createDisplayMediaStream(state);
  }
  if (state.mediaType === "fakeMedia" && state.fakeContents.worker) {
    return createFakeMediaStreamFromState(state);
  }
  if (state.mediaType === "mp4Media") {
    if (state.mp4MediaStream === null) {
      throw new Error("no MP4 file has been selected");
    }
    // 指定の MP4 を再生するための MediaStream を返す
    // DevTools ではいったん常に繰り返し再生にしておく
    return [await state.mp4MediaStream.play({ repeat: true }), null, null];
  }
  return createUserMediaStream(state);
}

// スポットライトイベントを処理する
function handleSpotlightEvent(message: SoraNotifyMessage): void {
  if (message.event_type === "spotlight.focused" && typeof message.connection_id === "string") {
    signals.setFocusedSpotlightConnectionId(message.connection_id);
  }
  if (message.event_type === "spotlight.unfocused" && typeof message.connection_id === "string") {
    signals.setUnFocusedSpotlightConnectionId(message.connection_id);
  }
  if (message.event_type === "connection.destroyed" && typeof message.connection_id === "string") {
    signals.deleteFocusedSpotlightConnectionId(message.connection_id);
  }
}

// connection.created の notify を処理する
function handleConnectionCreatedNotify(message: SoraNotifyMessage): void {
  if (message.event_type !== "connection.created" || typeof message.connection_id !== "string") {
    return;
  }
  const soraValue = signals.sora.value;
  // notify の connection_id と offer で受け取った自身の connection id が一致する場合
  if (message.connection_id === soraValue?.connectionId) {
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
  } else if (typeof message.client_id === "string") {
    // 自身以外の notify
    signals.setSoraRemoteClientId({
      connectionId: message.connection_id,
      clientId: message.client_id,
    });
  }
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
    handleSpotlightEvent(message);
    handleConnectionCreatedNotify(message);
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
      try {
        // ローカルの MediaStream の Track と MediaProcessor を止める
        await stopLocalVideoTrack(localMediaStreamValue, originalTrack);
      } catch (error) {
        signals.setLogMessages({
          title: "STOP_LOCAL_VIDEO_TRACK",
          description: error instanceof Error ? error.message : String(error),
        });
      }
    })();
    stopLocalAudioTrack(localMediaStreamValue, noiseSuppressionProcessorValue);
    for (const client of remoteClientsValue) {
      for (const track of client.mediaStream.getTracks()) {
        track.stop();
      }
    }
    if (fakeContentsValue.worker) {
      fakeContentsValue.worker.postMessage({ type: "stop" });
    }
    // fakeMedia 利用時の AudioContext を close する
    signals.closeFakeContentsAudio();
    // statsReport タイマーを即時停止する。setSora(null) による次回 tick 自滅を待たない
    stopStatsReportTimer();
    signals.setSora(null);
    signals.setSoraSessionId(null);
    signals.setSoraConnectionId(null);
    signals.setSoraClientId(null);
    signals.setSoraTurnUrl(null);
    signals.setSoraConnectionStatus("disconnected");
    signals.setLocalMediaStream(null);
    signals.removeAllRemoteClients();
    signals.setSoraInfoAlertMessage("disconnected Sora");
    signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("disconnected"));
    if (event.type === "abend" && reconnectValue) {
      // 再接続処理開始フラグ
      signals.setSoraReconnecting(true);
    }
  });
  soraConnection.on("timeline", (event) => {
    const message: TimelineMessage = {
      timestamp: Date.now(),
      type: event.type,
      data: event.data as Record<string, unknown> | undefined,
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
    const message: SignalingMessage = {
      timestamp: Date.now(),
      transportType: event.transportType,
      type: event.type,
      data: event.data as Record<string, unknown> | undefined,
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
    data: data as Record<string, unknown> | undefined,
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
      const localCandidate = s;
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
  let audioContext: undefined | AudioContext | null;
  try {
    [mediaStream, gainNode, audioContext] = await createMediaStream(state).catch((error) => {
      throw error;
    });
  } catch (error) {
    if (error instanceof Error) {
      signals.setLogMessages({
        title: LOG_TITLE,
        description: JSON.stringify(error.message),
      });
      signals.setAPIErrorAlertMessage(`failed to get user devices: ${error.message}`);
    }
    cleanupMediaStreamOnError(state, mediaStream);
    throw error;
  }
  signals.setFakeContentsAudio(audioContext, gainNode);
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
    for (const track of localMediaStreamValue.getVideoTracks()) {
      track.stop();
      localMediaStreamValue.removeTrack(track);
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    }
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
    for (const track of localMediaStreamValue.getAudioTracks()) {
      track.stop();
      localMediaStreamValue.removeTrack(track);
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    }
  }
  if (fakeContentsValue.worker) {
    fakeContentsValue.worker.postMessage({ type: "stop" });
  }
  // fakeMedia 利用時の AudioContext を close する
  signals.closeFakeContentsAudio();
  signals.setLocalMediaStream(null);
};

// Sora 接続オブジェクトを role に応じて生成し、共通の設定を行う
function createSoraConnectionByRole(
  connection: ReturnType<typeof Sora.connection>,
  roleValue: string,
  channelIdValue: string,
  connectionOptions: ReturnType<typeof createConnectOptions>,
  metadata: ReturnType<typeof parseMetadata>,
  googCpuOveruseDetectionValue: boolean | null,
): ConnectionPublisher | ConnectionSubscriber {
  let soraConnection: ConnectionPublisher | ConnectionSubscriber;
  if (roleValue === "sendonly") {
    soraConnection = connection.sendonly(channelIdValue, null, connectionOptions);
  } else if (roleValue === "sendrecv") {
    soraConnection = connection.sendrecv(channelIdValue, null, connectionOptions);
  } else {
    soraConnection = connection.recvonly(channelIdValue, null, connectionOptions);
  }
  soraConnection.metadata = metadata;
  // Chrome 独自のオプションを使用して CPU の負荷が高い場合に解像度を下げる処理の設定を入れる
  if (
    (roleValue === "sendonly" || roleValue === "sendrecv") &&
    typeof googCpuOveruseDetectionValue === "boolean"
  ) {
    soraConnection.constraints = {
      optional: [{ googCpuOveruseDetection: googCpuOveruseDetectionValue }],
    };
  }
  setSoraCallbacks(soraConnection);
  return soraConnection;
}

// Sora 接続のシグナリング URL を準備してログに出力する
function prepareSignalingConnection(): {
  connection: ReturnType<typeof Sora.connection>;
  connectionOptions: ReturnType<typeof createConnectOptions>;
  metadata: ReturnType<typeof parseMetadata>;
} {
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
  return { connection, connectionOptions, metadata };
}

// MediaStream 生成エラー時にプロセッサとトラックを停止する
function cleanupMediaStreamOnError(
  state: createMediaStreamPickedState,
  mediaStream: MediaStream | undefined,
): void {
  let originalTrack: MediaStreamVideoTrack | undefined;
  if (state.virtualBackgroundProcessor?.isProcessing()) {
    originalTrack ??= state.virtualBackgroundProcessor.getOriginalTrack();
    state.virtualBackgroundProcessor.stopProcessing();
  }
  if (originalTrack) {
    originalTrack.stop();
    signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
  } else if (mediaStream) {
    for (const track of mediaStream.getVideoTracks()) {
      track.stop();
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    }
  }

  if (state.noiseSuppressionProcessor?.isProcessing()) {
    const originalAudioTrack = state.noiseSuppressionProcessor.getOriginalTrack();
    if (originalAudioTrack) {
      originalAudioTrack.stop();
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalAudioTrack));
    }
    state.noiseSuppressionProcessor.stopProcessing();
  } else if (mediaStream) {
    for (const track of mediaStream.getAudioTracks()) {
      track.stop();
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    }
  }
}

// statsReport の定期更新タイマー
// setInterval ではなく setTimeout チェーンにすることで getStats の完了を待ってから
// 次回をスケジュールする。setInterval だと getStats が長時間かかった際に並行呼び出しが蓄積する
let statsReportTimerId: ReturnType<typeof setTimeout> | null = null;

function stopStatsReportTimer(): void {
  if (statsReportTimerId !== null) {
    clearTimeout(statsReportTimerId);
    statsReportTimerId = null;
  }
}

function startStatsReportTimer(): void {
  // 既存タイマーがあれば停止してから起動する。再接続のたびにタイマーが増殖するのを防ぐ
  stopStatsReportTimer();
  const schedule = async (): Promise<void> => {
    const soraValue = signals.sora.value;
    if (!soraValue) {
      statsReportTimerId = null;
      return;
    }
    try {
      await setStatsReportInternal(soraValue);
    } catch {
      // getStats のエラーはタイマーを停止させない
    }
    if (signals.sora.value !== null) {
      statsReportTimerId = setTimeout(() => {
        void schedule();
      }, 1000);
    } else {
      statsReportTimerId = null;
    }
  };
  void schedule();
}

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
  const { connection, connectionOptions, metadata } = prepareSignalingConnection();
  let soraConnection: undefined | ConnectionPublisher | ConnectionSubscriber;
  let mediaStream: undefined | MediaStream;
  let gainNode: undefined | GainNode | null;
  let audioContext: undefined | AudioContext | null;
  const roleValue = signals.role.value;
  const channelIdValue = signals.channelId.value;
  const googCpuOveruseDetectionValue = signals.googCpuOveruseDetection.value;
  const localMediaStreamValue = signals.localMediaStream.value;
  try {
    soraConnection = createSoraConnectionByRole(
      connection,
      roleValue,
      channelIdValue,
      connectionOptions,
      metadata,
      googCpuOveruseDetectionValue,
    );
    if (roleValue === "sendonly" || roleValue === "sendrecv") {
      if (!forceCreateMediaStream && localMediaStreamValue) {
        mediaStream = localMediaStreamValue;
      } else {
        [mediaStream, gainNode, audioContext] = await createMediaStream(state).catch((error) => {
          signals.setSoraErrorAlertMessage(error.toString());
          signals.setSoraConnectionStatus("disconnected");
          throw error;
        });
      }
      signals.setSoraConnectionStatus("connecting");
      // 先に setSora で state を参照できるようにしておかないと connection.created の notify が来た時に処理に困るため
      signals.setSora(soraConnection);
      await (soraConnection as ConnectionPublisher).connect(mediaStream);
    } else {
      signals.setSoraConnectionStatus("connecting");
      // 先に setSora で state を参照できるようにしておかないと connection.created の notify が来た時に処理に困るため
      signals.setSora(soraConnection);
      await (soraConnection as ConnectionSubscriber).connect();
    }
  } catch (error) {
    // 先に setSora で state を参照できるようにした state の参照を削除
    signals.setSora(null);
    if (error instanceof Error) {
      signals.setSoraErrorAlertMessage(`failed to connect Sora: ${error.message}`);
    }
    cleanupMediaStreamOnError(state, mediaStream);
    signals.setSoraConnectionStatus("disconnected");
    throw error;
  }
  if (soraConnection === undefined) {
    throw new Error("failed to connect Sora, connection object is undefined");
  }
  signals.setSoraInfoAlertMessage("succeeded to connect Sora");
  await setStatsReportInternal(soraConnection);
  startStatsReportTimer();
  // disconnect 時に stream を止めないためのハック
  soraConnection.stream = null;
  if (mediaStream && (localMediaStreamValue === null || forceCreateMediaStream)) {
    signals.setLocalMediaStream(mediaStream);
  }
  if (audioContext !== undefined) {
    signals.setFakeContentsAudio(audioContext, gainNode ?? null);
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
  const { connection, connectionOptions, metadata } = prepareSignalingConnection();
  let soraConnection: undefined | ConnectionPublisher | ConnectionSubscriber;
  let mediaStream: undefined | MediaStream;
  let gainNode: undefined | GainNode | null;
  let audioContext: undefined | AudioContext | null;
  const roleValue = signals.role.value;
  const channelIdValue = signals.channelId.value;
  const googCpuOveruseDetectionValue = signals.googCpuOveruseDetection.value;
  if (roleValue === "sendonly" || roleValue === "sendrecv") {
    try {
      [mediaStream, gainNode, audioContext] = await createMediaStream(state);
    } catch (error) {
      // createMediaStream の失敗時は再接続を中止し disconnected 状態に戻す
      if (error instanceof Error) {
        signals.setSoraErrorAlertMessage(error.toString());
      }
      signals.setSoraConnectionStatus("disconnected");
      signals.setSoraReconnecting(false);
      return;
    }
  }
  for (let i = 1; i <= 10; i++) {
    const reconnectingValue = signals.reconnecting.value;
    if (!reconnectingValue) {
      break;
    }
    signals.setSoraReconnectingTrials(i);
    try {
      soraConnection = createSoraConnectionByRole(
        connection,
        roleValue,
        channelIdValue,
        connectionOptions,
        metadata,
        googCpuOveruseDetectionValue,
      );
      if (roleValue === "sendonly" || roleValue === "sendrecv") {
        if (mediaStream) {
          await (soraConnection as ConnectionPublisher).connect(mediaStream);
        }
      } else {
        await (soraConnection as ConnectionSubscriber).connect();
      }
    } catch (error) {
      if (error instanceof Error) {
        signals.setSoraErrorAlertMessage(`(trials ${i}) failed to connect Sora: ${error.message}`);
      }
      soraConnection = undefined;
    }
    if (soraConnection !== undefined) {
      break;
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, i * 500 + 500);
    });
  }
  if (soraConnection === undefined) {
    signals.setSoraErrorAlertMessage("failed to reconnect Sora");
    signals.setSoraConnectionStatus("disconnected");
    signals.setSoraReconnecting(false);
    return;
  }
  signals.setSoraInfoAlertMessage("succeeded to reconnect Sora");
  await setStatsReportInternal(soraConnection);
  startStatsReportTimer();
  signals.setSora(soraConnection);
  if (mediaStream) {
    signals.setLocalMediaStream(mediaStream);
  }
  if (audioContext !== undefined) {
    signals.setFakeContentsAudio(audioContext, gainNode ?? null);
  }
  signals.setSoraConnectionStatus("connected");
  signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("connected"));
  signals.setSoraReconnecting(false);
};

// Sora との切断処理
export const disconnectSora = async (): Promise<void> => {
  const soraValue = signals.sora.value;
  const connectionStatusValue = signals.connectionStatus.value;
  // 既に切断済みの場合は何もしない
  if (connectionStatusValue === "disconnected") {
    return;
  }
  // statsReport タイマーは状態に関わらず即時停止する
  stopStatsReportTimer();
  if (
    soraValue &&
    (connectionStatusValue === "connected" ||
      connectionStatusValue === "connecting" ||
      connectionStatusValue === "preparing")
  ) {
    signals.setSoraConnectionStatus("disconnecting");
    await soraValue.disconnect();
  }
  // soraValue が存在しない / 切断できない状態でもクリーンアップして UI を再有効化する
  signals.setSoraConnectionStatus("disconnected");
  signals.setSoraReconnecting(false);
};

// デバイス一覧を取得
export const setMediaDevices = async (): Promise<void> => {
  const deviceInfos = await getDevices();
  const audioInputDevicesData: MediaDeviceInfo[] = [];
  const videoInputDevicesData: MediaDeviceInfo[] = [];
  const audioOutputDevicesData: MediaDeviceInfo[] = [];
  for (const deviceInfo of deviceInfos) {
    if (deviceInfo.deviceId === "") {
      continue;
    }
    if (deviceInfo.kind === "audioinput") {
      audioInputDevicesData.push(deviceInfo.toJSON());
    } else if (deviceInfo.kind === "audiooutput") {
      audioOutputDevicesData.push(deviceInfo.toJSON());
    } else if (deviceInfo.kind === "videoinput") {
      videoInputDevicesData.push(deviceInfo.toJSON());
    }
  }
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
    for (const track of localMediaStreamValue.getVideoTracks()) {
      track.stop();
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    }
  }

  if (noiseSuppressionProcessorValue?.isProcessing()) {
    const originalTrack = noiseSuppressionProcessorValue.getOriginalTrack();
    if (originalTrack) {
      originalTrack.stop();
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
    }
    noiseSuppressionProcessorValue.stopProcessing();
  } else if (localMediaStreamValue) {
    for (const track of localMediaStreamValue.getAudioTracks()) {
      track.stop();
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    }
  }
  const [mediaStream, gainNode, audioContext] = await createMediaStream(state).catch((error) => {
    signals.setSoraErrorAlertMessage(error.toString());
    signals.setSoraConnectionStatus("disconnected");
    throw error;
  });
  // 全トラックの replaceTrack を Promise.allSettled で並列実行し、失敗をまとめて通知する
  const replaceResults = await Promise.allSettled(
    mediaStream.getTracks().map(async (track) => {
      if (!soraValue?.pc) {
        return;
      }
      const sender = soraValue.pc.getSenders().find((s) => {
        if (!s.track) {
          return false;
        }
        return s.track.kind === track.kind;
      });
      if (sender) {
        await sender.replaceTrack(track);
      }
    }),
  );
  const failures = replaceResults.filter((result) => result.status === "rejected");
  if (failures.length > 0) {
    signals.setSoraErrorAlertMessage(
      `failed to replace ${failures.length} track(s) of ${replaceResults.length}`,
    );
  }
  signals.setLocalMediaStream(mediaStream);
  signals.setFakeContentsAudio(audioContext, gainNode);
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
    const [mediaStream, gainNode, audioContext] = await createMediaStream(pickedState).catch(
      (error) => {
        signals.setSoraErrorAlertMessage(error.toString());
        throw error;
      },
    );
    if (mediaStream.getAudioTracks().length > 0) {
      if (soraValue && connectionStatusValue === "connected" && localMediaStreamValue) {
        // Sora 接続中の場合
        await soraValue.replaceAudioTrack(localMediaStreamValue, mediaStream.getAudioTracks()[0]);
      } else if (localMediaStreamValue) {
        // Sora は未接続で media access での表示を行っている場合
        // 現在の AudioTrack を停止、削除してから、新しい AudioTrack を追加する
        for (const track of localMediaStreamValue.getAudioTracks()) {
          track.enabled = false;
          track.stop();
          localMediaStreamValue?.removeTrack(track);
        }
        localMediaStreamValue.addTrack(mediaStream.getAudioTracks()[0]);
      }
      signals.setFakeContentsAudio(audioContext, gainNode);
    }
  } else if (soraValue && connectionStatusValue === "connected" && localMediaStreamValue) {
    // Sora 接続中の場合
    stopLocalAudioTrack(localMediaStreamValue, noiseSuppressionProcessorValue);
    soraValue.removeAudioTrack(localMediaStreamValue).catch((error: unknown) => {
      signals.setLogMessages({
        title: "REMOVE_AUDIO_TRACK",
        description: error instanceof Error ? error.message : String(error),
      });
    });
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
    const [mediaStream, gainNode, audioContext] = await createMediaStream(pickedState).catch(
      (error) => {
        signals.setSoraErrorAlertMessage(error.toString());
        throw error;
      },
    );
    if (mediaStream.getVideoTracks().length > 0) {
      if (soraValue && connectionStatusValue === "connected" && localMediaStreamValue) {
        // Sora 接続中の場合
        soraValue
          .replaceVideoTrack(localMediaStreamValue, mediaStream.getVideoTracks()[0])
          .catch((error: unknown) => {
            signals.setLogMessages({
              title: "REPLACE_VIDEO_TRACK",
              description: error instanceof Error ? error.message : String(error),
            });
          });
      } else if (localMediaStreamValue) {
        // Sora は未接続で media access での表示を行っている場合
        // 現在の VideoTrack を停止、削除してから、新しい VideoTrack を追加する
        for (const track of localMediaStreamValue.getVideoTracks()) {
          track.enabled = false;
          track.stop();
          localMediaStreamValue?.removeTrack(track);
        }
        localMediaStreamValue.addTrack(mediaStream.getVideoTracks()[0]);
      }
      signals.setFakeContentsAudio(audioContext, gainNode);
    }
  } else if (soraValue && connectionStatusValue === "connected" && localMediaStreamValue) {
    // Sora 接続中の場合
    const originalTrack = stopVideoProcessors(virtualBackgroundProcessorValue);
    await stopLocalVideoTrack(localMediaStreamValue, originalTrack);
    soraValue.removeVideoTrack(localMediaStreamValue).catch((error: unknown) => {
      signals.setLogMessages({
        title: "REMOVE_VIDEO_TRACK",
        description: error instanceof Error ? error.message : String(error),
      });
    });
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
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 100);
    });
    originalTrack.stop();
    localMediaStreamValue?.removeTrack(originalTrack);
    signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
  } else {
    if (!localMediaStreamValue) {
      return;
    }
    for (const track of localMediaStreamValue.getVideoTracks()) {
      track.enabled = false;
    }
    // track enabled = false から sleep を sleep を入れないと配信側にカメラの最後のコマが残る問題へのハック
    // safari はこれで対応できるが firefox は残ってしまう
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 100);
    });
    for (const track of localMediaStreamValue.getVideoTracks()) {
      track.stop();
      localMediaStreamValue.removeTrack(track);
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    }
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
    for (const track of localMediaStreamValue.getAudioTracks()) {
      track.stop();
      localMediaStreamValue.removeTrack(track);
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    }
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
  setMaxNotifyMessages,
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
