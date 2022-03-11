// import queryString from "query-string";
import type { ConnectionOptions } from "sora-js-sdk";

import {
  // ASPECT_RATIO_TYPES,
  // AUDIO_BIT_RATES,
  // AUDIO_CODEC_TYPES,
  // AUDIO_CONTENT_HINTS,
  AUTO_GAIN_CONTROLS,
  BLUR_RADIUS,
  // DATA_CHANNEL_SIGNALING,
  // DEBUG_TYPES,
  // DISPLAY_RESOLUTIONS,
  ECHO_CANCELLATION_TYPES,
  ECHO_CANCELLATIONS,
  // FRAME_RATES,
  // IGNORE_DISCONNECT_WEBSOCKET,
  // MEDIA_TYPES,
  // MULTISTREAM,
  NOISE_SUPPRESSIONS,
  // RESIZE_MODE_TYPES,
  // RESOLUTIONS,
  // SIMULCAST,
  // SIMULCAST_RID,
  // SPOTLIGHT,
  // SPOTLIGHT_FOCUS_RIDS,
  // SPOTLIGHT_NUMBERS,
  // VIDEO_BIT_RATES,
  VIDEO_CODEC_TYPES,
  // VIDEO_CONTENT_HINTS,
} from "@/constants";
import type {
  ConnectionOptionsState,
  CustomHTMLCanvasElement,
  Json,
  QueryStringParameters,
  SoraDevtoolsMediaTrackConstraints,
  SoraDevtoolsState,
} from "@/types";

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
export function copy2clipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.resolve();
}

// Form の Type Guard
export function checkFormValue<T extends readonly string[]>(
  value: string,
  candidates: T
): value is typeof candidates[number] {
  return candidates.indexOf(value) >= 0;
}

// クエリ文字列パーサー
export function parseQueryString(): Partial<QueryStringParameters> {
  // const {
  //   apiUrl,
  //   aspectRatio,
  //   audio,
  //   audioBitRate,
  //   audioCodecType,
  //   audioContentHint,
  //   audioInput,
  //   audioOutput,
  //   audioTrack,
  //   autoGainControl,
  //   blurRadius,
  //   cameraDevice,
  //   channelId,
  //   clientId,
  //   dataChannelSignaling,
  //   dataChannels,
  //   debug,
  //   debugType,
  //   displayResolution,
  //   e2ee,
  //   echoCancellation,
  //   echoCancellationType,
  //   fakeVolume,
  //   frameRate,
  //   googCpuOveruseDetection,
  //   ignoreDisconnectWebSocket,
  //   mediaType,
  //   metadata,
  //   micDevice,
  //   mute,
  //   mediaProcessorsNoiseSuppression,
  //   noiseSuppression,
  //   reconnect,
  //   resizeMode,
  //   resolution,
  //   showStats,
  //   signalingNotifyMetadata,
  //   signalingUrlCandidates,
  //   simulcast,
  //   simulcastRid,
  //   spotlightFocusRid,
  //   spotlightNumber,
  //   spotlightUnfocusRid,
  //   video,
  //   videoBitRate,
  //   videoCodecType,
  //   videoContentHint,
  //   videoInput,
  //   videoTrack,
  // } = queryString.parse(location.search, { parseBooleans: true });
  const queryStringParameters: Partial<QueryStringParameters> = {};
  // if (typeof apiUrl === "string") {
  //   queryStringParameters.apiUrl = apiUrl;
  // }
  // if (typeof audio === "boolean") {
  //   queryStringParameters.audio = audio;
  // }
  // if (typeof audioBitRate === "string" && isAudioBitRate(audioBitRate)) {
  //   queryStringParameters.audioBitRate = audioBitRate;
  // }
  // if (typeof audioCodecType === "string" && isAudioCodecType(audioCodecType)) {
  //   queryStringParameters.audioCodecType = audioCodecType;
  // }
  // const stringAutoGainControl = String(autoGainControl);
  // if (isAutoGainControl(stringAutoGainControl)) {
  //   queryStringParameters.autoGainControl = stringAutoGainControl;
  // }
  // if (channelId !== undefined) {
  //   queryStringParameters.channelId = String(channelId);
  // }
  // if (clientId !== undefined) {
  //   queryStringParameters.clientId = String(clientId);
  // }
  // if (typeof googCpuOveruseDetection === "boolean") {
  //   queryStringParameters.googCpuOveruseDetection = googCpuOveruseDetection;
  // }
  // if (typeof debug === "boolean") {
  //   queryStringParameters.debug = debug;
  // }
  // if (typeof debugType === "string" && isDebugType(debugType)) {
  //   queryStringParameters.debugType = debugType;
  // }
  // if (typeof displayResolution === "string" && isDisplayResolution(displayResolution)) {
  //   queryStringParameters.displayResolution = displayResolution;
  // }
  // if (typeof e2ee === "boolean") {
  //   queryStringParameters.e2ee = e2ee;
  // }
  // const stringEchoCancellation = String(echoCancellation);
  // if (isEchoCancellation(stringEchoCancellation)) {
  //   queryStringParameters.echoCancellation = stringEchoCancellation;
  // }
  // if (typeof echoCancellationType === "string" && isEchoCancellationType(echoCancellationType)) {
  //   queryStringParameters.echoCancellationType = echoCancellationType;
  // }
  // const stringNoiseSuppression = String(noiseSuppression);
  // if (isNoiseSuppression(stringNoiseSuppression)) {
  //   queryStringParameters.noiseSuppression = stringNoiseSuppression;
  // }
  // if (fakeVolume) {
  //   queryStringParameters.fakeVolume = String(fakeVolume);
  // }
  // if (typeof frameRate === "string" && isFrameRate(frameRate)) {
  //   queryStringParameters.frameRate = frameRate;
  // }
  // if (typeof mediaType === "string" && isMediaType(mediaType)) {
  //   queryStringParameters.mediaType = mediaType;
  // }
  // if (metadata) {
  //   queryStringParameters.metadata = String(metadata);
  // }
  // if (typeof showStats === "boolean") {
  //   queryStringParameters.showStats = showStats;
  // }
  // if (signalingNotifyMetadata) {
  //   queryStringParameters.signalingNotifyMetadata = String(signalingNotifyMetadata);
  // }
  // if (signalingUrlCandidates && typeof signalingUrlCandidates === "string") {
  //   const parsedSignalingUrlCandidates = JSON.parse(signalingUrlCandidates);
  //   if (Array.isArray(parsedSignalingUrlCandidates)) {
  //     queryStringParameters.signalingUrlCandidates = parsedSignalingUrlCandidates;
  //   }
  // }
  // if (typeof simulcast === "boolean") {
  //   queryStringParameters.simulcast = simulcast;
  // }
  // if (typeof simulcastRid === "string" && isSimulcastRid(simulcastRid)) {
  //   queryStringParameters.simulcastRid = simulcastRid;
  // }
  // if (typeof spotlightNumber === "string" && isSpotlightNumber(spotlightNumber)) {
  //   queryStringParameters.spotlightNumber = spotlightNumber;
  // }
  // if (typeof spotlightFocusRid === "string" && isSpotlightFocusRid(spotlightFocusRid)) {
  //   queryStringParameters.spotlightFocusRid = spotlightFocusRid;
  // }
  // if (typeof spotlightUnfocusRid === "string" && isSpotlightFocusRid(spotlightUnfocusRid)) {
  //   queryStringParameters.spotlightUnfocusRid = spotlightUnfocusRid;
  // }
  // if (typeof resolution === "string" && isResolution(resolution)) {
  //   queryStringParameters.resolution = resolution;
  // }
  // if (typeof video === "boolean") {
  //   queryStringParameters.video = video;
  // }
  // if (typeof videoBitRate === "string" && isVideoBitRate(videoBitRate)) {
  //   queryStringParameters.videoBitRate = videoBitRate;
  // }
  // if (typeof videoCodecType === "string" && isVideoCodecType(videoCodecType)) {
  //   queryStringParameters.videoCodecType = videoCodecType;
  // }
  // if (audioInput) {
  //   queryStringParameters.audioInput = String(audioInput);
  // }
  // if (videoInput) {
  //   queryStringParameters.videoInput = String(videoInput);
  // }
  // if (audioOutput) {
  //   queryStringParameters.audioOutput = String(audioOutput);
  // }
  // if (typeof mute === "boolean") {
  //   queryStringParameters.mute = mute;
  // }
  // const stringDataChannelSignaling = String(dataChannelSignaling);
  // if (isDataChannelSignaling(stringDataChannelSignaling)) {
  //   queryStringParameters.dataChannelSignaling = stringDataChannelSignaling;
  // }
  // const stringIgnoreDisconnectWebSocket = String(ignoreDisconnectWebSocket);
  // if (isIgnoreDisconnectWebSocket(stringIgnoreDisconnectWebSocket)) {
  //   queryStringParameters.ignoreDisconnectWebSocket = stringIgnoreDisconnectWebSocket;
  // }
  // if (typeof micDevice === "boolean") {
  //   queryStringParameters.micDevice = micDevice;
  // }
  // if (typeof cameraDevice === "boolean") {
  //   queryStringParameters.cameraDevice = cameraDevice;
  // }
  // if (typeof audioTrack === "boolean") {
  //   queryStringParameters.audioTrack = audioTrack;
  // }
  // if (typeof videoTrack === "boolean") {
  //   queryStringParameters.videoTrack = videoTrack;
  // }
  // if (typeof dataChannels === "string") {
  //   queryStringParameters.dataChannels = dataChannels;
  // }
  // if (typeof reconnect === "boolean") {
  //   queryStringParameters.reconnect = reconnect;
  // }
  // const stringAudioContentHint = String(audioContentHint);
  // if (isAudioContentHint(stringAudioContentHint)) {
  //   queryStringParameters.audioContentHint = stringAudioContentHint;
  // }
  // const stringVideoContentHint = String(videoContentHint);
  // if (isVideoContentHint(stringVideoContentHint)) {
  //   queryStringParameters.videoContentHint = stringVideoContentHint;
  // }
  // const stringAspectRatio = String(aspectRatio);
  // if (isAspectRatio(stringAspectRatio)) {
  //   queryStringParameters.aspectRatio = stringAspectRatio;
  // }
  // const stringResizeMode = String(resizeMode);
  // if (isResizeMode(stringResizeMode)) {
  //   queryStringParameters.resizeMode = stringResizeMode;
  // }
  // const stringBlurRadius = String(blurRadius);
  // if (isBlurRadius(stringBlurRadius)) {
  //   queryStringParameters.blurRadius = stringBlurRadius;
  // }
  // if (typeof mediaProcessorsNoiseSuppression === "boolean") {
  //   queryStringParameters.mediaProcessorsNoiseSuppression = mediaProcessorsNoiseSuppression;
  // }
  return queryStringParameters;
}

// Sora のシグナリングURLを生成
export function createSignalingURL(
  enabledSignalingUrlCandidates: boolean,
  signalingUrlCandidates: string[]
): string | string[] {
  if (enabledSignalingUrlCandidates) {
    // 空文字列は取り除く
    return signalingUrlCandidates.filter((signalingUrlCandidate) => signalingUrlCandidate !== "");
  }
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
    case "120p (160x120)":
      return { width: 160, height: 120 };
    case "180p (320x180)":
      return { width: 320, height: 180 };
    case "240p (320x240)":
      return { width: 320, height: 240 };
    case "360p (640x360)":
      return { width: 640, height: 360 };
    case "480p (640x480)":
      return { width: 640, height: 480 };
    case "720p (1280x720)":
      return { width: 1280, height: 720 };
    case "1080p (1920x1080)":
      return { width: 1920, height: 1080 };
    case "2160p (3840x2160)":
      return { width: 3840, height: 2160 };
    default:
      return { width: 0, height: 0 };
  }
}

// アスペクト比に対応する数値を返す
export function getValueByAspectRatio(aspectRatio: string): number {
  switch (aspectRatio) {
    case "4:3":
      return 4 / 3;
    case "16:9":
      return 16 / 9;
    case "21:9":
      return 20 / 9;
    default:
      return NaN;
  }
}

// devtools の blurRadius 文字列に対する数値を返す
export function getBlurRadiusNumber(blurRadius: typeof BLUR_RADIUS[number]): number {
  switch (blurRadius) {
    case "weak":
      return 5;
    case "midium":
      return 10;
    case "strong":
      return 15;
    default:
      return 0;
  }
}

// getUserMedia の audio constraints を生成
type CreateAudioConstraintsParameters = {
  audio: boolean;
  autoGainControl: typeof AUTO_GAIN_CONTROLS[number];
  noiseSuppression: typeof NOISE_SUPPRESSIONS[number];
  echoCancellation: typeof ECHO_CANCELLATIONS[number];
  echoCancellationType: typeof ECHO_CANCELLATION_TYPES[number];
  audioInput: string;
};
export function createAudioConstraints(parameters: CreateAudioConstraintsParameters): boolean | MediaTrackConstraints {
  const { audio, autoGainControl, noiseSuppression, echoCancellation, echoCancellationType, audioInput } = parameters;
  if (!audio) {
    return false;
  }
  if (!autoGainControl && !noiseSuppression && !echoCancellation && !echoCancellationType && !audioInput) {
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
type CreateVideoConstraintsParameters = {
  aspectRatio: SoraDevtoolsState["aspectRatio"];
  frameRate: SoraDevtoolsState["frameRate"];
  resizeMode: SoraDevtoolsState["resizeMode"];
  resolution: SoraDevtoolsState["resolution"];
  video: SoraDevtoolsState["video"];
  videoInput: SoraDevtoolsState["videoInput"];
};
export function createVideoConstraints(parameters: CreateVideoConstraintsParameters): boolean | MediaTrackConstraints {
  const { video, frameRate, resolution, videoInput, aspectRatio, resizeMode } = parameters;
  if (!video) {
    return false;
  }
  if (!frameRate && !resolution && !videoInput && !aspectRatio && !resizeMode) {
    return video;
  }
  const videoConstraints: SoraDevtoolsMediaTrackConstraints = {};
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
  if (aspectRatio) {
    videoConstraints.aspectRatio = getValueByAspectRatio(aspectRatio);
  }
  if (resizeMode) {
    videoConstraints.resizeMode = resizeMode;
  }
  return videoConstraints;
}

// Fake 用の constraints を生成
type CreateFakeMediaConstraintsParameters = {
  audio: SoraDevtoolsState["audio"];
  video: SoraDevtoolsState["video"];
  frameRate: SoraDevtoolsState["frameRate"];
  resolution: SoraDevtoolsState["resolution"];
  volume: SoraDevtoolsState["fakeVolume"];
  aspectRatio: SoraDevtoolsState["aspectRatio"];
  resizeMode: SoraDevtoolsState["resizeMode"];
};
type FakeMediaStreamConstraints = {
  audio: boolean;
  video: boolean;
  frameRate: number;
  width: number;
  height: number;
  fontSize: number;
  volume: number;
  videoTrackConstraints?: SoraDevtoolsMediaTrackConstraints;
};
export function createFakeMediaConstraints(
  parameters: CreateFakeMediaConstraintsParameters
): FakeMediaStreamConstraints {
  const { audio, video, frameRate, resolution, volume, aspectRatio, resizeMode } = parameters;
  // fake の default frameRate は 30 fps
  const parsedFrameRate = parseInt(frameRate, 10) || 30;
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
    volume: parseFloat(volume),
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

// getDisplayMedia の video constraints を生成
type CreateGetDisplayMediaConstraintsParameters = {
  frameRate: SoraDevtoolsState["frameRate"];
  resolution: SoraDevtoolsState["resolution"];
  aspectRatio: SoraDevtoolsState["aspectRatio"];
  resizeMode: SoraDevtoolsState["resizeMode"];
};
export function createGetDisplayMediaConstraints(
  parameters: CreateGetDisplayMediaConstraintsParameters
): MediaStreamConstraints {
  const { aspectRatio, frameRate, resizeMode, resolution } = parameters;
  if (!frameRate && !resolution && !aspectRatio && !resizeMode) {
    return { video: true };
  }
  const videoConstraints: SoraDevtoolsMediaTrackConstraints = {};
  if (frameRate) {
    videoConstraints.frameRate = parseInt(frameRate, 10);
  }
  if (resolution) {
    const { width, height } = getVideoSizeByResolution(resolution);
    if (0 < width && 0 < height) {
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
  return {
    video: videoConstraints,
  };
}

// Fake 用の MediaStream を生成
export function createFakeMediaStream(parameters: FakeMediaStreamConstraints): {
  canvas: CustomHTMLCanvasElement | null;
  mediaStream: MediaStream;
  gainNode: GainNode | null;
} {
  const mediaStream = new MediaStream();
  let canvas = null;
  if (parameters.video) {
    canvas = document.createElement("canvas") as CustomHTMLCanvasElement;
    // Firefox では getContext を呼ばないと captureStream が失敗する
    canvas.getContext("2d");
    canvas.width = parameters.width;
    canvas.height = parameters.height;
    const cancasStream = canvas.captureStream(parameters.frameRate);
    const videoTrack = cancasStream.getTracks()[0];
    if (parameters.videoTrackConstraints) {
      videoTrack.applyConstraints(parameters.videoTrackConstraints);
    }
    mediaStream.addTrack(videoTrack);
  }
  let gainNode = null;
  if (parameters.audio) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
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
  return { canvas, mediaStream, gainNode };
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

export function parseBooleanString(value: string): boolean | undefined {
  if (value === "true") {
    return true;
  } else if (value === "false") {
    return false;
  }
  return;
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
  if (codecs.includes("AV1")) {
    return "AV1";
  }
  if (codecs.includes("H265")) {
    return "H265";
  }
  return initialValue;
}

export async function getDevices(): Promise<MediaDeviceInfo[]> {
  // https じゃない場合などで mediaDevices が undefined になる可能性がある
  if (navigator.mediaDevices === undefined) {
    return [];
  }
  try {
    return await navigator.mediaDevices.enumerateDevices();
  } catch (_) {
    // 例外が起きた場合は何もしない
  }
  return [];
}

// Sora との接続状態に応じて特定の Form を表示するかしないかを返す
export function isFormDisabled(connectionStatus: SoraDevtoolsState["soraContents"]["connectionStatus"]): boolean {
  return connectionStatus === "connected" || connectionStatus === "connecting";
}

// track の設定情報を返す
type GetMediaStreamTrackProperties = {
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
};
export function getMediaStreamTrackProperties(track: MediaStreamTrack): GetMediaStreamTrackProperties {
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

// Sora の connectOptions を生成する
export function createConnectOptions(connectionOptionsState: ConnectionOptionsState): ConnectionOptions {
  const connectionOptions: ConnectionOptions = {
    audio: connectionOptionsState.audio,
    video: connectionOptionsState.video,
  };
  // audioCodecType
  if (connectionOptionsState.audioCodecType) {
    connectionOptions.audioCodecType = connectionOptionsState.audioCodecType;
  }
  // audioBitRate
  const parsedAudioBitRate = parseInt(connectionOptionsState.audioBitRate, 10);
  if (parsedAudioBitRate) {
    connectionOptions.audioBitRate = parsedAudioBitRate;
  }
  // videoCodecType
  if (connectionOptionsState.videoCodecType) {
    connectionOptions.videoCodecType = connectionOptionsState.videoCodecType;
  }
  // videoBitRate
  const parsedVideoBitRate = parseInt(connectionOptionsState.videoBitRate, 10);
  if (parsedVideoBitRate) {
    connectionOptions.videoBitRate = parsedVideoBitRate;
  }
  // multistream
  const parsedMultistream = parseBooleanString(connectionOptionsState.multistream);
  if (parsedMultistream !== undefined) {
    connectionOptions.multistream = parsedMultistream;
  }
  // e2ee
  if (connectionOptionsState.e2ee) {
    connectionOptions.e2ee = true;
  }
  // spotlight
  const parsedSpotlight = parseBooleanString(connectionOptionsState.spotlight);
  if (parsedSpotlight !== undefined) {
    connectionOptions.spotlight = parsedSpotlight;
    if (parsedSpotlight === true) {
      if (connectionOptionsState.spotlightNumber) {
        connectionOptions.spotlightNumber = parseInt(connectionOptionsState.spotlightNumber);
      }
      if (connectionOptionsState.spotlightFocusRid) {
        connectionOptions.spotlightFocusRid = connectionOptionsState.spotlightFocusRid;
      }
      if (connectionOptionsState.spotlightUnfocusRid) {
        connectionOptions.spotlightUnfocusRid = connectionOptionsState.spotlightUnfocusRid;
      }
    }
  }
  // simulcast
  const parsedSimulcast = parseBooleanString(connectionOptionsState.simulcast);
  if (parsedSimulcast !== undefined) {
    connectionOptions.simulcast = parsedSimulcast;
    if (parsedSimulcast === true && connectionOptionsState.simulcastRid) {
      connectionOptions.simulcastRid = connectionOptionsState.simulcastRid;
    }
  }
  // signalingNotifyMetadata
  if (connectionOptionsState.enabledSignalingNotifyMetadata) {
    connectionOptions.signalingNotifyMetadata = parseMetadata(true, connectionOptionsState.signalingNotifyMetadata);
  }
  // clientId
  if (connectionOptionsState.enabledClientId) {
    connectionOptions.clientId = connectionOptionsState.clientId;
  }
  // dataChannelSignaling, ignoreDisconnectWebSocket
  if (connectionOptionsState.enabledDataChannel) {
    const parsedDataChannelSignaling = parseBooleanString(connectionOptionsState.dataChannelSignaling);
    if (parsedDataChannelSignaling !== undefined) {
      connectionOptions.dataChannelSignaling = parsedDataChannelSignaling;
    }
    const parsedIgnoreDisconnectWebSocket = parseBooleanString(connectionOptionsState.ignoreDisconnectWebSocket);
    if (parsedIgnoreDisconnectWebSocket !== undefined) {
      connectionOptions.ignoreDisconnectWebSocket = parsedIgnoreDisconnectWebSocket;
    }
  }
  // dataChannels
  if (connectionOptionsState.dataChannels !== "") {
    let dataChannels = [];
    try {
      dataChannels = JSON.parse(connectionOptionsState.dataChannels);
    } catch (_) {
      // サンプル実装なので warning で回避
      console.warn("Illegal format DataChannels");
    }
    if (Array.isArray(dataChannels)) {
      connectionOptions.dataChannels = dataChannels;
    }
  }
  return connectionOptions;
}
