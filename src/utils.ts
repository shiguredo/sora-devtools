import queryString from "query-string";

import {
  AUDIO_BIT_RATES,
  AUDIO_CODEC_TYPES,
  DATA_CHANNEL_SIGNALING,
  DISPLAY_RESOLUTIONS,
  ECHO_CANCELLATION_TYPES,
  FRAME_RATES,
  IGNORE_DISCONNECT_WEBSOCKET,
  MEDIA_TYPES,
  RESOLUTIONS,
  SIMULCAST_RID,
  SPOTLIGHT_FOCUS_RIDS,
  SPOTLIGHT_NUMBERS,
  SPOTLIGHTS,
  VIDEO_BIT_RATES,
  VIDEO_CODEC_TYPES,
} from "@/constants";

// HTMLCanvasElement interface に captureStream を追加
interface CustomHTMLCanvasElement extends HTMLCanvasElement {
  captureStream(fps?: number): MediaStream;
}

// MediaTrackConstraints interface に echoCancellationType を追加
interface SoraDemoMediaTrackConstraints extends MediaTrackConstraints {
  echoCancellationType?: "system" | "browser";
}

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | {
      [prop: string]: Json | undefined;
    };

// Sora demo の接続種類
export type ConnectType = "sendonly" | "sendrecv" | "recvonly";

// HTMLVideoElement interface に setSinkId を追加
export interface CustomHTMLVideoElement extends HTMLVideoElement {
  setSinkId(audioId: string): void;
}

// MediaDevices interface に getDisplayMedia を追加
export interface SoraDemoMediaDevices extends MediaDevices {
  getDisplayMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
}

// RTCMediaStreamTrackStats に jitterBuffer 関連を追加
export interface ExpansionRTCMediaStreamTrackStats extends RTCMediaStreamTrackStats {
  jitterBufferDelay: number;
  jitterBufferEmittedCount: number;
  prevJitterBufferDelay: number;
  prevJitterBufferEmittedCount: number;
}

// 各 page で有効にするパラメーターを指定するための Type
export type EnabledParameters = {
  audio?: boolean;
  audioBitRate?: boolean;
  audioCodecType?: boolean;
  audioInput?: boolean;
  audioOutput?: boolean;
  autoGainControl?: boolean;
  clientId?: boolean;
  channelId?: boolean;
  dataChannel?: boolean;
  displayResolution?: boolean;
  e2ee?: boolean;
  echoCancellation?: boolean;
  echoCancellationType?: boolean;
  frameRate?: boolean;
  mediaType?: boolean;
  metadata?: boolean;
  noiseSuppression?: boolean;
  resolution?: boolean;
  signalingNotifyMetadata?: boolean;
  simulcastRid?: boolean;
  spotlight?: boolean;
  spotlightFocusRid?: boolean;
  spotlightNumber?: boolean;
  spotlightUnfocusRid?: boolean;
  video?: boolean;
  videoBitRate?: boolean;
  videoCodecType?: boolean;
  videoInput?: boolean;
};

// Debug log message の Type
export type LogMessage = {
  timestamp: number;
  message: {
    title: string;
    description: string;
  };
};

// Sora on notify callback の引数 Type
export type SoraNotifyMessage = {
  type: "notify";
  event_type: string;
  [x: string]: unknown;
};

// Debug notify message の Type
export type NotifyMessage = {
  timestamp: number;
  message: SoraNotifyMessage;
  transportType: string;
};

// Sora on push callback の引数 Type
export type SoraPushMessage = {
  type: "push";
  data: {
    [x: string]: unknown;
  };
};

// Debug push message の Type
export type PushMessage = {
  timestamp: number;
  message: SoraPushMessage;
  transportType: string;
};

// Debug data channel message の Type
export type DataChannelMessage = {
  timestamp: number;
  id: number | null;
  label: string;
  type: string;
  data: {
    binaryType: RTCDataChannel["binaryType"];
    bufferedAmount: RTCDataChannel["bufferedAmount"];
    bufferedAmountLowThreshold: RTCDataChannel["bufferedAmountLowThreshold"];
    id: RTCDataChannel["id"];
    label: RTCDataChannel["label"];
    maxPacketLifeTime: RTCDataChannel["maxPacketLifeTime"];
    maxRetransmits: RTCDataChannel["maxRetransmits"];
    negotiated: RTCDataChannel["negotiated"];
    ordered: RTCDataChannel["ordered"];
    protocol: RTCDataChannel["protocol"];
    readyState: RTCDataChannel["readyState"];
  };
};

// Debug signaling message の Type
export type SignalingMessage = {
  timestamp: number;
  type: string;
  transportType?: "websocket" | "datachannel";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
};

// 画面表示する message の Type
export type AlertMessage = {
  timestamp: number;
  type: "error" | "info";
  title: string;
  message: string;
};

// Debug 表示タブ選択状態用の Type
export type DebugType = "log" | "notify" | "push" | "stats" | "datachannel" | "signaling";

// UNIX time を 年-月-日 時:分:秒:ミリ秒 形式に変換
export function formatUnixtime(time: number): string {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const millisecond = date.getMilliseconds();
  return `${year}-${month}-${day} ${hour}:${minute}:${second}.${millisecond}`;
}

// OS の Clipboard にテキストを書き込む
export function copy2clipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }

  const textarea = document.createElement("textarea");
  textarea.style.position = "absolute";
  textarea.style.top = "-1000px";
  textarea.innerText = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } catch (error) {
    Promise.reject(error);
  }
  document.body.removeChild(textarea);
  return Promise.resolve();
}

// AudioCodecType の Type Guard
export function isAudioCodecType(audioCodecType: string): audioCodecType is typeof AUDIO_CODEC_TYPES[number] {
  return (AUDIO_CODEC_TYPES as readonly string[]).indexOf(audioCodecType) >= 0;
}

// AudioBitRate の Type Guard
export function isAudioBitRate(audioBitRate: string): audioBitRate is typeof AUDIO_BIT_RATES[number] {
  return (AUDIO_BIT_RATES as readonly string[]).indexOf(audioBitRate) >= 0;
}

// VideoCodecType の Type Guard
export function isVideoCodecType(videoCodecType: string): videoCodecType is typeof VIDEO_CODEC_TYPES[number] {
  return (VIDEO_CODEC_TYPES as readonly string[]).indexOf(videoCodecType) >= 0;
}

// VideoBitRate の Type Guard
export function isVideoBitRate(videoBitRate: string): videoBitRate is typeof VIDEO_BIT_RATES[number] {
  return (VIDEO_BIT_RATES as readonly string[]).indexOf(videoBitRate) >= 0;
}

// Resolution の Type Guard
export function isResolution(resolution: string): resolution is typeof RESOLUTIONS[number] {
  return (RESOLUTIONS as readonly string[]).indexOf(resolution) >= 0;
}

// DisplayResolution の Type Guard
export function isDisplayResolution(
  displayResolution: string
): displayResolution is typeof DISPLAY_RESOLUTIONS[number] {
  return (DISPLAY_RESOLUTIONS as readonly string[]).indexOf(displayResolution) >= 0;
}

// FrameRate の Type Guard
export function isFrameRate(frameRate: string): frameRate is typeof FRAME_RATES[number] {
  return (FRAME_RATES as readonly string[]).indexOf(frameRate) >= 0;
}

// EchoCancellationType の Type Guard
export function isEchoCancellationType(
  echoCancellationType: string
): echoCancellationType is typeof ECHO_CANCELLATION_TYPES[number] {
  return (ECHO_CANCELLATION_TYPES as readonly string[]).indexOf(echoCancellationType) >= 0;
}

// SpotlightNumber の Type Guard
export function isSpotlightNumber(spotlightNumber: string): spotlightNumber is typeof SPOTLIGHT_NUMBERS[number] {
  return (SPOTLIGHT_NUMBERS as readonly string[]).indexOf(spotlightNumber) >= 0;
}

// Spotlight の Type Guard
export function isSpotlight(spotlight: string): spotlight is typeof SPOTLIGHTS[number] {
  return (SPOTLIGHTS as readonly string[]).indexOf(spotlight) >= 0;
}

// SpotlightFocusRid / SpotlightUnfocusRid の Type Guard
export function isSpotlightFocusRid(
  spotlightFocusRid: string
): spotlightFocusRid is typeof SPOTLIGHT_FOCUS_RIDS[number] {
  return (SPOTLIGHT_FOCUS_RIDS as readonly string[]).indexOf(spotlightFocusRid) >= 0;
}

// SimulcastQuality の Type Guard
export function isSimulcastRid(simulcastRid: string): simulcastRid is typeof SIMULCAST_RID[number] {
  return (SIMULCAST_RID as readonly string[]).indexOf(simulcastRid) >= 0;
}

// MediaType の Type Guard
export function isMediaType(mediaType: string): mediaType is typeof MEDIA_TYPES[number] {
  return (MEDIA_TYPES as readonly string[]).indexOf(mediaType) >= 0;
}

// DataChannelSignaling の Type Guard
export function isDataChannelSignaling(
  dataChannelSignaling: string
): dataChannelSignaling is typeof DATA_CHANNEL_SIGNALING[number] {
  return (DATA_CHANNEL_SIGNALING as readonly string[]).indexOf(dataChannelSignaling) >= 0;
}

// IgnoreDisconnectWebSocket の Type Guard
export function isIgnoreDisconnectWebSocket(
  ignoreDisconnectWebSocket: string
): ignoreDisconnectWebSocket is typeof IGNORE_DISCONNECT_WEBSOCKET[number] {
  return (IGNORE_DISCONNECT_WEBSOCKET as readonly string[]).indexOf(ignoreDisconnectWebSocket) >= 0;
}

// クエリ文字列から取得する parameter の Type
export type QueryStringParameters = {
  audio: boolean;
  audioBitRate: typeof AUDIO_BIT_RATES[number];
  audioCodecType: typeof AUDIO_CODEC_TYPES[number];
  audioInput: string;
  audioOutput: string;
  autoGainControl: boolean;
  channelId: string;
  clientId: string;
  dataChannelSignaling: typeof DATA_CHANNEL_SIGNALING[number];
  debug: boolean;
  displayResolution: typeof DISPLAY_RESOLUTIONS[number];
  e2ee: boolean;
  echoCancellation: boolean;
  echoCancellationType: typeof ECHO_CANCELLATION_TYPES[number];
  fakeVolume: string;
  frameRate: typeof FRAME_RATES[number];
  googCpuOveruseDetection: boolean;
  ignoreDisconnectWebSocket: typeof IGNORE_DISCONNECT_WEBSOCKET[number];
  mediaType: typeof MEDIA_TYPES[number];
  metadata: string;
  mute: boolean;
  noiseSuppression: boolean;
  resolution: typeof RESOLUTIONS[number];
  showStats: boolean;
  signalingNotifyMetadata: string;
  simulcastRid: typeof SIMULCAST_RID[number];
  spotlight: typeof SPOTLIGHTS[number];
  spotlightFocusRid: typeof SPOTLIGHT_FOCUS_RIDS[number];
  spotlightNumber: typeof SPOTLIGHT_NUMBERS[number];
  spotlightUnfocusRid: typeof SPOTLIGHT_FOCUS_RIDS[number];
  video: boolean;
  videoBitRate: typeof VIDEO_BIT_RATES[number];
  videoCodecType: typeof VIDEO_CODEC_TYPES[number];
  videoInput: string;
};

// クエリ文字列パーサー
export function parseQueryString(): Partial<QueryStringParameters> {
  const {
    audio,
    audioBitRate,
    audioCodecType,
    audioInput,
    audioOutput,
    autoGainControl,
    channelId,
    clientId,
    debug,
    dataChannelSignaling,
    displayResolution,
    e2ee,
    echoCancellation,
    echoCancellationType,
    fakeVolume,
    frameRate,
    googCpuOveruseDetection,
    ignoreDisconnectWebSocket,
    mediaType,
    metadata,
    noiseSuppression,
    mute,
    showStats,
    signalingNotifyMetadata,
    spotlight,
    spotlightNumber,
    spotlightFocusRid,
    spotlightUnfocusRid,
    simulcastRid,
    resolution,
    video,
    videoBitRate,
    videoCodecType,
    videoInput,
  } = queryString.parse(location.search, { parseBooleans: true });
  const queryStringParameters: Partial<QueryStringParameters> = {};
  if (typeof audio === "boolean") {
    queryStringParameters.audio = audio;
  }
  if (typeof audioBitRate === "string" && isAudioBitRate(audioBitRate)) {
    queryStringParameters.audioBitRate = audioBitRate;
  }
  if (typeof audioCodecType === "string" && isAudioCodecType(audioCodecType)) {
    queryStringParameters.audioCodecType = audioCodecType;
  }
  if (typeof autoGainControl === "boolean") {
    queryStringParameters.autoGainControl = autoGainControl;
  }
  if (channelId !== undefined) {
    queryStringParameters.channelId = String(channelId);
  }
  if (clientId !== undefined) {
    queryStringParameters.clientId = String(clientId);
  }
  if (typeof googCpuOveruseDetection === "boolean") {
    queryStringParameters.googCpuOveruseDetection = googCpuOveruseDetection;
  }
  if (typeof debug === "boolean") {
    queryStringParameters.debug = debug;
  }
  if (typeof displayResolution === "string" && isDisplayResolution(displayResolution)) {
    queryStringParameters.displayResolution = displayResolution;
  }
  if (typeof e2ee === "boolean") {
    queryStringParameters.e2ee = e2ee;
  }
  if (typeof echoCancellation === "boolean") {
    queryStringParameters.echoCancellation = echoCancellation;
  }
  if (typeof echoCancellationType === "string" && isEchoCancellationType(echoCancellationType)) {
    queryStringParameters.echoCancellationType = echoCancellationType;
  }
  if (typeof noiseSuppression === "boolean") {
    queryStringParameters.noiseSuppression = noiseSuppression;
  }
  if (fakeVolume) {
    queryStringParameters.fakeVolume = String(fakeVolume);
  }
  if (typeof frameRate === "string" && isFrameRate(frameRate)) {
    queryStringParameters.frameRate = frameRate;
  }
  if (typeof mediaType === "string" && isMediaType(mediaType)) {
    queryStringParameters.mediaType = mediaType;
  }
  if (metadata) {
    queryStringParameters.metadata = String(metadata);
  }
  if (typeof showStats === "boolean") {
    queryStringParameters.showStats = showStats;
  }
  if (signalingNotifyMetadata) {
    queryStringParameters.signalingNotifyMetadata = String(signalingNotifyMetadata);
  }
  if (typeof simulcastRid === "string" && isSimulcastRid(simulcastRid)) {
    queryStringParameters.simulcastRid = simulcastRid;
  }
  if (typeof spotlight === "string" && isSpotlight(spotlight)) {
    queryStringParameters.spotlight = spotlight;
  }
  if (typeof spotlightNumber === "string" && isSpotlightNumber(spotlightNumber)) {
    queryStringParameters.spotlightNumber = spotlightNumber;
  }
  if (typeof spotlightFocusRid === "string" && isSpotlightFocusRid(spotlightFocusRid)) {
    queryStringParameters.spotlightFocusRid = spotlightFocusRid;
  }
  if (typeof spotlightUnfocusRid === "string" && isSpotlightFocusRid(spotlightUnfocusRid)) {
    queryStringParameters.spotlightUnfocusRid = spotlightUnfocusRid;
  }
  if (typeof resolution === "string" && isResolution(resolution)) {
    queryStringParameters.resolution = resolution;
  }
  if (typeof video === "boolean") {
    queryStringParameters.video = video;
  }
  if (typeof videoBitRate === "string" && isVideoBitRate(videoBitRate)) {
    queryStringParameters.videoBitRate = videoBitRate;
  }
  if (typeof videoCodecType === "string" && isVideoCodecType(videoCodecType)) {
    queryStringParameters.videoCodecType = videoCodecType;
  }
  if (audioInput) {
    queryStringParameters.audioInput = String(audioInput);
  }
  if (videoInput) {
    queryStringParameters.videoInput = String(videoInput);
  }
  if (audioOutput) {
    queryStringParameters.audioOutput = String(audioOutput);
  }
  if (typeof mute === "boolean") {
    queryStringParameters.mute = mute;
  }
  const stringDataChannelSignaling = String(dataChannelSignaling);
  if (isDataChannelSignaling(stringDataChannelSignaling)) {
    queryStringParameters.dataChannelSignaling = stringDataChannelSignaling;
  }
  const stringIgnoreDisconnectWebSocket = String(ignoreDisconnectWebSocket);
  if (isIgnoreDisconnectWebSocket(stringIgnoreDisconnectWebSocket)) {
    queryStringParameters.ignoreDisconnectWebSocket = stringIgnoreDisconnectWebSocket;
  }
  return queryStringParameters;
}

// Sora のシグナリングURLを生成
export function createSignalingURL(): string {
  if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_SORA_SIGNALING_URL) {
    return process.env.NEXT_PUBLIC_SORA_SIGNALING_URL;
  }
  const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
  const port = window.location.port ? `:${window.location.port}` : "";
  return wsProtocol + window.location.hostname + port + "/signaling";
}

// 解像度に対応する width と height を返す
export function getVideoSizeByResolution(resolution: string): { width: number; height: number } {
  switch (resolution) {
    case "QQVGA":
      return { width: 160, height: 120 };
    case "QCIF":
      return { width: 176, height: 144 };
    case "HQVGA":
      return { width: 240, height: 160 };
    case "QVGA":
      return { width: 320, height: 240 };
    case "VGA":
      return { width: 640, height: 480 };
    case "SD":
      return { width: 720, height: 480 };
    case "HD":
      return { width: 1280, height: 720 };
    case "FHD":
      return { width: 1920, height: 1080 };
    case "UHD 3840x2160":
      return { width: 3840, height: 2160 };
    case "UHD 4096x2160":
      return { width: 4096, height: 2160 };
    case "3840x1920":
      return { width: 3840, height: 1920 };
    default:
      return { width: 0, height: 0 };
  }
}

// getUserMedia の audio constraints を生成
type CreateAudioConstraintsParameters = {
  audio: boolean;
  autoGainControl: boolean;
  noiseSuppression: boolean;
  echoCancellation: boolean;
  echoCancellationType: typeof ECHO_CANCELLATION_TYPES[number];
  audioInput: string;
};
export function createAudioConstraints(parameters: CreateAudioConstraintsParameters): boolean | MediaTrackConstraints {
  const { audio, autoGainControl, noiseSuppression, echoCancellation, echoCancellationType, audioInput } = parameters;
  if (!audio) {
    return false;
  }
  const audioConstraints: SoraDemoMediaTrackConstraints = {};
  if (audioInput) {
    audioConstraints.deviceId = { exact: audioInput };
  }
  audioConstraints.autoGainControl = autoGainControl;
  audioConstraints.noiseSuppression = noiseSuppression;
  audioConstraints.echoCancellation = echoCancellation;
  if (echoCancellationType) {
    audioConstraints.echoCancellationType = echoCancellationType;
  }
  return audioConstraints;
}

// getUserMedia の video constraints を生成
type CreateVideoConstraintsParameters = {
  video: boolean;
  frameRate: string;
  resolution: string;
  videoInput: string;
};
export function createVideoConstraints(parameters: CreateVideoConstraintsParameters): boolean | MediaTrackConstraints {
  const { video, frameRate, resolution, videoInput } = parameters;
  if (!video) {
    return false;
  }
  if (!frameRate && !resolution && !videoInput) {
    return video;
  }
  const videoConstraints: MediaTrackConstraints = {};
  if (frameRate) {
    videoConstraints.frameRate = { min: parseInt(frameRate, 10), max: parseInt(frameRate, 10) };
  }
  if (resolution) {
    const { width, height } = getVideoSizeByResolution(resolution);
    if (0 < width && 0 < height) {
      videoConstraints.width = { exact: width };
      videoConstraints.height = { exact: height };
    }
  }
  if (videoInput) {
    videoConstraints.deviceId = { exact: videoInput };
  }
  return videoConstraints;
}

// Fake 用の constraints を生成
type CreateFakeMediaConstraintsParameters = {
  audio: boolean;
  video: boolean;
  frameRate: string;
  resolution: string;
  volume: string;
};
type FakeMediaStreamConstraints = {
  audio: boolean;
  video: boolean;
  frameRate: number;
  width: number;
  height: number;
  fontSize: number;
  volume: number;
};
export function createFakeMediaConstraints(
  parameters: CreateFakeMediaConstraintsParameters
): FakeMediaStreamConstraints {
  // fake の default frameRate は 30 fps
  const frameRate = parseInt(parameters.frameRate, 10) || 30;
  // width, height の default はそれぞれ 240 / 160
  const resolutionSize = getVideoSizeByResolution(parameters.resolution);
  const width = resolutionSize.width || 240;
  const height = resolutionSize.height || 160;
  const fontSize = Math.floor(width / 5);
  return {
    audio: parameters.audio,
    video: parameters.video,
    frameRate: frameRate,
    width: width,
    height: height,
    fontSize: fontSize,
    volume: parseFloat(parameters.volume),
  };
}

// Fake 用の MediaStream を生成
export function createFakeMediaStream(
  parameters: FakeMediaStreamConstraints
): { canvas: CustomHTMLCanvasElement; stream: MediaStream; gainNode: GainNode } {
  const stream = new MediaStream();
  const canvas = document.createElement("canvas") as CustomHTMLCanvasElement;
  // Firefox では getContext を呼ばないと captureStream が失敗する
  canvas.getContext("2d");
  canvas.width = parameters.width;
  canvas.height = parameters.height;
  const cancasStream = canvas.captureStream(parameters.frameRate);
  const videoTracks = cancasStream.getTracks();
  stream.addTrack(videoTracks[0]);
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const selectedOscillatorType = "sine";
  oscillator.type = selectedOscillatorType;
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  oscillator.start(0);
  const mediaStreamDestination = audioContext.createMediaStreamDestination();
  gainNode.connect(mediaStreamDestination);
  const audioTracks = mediaStreamDestination.stream.getTracks();
  stream.addTrack(audioTracks[0]);
  gainNode.gain.setValueAtTime(parameters.volume, 0);
  return { canvas, stream, gainNode };
}

// Fake mediastream を生成するための canvas に書き込みをする
export function drawFakeCanvas(
  canvas: CustomHTMLCanvasElement | null,
  colorCode: number,
  fontSize: number,
  text: string
): void {
  if (canvas === null) {
    return;
  }
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  context.globalCompositeOperation = "source-over";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#" + ("0".repeat(6) + colorCode.toString(16)).slice(-6);
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#" + ("0".repeat(6) + (0xffffff - colorCode).toString(16)).slice(-6);
  context.font = `${fontSize}px Arial`;
  const x = canvas.width / 2 - fontSize / 2;
  const margin = (fontSize / 4) * (text.length - 1);
  const y = canvas.height / 2 + fontSize / 2.5;
  context.fillText(text, x - margin, y);
}

// 新/旧 spotlight の互換性を保つための parser
export function parseSpotlight(spotlight: string): boolean | number {
  if (spotlight === "true") {
    return true;
  }
  const numberSpotlight = parseInt(spotlight, 10);
  if (isNaN(numberSpotlight)) {
    return false;
  }
  return numberSpotlight;
}

export function parseMetadata(enabledMetadata: boolean, metadata: string): Json | undefined {
  if (!enabledMetadata) {
    return undefined;
  }
  try {
    return JSON.parse(metadata);
  } catch (_e) {
    // JSON parse に失敗しても何もしない
  }
  return metadata;
}

export function getDefaultVideoCodecType(
  initialValue: typeof VIDEO_CODEC_TYPES[number]
): typeof VIDEO_CODEC_TYPES[number] {
  if (!RTCRtpSender.getCapabilities) {
    return initialValue;
  }
  const capabilities = RTCRtpSender.getCapabilities("video");
  if (!capabilities || !capabilities.codecs) {
    return initialValue;
  }
  const codecs = capabilities.codecs.map((c) => c.mimeType.replace("video/", ""));
  if (codecs.includes(initialValue)) {
    return initialValue;
  }
  if (codecs.includes("VP9")) {
    return "VP9";
  }
  if (codecs.includes("VP8")) {
    return "VP8";
  }
  if (codecs.includes("H264")) {
    return "H264";
  }
  if (codecs.includes("AV1X")) {
    return "AV1";
  }
  if (codecs.includes("H265")) {
    return "H265";
  }
  return initialValue;
}
