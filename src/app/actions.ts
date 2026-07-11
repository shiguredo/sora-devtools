import type { NoiseSuppressionProcessor } from "@shiguredo/noise-suppression";
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
  getErrorMessage,
  getMediaStreamTrackProperties,
  parseMetadata,
  parseQueryString,
  setTrackContentHint,
} from "./../utils.ts";
import {
  getOrCreateNoiseSuppressionProcessor,
  isNoiseSuppressionSupported,
  runWithNoiseSuppressionProcessorLock,
} from "./../noiseSuppression.ts";
import { loadUrlEntries } from "./../opfs.ts";
import {
  enqueueStats,
  flushStatsBuffer,
  getCurrentConnectionId,
  getCurrentSessionDbId,
  insertConnection,
  insertSession,
  updateConnectionEndedAt,
  updateSessionEndedAt,
  updateSessionIdAndConnectionId,
} from "./../sessionDatabaseLoader.ts";
import { normalizeWebrtcStats } from "./../webrtcStatsNormalizer.ts";
import * as signals from "./signals.ts";

// 接続試行単位の永続化コンテキスト。sessions.id はローカルで保持し、
// connections INSERT 成功時の connectionId もここに記録する（明示パス用）
interface SessionPersistenceState {
  sessionDbId: number;
  persistedConnectionId: string | null;
  // connection.created 時点の connectionId。SDK は disconnect コールバック前に
  // soraConnection.connectionId を null 化するため、フックではこの値を優先する
  observedConnectionId: string | null;
  // connection.created 時点の Sora session_id（stats 行用。signals は読まない）
  sessionId: string | null;
  // disconnect が INSERT より先に来た connectionId を記録し、INSERT 完了後に ended_at を書く
  connectionEndedPendingIds: Set<string>;
}

// sessions.ended_at / connections.ended_at を fire-and-forget で更新する
function runPersistenceTask(task: () => Promise<void>): void {
  void (async () => {
    try {
      await task();
    } catch (error: unknown) {
      signals.setLogMessages({
        title: "SESSION_DATABASE",
        description: getErrorMessage(error),
      });
    }
  })();
}

function persistSessionEndedAt(sessionDbId: number | null | undefined): void {
  if (sessionDbId === null || sessionDbId === undefined) {
    return;
  }
  runPersistenceTask(async () => {
    await updateSessionEndedAt(sessionDbId);
  });
}

function persistConnectionEndedAt(connectionId: string | null | undefined): void {
  if (!connectionId) {
    return;
  }
  runPersistenceTask(async () => {
    await updateConnectionEndedAt(connectionId);
  });
}

// persistence に保持した connectionId を優先して返す（SDK が callback 前に null 化するため）
function connectionIdFromPersistence(
  persistence: SessionPersistenceState | null | undefined,
): string | null {
  if (persistence === null || persistence === undefined) {
    return null;
  }
  return persistence.persistedConnectionId ?? persistence.observedConnectionId;
}

// stats バッファを fire-and-forget で flush する（DuckDB への書き込み）
function persistStatsFlush(sessionDbId: number | null | undefined): void {
  if (sessionDbId === null || sessionDbId === undefined) {
    return;
  }
  runPersistenceTask(async () => {
    await flushStatsBuffer(sessionDbId);
  });
}

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
    setTrackContentHint(track, state.videoContentHint);
    track.enabled = state.videoTrack;
  }
  for (const track of mediaStream.getAudioTracks()) {
    setTrackContentHint(track, state.audioContentHint);
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
  // navigator.mediaDevices は HTTPS / localhost 以外では undefined になり得る
  // oxlint-disable-next-line typescript/no-unnecessary-condition
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
    setTrackContentHint(track, state.videoContentHint);
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

// getUserMedia で取得した音声トラックにノイズ抑制とタイムライン記録を行う
async function processAudioTrack(
  audioTrack: MediaStreamTrack,
  state: createMediaStreamPickedState,
  noiseSuppressionProcessorEnabled: boolean,
): Promise<MediaStreamTrack> {
  signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", audioTrack));
  if (!noiseSuppressionProcessorEnabled) {
    return audioTrack;
  }
  const processor = await getOrCreateNoiseSuppressionProcessor(state.noiseSuppressionProcessor);
  const processedTrack = await runWithNoiseSuppressionProcessorLock(async () => {
    // 未初期化プロセッサの stopProcessing() は冪等であることが期待されているが
    // 安全のため isProcessing() でガードする
    if (processor.isProcessing()) {
      processor.stopProcessing();
    }
    // getAudioTracks() の実行時型は MediaStreamAudioTrack
    return processor.startProcessing(audioTrack as MediaStreamAudioTrack);
  });
  // startProcessing 成功後に signal を更新する
  // 失敗した場合に失敗済みプロセッサが signal に残り次回再利用されるのを防ぐ
  signals.noiseSuppressionProcessor.value = processor;
  return processedTrack;
}

// getUserMedia で取得した映像トラックに仮想背景とタイムライン記録を行う
async function processVideoTrack(
  videoTrack: MediaStreamTrack,
  state: createMediaStreamPickedState,
  virtualBackgroundProcessorEnabled: boolean,
): Promise<MediaStreamTrack> {
  signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("start", videoTrack));
  if (!virtualBackgroundProcessorEnabled) {
    return videoTrack;
  }
  if (state.virtualBackgroundProcessor === null) {
    throw new Error("failed to start VirtualBackgroundProcessor, processor is null");
  }
  const options = {
    blurRadius: getBlurRadiusNumber(state.blurRadius),
  };
  state.virtualBackgroundProcessor.stopProcessing();
  return state.virtualBackgroundProcessor.startProcessing(
    videoTrack as MediaStreamVideoTrack,
    options,
  );
}

// getUserMedia を使用して MediaStream を生成する
async function createUserMediaStream(
  state: createMediaStreamPickedState,
): Promise<[MediaStream, null, null]> {
  const LOG_TITLE = "MEDIA_CONSTRAINTS";
  const noiseSuppressionProcessorEnabled =
    state.mediaProcessorsNoiseSuppression && isNoiseSuppressionSupported();
  const virtualBackgroundProcessorEnabled =
    state.blurRadius !== "" && VirtualBackgroundProcessor.isSupported();
  // navigator.mediaDevices は HTTPS / localhost 以外では undefined になり得る
  // oxlint-disable-next-line typescript/no-unnecessary-condition
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
  if (!audioConstraints && !videoConstraints) {
    applyTrackSettings(mediaStream, state);
    return [mediaStream, null, null];
  }
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
  const gumMediaStream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
  let audioTrackAdded = false;
  let videoTrackAdded = false;
  try {
    if (audioConstraints) {
      const [audioTrack] = gumMediaStream.getAudioTracks();
      const processedTrack = await processAudioTrack(
        audioTrack,
        state,
        noiseSuppressionProcessorEnabled,
      );
      signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-audio-get-user-media"));
      mediaStream.addTrack(processedTrack);
      audioTrackAdded = true;
    }
    if (videoConstraints) {
      const [videoTrack] = gumMediaStream.getVideoTracks();
      const processedTrack = await processVideoTrack(
        videoTrack,
        state,
        virtualBackgroundProcessorEnabled,
      );
      signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("succeed-video-get-user-media"));
      mediaStream.addTrack(processedTrack);
      videoTrackAdded = true;
    }
  } catch (error) {
    // mediaStream に追加済みの track は呼び出し元で管理されるため停止しない
    if (!audioTrackAdded) {
      for (const track of gumMediaStream.getAudioTracks()) {
        track.stop();
      }
    }
    if (!videoTrackAdded) {
      for (const track of gumMediaStream.getVideoTracks()) {
        track.stop();
      }
    }
    throw error;
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

// connection.destroyed の notify かを判定する型ガード
export const isConnectionDestroyedNotify = (
  message: SoraNotifyMessage,
): message is SoraNotifyMessage & { connection_id: string } =>
  message.event_type === "connection.destroyed" && typeof message.connection_id === "string";

// スポットライトイベントを処理する
function handleSpotlightEvent(message: SoraNotifyMessage): void {
  if (message.event_type === "spotlight.focused" && typeof message.connection_id === "string") {
    signals.setFocusedSpotlightConnectionId(message.connection_id);
  }
  if (message.event_type === "spotlight.unfocused" && typeof message.connection_id === "string") {
    signals.setUnFocusedSpotlightConnectionId(message.connection_id);
  }
  if (isConnectionDestroyedNotify(message)) {
    signals.deleteFocusedSpotlightConnectionId(message.connection_id);
  }
}

// connection.created の notify を処理する
// persistence がある場合は sessions UPDATE と connections INSERT も行う
function handleConnectionCreatedNotify(
  message: SoraNotifyMessage,
  soraConnection: ConnectionPublisher | ConnectionSubscriber,
  persistence: SessionPersistenceState | null,
): void {
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
    // セッション永続化: session_id / connection_id を UPDATE し connections を INSERT する
    if (
      persistence !== null &&
      typeof message.session_id === "string" &&
      typeof message.connection_id === "string"
    ) {
      const sessionId = message.session_id;
      const connectionId = message.connection_id;
      // SDK が disconnect 前に connectionId を消す前に、同期で保持する
      persistence.observedConnectionId = connectionId;
      persistence.sessionId = sessionId;
      const soraClientId = typeof message.client_id === "string" ? message.client_id : "";
      const channelId = signals.channelId.value;
      const signalingUrl = soraConnection.connectedSignalingUrl;
      const { sessionDbId } = persistence;
      runPersistenceTask(async () => {
        await updateSessionIdAndConnectionId(sessionDbId, sessionId, connectionId);
      });
      runPersistenceTask(async () => {
        const inserted = await insertConnection(
          sessionDbId,
          sessionId,
          connectionId,
          soraClientId,
          channelId,
          signalingUrl,
        );
        // INSERT 成功時のみ明示パス用に connectionId を保持する
        if (inserted) {
          persistence.persistedConnectionId = connectionId;
          // disconnect が INSERT より先に走っていた場合はここで ended_at を補完する
          if (persistence.connectionEndedPendingIds.has(connectionId)) {
            persistence.connectionEndedPendingIds.delete(connectionId);
            await updateConnectionEndedAt(connectionId);
          }
        }
      });
    }
  } else if (typeof message.client_id === "string") {
    // 自身以外の notify
    signals.setSoraRemoteClientId({
      connectionId: message.connection_id,
      clientId: message.client_id,
    });
  }
}

// track の ended イベントリスナー管理
// connectionId をキー、{track, listener} の配列を値とする Map
const trackEndedListeners = new Map<
  string,
  Array<{ track: MediaStreamTrack; listener: () => void }>
>();

const registerTrackEndedListener = (connectionId: string, track: MediaStreamTrack): void => {
  const currentListeners = trackEndedListeners.get(connectionId) ?? [];
  // 同一 track の重複登録を避ける
  if (currentListeners.some((entry) => entry.track === track)) {
    return;
  }
  const listener = (): void => {
    // いずれか 1 track の ended でクライアントごと削除する（removetrack と同じ stream 単位の粒度）
    removeRemoteClientCleanup(connectionId);
  };
  track.addEventListener("ended", listener);
  currentListeners.push({ track, listener });
  trackEndedListeners.set(connectionId, currentListeners);
};

const unregisterTrackEndedListeners = (connectionId: string): void => {
  const listeners = trackEndedListeners.get(connectionId);
  if (listeners) {
    for (const { track, listener } of listeners) {
      track.removeEventListener("ended", listener);
    }
    trackEndedListeners.delete(connectionId);
  }
};

// リモートクライアントを ended リスナーを解除しつつ個別に削除する
//
// 他参加者が channel から退出した場合に、remoteClients signal から該当クライアントを
// 削除し、登録済みの track ended リスナーを解除する。
//
// 注意: ここでは remote track を stop() しない。
// 接続継続中のマルチストリーム session で他参加者が退出・再接続する re-offer 時に、
// Firefox では stop() 済みの remote track と同一 transceiver に紐づく後続 track イベントが
// 正しく処理されず、再接続後の映像が真っ白になる問題が発生する。
// そのため signal からの削除のみ行い、track の停止は sora-js-sdk 側の re-offer 処理に任せる。
// フル切断時の一括掃除（clearRemoteMediaClients）では、リソース解放のため引き続き track.stop() を行う。
const removeRemoteClientCleanup = (connectionId: string): void => {
  unregisterTrackEndedListeners(connectionId);
  signals.removeRemoteClient(connectionId);
};

// リモートクライアント全件の track 停止・ended リスナー解除後に signal を一括クリアする
const clearRemoteMediaClients = (): void => {
  for (const client of signals.remoteClients.value) {
    unregisterTrackEndedListeners(client.connectionId);
    for (const track of client.mediaStream.getTracks()) {
      track.stop();
    }
  }
  signals.removeAllRemoteClients();
};

// Sora 切断時の完全なメディア掃除
// リモート・ローカル両方のメディアリソースを解放する
// 冪等（null・空で再呼び出ししても安全）
export const cleanupSoraMediaState = async (): Promise<void> => {
  clearRemoteMediaClients();
  const localMediaStreamValue = signals.localMediaStream.value;
  const virtualBackgroundProcessorValue = signals.virtualBackgroundProcessor.value;
  const noiseSuppressionProcessorValue = signals.noiseSuppressionProcessor.value;
  const fakeContentsValue = signals.fakeContents.value;
  // media processor は同期処理で停止する
  const originalTrack = stopVideoProcessors(virtualBackgroundProcessorValue);
  // fakeMedia の worker を停止する
  if (fakeContentsValue.worker) {
    fakeContentsValue.worker.postMessage({ type: "stop" });
  }
  // fakeMedia 利用時の AudioContext を close する
  signals.closeFakeContentsAudio();
  // closed/0030 の安全網: signal を先に null にして UI から映像を即座に消す（同期）
  signals.setLocalMediaStream(null);
  // 後追いで video / audio track stop を並列に待つ
  // 旧コードでは audio 側の rejection を握り潰していたが Promise.allSettled で video / audio 双方の rejection をログに残す
  const [videoResult, audioResult] = await Promise.allSettled([
    stopLocalVideoTrack(localMediaStreamValue, originalTrack),
    stopLocalAudioTrack(localMediaStreamValue, noiseSuppressionProcessorValue),
  ]);
  if (videoResult.status === "rejected") {
    signals.setLogMessages({
      title: "STOP_LOCAL_VIDEO_TRACK",
      description: getErrorMessage(videoResult.reason),
    });
  }
  if (audioResult.status === "rejected") {
    signals.setLogMessages({
      title: "STOP_LOCAL_AUDIO_TRACK",
      description: getErrorMessage(audioResult.reason),
    });
  }
};

// track イベントの本体処理を切り出す。setSoraCallbacks 側のラッパで isCurrent() 判定を通過した後に呼ばれる。
// 0047 の isCurrent ガードを setSoraCallbacks 側で適用済みのため本関数では再判定しない (テスト時に signals.sora を設定する必要が無くなる)。
// event.streams が空配列の場合は remoteClients を変更せず timeline メッセージのみ追加して return する。
// 現行 sora-js-sdk は publisher 系で明示ガードしており subscriber 系も TypeError 経由で空配列イベントが到達しない設計だが、
// SDK の比較順や connectionId 判定が変わると即座に空配列イベントが到達しうるためアプリ層にも防御層を入れる。
export const handleTrackEvent = (event: RTCTrackEvent): void => {
  signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-track"));
  if (event.streams.length === 0) {
    signals.setTimelineMessage(
      createSoraDevtoolsTimelineMessage("event-on-track", {
        emptyStreams: true,
        trackId: event.track.id,
        kind: event.track.kind,
      }),
    );
    return;
  }
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
  // 新規・既存クライアントに関わらず全 track の ended リスナーを登録する
  for (const track of event.streams[0].getTracks()) {
    registerTrackEndedListener(event.streams[0].id, track);
  }
};

// Sora connection オブジェクトに callback をセットする
function setSoraCallbacks(
  soraConnection: ConnectionPublisher | ConnectionSubscriber,
  persistence: SessionPersistenceState | null,
): void {
  // sora-js-sdk にはリスナー解除 API (off / removeAllListeners) が無く、reconnectSora で
  // 旧接続が破棄されても本関数で登録したリスナーは残り続ける。各ハンドラ先頭で
  // 「自分が現在の signals.sora.value か」を判定し、新セッションの state を破壊しうる
  // 処理を旧接続のリスナーからは skip する。
  const isCurrent = (): boolean => signals.sora.value === soraConnection;
  soraConnection.on("log", (title: string, description: Json) => {
    if (!isCurrent()) {
      return;
    }
    signals.setLogMessages({
      title,
      description: JSON.stringify(description),
    });
  });
  soraConnection.on("notify", (message: SoraNotifyMessage, transportType: TransportType) => {
    // 旧接続からの notify が新セッションの remoteClients を破壊するのを防ぐ
    if (!isCurrent()) {
      return;
    }
    handleSpotlightEvent(message);
    handleConnectionCreatedNotify(message, soraConnection, persistence);
    // 他参加者が退出したらリモートクライアントを削除する
    if (isConnectionDestroyedNotify(message)) {
      removeRemoteClientCleanup(message.connection_id);
    }
    signals.setNotifyMessages({
      timestamp: Date.now(),
      message,
      transportType,
    });
  });
  soraConnection.on("push", (message: SoraPushMessage, transportType: TransportType) => {
    if (!isCurrent()) {
      return;
    }
    signals.setPushMessages({
      timestamp: Date.now(),
      message,
      transportType,
    });
  });
  soraConnection.on("track", (event: RTCTrackEvent) => {
    // 旧接続からの track が新セッションの remoteClients に混入するのを防ぐため
    // timeline 記録も含めて完全に skip する
    if (!isCurrent()) {
      return;
    }
    handleTrackEvent(event);
  });
  soraConnection.on("removetrack", (event: MediaStreamTrackEvent) => {
    // SDK イベント発火そのものは古い接続でも timeline に残す（append-only で state 破壊なし）
    signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-removetrack"));
    // remoteClients 書き換えは新セッションのみ
    if (!isCurrent()) {
      return;
    }
    const remoteClientsValue = signals.remoteClients.value;
    // sora-js-sdk の "track" イベントは常に RTCTrackEvent を渡すため event は non-null
    const remoteClient = remoteClientsValue.find((client) => {
      if (event.target) {
        return client.connectionId === (event.target as MediaStream).id;
      }
      return false;
    });
    if (remoteClient) {
      removeRemoteClientCleanup(remoteClient.connectionId);
    }
  });
  soraConnection.on("disconnect", async (event) => {
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
    // 記録 1: SDK イベントの発火そのものを記録する。古い接続でも timeline に残す
    signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-disconnect", message));
    // 永続化フックは isCurrent() ガードの前に置く。
    // SDK は本コールバックの Promise を待たないため、識別子を同期キャプチャしてから void で投げる。
    // SDK は callbacks.disconnect の前に initializeConnection() で connectionId を null 化するため、
    // soraConnection.connectionId は使わず、connection.created 時点で保持した ID を使う。
    const connectionIdForPersistence =
      connectionIdFromPersistence(persistence) ?? getCurrentConnectionId();
    const sessionDbIdForPersistence = persistence?.sessionDbId ?? null;
    const current = isCurrent();
    const reconnecting = signals.reconnecting.value;
    // INSERT 未完了のレースに備え、当該 connectionId を pending に入れてから UPDATE を投げる
    if (persistence !== null && connectionIdForPersistence) {
      persistence.connectionEndedPendingIds.add(connectionIdForPersistence);
    }
    persistConnectionEndedAt(connectionIdForPersistence);
    if (current && !reconnecting) {
      persistSessionEndedAt(sessionDbIdForPersistence);
    }
    // stats バッファは isCurrent 前に、クロージャの sessionDbId で flush する
    persistStatsFlush(sessionDbIdForPersistence);
    // 以降の state 操作は新セッションのみ
    if (!current) {
      return;
    }
    const reconnectValue = signals.reconnect.value;
    // statsReport タイマーを即時停止する。setSora(null) による次回 tick 自滅を待たない
    stopStatsReportTimer();
    signals.setSora(null);
    signals.setSoraSessionId(null);
    signals.setSoraConnectionId(null);
    signals.setSoraClientId(null);
    signals.setSoraTurnUrl(null);
    signals.setSoraConnectionStatus("disconnected");
    signals.setSoraInfoAlertMessage("disconnected Sora");
    // 記録 2: アプリ側の状態遷移として記録する。古い接続では skip 済みのためここには来ない
    signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("disconnected"));
    if (event.type === "abend" && reconnectValue) {
      // 再接続処理開始フラグ
      signals.setSoraReconnecting(true);
      // reconnectSora の起動責務を <Reconnect /> の useEffect から本ハンドラに集約する。
      // <Reconnect /> の再 mount による二重起動を防ぐため、useEffect 経由の起動は
      // 廃止し、本箇所で直接呼び出す形にしている。
      // SDK は本ハンドラの戻り値 Promise を待たないため reconnectSora は void で起動する。
      // 後続の await cleanupSoraMediaState と reconnectSora の同期前処理が並走するが、
      // 双方 clearRemoteMediaClients / closeFakeContentsAudio は冪等で実害は無い。
      void reconnectSora();
    }
    // SDK は本コールバックの戻り値 Promise を待たないため、cleanup は実質 fire-and-forget となる
    // cleanup が reject した場合は unhandled rejection を起こさないよう try / catch でログ化する
    try {
      await cleanupSoraMediaState();
    } catch (error) {
      signals.setLogMessages({
        title: "CLEANUP_SORA_MEDIA_STATE",
        description: getErrorMessage(error),
      });
    }
  });
  soraConnection.on("timeline", (event) => {
    if (!isCurrent()) {
      return;
    }
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
    if (!isCurrent()) {
      return;
    }
    const message: SignalingMessage = {
      timestamp: Date.now(),
      transportType: event.transportType,
      type: event.type,
      data: event.data as Record<string, unknown> | undefined,
    };
    signals.setSignalingMessage(message);
  });
  soraConnection.on("message", (event) => {
    if (!isCurrent()) {
      return;
    }
    signals.setDataChannelMessage({
      timestamp: Date.now(),
      label: event.label,
      data: event.data,
    });
  });
  soraConnection.on("datachannel", (event) => {
    if (!isCurrent()) {
      return;
    }
    signals.setSoraDataChannels(event.datachannel);
  });
  soraConnection.on("switched", (message) => {
    if (!isCurrent()) {
      return;
    }
    signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-switched", message));
  });
  soraConnection.on("connected", (message) => {
    if (!isCurrent()) {
      return;
    }
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
    type,
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

// statsReport を更新し、永続化バッファへ正規化結果を積む
// channelId を渡した場合は開始時キャプチャ値を使い、毎 tick の signals 参照を避ける
async function setStatsReportInternal(
  soraConnection: ConnectionPublisher | ConnectionSubscriber,
  persistence: SessionPersistenceState | null,
  channelId?: string,
): Promise<void> {
  // 前行の soraConnection.pc && で null チェック済みのため ?. は冗長
  if (soraConnection.pc && soraConnection.pc.iceConnectionState !== "closed") {
    const stats = await soraConnection.pc.getStats();
    const statsReportData: RTCStats[] = [];
    const localCandidateStats: RTCIceLocalCandidateStats[] = [];
    for (const s of stats.values()) {
      const stat = s as RTCStats;
      statsReportData.push(stat);
      if (stat.type === "local-candidate") {
        localCandidateStats.push(stat);
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

    if (persistence !== null) {
      const resolvedChannelId = channelId ?? signals.channelId.value;
      const normalized = normalizeWebrtcStats(
        statsReportData,
        persistence.sessionDbId,
        persistence.sessionId,
        persistence.observedConnectionId ?? persistence.persistedConnectionId,
        resolvedChannelId,
      );
      enqueueStats(
        normalized,
        persistence.sessionDbId,
        persistence.sessionId,
        persistence.observedConnectionId ?? persistence.persistedConnectionId,
        resolvedChannelId,
      );
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
    [mediaStream, gainNode, audioContext] = await createMediaStream(state);
  } catch (error) {
    if (error instanceof Error) {
      signals.setLogMessages({
        title: LOG_TITLE,
        description: JSON.stringify(error.message),
      });
      signals.setAPIErrorAlertMessage(`failed to get user devices: ${error.message}`);
    }
    await cleanupMediaStreamOnError(state, mediaStream);
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

  await stopLocalAudioTrack(localMediaStreamValue, noiseSuppressionProcessorValue);
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
  persistence: SessionPersistenceState | null,
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
  setSoraCallbacks(soraConnection, persistence);
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
async function cleanupMediaStreamOnError(
  state: createMediaStreamPickedState,
  mediaStream: MediaStream | undefined,
): Promise<void> {
  let originalTrack: MediaStreamVideoTrack | undefined;
  if (state.virtualBackgroundProcessor?.isProcessing()) {
    originalTrack ??= state.virtualBackgroundProcessor.getOriginalTrack();
    state.virtualBackgroundProcessor.stopProcessing();
  }
  if (originalTrack) {
    originalTrack.stop();
    signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
  }
  if (mediaStream) {
    for (const track of mediaStream.getVideoTracks()) {
      track.stop();
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    }
  }

  await stopLocalAudioTrack(mediaStream ?? null, state.noiseSuppressionProcessor);
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

function startStatsReportTimer(
  soraConnection: ConnectionPublisher | ConnectionSubscriber,
  persistence: SessionPersistenceState | null,
): void {
  // 既存タイマーがあれば停止してから起動する。再接続のたびにタイマーが増殖するのを防ぐ
  stopStatsReportTimer();
  // 開始時に persistence / connection / channelId をキャプチャする（毎 tick の getCurrent は使わない）
  const capturedPersistence = persistence;
  const capturedConnection = soraConnection;
  const capturedChannelId = signals.channelId.value;
  const schedule = async (): Promise<void> => {
    if (signals.sora.value !== capturedConnection) {
      statsReportTimerId = null;
      return;
    }
    try {
      await setStatsReportInternal(capturedConnection, capturedPersistence, capturedChannelId);
    } catch {
      // getStats のエラーはタイマーを停止させない
    }
    if (signals.sora.value === capturedConnection) {
      statsReportTimerId = setTimeout(() => {
        void schedule();
      }, 1000);
    } else {
      statsReportTimerId = null;
    }
  };
  void schedule();
}

// connectSora のキャンセル時にローカル変数として生成済みの資源を解放する。
// disconnectSora の cleanupSoraMediaState は signal 経由でしか解放できないため、
// まだ signal に積まれていない mediaStream / audioContext / soraConnection はここで直接解放する。
function abortConnectSoraResources(args: {
  mediaStream: MediaStream | undefined;
  audioContext: AudioContext | null | undefined;
  soraConnection: ConnectionPublisher | ConnectionSubscriber | undefined;
  forceCreateMediaStream: boolean;
  localMediaStreamValue: MediaStream | null;
}): void {
  const {
    mediaStream,
    audioContext,
    soraConnection,
    forceCreateMediaStream,
    localMediaStreamValue,
  } = args;
  // 既存 localMediaStream を再利用したパスでは mediaStream は signal がまだ保持しているため stop しない。
  // それ以外のパス (新規取得 / forceCreateMediaStream) では本ヘルパーで track を stop する。
  if (mediaStream && (forceCreateMediaStream || localMediaStreamValue !== mediaStream)) {
    for (const track of mediaStream.getTracks()) {
      track.stop();
    }
  }
  if (audioContext) {
    void audioContext.close();
  }
  if (soraConnection && signals.sora.value === soraConnection) {
    // 0047 の isCurrent() ガードで disconnect ハンドラは skip されるが、SDK 側の WebSocket
    // / PeerConnection を確実に close するため disconnect() は呼ぶ。失敗は無視する。
    signals.setSora(null);
    void soraConnection.disconnect();
  }
  signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-connect-cancelled"));
}

// oxlint-disable-next-line eslint/max-statements -- 5 箇所のキャンセル検知ポイントとローカル変数の closure 捕捉のため外部関数化せず連結する
export const connectSora = async (): Promise<void> => {
  signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("start-connection"));
  signals.setSoraConnectionStatus("preparing");
  const state = getStateForMediaStream();
  // 強制的に state.soraContents.localMediaStream を作り直すかどうか
  let forceCreateMediaStream = false;
  // 前セッションのリモート残骸を掃除する。 localMediaStream は再利用のため触らない
  clearRemoteMediaClients();
  // 接続中の場合は切断する
  const soraValue = signals.sora.value;
  if (soraValue) {
    await soraValue.disconnect();
    // 検知ポイント 1: 既存接続あり時の await 直後に Disconnect が押された場合の専用ガード。
    // この時点ではローカル変数 mediaStream / audioContext / soraConnection が未代入のため
    // 解放処理は不要で、event-connect-cancelled だけ記録して新接続を作らずに return する。
    if (signals.connectionStatus.value === "disconnected") {
      signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-connect-cancelled"));
      return;
    }
    // 接続中の再接続の場合は、MediaStream を作り直し、state.soraContents.localMediaStream を更新する
    forceCreateMediaStream = true;
  }
  const { connection, connectionOptions, metadata } = prepareSignalingConnection();
  // 検知ポイント 1 通過後・createSoraConnectionByRole 前に sessions を INSERT する
  // metadata のマスクは insertSession 内で行う
  const sessionDbId = await insertSession(signals.channelId.value, signals.role.value, metadata);
  const persistence: SessionPersistenceState | null =
    sessionDbId === null
      ? null
      : {
          sessionDbId,
          persistedConnectionId: null,
          observedConnectionId: null,
          sessionId: null,
          connectionEndedPendingIds: new Set(),
        };
  let soraConnection: undefined | ConnectionPublisher | ConnectionSubscriber;
  let mediaStream: undefined | MediaStream;
  let gainNode: undefined | GainNode | null;
  let audioContext: undefined | AudioContext | null;
  const roleValue = signals.role.value;
  const channelIdValue = signals.channelId.value;
  const googCpuOveruseDetectionValue = signals.googCpuOveruseDetection.value;
  const localMediaStreamValue = signals.localMediaStream.value;
  // preparing / connecting 中にユーザーが Disconnect を押すと disconnectSora は soraValue == null
  // でも setSoraConnectionStatus("disconnected") を立てる (0007 で確立した意図的サポート)。
  // connectSora 側は各 await 直後に本ヘルパーで disconnected を検知し、ローカル変数の資源を
  // abortConnectSoraResources で直接解放する。
  const abortIfCancelled = (): boolean => {
    if (signals.connectionStatus.value !== "disconnected") {
      return false;
    }
    abortConnectSoraResources({
      mediaStream,
      audioContext,
      soraConnection,
      forceCreateMediaStream,
      localMediaStreamValue,
    });
    // abortConnectSoraResources は setSora(null) 後に disconnect するためフックは !isCurrent になる。
    // sessions / connections の ended_at は明示パスで更新する。
    persistSessionEndedAt(persistence?.sessionDbId);
    persistConnectionEndedAt(connectionIdFromPersistence(persistence));
    persistStatsFlush(persistence?.sessionDbId);
    return true;
  };
  try {
    soraConnection = createSoraConnectionByRole(
      connection,
      roleValue,
      channelIdValue,
      connectionOptions,
      metadata,
      googCpuOveruseDetectionValue,
      persistence,
    );
    if (roleValue === "sendonly" || roleValue === "sendrecv") {
      if (!forceCreateMediaStream && localMediaStreamValue) {
        mediaStream = localMediaStreamValue;
      } else {
        [mediaStream, gainNode, audioContext] = await createMediaStream(state).catch(
          (error: unknown) => {
            const message = getErrorMessage(error);
            signals.setSoraErrorAlertMessage(message);
            signals.setSoraConnectionStatus("disconnected");
            throw error;
          },
        );
      }
      // 検知ポイント 2: 新規取得パスと再利用パス両方の後で 1 回検知する
      if (abortIfCancelled()) {
        return;
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
    // 検知ポイント 3 / 4: connect 直後の共通検知 (sendrecv / sendonly / recvonly いずれも)
    if (abortIfCancelled()) {
      return;
    }
  } catch (error) {
    // 先に setSora で state を参照できるようにした state の参照を削除
    signals.setSora(null);
    if (error instanceof Error) {
      signals.setSoraErrorAlertMessage(`failed to connect Sora: ${error.message}`);
    }
    // try/catch 失敗時は明示パスで ended_at を更新する
    persistSessionEndedAt(persistence?.sessionDbId);
    persistConnectionEndedAt(connectionIdFromPersistence(persistence));
    persistStatsFlush(persistence?.sessionDbId);
    await cleanupMediaStreamOnError(state, mediaStream);
    // 残留した remoteClients と localMediaStream を掃除し、接続失敗後も UI に映像が残らないようにする
    await cleanupSoraMediaState();
    signals.setSoraConnectionStatus("disconnected");
    throw error;
  }
  // createSoraConnectionByRole は常に ConnectionPublisher | ConnectionSubscriber を返すため soraConnection は non-null
  signals.setSoraInfoAlertMessage("succeeded to connect Sora");
  await setStatsReportInternal(soraConnection, persistence);
  // 検知ポイント 5: setStatsReportInternal の await 中にも Disconnect が押されうるため、
  // setSoraConnectionStatus("connected") を立てる前に最終チェックする
  if (abortIfCancelled()) {
    return;
  }
  startStatsReportTimer(soraConnection, persistence);
  if (mediaStream && (localMediaStreamValue === null || forceCreateMediaStream)) {
    signals.setLocalMediaStream(mediaStream);
  }
  if (audioContext !== undefined) {
    signals.setFakeContentsAudio(audioContext, gainNode ?? null);
  }
  signals.setSoraConnectionStatus("connected");
  signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("connected"));
};

// 再接続を最大 10 回試行し成功した SoraConnection を返す。失敗時は undefined。
async function attemptReconnection(
  connection: ReturnType<typeof prepareSignalingConnection>["connection"],
  connectionOptions: ReturnType<typeof prepareSignalingConnection>["connectionOptions"],
  metadata: ReturnType<typeof prepareSignalingConnection>["metadata"],
  roleValue: SoraDevtoolsState["role"],
  channelIdValue: string,
  googCpuOveruseDetectionValue: boolean | null,
  mediaStream: MediaStream | undefined,
  persistence: SessionPersistenceState | null,
): Promise<ConnectionPublisher | ConnectionSubscriber | undefined> {
  for (let i = 1; i <= 10; i++) {
    if (!signals.reconnecting.value) {
      break;
    }
    signals.setSoraReconnectingTrials(i);
    // 試行ごとに connections INSERT 成功 ID をリセットする（同一 sessions 行を使い回す）
    // pending IDs は他試行の connectionId を消さない（遅延 disconnect 補完のため）
    if (persistence !== null) {
      persistence.persistedConnectionId = null;
      persistence.observedConnectionId = null;
      persistence.sessionId = null;
    }
    let soraConnection: undefined | ConnectionPublisher | ConnectionSubscriber;
    try {
      soraConnection = createSoraConnectionByRole(
        connection,
        roleValue,
        channelIdValue,
        connectionOptions,
        metadata,
        googCpuOveruseDetectionValue,
        persistence,
      );
      // connectSora と同様に connect() の前に setSora で state を参照できるようにする
      // connection.created の notify が来た時に自分のコネクションと照合するため
      signals.setSora(soraConnection);
      if (roleValue === "sendonly" || roleValue === "sendrecv") {
        if (mediaStream) {
          await (soraConnection as ConnectionPublisher).connect(mediaStream);
        }
      } else {
        await (soraConnection as ConnectionSubscriber).connect();
      }
    } catch (error) {
      signals.setSora(null);
      if (error instanceof Error) {
        signals.setSoraErrorAlertMessage(`(trials ${i}) failed to connect Sora: ${error.message}`);
      }
      // リトライ途中の catch では sessions.ended_at は更新しない。
      // connections INSERT 済みならその connectionId で ended_at を更新する。
      persistConnectionEndedAt(connectionIdFromPersistence(persistence));
      persistStatsFlush(persistence?.sessionDbId);
      soraConnection = undefined;
    }
    if (soraConnection !== undefined) {
      return soraConnection;
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, i * 500 + 500);
    });
  }
  return undefined;
}

// reconnectSora の本体実装。in-flight ガードはこの関数の外側 wrapper で行う
// oxlint-disable-next-line eslint/max-statements -- 永続化フックと createMediaStream / attemptReconnection 失敗パスを同一関数に保持する
const reconnectSoraImpl = async (): Promise<void> => {
  signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("start-reconnect"));
  signals.setSoraConnectionStatus("connecting");
  const state = getStateForMediaStream();
  // 前セッションのリモート残骸を掃除する
  clearRemoteMediaClients();
  const soraValue = signals.sora.value;
  const connectionStatusValue = signals.connectionStatus.value;
  // 接続中の場合は切断する
  if (soraValue && connectionStatusValue === "connected") {
    await soraValue.disconnect();
  }
  const { connection, connectionOptions, metadata } = prepareSignalingConnection();
  // prepareSignalingConnection 後・createMediaStream 前に sessions を INSERT する
  const sessionDbId = await insertSession(signals.channelId.value, signals.role.value, metadata);
  const persistence: SessionPersistenceState | null =
    sessionDbId === null
      ? null
      : {
          sessionDbId,
          persistedConnectionId: null,
          observedConnectionId: null,
          sessionId: null,
          connectionEndedPendingIds: new Set(),
        };
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
        signals.setSoraErrorAlertMessage(error.message);
      }
      persistSessionEndedAt(persistence?.sessionDbId);
      persistConnectionEndedAt(connectionIdFromPersistence(persistence));
      persistStatsFlush(persistence?.sessionDbId);
      await cleanupSoraMediaState();
      signals.setSoraConnectionStatus("disconnected");
      signals.setSoraReconnecting(false);
      return;
    }
  }
  const soraConnection = await attemptReconnection(
    connection,
    connectionOptions,
    metadata,
    roleValue,
    channelIdValue,
    googCpuOveruseDetectionValue,
    mediaStream,
    persistence,
  );
  if (soraConnection === undefined) {
    // 新規生成した mediaStream / audioContext は signal にセットされていないため、
    // cleanupSoraMediaState では解放されない。ローカル変数として直接解放してリークを防ぐ。
    // キャンセル経路 (Reconnect Toast を閉じる) でも attemptReconnection は undefined を返すため
    // 本ブロックを通り、同じ解放処理でリソースが回収される。
    if (mediaStream) {
      for (const track of mediaStream.getTracks()) {
        track.stop();
        // 失敗 / キャンセル時に停止した track もタイムラインに記録してデバッグ時に追えるようにする
        signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
      }
    }
    // audioContext は undefined / null / AudioContext の 3 状態。truthy チェックで一括捕捉する
    if (audioContext) {
      // 既存の closeFakeContentsAudio と同じ void パターンで AudioContext を解放する
      void audioContext.close();
    }
    signals.setSora(null);
    // 全リトライ枯渇 / reconnecting キャンセル時は明示パスで sessions.ended_at を更新する
    persistSessionEndedAt(persistence?.sessionDbId);
    persistConnectionEndedAt(connectionIdFromPersistence(persistence));
    persistStatsFlush(persistence?.sessionDbId);
    await cleanupSoraMediaState();
    signals.setSoraErrorAlertMessage("failed to reconnect Sora");
    signals.setSoraConnectionStatus("disconnected");
    signals.setSoraReconnecting(false);
    return;
  }
  signals.setSoraInfoAlertMessage("succeeded to reconnect Sora");
  await setStatsReportInternal(soraConnection, persistence);
  startStatsReportTimer(soraConnection, persistence);
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

// reconnectSora の二重起動を防ぐためのモジュールローカルな in-flight Promise。
// 後発呼び出しは既存の in-flight Promise を返し、reconnectSoraImpl の signal 副作用が
// 二重に走るのを防ぐ。Promise は finally で確実に null に戻す。
// Toast 手動クローズ後 (setSoraReconnecting(false)) でも、attemptReconnection のループ内
// setTimeout で待機中は in-flight が pending のまま残るため、その期間に別経路の abend が
// 起きても新規 reconnect は走らず既存の in-flight に合流する。最大残存時間は
// attemptReconnection の最終 sleep (i=10 で 5500ms) で、それ以降は finally で解放される。
let reconnectInFlight: Promise<void> | null = null;
export const reconnectSora = async (): Promise<void> => {
  if (reconnectInFlight) {
    return reconnectInFlight;
  }
  reconnectInFlight = (async () => {
    try {
      await reconnectSoraImpl();
    } finally {
      reconnectInFlight = null;
    }
  })();
  return reconnectInFlight;
};

// Sora との切断処理
export const disconnectSora = async (): Promise<void> => {
  // 永続化は最初の await より前に置く（beforeunload の fire-and-forget を空洞化しないため）
  // (1) getCurrentSessionDbId / getCurrentConnectionId を同期キャプチャし、非 null なら ended_at を更新する
  //     connections は SDK が disconnect コールバック前に connectionId を消すため、明示パスでも書く
  const sessionDbIdToEnd = getCurrentSessionDbId();
  const connectionIdToEnd = getCurrentConnectionId();
  persistSessionEndedAt(sessionDbIdToEnd);
  persistConnectionEndedAt(connectionIdToEnd);
  // stats も先頭で flush する（beforeunload の fire-and-forget を空洞化しない）
  persistStatsFlush(sessionDbIdToEnd);
  // (2) reconnecting 中ならリトライを止める（early return で setSoraReconnecting(false) に届かないため）
  if (signals.reconnecting.value) {
    signals.setSoraReconnecting(false);
  }
  const soraValue = signals.sora.value;
  const connectionStatusValue = signals.connectionStatus.value;
  // disconnected 状態でも残留メディアを掃除する
  // connected / connecting / preparing 時は SDK への切断通知前にローカル track を止めるが、UI を即座に消すための意図的な順序であり冪等で安全
  // sora-js-sdk の disconnect() は WebSocket / PeerConnection を close するだけでローカル track を停止しないため、切断通知前に止めても例外や ICE エラーは起きない
  // cleanup の完了 (track stop 含む) を待ってから SDK の disconnect 通知を呼ぶことで、切断完了通知前にローカル track stop が完了することを保証する
  await cleanupSoraMediaState();
  // statsReport タイマーは状態に関わらず即時停止する
  stopStatsReportTimer();
  // メディア掃除とタイマー停止は済んだので切断済みならここで抜ける
  if (connectionStatusValue === "disconnected") {
    return;
  }
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
    // MediaDeviceInfo.toJSON は lib.dom の宣言上 any なので MediaDeviceInfo に縮約する
    const json = deviceInfo.toJSON() as MediaDeviceInfo;
    if (deviceInfo.kind === "audioinput") {
      audioInputDevicesData.push(json);
    } else if (deviceInfo.kind === "audiooutput") {
      audioOutputDevicesData.push(json);
      // MediaDeviceKind は "audioinput" | "audiooutput" | "videoinput" のみのため
      // audio 系を除外した後の else は videoinput で確定する
    } else {
      videoInputDevicesData.push(json);
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

// updateMediaStream の本体実装。in-flight ガードはこの関数の外側 wrapper で行う。
// デバイスの変更時などに Sora との接続を維持したまま MediaStream のみ更新する。
const updateMediaStreamImpl = async (): Promise<void> => {
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
    // 関数先頭の if (!localMediaStreamValue) return によりここでは localMediaStreamValue は non-null
  } else {
    for (const track of localMediaStreamValue.getVideoTracks()) {
      track.stop();
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    }
  }

  await stopLocalAudioTrack(localMediaStreamValue, noiseSuppressionProcessorValue);
  const [mediaStream, gainNode, audioContext] = await createMediaStream(state).catch(
    (error: unknown) => {
      const message = getErrorMessage(error);
      signals.setSoraErrorAlertMessage(message);
      signals.setSoraConnectionStatus("disconnected");
      throw error;
    },
  );
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
  // 関数内の await を跨いだ後に切断が走ると、ここで signal を上書きして UI に新規メディアが復活し
  // AudioContext がどこからも参照されないままリークする。末尾の signal 更新前に状態を検査し、
  // 中断と判定できる場合はローカル変数として持っている新規リソースを直接解放して return する。
  // requestMedia プレビュー後 connect 前の経路では soraValue / signals.sora.value がともに null で
  // 参照比較が false になり、preview 中の updateMediaStream は素通りする。
  if (
    // 関数開始時の sora と現在の sora が異なる場合は切断後の再接続で新セッションに移行している
    signals.sora.value !== soraValue ||
    // disconnectSora 内の await cleanupSoraMediaState() を跨いだ時間窓を捕捉する
    signals.localMediaStream.value === null ||
    // ユーザー操作の disconnect が走行中 / 完了済みの過渡状態を捕捉する
    signals.connectionStatus.value === "disconnecting" ||
    signals.connectionStatus.value === "disconnected"
  ) {
    for (const track of mediaStream.getTracks()) {
      track.stop();
      // 中断時に破棄した track もタイムラインに記録してデバッグ時に追えるようにする
      signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
    }
    if (audioContext !== null) {
      // 既存の closeFakeContentsAudio と同じ void パターンで AudioContext を解放する
      void audioContext.close();
    }
    return;
  }
  signals.setLocalMediaStream(mediaStream);
  signals.setFakeContentsAudio(audioContext, gainNode);
};

// updateMediaStream の二重起動を防ぐためのモジュールローカルな in-flight Promise。
// UpdateMediaStreamButton 連打と AudioInputForm / VideoInputForm の onChange が並列発火しても
// 後発は既存の in-flight Promise を共有し、updateMediaStreamImpl の signal 上書きと
// AudioContext 重複生成を防ぐ。Promise は finally で確実に null に戻す。
let updateMediaStreamInFlight: Promise<void> | null = null;
export const updateMediaStream = async (): Promise<void> => {
  if (updateMediaStreamInFlight) {
    return updateMediaStreamInFlight;
  }
  updateMediaStreamInFlight = (async () => {
    try {
      await updateMediaStreamImpl();
    } finally {
      updateMediaStreamInFlight = null;
    }
  })();
  return updateMediaStreamInFlight;
};

export const setMicDeviceAction = async (micDevice: boolean): Promise<void> => {
  const state = getStateForMediaStream();
  const localMediaStreamValue = signals.localMediaStream.value;
  const soraValue = signals.sora.value;
  const connectionStatusValue = signals.connectionStatus.value;
  const noiseSuppressionProcessorValue = signals.noiseSuppressionProcessor.value;
  // connected 状態では soraValue が null でも localMediaStreamValue の操作が必要な場合があるため
  // setCameraDeviceAction と同じく 3 条件の AND で判定する
  if (!localMediaStreamValue && !soraValue && connectionStatusValue !== "connected") {
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
      micDevice,
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
      (error: unknown) => {
        const message = getErrorMessage(error);
        signals.setSoraErrorAlertMessage(message);
        throw error;
      },
    );
    if (mediaStream.getAudioTracks().length > 0) {
      if (soraValue && connectionStatusValue === "connected" && localMediaStreamValue) {
        // Sora 接続中の場合
        try {
          await soraValue.replaceAudioTrack(localMediaStreamValue, mediaStream.getAudioTracks()[0]);
        } catch (error) {
          signals.setLogMessages({
            title: "REPLACE_AUDIO_TRACK",
            description: getErrorMessage(error),
          });
        }
      } else if (localMediaStreamValue) {
        // Sora は未接続で media access での表示を行っている場合
        // 現在の AudioTrack を停止、削除してから、新しい AudioTrack を追加する
        for (const track of localMediaStreamValue.getAudioTracks()) {
          track.enabled = false;
          track.stop();
          localMediaStreamValue.removeTrack(track);
        }
        localMediaStreamValue.addTrack(mediaStream.getAudioTracks()[0]);
      }
      signals.setFakeContentsAudio(audioContext, gainNode);
    } else if (audioContext) {
      // トラックが生成されなかった場合は AudioContext を close してリークを防ぐ
      void audioContext.close();
    }
  } else if (soraValue && connectionStatusValue === "connected" && localMediaStreamValue) {
    // Sora 接続中の場合
    await stopLocalAudioTrack(localMediaStreamValue, noiseSuppressionProcessorValue);
    signals.closeFakeContentsAudio();
    try {
      await soraValue.removeAudioTrack(localMediaStreamValue);
    } catch (error) {
      signals.setLogMessages({
        title: "REMOVE_AUDIO_TRACK",
        description: getErrorMessage(error),
      });
    }
  } else if (localMediaStreamValue) {
    // Sora は未接続で media access での表示を行っている場合
    // localMediaStream の AudioTrack を停止して MediaStream から Track を削除する
    await stopLocalAudioTrack(localMediaStreamValue, noiseSuppressionProcessorValue);
    signals.closeFakeContentsAudio();
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
      cameraDevice,
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
      (error: unknown) => {
        const message = getErrorMessage(error);
        signals.setSoraErrorAlertMessage(message);
        throw error;
      },
    );
    if (mediaStream.getVideoTracks().length > 0) {
      if (soraValue && connectionStatusValue === "connected" && localMediaStreamValue) {
        // Sora 接続中の場合
        try {
          await soraValue.replaceVideoTrack(localMediaStreamValue, mediaStream.getVideoTracks()[0]);
        } catch (error) {
          signals.setLogMessages({
            title: "REPLACE_VIDEO_TRACK",
            description: getErrorMessage(error),
          });
        }
      } else if (localMediaStreamValue) {
        // Sora は未接続で media access での表示を行っている場合
        // 現在の VideoTrack を停止、削除してから、新しい VideoTrack を追加する
        for (const track of localMediaStreamValue.getVideoTracks()) {
          track.enabled = false;
          track.stop();
          localMediaStreamValue.removeTrack(track);
        }
        localMediaStreamValue.addTrack(mediaStream.getVideoTracks()[0]);
      }
      signals.setFakeContentsAudio(audioContext, gainNode);
    } else if (audioContext) {
      // トラックが生成されなかった場合は AudioContext を close してリークを防ぐ
      void audioContext.close();
    }
  } else if (soraValue && connectionStatusValue === "connected" && localMediaStreamValue) {
    // Sora 接続中の場合
    const originalTrack = stopVideoProcessors(virtualBackgroundProcessorValue);
    await stopLocalVideoTrack(localMediaStreamValue, originalTrack);
    try {
      await soraValue.removeVideoTrack(localMediaStreamValue);
    } catch (error) {
      signals.setLogMessages({
        title: "REMOVE_VIDEO_TRACK",
        description: getErrorMessage(error),
      });
    }
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
    // getVideoTracks() は live collection を返すため待機中に新規トラックが追加されても巻き込まないよう先に配列に固定する
    const tracks = [...localMediaStreamValue.getVideoTracks()];
    for (const track of tracks) {
      track.enabled = false;
    }
    // track enabled = false から sleep を sleep を入れないと配信側にカメラの最後のコマが残る問題へのハック
    // safari はこれで対応できるが firefox は残ってしまう
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 100);
    });
    for (const track of tracks) {
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
const stopLocalAudioTrack = async (
  localMediaStreamValue: MediaStream | null,
  noiseSuppressionProcessor: NoiseSuppressionProcessor | null,
): Promise<void> =>
  runWithNoiseSuppressionProcessorLock(async () => {
    if (noiseSuppressionProcessor?.isProcessing()) {
      const originalTrack = noiseSuppressionProcessor.getOriginalTrack();
      if (originalTrack) {
        originalTrack.stop();
        localMediaStreamValue?.removeTrack(originalTrack);
        signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", originalTrack));
      }
      noiseSuppressionProcessor.stopProcessing();
    }
    if (localMediaStreamValue) {
      for (const track of localMediaStreamValue.getAudioTracks()) {
        track.stop();
        localMediaStreamValue.removeTrack(track);
        signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track));
      }
    }
  });

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
