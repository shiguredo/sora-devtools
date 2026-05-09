import type { ConnectionOptions, DataChannelConfiguration, ForwardingFilter } from "sora-js-sdk";

import {
  ASPECT_RATIO_TYPES,
  AUDIO_CODEC_TYPES,
  AUDIO_CONTENT_HINTS,
  AUTO_GAIN_CONTROLS,
  BLUR_RADIUS,
  DATA_CHANNEL_SIGNALING,
  DEBUG_TYPES,
  ECHO_CANCELLATIONS,
  ECHO_CANCELLATION_TYPES,
  FACING_MODES,
  IGNORE_DISCONNECT_WEBSOCKET,
  MEDIA_TYPES,
  NOISE_SUPPRESSIONS,
  RESIZE_MODE_TYPES,
  ROLES,
  SIMULCAST,
  SIMULCAST_REQUEST_RID,
  SIMULCAST_RID,
  SPOTLIGHT,
  SPOTLIGHT_FOCUS_RIDS,
  SPOTLIGHT_NUMBERS,
  VIDEO_CODEC_TYPES,
  VIDEO_CONTENT_HINTS,
} from "./constants.ts";
import type {
  ConnectionOptionsState,
  Json,
  QueryStringParameters,
  SoraDevtoolsMediaTrackConstraints,
  SoraDevtoolsState,
} from "./types.ts";

// UNIX time を 年-月-日 時:分:秒.ミリ秒 形式に変換
export function formatUnixtime(time: number): string {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");
  const millisecond = date.getMilliseconds().toString().padStart(3, "0");
  return `${year}-${month}-${day} ${hour}:${minute}:${second}.${millisecond}`;
}

// OS の Clipboard にテキストを書き込む
export async function copy2clipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
}

// Form の Type Guard
export function checkFormValue<T extends readonly string[]>(
  value: unknown,
  candidates: T,
): value is (typeof candidates)[number] {
  if (typeof value === "string") {
    return candidates.includes(value);
  }
  return false;
}

// URLSearchParams から値を取得して string | undefined を返す
function parseStringParameter(searchParams: URLSearchParams, key: string): string | undefined {
  const value = searchParams.get(key);
  if (value !== null) {
    return value;
  }
}

// クエリ文字列パーサー
export function parseQueryString(searchParams: URLSearchParams): Partial<QueryStringParameters> {
  // URLSearchParams から値を取得して boolean | undefined を返す
  const parseBooleanParameter = (
    searchParams: URLSearchParams,
    key: string,
  ): boolean | undefined => {
    const value = searchParams.get(key);
    if (value !== null) {
      return parseBooleanString(value);
    }
  };
  // URLSearchParams から値を取得して特定の文字列かどうかを判定して string | undefined を返す
  const parseSpecifiedStringParameter = <T extends readonly string[]>(
    searchParams: URLSearchParams,
    key: string,
    candidates: T,
  ): (typeof candidates)[number] | undefined => {
    const value = searchParams.get(key);
    if (value !== null && checkFormValue(value, candidates)) {
      return value;
    }
  };

  // signalingUrlCandidates のパース
  let signalingUrlCandidates: unknown;
  const signalingUrlCandidatesValue = searchParams.get("signalingUrlCandidates");
  if (signalingUrlCandidatesValue !== null) {
    try {
      signalingUrlCandidates = JSON.parse(signalingUrlCandidatesValue);
    } catch {
      // 例外の場合は何もしない
    }
  }

  const result: Partial<QueryStringParameters> = {
    apiUrl: parseStringParameter(searchParams, "apiUrl"),
    audio: parseBooleanParameter(searchParams, "audio"),
    audioBitRate: parseStringParameter(searchParams, "audioBitRate"),
    audioCodecType: parseSpecifiedStringParameter(
      searchParams,
      "audioCodecType",
      AUDIO_CODEC_TYPES,
    ),
    audioStreamingLanguageCode: parseStringParameter(searchParams, "audioStreamingLanguageCode"),
    autoGainControl: parseSpecifiedStringParameter(
      searchParams,
      "autoGainControl",
      AUTO_GAIN_CONTROLS,
    ),
    bundleId: parseStringParameter(searchParams, "bundleId"),
    channelId: parseStringParameter(searchParams, "channelId"),
    clientId: parseStringParameter(searchParams, "clientId"),
    googCpuOveruseDetection: parseBooleanParameter(searchParams, "googCpuOveruseDetection"),
    debug: parseBooleanParameter(searchParams, "debug"),
    debugType: parseSpecifiedStringParameter(searchParams, "debugType", DEBUG_TYPES),
    debugApiUrl: parseStringParameter(searchParams, "debugApiUrl"),
    displayResolution: parseStringParameter(searchParams, "displayResolution"),
    echoCancellation: parseSpecifiedStringParameter(
      searchParams,
      "echoCancellation",
      ECHO_CANCELLATIONS,
    ),
    echoCancellationType: parseSpecifiedStringParameter(
      searchParams,
      "echoCancellationType",
      ECHO_CANCELLATION_TYPES,
    ),
    noiseSuppression: parseSpecifiedStringParameter(
      searchParams,
      "noiseSuppression",
      NOISE_SUPPRESSIONS,
    ),
    facingMode: parseSpecifiedStringParameter(searchParams, "facingMode", FACING_MODES),
    fakeVolume: parseStringParameter(searchParams, "fakeVolume"),
    frameRate: parseStringParameter(searchParams, "frameRate"),
    mediaStats: parseBooleanParameter(searchParams, "mediaStats"),
    mediaType: parseSpecifiedStringParameter(searchParams, "mediaType", MEDIA_TYPES),
    metadata: parseStringParameter(searchParams, "metadata"),
    showStats: parseBooleanParameter(searchParams, "showStats"),
    signalingNotifyMetadata: parseStringParameter(searchParams, "signalingNotifyMetadata"),
    signalingUrlCandidates: Array.isArray(signalingUrlCandidates)
      ? signalingUrlCandidates
      : undefined,
    forwardingFilters: parseStringParameter(searchParams, "forwardingFilters"),
    simulcast: parseSpecifiedStringParameter(searchParams, "simulcast", SIMULCAST),
    simulcastRid: parseSpecifiedStringParameter(searchParams, "simulcastRid", SIMULCAST_RID),
    simulcastRequestRid: parseSpecifiedStringParameter(
      searchParams,
      "simulcastRequestRid",
      SIMULCAST_REQUEST_RID,
    ),
    spotlight: parseSpecifiedStringParameter(searchParams, "spotlight", SPOTLIGHT),
    spotlightNumber: parseSpecifiedStringParameter(
      searchParams,
      "spotlightNumber",
      SPOTLIGHT_NUMBERS,
    ),
    spotlightFocusRid: parseSpecifiedStringParameter(
      searchParams,
      "spotlightFocusRid",
      SPOTLIGHT_FOCUS_RIDS,
    ),
    spotlightUnfocusRid: parseSpecifiedStringParameter(
      searchParams,
      "spotlightUnfocusRid",
      SPOTLIGHT_FOCUS_RIDS,
    ),
    resolution: parseStringParameter(searchParams, "resolution"),
    video: parseBooleanParameter(searchParams, "video"),
    videoBitRate: parseStringParameter(searchParams, "videoBitRate"),
    videoCodecType: parseSpecifiedStringParameter(
      searchParams,
      "videoCodecType",
      VIDEO_CODEC_TYPES,
    ),
    videoVP9Params: parseStringParameter(searchParams, "videoVP9Params"),
    videoH264Params: parseStringParameter(searchParams, "videoH264Params"),
    videoH265Params: parseStringParameter(searchParams, "videoH265Params"),
    videoAV1Params: parseStringParameter(searchParams, "videoAV1Params"),
    forceStereoOutput: parseBooleanParameter(searchParams, "forceStereoOutput"),
    audioInput: parseStringParameter(searchParams, "audioInput"),
    videoInput: parseStringParameter(searchParams, "videoInput"),
    audioOutput: parseStringParameter(searchParams, "audioOutput"),
    mute: parseBooleanParameter(searchParams, "mute"),
    dataChannelSignaling: parseSpecifiedStringParameter(
      searchParams,
      "dataChannelSignaling",
      DATA_CHANNEL_SIGNALING,
    ),
    ignoreDisconnectWebSocket: parseSpecifiedStringParameter(
      searchParams,
      "ignoreDisconnectWebSocket",
      IGNORE_DISCONNECT_WEBSOCKET,
    ),
    micDevice: parseBooleanParameter(searchParams, "micDevice"),
    cameraDevice: parseBooleanParameter(searchParams, "cameraDevice"),
    audioTrack: parseBooleanParameter(searchParams, "audioTrack"),
    videoTrack: parseBooleanParameter(searchParams, "videoTrack"),
    dataChannels: parseStringParameter(searchParams, "dataChannels"),
    reconnect: parseBooleanParameter(searchParams, "reconnect"),
    audioContentHint: parseSpecifiedStringParameter(
      searchParams,
      "audioContentHint",
      AUDIO_CONTENT_HINTS,
    ),
    videoContentHint: parseSpecifiedStringParameter(
      searchParams,
      "videoContentHint",
      VIDEO_CONTENT_HINTS,
    ),
    aspectRatio: parseSpecifiedStringParameter(searchParams, "aspectRatio", ASPECT_RATIO_TYPES),
    resizeMode: parseSpecifiedStringParameter(searchParams, "resizeMode", RESIZE_MODE_TYPES),
    blurRadius: parseSpecifiedStringParameter(searchParams, "blurRadius", BLUR_RADIUS),
    mediaProcessorsNoiseSuppression: parseBooleanParameter(
      searchParams,
      "mediaProcessorsNoiseSuppression",
    ),
    role: parseSpecifiedStringParameter(searchParams, "role", ROLES),
  };

  // undefined の項目を除外した新しいオブジェクトを作成する
  const filteredResult: Partial<QueryStringParameters> = {};
  for (const key of Object.keys(result) as Array<keyof Partial<QueryStringParameters>>) {
    if (result[key] !== undefined) {
      // biome-ignore lint: 型安全なキーによる代入
      (filteredResult as Record<string, unknown>)[key] = result[key];
    }
  }
  return filteredResult;
}

// Sora のシグナリングURLを生成
export function createSignalingURL(
  enabledSignalingUrlCandidates: boolean,
  signalingUrlCandidates: string[],
): string | string[] {
  if (enabledSignalingUrlCandidates) {
    // 空文字列は取り除く
    return signalingUrlCandidates.filter((signalingUrlCandidate) => signalingUrlCandidate !== "");
  }
  if (import.meta.env.NODE_ENV === "development" && import.meta.env.VITE_SORA_SIGNALING_URL) {
    return import.meta.env.VITE_SORA_SIGNALING_URL;
  }
  const wsProtocol = globalThis.location.protocol === "https:" ? "wss://" : "ws://";
  const port = globalThis.location.port ? `:${globalThis.location.port}` : "";
  return `${wsProtocol + globalThis.location.hostname + port}/signaling`;
}

// 解像度に対応する width と height を返す
const videoResolutionPattern = /^(\d+)x(\d+)$/;

export function testVideoResolutionPattern(resolution: string): boolean {
  return videoResolutionPattern.test(resolution);
}

export function getVideoSizeByResolution(resolution: string): {
  width: number;
  height: number;
} {
  if (videoResolutionPattern.test(resolution)) {
    const match = resolution.match(videoResolutionPattern);
    if (match) {
      return {
        width: Number.parseInt(match[1], 10),
        height: Number.parseInt(match[2], 10),
      };
    }
  }
  return { width: 0, height: 0 };
}

// アスペクト比に対応する数値を返す
export function getValueByAspectRatio(aspectRatio: string): number {
  switch (aspectRatio) {
    case "4:3": {
      return 4 / 3;
    }
    case "16:9": {
      return 16 / 9;
    }
    case "21:9": {
      return 20 / 9;
    }
    default: {
      return Number.NaN;
    }
  }
}

// devtools の blurRadius 文字列に対する数値を返す
export function getBlurRadiusNumber(blurRadius: (typeof BLUR_RADIUS)[number]): number {
  switch (blurRadius) {
    case "": {
      return 0;
    }
    case "weak": {
      return 5;
    }
    case "medium": {
      return 10;
    }
    case "strong": {
      return 15;
    }
  }
}

// getUserMedia の audio constraints を生成
interface CreateAudioConstraintsParameters {
  audio: boolean;
  autoGainControl: (typeof AUTO_GAIN_CONTROLS)[number];
  noiseSuppression: (typeof NOISE_SUPPRESSIONS)[number];
  echoCancellation: (typeof ECHO_CANCELLATIONS)[number];
  echoCancellationType: (typeof ECHO_CANCELLATION_TYPES)[number];
  audioInput: string;
}
export function createAudioConstraints(
  parameters: CreateAudioConstraintsParameters,
): boolean | MediaTrackConstraints {
  const {
    audio,
    autoGainControl,
    noiseSuppression,
    echoCancellation,
    echoCancellationType,
    audioInput,
  } = parameters;
  if (!audio) {
    return false;
  }
  if (
    !autoGainControl &&
    !noiseSuppression &&
    !echoCancellation &&
    !echoCancellationType &&
    !audioInput
  ) {
    return audio;
  }
  const audioConstraints: SoraDevtoolsMediaTrackConstraints = {};
  if (audioInput) {
    audioConstraints.deviceId = { exact: audioInput };
  }
  const parsedAutoGainControl = parseBooleanString(autoGainControl);
  if (parsedAutoGainControl !== undefined) {
    audioConstraints.autoGainControl = parsedAutoGainControl;
  }
  const parsedNoiseSuppression = parseBooleanString(noiseSuppression);
  if (parsedNoiseSuppression !== undefined) {
    audioConstraints.noiseSuppression = parsedNoiseSuppression;
  }
  const parsedEchoCancellation = parseBooleanString(echoCancellation);
  if (parsedEchoCancellation !== undefined) {
    audioConstraints.echoCancellation = parsedEchoCancellation;
  }
  if (echoCancellationType) {
    audioConstraints.echoCancellationType = echoCancellationType;
  }
  return audioConstraints;
}

// getUserMedia の video constraints を生成
interface CreateVideoConstraintsParameters {
  aspectRatio: SoraDevtoolsState["aspectRatio"];
  frameRate: SoraDevtoolsState["frameRate"];
  resizeMode: SoraDevtoolsState["resizeMode"];
  resolution: SoraDevtoolsState["resolution"];
  video: SoraDevtoolsState["video"];
  videoInput: SoraDevtoolsState["videoInput"];
  facingMode: SoraDevtoolsState["facingMode"];
}
export function createVideoConstraints(
  parameters: CreateVideoConstraintsParameters,
): boolean | MediaTrackConstraints {
  const { video, frameRate, resolution, videoInput, aspectRatio, resizeMode, facingMode } =
    parameters;
  if (!video) {
    return false;
  }
  if (!frameRate && !resolution && !videoInput && !aspectRatio && !resizeMode && !facingMode) {
    return video;
  }
  const videoConstraints: SoraDevtoolsMediaTrackConstraints = {};
  if (frameRate) {
    const fps = Number.parseInt(frameRate, 10);
    if (!Number.isNaN(fps)) {
      videoConstraints.frameRate = {
        min: fps,
        max: fps,
      };
    }
  }
  if (resolution) {
    const { width, height } = getVideoSizeByResolution(resolution);
    if (width > 0 && height > 0) {
      videoConstraints.width = { exact: width };
      videoConstraints.height = { exact: height };
    }
  }
  if (videoInput) {
    videoConstraints.deviceId = { exact: videoInput };
  }
  if (aspectRatio) {
    videoConstraints.aspectRatio = getValueByAspectRatio(aspectRatio);
  }
  if (resizeMode) {
    videoConstraints.resizeMode = resizeMode;
  }
  if (facingMode === "front") {
    videoConstraints.facingMode = "user";
  } else if (facingMode === "back") {
    videoConstraints.facingMode = { exact: "environment" };
  }
  return videoConstraints;
}

// Fake 用の constraints を生成
interface CreateFakeMediaConstraintsParameters {
  audio: SoraDevtoolsState["audio"];
  video: SoraDevtoolsState["video"];
  frameRate: SoraDevtoolsState["frameRate"];
  resolution: SoraDevtoolsState["resolution"];
  volume: SoraDevtoolsState["fakeVolume"];
  aspectRatio: SoraDevtoolsState["aspectRatio"];
  resizeMode: SoraDevtoolsState["resizeMode"];
}
interface FakeMediaStreamConstraints {
  audio: boolean;
  video: boolean;
  frameRate: number;
  width: number;
  height: number;
  fontSize: number;
  volume: number;
  videoTrackConstraints?: SoraDevtoolsMediaTrackConstraints;
}
export function createFakeMediaConstraints(
  parameters: CreateFakeMediaConstraintsParameters,
): FakeMediaStreamConstraints {
  const { audio, video, frameRate, resolution, volume, aspectRatio, resizeMode } = parameters;
  // fake の default frameRate は 30 fps
  const fps = Number.parseInt(frameRate, 10);
  const parsedFrameRate = Number.isNaN(fps) ? 30 : fps;
  // width, height の default はそれぞれ 240 / 160
  const resolutionSize = getVideoSizeByResolution(resolution);
  const width = resolutionSize.width || 240;
  const height = resolutionSize.height || 160;
  const fontSize = Math.floor(width / 5);
  const constraints: FakeMediaStreamConstraints = {
    audio: audio,
    video: video,
    frameRate: parsedFrameRate,
    width: width,
    height: height,
    fontSize: fontSize,
    volume: Number.parseFloat(volume),
  };
  if (video && (aspectRatio || resizeMode)) {
    constraints.videoTrackConstraints = {};
    if (aspectRatio) {
      constraints.videoTrackConstraints.aspectRatio = getValueByAspectRatio(aspectRatio);
    }
    if (resizeMode) {
      constraints.videoTrackConstraints.resizeMode = resizeMode;
    }
  }
  return constraints;
}

// getDisplayMedia の audio constraints を生成
interface CreateGetDisplayMediaAudioConstraintsParameters {
  audio: SoraDevtoolsState["audio"];
  autoGainControl: (typeof AUTO_GAIN_CONTROLS)[number];
  noiseSuppression: (typeof NOISE_SUPPRESSIONS)[number];
  echoCancellation: (typeof ECHO_CANCELLATIONS)[number];
  echoCancellationType: (typeof ECHO_CANCELLATION_TYPES)[number];
}
export function createGetDisplayMediaAudioConstraints(
  parameters: CreateGetDisplayMediaAudioConstraintsParameters,
): boolean | MediaTrackConstraints {
  const { audio, autoGainControl, noiseSuppression, echoCancellation, echoCancellationType } =
    parameters;
  if (!audio) {
    return false;
  }
  if (!autoGainControl && !noiseSuppression && !echoCancellation && !echoCancellationType) {
    return true;
  }
  const audioConstraints: SoraDevtoolsMediaTrackConstraints = {};
  const parsedAutoGainControl = parseBooleanString(autoGainControl);
  if (parsedAutoGainControl !== undefined) {
    audioConstraints.autoGainControl = parsedAutoGainControl;
  }
  const parsedNoiseSuppression = parseBooleanString(noiseSuppression);
  if (parsedNoiseSuppression !== undefined) {
    audioConstraints.noiseSuppression = parsedNoiseSuppression;
  }
  const parsedEchoCancellation = parseBooleanString(echoCancellation);
  if (parsedEchoCancellation !== undefined) {
    audioConstraints.echoCancellation = parsedEchoCancellation;
  }
  if (echoCancellationType) {
    audioConstraints.echoCancellationType = echoCancellationType;
  }
  return audioConstraints;
}

// getDisplayMedia の video constraints を生成
interface CreateGetDisplayMediaVideoConstraintsParameters {
  frameRate: SoraDevtoolsState["frameRate"];
  resolution: SoraDevtoolsState["resolution"];
  aspectRatio: SoraDevtoolsState["aspectRatio"];
  resizeMode: SoraDevtoolsState["resizeMode"];
}
export function createGetDisplayMediaVideoConstraints(
  parameters: CreateGetDisplayMediaVideoConstraintsParameters,
): boolean | SoraDevtoolsMediaTrackConstraints {
  const { aspectRatio, frameRate, resizeMode, resolution } = parameters;
  if (!frameRate && !resolution && !aspectRatio && !resizeMode) {
    return true;
  }
  const videoConstraints: SoraDevtoolsMediaTrackConstraints = {};
  if (frameRate) {
    const fps = Number.parseInt(frameRate, 10);
    if (!Number.isNaN(fps)) {
      videoConstraints.frameRate = fps;
    }
  }
  if (resolution) {
    const { width, height } = getVideoSizeByResolution(resolution);
    if (width > 0 && height > 0) {
      videoConstraints.width = width;
      videoConstraints.height = height;
    }
  }
  if (aspectRatio) {
    videoConstraints.aspectRatio = getValueByAspectRatio(aspectRatio);
  }
  if (resizeMode) {
    videoConstraints.resizeMode = resizeMode;
  }
  return videoConstraints;
}

// Fake 用の MediaStream を生成
// Chrome/Edge/Safari 向け。Firefox は非対応。
export function createFakeMediaStream(parameters: FakeMediaStreamConstraints): {
  offscreenCanvas: OffscreenCanvas | null;
  mediaStream: MediaStream;
  gainNode: GainNode | null;
  audioContext: AudioContext | null;
  frameRate: number;
} {
  const mediaStream = new MediaStream();
  let offscreenCanvas: OffscreenCanvas | null = null;
  if (parameters.video) {
    const canvas = document.createElement("canvas");
    canvas.width = parameters.width;
    canvas.height = parameters.height;
    // captureStream を先に呼ぶ（transferControlToOffscreen の前に呼ぶ必要がある）
    const canvasStream = canvas.captureStream(parameters.frameRate);
    const [videoTrack] = canvasStream.getTracks();
    if (parameters.videoTrackConstraints) {
      void videoTrack.applyConstraints(parameters.videoTrackConstraints);
    }
    mediaStream.addTrack(videoTrack);
    // OffscreenCanvas に制御を移す（Worker で描画）
    offscreenCanvas = canvas.transferControlToOffscreen();
  }
  let gainNode: GainNode | null = null;
  let audioContext: AudioContext | null = null;
  if (parameters.audio) {
    const AudioContextCtor =
      globalThis.AudioContext ||
      (globalThis as unknown as Record<string, typeof globalThis.AudioContext>).webkitAudioContext;
    audioContext = new AudioContextCtor();
    const oscillator = audioContext.createOscillator();
    const selectedOscillatorType = "sine";
    oscillator.type = selectedOscillatorType;
    gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    oscillator.start(0);
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    gainNode.connect(mediaStreamDestination);
    const audioTracks = mediaStreamDestination.stream.getTracks();
    mediaStream.addTrack(audioTracks[0]);
    gainNode.gain.setValueAtTime(parameters.volume, 0);
  }
  return {
    offscreenCanvas,
    mediaStream,
    gainNode,
    audioContext,
    frameRate: parameters.frameRate,
  };
}

export function parseBooleanString(value: string): boolean | undefined {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
}

export function parseMetadata(enabledMetadata: boolean, metadata: string): Json | undefined {
  if (!enabledMetadata) {
    return undefined;
  }
  try {
    return JSON.parse(metadata);
  } catch {
    // JSON parse に失敗しても何もしない
  }
  return metadata;
}

export function getDefaultVideoCodecType(): (typeof VIDEO_CODEC_TYPES)[number] {
  // getCapabilities API が存在しない場合
  if (!globalThis.RTCRtpSender || !RTCRtpSender.getCapabilities) {
    return "VP9";
  }
  // getCapabilities APIから codec 一覧が取れない場合
  const capabilities = RTCRtpSender.getCapabilities("video");
  if (!capabilities?.codecs) {
    return "VP9";
  }
  const codecs = new Set(capabilities.codecs.map((c) => c.mimeType.replace("video/", "")));
  if (codecs.has("VP9")) {
    return "VP9";
  }
  if (codecs.has("VP8")) {
    return "VP8";
  }
  if (codecs.has("H264")) {
    return "H264";
  }
  if (codecs.has("AV1")) {
    return "AV1";
  }
  if (codecs.has("H265")) {
    return "H265";
  }
  return "VP9";
}

export async function getDevices(): Promise<MediaDeviceInfo[]> {
  // https じゃない場合などで mediaDevices が undefined になる可能性がある
  if (navigator.mediaDevices === undefined) {
    return [];
  }
  try {
    return await navigator.mediaDevices.enumerateDevices();
  } catch {
    // 例外が起きた場合は何もしない
  }
  return [];
}

// Sora との接続状態に応じて特定の Form を表示するかしないかを返す
export function isFormDisabled(
  connectionStatus: SoraDevtoolsState["soraContents"]["connectionStatus"],
): boolean {
  return (
    connectionStatus === "preparing" ||
    connectionStatus === "connected" ||
    connectionStatus === "connecting"
  );
}

// track の設定情報を返す
interface GetMediaStreamTrackProperties {
  id: MediaStreamTrack["id"];
  label: MediaStreamTrack["label"];
  kind: MediaStreamTrack["kind"];
  enabled: MediaStreamTrack["enabled"];
  muted: MediaStreamTrack["muted"];
  readyState: MediaStreamTrack["readyState"];
  contentHint: MediaStreamTrack["contentHint"];
  getConstraints: MediaTrackConstraints;
  getCapabilities: MediaTrackCapabilities | null;
  getSettings: MediaTrackSettings;
}
export function getMediaStreamTrackProperties(
  track: MediaStreamTrack,
): GetMediaStreamTrackProperties {
  return {
    id: track.id,
    label: track.label,
    kind: track.kind,
    enabled: track.enabled,
    muted: track.muted,
    readyState: track.readyState,
    contentHint: track.contentHint,
    getConstraints: track.getConstraints(),
    getCapabilities: track.getCapabilities ? track.getCapabilities() : null,
    getSettings: track.getSettings(),
  };
}

// 音声コーデックとビットレートのオプションを設定する
function applyAudioCodecOptions(
  connectionOptions: ConnectionOptions,
  connectionOptionsState: ConnectionOptionsState,
): void {
  if (connectionOptionsState.audioCodecType) {
    connectionOptions.audioCodecType = connectionOptionsState.audioCodecType;
  }
  const parsedAudioBitRate = Number.parseInt(connectionOptionsState.audioBitRate, 10);
  if (parsedAudioBitRate) {
    connectionOptions.audioBitRate = parsedAudioBitRate;
  }
  if (connectionOptionsState.enabledAudioStreamingLanguageCode) {
    connectionOptions.audioStreamingLanguageCode =
      connectionOptionsState.audioStreamingLanguageCode;
  }
}

// 映像コーデック、ビットレート、コーデックパラメータのオプションを設定する
function applyVideoCodecOptions(
  connectionOptions: ConnectionOptions,
  connectionOptionsState: ConnectionOptionsState,
): void {
  if (connectionOptionsState.videoCodecType) {
    connectionOptions.videoCodecType = connectionOptionsState.videoCodecType;
  }
  const parsedVideoBitRate = Number.parseInt(connectionOptionsState.videoBitRate, 10);
  if (parsedVideoBitRate) {
    connectionOptions.videoBitRate = parsedVideoBitRate;
  }
  if (connectionOptionsState.enabledVideoVP9Params) {
    connectionOptions.videoVP9Params = parseMetadata(true, connectionOptionsState.videoVP9Params);
  }
  if (connectionOptionsState.enabledVideoAV1Params) {
    connectionOptions.videoAV1Params = parseMetadata(true, connectionOptionsState.videoAV1Params);
  }
  if (connectionOptionsState.enabledVideoH264Params) {
    connectionOptions.videoH264Params = parseMetadata(true, connectionOptionsState.videoH264Params);
  }
  if (connectionOptionsState.enabledVideoH265Params) {
    connectionOptions.videoH265Params = parseMetadata(true, connectionOptionsState.videoH265Params);
  }
}

// spotlight 関連のオプションを設定する
function applySpotlightOptions(
  connectionOptions: ConnectionOptions,
  connectionOptionsState: ConnectionOptionsState,
): void {
  const parsedSpotlight = parseBooleanString(connectionOptionsState.spotlight);
  if (parsedSpotlight === undefined) {
    return;
  }
  connectionOptions.spotlight = parsedSpotlight;
  if (!parsedSpotlight) {
    return;
  }
  if (connectionOptionsState.spotlightNumber) {
    connectionOptions.spotlightNumber = Number.parseInt(connectionOptionsState.spotlightNumber, 10);
  }
  if (connectionOptionsState.spotlightFocusRid) {
    connectionOptions.spotlightFocusRid = connectionOptionsState.spotlightFocusRid;
  }
  if (connectionOptionsState.spotlightUnfocusRid) {
    connectionOptions.spotlightUnfocusRid = connectionOptionsState.spotlightUnfocusRid;
  }
}

// simulcast 関連のオプションを設定する
function applySimulcastOptions(
  connectionOptions: ConnectionOptions,
  connectionOptionsState: ConnectionOptionsState,
): void {
  const parsedSimulcast = parseBooleanString(connectionOptionsState.simulcast);
  if (parsedSimulcast === undefined) {
    return;
  }
  connectionOptions.simulcast = parsedSimulcast;
  if (!parsedSimulcast) {
    return;
  }
  if (connectionOptionsState.simulcastRid) {
    connectionOptions.simulcastRid = connectionOptionsState.simulcastRid;
  }
  if (connectionOptionsState.simulcastRequestRid) {
    connectionOptions.simulcastRequestRid = connectionOptionsState.simulcastRequestRid;
  }
}

// シグナリング関連のメタデータとフィルターのオプションを設定する
function applySignalingMetadataOptions(
  connectionOptions: ConnectionOptions,
  connectionOptionsState: ConnectionOptionsState,
): void {
  if (connectionOptionsState.enabledSignalingNotifyMetadata) {
    connectionOptions.signalingNotifyMetadata = parseMetadata(
      true,
      connectionOptionsState.signalingNotifyMetadata,
    );
  }
  if (connectionOptionsState.enabledForwardingFilters) {
    connectionOptions.forwardingFilters = parseMetadata(
      true,
      connectionOptionsState.forwardingFilters,
    ) as ForwardingFilter[];
  }
  if (connectionOptionsState.enabledBundleId) {
    connectionOptions.bundleId = connectionOptionsState.bundleId;
  }
  if (connectionOptionsState.enabledClientId) {
    connectionOptions.clientId = connectionOptionsState.clientId;
  }
}

// データチャネル関連のオプションを設定する
function applyDataChannelOptions(
  connectionOptions: ConnectionOptions,
  connectionOptionsState: ConnectionOptionsState,
): void {
  if (connectionOptionsState.enabledDataChannel) {
    const parsedDataChannelSignaling = parseBooleanString(
      connectionOptionsState.dataChannelSignaling,
    );
    if (parsedDataChannelSignaling !== undefined) {
      connectionOptions.dataChannelSignaling = parsedDataChannelSignaling;
    }
    const parsedIgnoreDisconnectWebSocket = parseBooleanString(
      connectionOptionsState.ignoreDisconnectWebSocket,
    );
    if (parsedIgnoreDisconnectWebSocket !== undefined) {
      connectionOptions.ignoreDisconnectWebSocket = parsedIgnoreDisconnectWebSocket;
    }
  }
  if (connectionOptionsState.dataChannels !== "") {
    let dataChannels: DataChannelConfiguration[] = [];
    try {
      dataChannels = JSON.parse(connectionOptionsState.dataChannels) as DataChannelConfiguration[];
    } catch {
      // 例外が起きた場合は何もしない
    }
    if (Array.isArray(dataChannels)) {
      connectionOptions.dataChannels = dataChannels;
    }
  }
}

// Sora の connectOptions を生成する
export function createConnectOptions(
  connectionOptionsState: ConnectionOptionsState,
): ConnectionOptions {
  const connectionOptions: ConnectionOptions = {
    audio: connectionOptionsState.audio,
    video: connectionOptionsState.video,
  };
  // recvonly の時は audio/video のパラメータを送らない
  if (connectionOptionsState.role !== "recvonly") {
    applyAudioCodecOptions(connectionOptions, connectionOptionsState);
    applyVideoCodecOptions(connectionOptions, connectionOptionsState);
  }
  // role が sendrecv か recvonly の場合は forceStereoOutput の設定を反映する
  if (connectionOptionsState.role !== "sendonly" && connectionOptionsState.forceStereoOutput) {
    connectionOptions.forceStereoOutput = connectionOptionsState.forceStereoOutput;
  }
  applySpotlightOptions(connectionOptions, connectionOptionsState);
  applySimulcastOptions(connectionOptions, connectionOptionsState);
  applySignalingMetadataOptions(connectionOptions, connectionOptionsState);
  applyDataChannelOptions(connectionOptions, connectionOptionsState);
  return connectionOptions;
}
