import queryString from "query-string";

import {
  AUDIO_BIT_RATES,
  AUDIO_CODEC_TYPES,
  ECHO_CANCELLATION_TYPES,
  FRAME_RATES,
  RESOLUTIONS,
  SIMULCAST_QUARITY,
  SPOTLIGHT_NUMBERS,
  SPOTLIGHTS,
  VIDEO_BIT_RATES,
  VIDEO_CODEC_TYPES,
} from "@/constants";

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

export function isAudioCodecType(audioCodecType: string): audioCodecType is typeof AUDIO_CODEC_TYPES[number] {
  return (AUDIO_CODEC_TYPES as readonly string[]).indexOf(audioCodecType) >= 0;
}

export function isAudioBitRate(audioBitRate: string): audioBitRate is typeof AUDIO_BIT_RATES[number] {
  return (AUDIO_BIT_RATES as readonly string[]).indexOf(audioBitRate) >= 0;
}

export function isVideoCodecType(videoCodecType: string): videoCodecType is typeof VIDEO_CODEC_TYPES[number] {
  return (VIDEO_CODEC_TYPES as readonly string[]).indexOf(videoCodecType) >= 0;
}

export function isVideoBitRate(videoBitRate: string): videoBitRate is typeof VIDEO_BIT_RATES[number] {
  return (VIDEO_BIT_RATES as readonly string[]).indexOf(videoBitRate) >= 0;
}

export function isResolution(resolution: string): resolution is typeof RESOLUTIONS[number] {
  return (RESOLUTIONS as readonly string[]).indexOf(resolution) >= 0;
}

export function isFrameRate(frameRate: string): frameRate is typeof FRAME_RATES[number] {
  return (FRAME_RATES as readonly string[]).indexOf(frameRate) >= 0;
}

export function isEchoCancellationType(
  echoCancellationType: string
): echoCancellationType is typeof ECHO_CANCELLATION_TYPES[number] {
  return (ECHO_CANCELLATION_TYPES as readonly string[]).indexOf(echoCancellationType) >= 0;
}

export function isSpotlightNumber(spotlightNumber: string): spotlightNumber is typeof SPOTLIGHT_NUMBERS[number] {
  return (SPOTLIGHT_NUMBERS as readonly string[]).indexOf(spotlightNumber) >= 0;
}

export function isSpotlight(spotlight: string): spotlight is typeof SPOTLIGHTS[number] {
  return (SPOTLIGHTS as readonly string[]).indexOf(spotlight) >= 0;
}

export function isSimulcastQuality(simulcastQuality: string): simulcastQuality is typeof SIMULCAST_QUARITY[number] {
  return (SIMULCAST_QUARITY as readonly string[]).indexOf(simulcastQuality) >= 0;
}

export type QueryStringParams = {
  audio: boolean;
  audioBitRate: typeof AUDIO_BIT_RATES[number];
  audioCodecType: typeof AUDIO_CODEC_TYPES[number];
  audioInput: string;
  audioOutput: string;
  autoGainControl: boolean;
  channelId: string;
  cpuOveruseDetection: boolean;
  debug: boolean;
  echoCancellation: boolean;
  echoCancellationType: typeof ECHO_CANCELLATION_TYPES[number];
  fake: boolean;
  fakeVolume: string;
  frameRate: typeof FRAME_RATES[number];
  getDisplayMedia: boolean;
  noiseSuppression: boolean;
  mute: boolean;
  spotlight: typeof SPOTLIGHTS[number];
  spotlightNumber: typeof SPOTLIGHT_NUMBERS[number];
  simulcastQuality: typeof SIMULCAST_QUARITY[number];
  resolution: typeof RESOLUTIONS[number];
  video: boolean;
  videoBitRate: typeof VIDEO_BIT_RATES[number];
  videoCodecType: typeof VIDEO_CODEC_TYPES[number];
  videoInput: string;
};

export function parseQueryString(): Partial<QueryStringParams> {
  const params = queryString.parse(location.search, { parseBooleans: true });
  const queryStringParams: Partial<QueryStringParams> = {};
  if (typeof params.audio === "boolean") {
    queryStringParams.audio = params.audio;
  }
  if (typeof params.audioBitRate === "string" && isAudioBitRate(params.audioBitRate)) {
    queryStringParams.audioBitRate = params.audioBitRate;
  }
  if (typeof params.audioCodecType === "string" && isAudioCodecType(params.audioCodecType)) {
    queryStringParams.audioCodecType = params.audioCodecType;
  }
  if (typeof params.autoGainControl === "boolean") {
    queryStringParams.autoGainControl = params.autoGainControl;
  }
  if (params.channelId) {
    queryStringParams.channelId = String(params.channelId);
  }
  if (typeof params.cpuOveruseDetection === "boolean") {
    queryStringParams.cpuOveruseDetection = params.cpuOveruseDetection;
  }
  if (typeof params.debug === "boolean") {
    queryStringParams.debug = params.debug;
  }
  if (typeof params.echoCancellation === "boolean") {
    queryStringParams.echoCancellation = params.echoCancellation;
  }
  if (typeof params.echoCancellationType === "string" && isEchoCancellationType(params.echoCancellationType)) {
    queryStringParams.echoCancellationType = params.echoCancellationType;
  }
  if (params.noiseSuppression && typeof params.noiseSuppression === "boolean") {
    queryStringParams.noiseSuppression = params.noiseSuppression;
  }
  if (typeof params.fake === "boolean") {
    queryStringParams.fake = params.fake;
  }
  if (params.fakeVolume) {
    queryStringParams.fakeVolume = String(params.fakeVolume);
  }
  if (params.frameRate && typeof params.frameRate === "string" && isFrameRate(params.frameRate)) {
    queryStringParams.frameRate = params.frameRate;
  }
  if (params.getDisplayMedia && typeof params.getDisplayMedia === "boolean") {
    queryStringParams.getDisplayMedia = params.getDisplayMedia;
  }
  if (
    params.simulcastQuality &&
    typeof params.simulcastQuality === "string" &&
    isSimulcastQuality(params.simulcastQuality)
  ) {
    queryStringParams.simulcastQuality = params.simulcastQuality;
  }
  if (params.spotlight && typeof params.spotlight === "string" && isSpotlight(params.spotlight)) {
    queryStringParams.spotlight = params.spotlight;
  }
  if (
    params.spotlightNumber &&
    typeof params.spotlightNumber === "string" &&
    isSpotlightNumber(params.spotlightNumber)
  ) {
    queryStringParams.spotlightNumber = params.spotlightNumber;
  }
  if (params.resolution && typeof params.resolution === "string" && isResolution(params.resolution)) {
    queryStringParams.resolution = params.resolution;
  }
  if (params.video && typeof params.video === "boolean") {
    queryStringParams.video = params.video;
  }
  if (params.videoBitRate && typeof params.videoBitRate === "string" && isVideoBitRate(params.videoBitRate)) {
    queryStringParams.videoBitRate = params.videoBitRate;
  }
  if (params.videoCodecType && typeof params.videoCodecType === "string" && isVideoCodecType(params.videoCodecType)) {
    queryStringParams.videoCodecType = params.videoCodecType;
  }
  if (params.audioInput) {
    queryStringParams.audioInput = String(params.audioInput);
  }
  if (params.videoInput) {
    queryStringParams.videoInput = String(params.videoInput);
  }
  if (params.audioOutput) {
    queryStringParams.audioOutput = String(params.audioOutput);
  }
  if (typeof params.mute === "boolean") {
    queryStringParams.mute = params.mute;
  }
  return queryStringParams;
}

export function createSignalingURL(): string {
  if (process.env.NODE_ENV === "development") {
    return "ws://localhost:5000/signaling";
  }
  const protocol = window.location.protocol;
  let wsProtocol = "ws://";
  if (protocol == "https:") {
    wsProtocol = "wss://";
  }
  let port = window.location.port;
  if (port) {
    port = ":" + port;
  }
  return wsProtocol + window.location.hostname + port + "/signaling";
}

type ResolutionSize = {
  width: number;
  height: number;
};
function getVideoSizeByResolution(resolution: string): ResolutionSize {
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

interface SoraDemoMediaTrackConstraints extends MediaTrackConstraints {
  echoCancellationType?: "system" | "browser";
}
function createAudioConstraints(
  audio: boolean | undefined,
  autoGainControl: boolean | undefined,
  noiseSuppression: boolean | undefined,
  echoCancellation: boolean | undefined,
  echoCancellationType: typeof ECHO_CANCELLATION_TYPES[number] | undefined,
  audioInput: string | undefined
): boolean | MediaTrackConstraints {
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

function createVideoConstraints(
  video: boolean | undefined,
  frameRate: string | undefined,
  resolution: string | undefined,
  videoInput: string | undefined
): boolean | MediaTrackConstraints {
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

type CreateGetUserMediaConstraintsParams = {
  audio?: boolean;
  autoGainControl?: boolean;
  noiseSuppression?: boolean;
  echoCancellation?: boolean;
  echoCancellationType?: typeof ECHO_CANCELLATION_TYPES[number];
  video?: boolean;
  frameRate?: string;
  resolution?: string;
  audioInput?: string;
  videoInput?: string;
};
export function createGetUserMediaConstraints(params: CreateGetUserMediaConstraintsParams): MediaStreamConstraints {
  return {
    audio: createAudioConstraints(
      params.audio,
      params.autoGainControl,
      params.noiseSuppression,
      params.echoCancellation,
      params.echoCancellationType,
      params.audioInput
    ),
    video: createVideoConstraints(params.video, params.frameRate, params.resolution, params.videoInput),
  };
}

export interface SoraDemoMediaDevices extends MediaDevices {
  getDisplayMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
}

export type SoraLogMessage = {
  timestamp: number;
  title: string;
  description: string;
};

export type DebugType = "log" | "notify" | "stats";

export type SoraNotifyMessage = {
  type: string;
  event_type: string;
  timestamp: number;
  [x: string]: unknown;
};

export type EnabledParameters = {
  enabledAudio?: boolean;
  enabledAudioBitRate?: boolean;
  enabledAudioCodecType?: boolean;
  enabledAudioInput?: boolean;
  enabledAudioOutput?: boolean;
  enabledAutoGainControl?: boolean;
  enabledChannelId?: boolean;
  enabledCpuOveruseDetection?: boolean;
  enabledEchoCancellation?: boolean;
  enabledEchoCancellationType?: boolean;
  enabledFake?: boolean;
  enabledFrameRate?: boolean;
  enabledGetDisplayMedia?: boolean;
  enabledNoiseSuppression?: boolean;
  enabledResolution?: boolean;
  enabledSimulcastQuality?: boolean;
  enabledSpotlight?: boolean;
  enabledSpotlightNumber?: boolean;
  enabledVideo?: boolean;
  enabledVideoBitRate?: boolean;
  enabledVideoCodecType?: boolean;
  enabledVideoInput?: boolean;
};

export interface CustomHTMLCanvasElement extends HTMLCanvasElement {
  captureStream(fps?: number): MediaStream;
}

type FakeMediaStreamConstraints = {
  audio: boolean;
  video: boolean;
  frameRate: number;
  width: number;
  height: number;
  fontSize: number;
  volume: number;
};
export function createFakeMediaStream(
  params: FakeMediaStreamConstraints
): { canvas: CustomHTMLCanvasElement; stream: MediaStream; gainNode: GainNode } {
  const stream = new MediaStream();
  const canvas = document.createElement("canvas") as CustomHTMLCanvasElement;
  canvas.width = params.width;
  canvas.height = params.height;
  const cancasStream = canvas.captureStream(params.frameRate);
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
  gainNode.gain.setValueAtTime(params.volume, 0);
  return { canvas, stream, gainNode };
}

function calcTextX(canvasWidth: number, textLength: number, fontSize: number): number {
  const x = canvasWidth / 2 - fontSize / 2;
  const margin = (fontSize / 4) * (textLength - 1);
  return x - margin;
}

function calcTextY(canvasHeight: number, fontSize: number): number {
  const y = canvasHeight / 2 + fontSize / 2.5;
  return y;
}

export function drawCanvas(
  canvas: CustomHTMLCanvasElement | null,
  colorCode: number,
  fontSize: number,
  text: string
): void {
  if (canvas === null) return;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.globalCompositeOperation = "source-over";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#" + ("0".repeat(6) + colorCode.toString(16)).slice(-6);
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#" + ("0".repeat(6) + (0xffffff - colorCode).toString(16)).slice(-6);
  context.font = `${fontSize}px Arial`;
  context.fillText(text, calcTextX(canvas.width, text.length, fontSize), calcTextY(canvas.height, fontSize));
}

type CreateFakeMediaConstraintsParams = {
  audio: boolean;
  video: boolean;
  frameRate: string;
  resolution: string;
  volume: string;
};
export function createFakeMediaConstraints(params: CreateFakeMediaConstraintsParams): FakeMediaStreamConstraints {
  // fake の default frameRate は 30 fps
  const frameRate = parseInt(params.frameRate, 10) || 30;
  // width, height の default はそれぞれ 240 / 160
  let { width, height } = getVideoSizeByResolution(params.resolution);
  width = width || 240;
  height = height || 160;
  const fontSize = Math.floor(width / 5);
  return {
    audio: params.audio,
    video: params.video,
    frameRate: frameRate,
    width: width,
    height: height,
    fontSize: fontSize,
    volume: parseFloat(params.volume),
  };
}
// 新/旧 spotlight の互換性を保つための parser
export function parseSpotlight(spotlight: string): boolean | number | undefined {
  if (spotlight === "true") return true;
  if (!spotlight) return undefined;
  const numberSpotlight = parseInt(spotlight, 10);
  if (isNaN(numberSpotlight)) return undefined;
  return numberSpotlight;
}
