import type { ConnectionPublisher, ConnectionSubscriber, Role, TimelineEventLogType, TransportType } from "sora-js-sdk";

import {
  AUDIO_BIT_RATES,
  AUDIO_CODEC_TYPES,
  AUTO_GAIN_CONTROLS,
  DATA_CHANNEL_SIGNALING,
  DEBUG_TYPES,
  DISPLAY_RESOLUTIONS,
  ECHO_CANCELLATION_TYPES,
  ECHO_CANCELLATIONS,
  FRAME_RATES,
  IGNORE_DISCONNECT_WEBSOCKET,
  MEDIA_TYPES,
  NOISE_SUPPRESSIONS,
  RESOLUTIONS,
  SIMULCAST_RID,
  SPOTLIGHT_FOCUS_RIDS,
  SPOTLIGHT_NUMBERS,
  VIDEO_BIT_RATES,
  VIDEO_CODEC_TYPES,
} from "@/constants";

export type SoraDemoState = {
  alertMessages: AlertMessage[];
  audio: boolean;
  audioBitRate: typeof AUDIO_BIT_RATES[number];
  audioCodecType: typeof AUDIO_CODEC_TYPES[number];
  audioInput: string;
  audioInputDevices: MediaDeviceInfo[];
  audioOutput: string;
  audioOutputDevices: MediaDeviceInfo[];
  autoGainControl: typeof AUTO_GAIN_CONTROLS[number];
  channelId: string;
  clientId: string;
  googCpuOveruseDetection: boolean | null;
  timelineMessages: TimelineMessage[];
  debug: boolean;
  debugFilterText: string;
  debugType: DebugType;
  dataChannelSignaling: typeof DATA_CHANNEL_SIGNALING[number];
  dataChannelMessaging: string;
  dataChannelMessages: DataChannelMessage[];
  displaySettings: DisplaySettings;
  displayResolution: typeof DISPLAY_RESOLUTIONS[number];
  echoCancellation: typeof ECHO_CANCELLATIONS[number];
  echoCancellationType: typeof ECHO_CANCELLATION_TYPES[number];
  e2ee: boolean;
  enabledClientId: boolean;
  enabledDataChannelMessaging: boolean;
  enabledDataChannel: boolean;
  enabledMetadata: boolean;
  enabledSignalingNotifyMetadata: boolean;
  enabledSignalingUrlCandidates: boolean;
  fakeContents: {
    worker: Worker | null;
    colorCode: number;
    gainNode: GainNode | null;
  };
  fakeVolume: string;
  frameRate: typeof FRAME_RATES[number];
  soraContents: {
    connectionStatus: "disconnected" | "disconnecting" | "connected" | "connecting";
    sora: ConnectionPublisher | ConnectionSubscriber | null;
    connectionId: string | null;
    clientId: string | null;
    localMediaStream: MediaStream | null;
    remoteMediaStreams: MediaStream[];
    prevStatsReport: RTCStats[];
    statsReport: RTCStats[];
  };
  ignoreDisconnectWebSocket: typeof IGNORE_DISCONNECT_WEBSOCKET[number];
  logMessages: LogMessage[];
  mediaType: typeof MEDIA_TYPES[number];
  metadata: string;
  multistream: boolean;
  mute: boolean;
  noiseSuppression: typeof NOISE_SUPPRESSIONS[number];
  notifyMessages: NotifyMessage[];
  pushMessages: PushMessage[];
  resolution: typeof RESOLUTIONS[number];
  showStats: boolean;
  signalingMessages: SignalingMessage[];
  signalingNotifyMetadata: string;
  signalingUrlCandidates: string[];
  simulcast: boolean;
  simulcastRid: typeof SIMULCAST_RID[number];
  spotlight: boolean;
  focusedSpotlightConnectionIds: {
    [key: string]: boolean;
  };
  spotlightNumber: typeof SPOTLIGHT_NUMBERS[number];
  spotlightFocusRid: typeof SPOTLIGHT_FOCUS_RIDS[number];
  spotlightUnfocusRid: typeof SPOTLIGHT_FOCUS_RIDS[number];
  video: boolean;
  videoBitRate: typeof VIDEO_BIT_RATES[number];
  videoCodecType: typeof VIDEO_CODEC_TYPES[number];
  videoInput: string;
  videoInputDevices: MediaDeviceInfo[];
  version: string;
  cameraDevice: boolean;
  videoTrack: boolean;
  micDevice: boolean;
  audioTrack: boolean;
  role: Role;
};

// 画面表示する message の Type
export type AlertMessage = {
  timestamp: number;
  type: "error" | "info";
  title: string;
  message: string;
};

// Debug timeline message の Type
export type TimelineMessage = {
  timestamp: number;
  type: string;
  logType: TimelineEventLogType | "sora-demo";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  dataChannelId?: number | null;
  dataChannelLabel?: string | null;
};

// HTMLCanvasElement interface に captureStream を追加
export interface CustomHTMLCanvasElement extends HTMLCanvasElement {
  captureStream(fps?: number): MediaStream;
}

// MediaTrackConstraints interface に echoCancellationType を追加
export interface SoraDemoMediaTrackConstraints extends MediaTrackConstraintSet {
  autoGainControl?: boolean;
  noiseSuppression?: boolean;
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

// HTMLVideoElement interface に setSinkId を追加
export interface CustomHTMLVideoElement extends HTMLVideoElement {
  setSinkId(audioId: string): void;
}

// MediaDevices interface に getDisplayMedia を追加
export interface SoraDemoMediaDevices extends MediaDevices {
  getDisplayMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
}

// RTCMediaStreamTrackStats に jitterBuffer 関連を追加
export interface RTCMediaStreamTrackStats extends RTCStats {
  ssrc: number;
  kind: string;
  trackId: string;
  trackIdentifier: string;
  transportId: string;
  codecId: string;
  mediaType: string;
  jitter: number;
  packetsLost: number;
  remoteId: string;
  packetsReceived: number;
  fecPacketsReceived: number;
  fecPacketsDiscarded: number;
  bytesReceived: number;
  headerBytesReceived: number;
  lastPacketReceivedTimestamp: number;
  jitterBufferDelay: number;
  jitterBufferEmittedCount: number;
  totalSamplesReceived: number;
  concealedSamples: number;
  silentConcealedSamples: number;
  concealmentEvents: number;
  insertedSamplesForDeceleration: number;
  removedSamplesForAcceleration: number;
  audioLevel: number;
  totalAudioEnergy: number;
  totalSamplesDuration: number;
  estimatedPlayoutTimestamp: number;
  prevJitterBufferDelay: number;
  prevJitterBufferEmittedCount: number;
}

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
  transportType: TransportType;
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
  transportType: TransportType;
};

// Debug signaling message の Type
export type SignalingMessage = {
  timestamp: number;
  type: string;
  transportType: TransportType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
};

// Debug data channel message の Type
export type DataChannelMessage = {
  timestamp: number;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
};

// Debug 表示タブ選択状態用の Type
export type DebugType = typeof DEBUG_TYPES[number];

// クエリ文字列から取得する parameter の Type
export type QueryStringParameters = {
  audio: boolean;
  audioBitRate: typeof AUDIO_BIT_RATES[number];
  audioCodecType: typeof AUDIO_CODEC_TYPES[number];
  audioInput: string;
  audioOutput: string;
  audioTrack: boolean;
  autoGainControl: typeof AUTO_GAIN_CONTROLS[number];
  cameraDevice: boolean;
  channelId: string;
  clientId: string;
  dataChannelSignaling: typeof DATA_CHANNEL_SIGNALING[number];
  dataChannelMessaging: string;
  debug: boolean;
  displayResolution: typeof DISPLAY_RESOLUTIONS[number];
  e2ee: boolean;
  echoCancellation: typeof ECHO_CANCELLATIONS[number];
  echoCancellationType: typeof ECHO_CANCELLATION_TYPES[number];
  fakeVolume: string;
  frameRate: typeof FRAME_RATES[number];
  googCpuOveruseDetection: boolean;
  ignoreDisconnectWebSocket: typeof IGNORE_DISCONNECT_WEBSOCKET[number];
  mediaType: typeof MEDIA_TYPES[number];
  metadata: string;
  micDevice: boolean;
  mute: boolean;
  noiseSuppression: typeof NOISE_SUPPRESSIONS[number];
  resolution: typeof RESOLUTIONS[number];
  showStats: boolean;
  signalingNotifyMetadata: string;
  signalingUrlCandidates: string[];
  simulcastRid: typeof SIMULCAST_RID[number];
  spotlightFocusRid: typeof SPOTLIGHT_FOCUS_RIDS[number];
  spotlightNumber: typeof SPOTLIGHT_NUMBERS[number];
  spotlightUnfocusRid: typeof SPOTLIGHT_FOCUS_RIDS[number];
  video: boolean;
  videoBitRate: typeof VIDEO_BIT_RATES[number];
  videoCodecType: typeof VIDEO_CODEC_TYPES[number];
  videoInput: string;
  videoTrack: boolean;
};

// sora-js-sdk の接続オプションで使用する state
export type ConnectionOptionsState = Pick<
  SoraDemoState,
  | "audio"
  | "audioBitRate"
  | "audioCodecType"
  | "clientId"
  | "dataChannelMessaging"
  | "dataChannelSignaling"
  | "e2ee"
  | "enabledClientId"
  | "enabledDataChannel"
  | "enabledSignalingNotifyMetadata"
  | "ignoreDisconnectWebSocket"
  | "multistream"
  | "signalingNotifyMetadata"
  | "simulcast"
  | "simulcastRid"
  | "spotlight"
  | "spotlightFocusRid"
  | "spotlightNumber"
  | "spotlightUnfocusRid"
  | "video"
  | "videoBitRate"
  | "videoCodecType"
>;

// page 初期レンダリング時に渡されるパラメーター
export type PageInitialParameters = {
  role: SoraDemoState["role"];
  multistream: SoraDemoState["multistream"];
  spotlight: SoraDemoState["spotlight"];
  simulcast: SoraDemoState["simulcast"];
  audio?: SoraDemoState["audio"];
  audioBitRate?: SoraDemoState["audioBitRate"];
  audioCodecType?: SoraDemoState["audioCodecType"];
  audioInput?: SoraDemoState["audioInput"];
  audioOutput?: SoraDemoState["audioOutput"];
  autoGainControl?: SoraDemoState["autoGainControl"];
  channelId?: SoraDemoState["channelId"];
  clientId?: SoraDemoState["clientId"];
  googCpuOveruseDetection?: SoraDemoState["googCpuOveruseDetection"];
  debug?: SoraDemoState["debug"];
  dataChannelSignaling?: SoraDemoState["dataChannelSignaling"];
  dataChannelMessaging?: SoraDemoState["dataChannelMessaging"];
  displayResolution?: SoraDemoState["displayResolution"];
  echoCancellation?: SoraDemoState["echoCancellation"];
  echoCancellationType?: SoraDemoState["echoCancellationType"];
  e2ee?: SoraDemoState["e2ee"];
  fakeVolume?: SoraDemoState["fakeVolume"];
  frameRate?: SoraDemoState["frameRate"];
  ignoreDisconnectWebSocket?: SoraDemoState["ignoreDisconnectWebSocket"];
  mediaType?: SoraDemoState["mediaType"];
  metadata?: SoraDemoState["metadata"];
  mute?: SoraDemoState["mute"];
  noiseSuppression?: SoraDemoState["noiseSuppression"];
  resolution?: SoraDemoState["resolution"];
  showStats?: SoraDemoState["showStats"];
  signalingNotifyMetadata?: SoraDemoState["signalingNotifyMetadata"];
  signalingUrlCandidates?: SoraDemoState["signalingUrlCandidates"];
  simulcastRid?: SoraDemoState["simulcastRid"];
  spotlightNumber?: SoraDemoState["spotlightNumber"];
  spotlightFocusRid?: SoraDemoState["spotlightFocusRid"];
  spotlightUnfocusRid?: SoraDemoState["spotlightUnfocusRid"];
  video?: SoraDemoState["video"];
  videoBitRate?: SoraDemoState["videoBitRate"];
  videoCodecType?: SoraDemoState["videoCodecType"];
  videoInput?: SoraDemoState["videoInput"];
  cameraDevice?: SoraDemoState["cameraDevice"];
  videoTrack?: SoraDemoState["videoTrack"];
  micDevice?: SoraDemoState["micDevice"];
  audioTrack?: SoraDemoState["audioTrack"];
};

// 画面表示に使用する設定
export type DisplaySettings = {
  audioBitRate: boolean;
  audioCodecType: boolean;
  audioInput: boolean;
  audioOutput: boolean;
  audioTrack: boolean;
  audioConstraints: boolean;
  cameraDevice: boolean;
  clientId: boolean;
  mediaType: boolean;
  micDevice: boolean;
  simulcastRid: boolean;
  spotlightFocusRid: boolean;
  spotlightNumber: boolean;
  spotlightUnfocusRid: boolean;
  videoBitRate: boolean;
  videoCodecType: boolean;
  videoConstraints: boolean;
  videoInput: boolean;
  videoTrack: boolean;
};

// ダウンロードレポートに使用するパラメーター
export type DownloadReportParameters = Omit<
  SoraDemoState,
  | "alertMessages"
  | "dataChannelMessages"
  | "debugFilterText"
  | "debugType"
  | "displaySettings"
  | "fakeContents"
  | "focusedSpotlightConnectionIds"
  | "logMessages"
  | "mute"
  | "notifyMessages"
  | "pushMessages"
  | "showStats"
  | "signalingMessages"
  | "soraContents"
  | "timelineMessages"
  | "version"
>;

export type DownloadReport = {
  userAgent: string;
  pageName: string;
  "sora-demo": string;
  "sora-js-sdk": string;
  parameters: DownloadReportParameters;
  timeline: unknown[];
  notify: unknown[];
  stats: unknown[];
};
