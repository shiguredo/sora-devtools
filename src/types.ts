import type { LightAdjustmentProcessor } from '@shiguredo/light-adjustment'
import type { NoiseSuppressionProcessor } from '@shiguredo/noise-suppression'
import type { VirtualBackgroundProcessor } from '@shiguredo/virtual-background'
import type {
  ConnectionPublisher,
  ConnectionSubscriber,
  DataChannelConfiguration,
  Role,
  TimelineEventLogType,
  TransportType,
} from 'sora-js-sdk'

import {
  ASPECT_RATIO_TYPES,
  AUDIO_BIT_RATES,
  AUDIO_CODEC_TYPES,
  AUDIO_CONTENT_HINTS,
  AUTO_GAIN_CONTROLS,
  BLUR_RADIUS,
  CONNECTION_STATUS,
  DATA_CHANNEL_SIGNALING,
  DEBUG_TYPES,
  DISPLAY_RESOLUTIONS,
  ECHO_CANCELLATION_TYPES,
  ECHO_CANCELLATIONS,
  FACING_MODES,
  FRAME_RATES,
  IGNORE_DISCONNECT_WEBSOCKET,
  LIGHT_ADJUSTMENT,
  LYRA_PARAMS_BITRATES,
  MEDIA_TYPES,
  MULTISTREAM,
  NOISE_SUPPRESSIONS,
  RESIZE_MODE_TYPES,
  RESOLUTIONS,
  SIMULCAST,
  SIMULCAST_RID,
  SPOTLIGHT,
  SPOTLIGHT_FOCUS_RIDS,
  SPOTLIGHT_NUMBERS,
  VIDEO_BIT_RATES,
  VIDEO_CODEC_TYPES,
  VIDEO_CONTENT_HINTS,
} from '@/constants'

export type SoraDevtoolsState = {
  alertMessages: AlertMessage[]
  audio: boolean
  audioBitRate: (typeof AUDIO_BIT_RATES)[number]
  audioCodecType: (typeof AUDIO_CODEC_TYPES)[number]
  audioContentHint: (typeof AUDIO_CONTENT_HINTS)[number]
  audioInput: string
  audioInputDevices: MediaDeviceInfo[]
  audioOutput: string
  audioOutputDevices: MediaDeviceInfo[]
  autoGainControl: (typeof AUTO_GAIN_CONTROLS)[number]
  blurRadius: (typeof BLUR_RADIUS)[number]
  bundleId: string
  channelId: string
  clientId: string
  googCpuOveruseDetection: boolean | null
  timelineMessages: TimelineMessage[]
  debug: boolean
  debugFilterText: string
  debugType: DebugType
  dataChannelSignaling: (typeof DATA_CHANNEL_SIGNALING)[number]
  dataChannels: string
  dataChannelMessages: DataChannelMessage[]
  displayResolution: (typeof DISPLAY_RESOLUTIONS)[number]
  echoCancellation: (typeof ECHO_CANCELLATIONS)[number]
  echoCancellationType: (typeof ECHO_CANCELLATION_TYPES)[number]
  e2ee: boolean
  enabledBundleId: boolean
  enabledClientId: boolean
  enabledDataChannels: boolean
  enabledDataChannel: boolean
  enabledMetadata: boolean
  enabledSignalingNotifyMetadata: boolean
  enabledSignalingUrlCandidates: boolean
  enabledForwardingFilter: boolean
  enabledVideoVP9Params: boolean
  enabledVideoH264Params: boolean
  enabledVideoAV1Params: boolean
  audioStreamingLanguageCode: string
  enabledAudioStreamingLanguageCode: boolean
  lyraParamsBitrate: (typeof LYRA_PARAMS_BITRATES)[number]
  fakeContents: {
    worker: Worker | null
    colorCode: number
    gainNode: GainNode | null
  }
  fakeVolume: string
  frameRate: (typeof FRAME_RATES)[number]
  soraContents: {
    connectionStatus: (typeof CONNECTION_STATUS)[number]
    reconnecting: boolean
    reconnectingTrials: number
    sora: ConnectionPublisher | ConnectionSubscriber | null
    connectionId: string | null
    clientId: string | null
    localMediaStream: MediaStream | null
    remoteMediaStreams: MediaStream[]
    prevStatsReport: RTCStats[]
    statsReport: RTCStats[]
    datachannels: DataChannelConfiguration[]
  }
  ignoreDisconnectWebSocket: (typeof IGNORE_DISCONNECT_WEBSOCKET)[number]
  logMessages: LogMessage[]
  mediaProcessorsNoiseSuppression: boolean
  mediaType: (typeof MEDIA_TYPES)[number]
  metadata: string
  multistream: (typeof MULTISTREAM)[number]
  mute: boolean
  noiseSuppression: (typeof NOISE_SUPPRESSIONS)[number]
  notifyMessages: NotifyMessage[]
  pushMessages: PushMessage[]
  resolution: (typeof RESOLUTIONS)[number]
  showStats: boolean
  signalingMessages: SignalingMessage[]
  signalingNotifyMetadata: string
  signalingUrlCandidates: string[]
  forwardingFilter: string
  simulcast: (typeof SIMULCAST)[number]
  simulcastRid: (typeof SIMULCAST_RID)[number]
  spotlight: (typeof SPOTLIGHT)[number]
  focusedSpotlightConnectionIds: {
    [key: string]: boolean
  }
  spotlightNumber: (typeof SPOTLIGHT_NUMBERS)[number]
  spotlightFocusRid: (typeof SPOTLIGHT_FOCUS_RIDS)[number]
  spotlightUnfocusRid: (typeof SPOTLIGHT_FOCUS_RIDS)[number]
  video: boolean
  videoBitRate: (typeof VIDEO_BIT_RATES)[number]
  videoCodecType: (typeof VIDEO_CODEC_TYPES)[number]
  videoContentHint: (typeof VIDEO_CONTENT_HINTS)[number]
  videoInput: string
  videoInputDevices: MediaDeviceInfo[]
  videoVP9Params: string
  videoH264Params: string
  videoAV1Params: string
  version: string
  cameraDevice: boolean
  videoTrack: boolean
  micDevice: boolean
  audioTrack: boolean
  role: Role
  reconnect: boolean
  apiUrl: null | string
  aspectRatio: (typeof ASPECT_RATIO_TYPES)[number]
  resizeMode: (typeof RESIZE_MODE_TYPES)[number]
  lightAdjustment: (typeof LIGHT_ADJUSTMENT)[number]
  lightAdjustmentProcessor: LightAdjustmentProcessor | null
  noiseSuppressionProcessor: NoiseSuppressionProcessor | null
  virtualBackgroundProcessor: VirtualBackgroundProcessor | null
  facingMode: (typeof FACING_MODES)[number]
}

// 画面表示する message の Type
export type AlertMessage = {
  timestamp: number
  type: 'error' | 'info'
  title: string
  message: string
}

// Debug timeline message の Type
export type TimelineMessage = {
  timestamp: number
  type: string
  logType: TimelineEventLogType | 'sora-devtools'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  dataChannelId?: number | null
  dataChannelLabel?: string | null
}

// HTMLCanvasElement interface に captureStream を追加
export interface CustomHTMLCanvasElement extends HTMLCanvasElement {
  captureStream(fps?: number): MediaStream
}

// MediaTrackConstraints interface に property を追加
export interface SoraDevtoolsMediaTrackConstraints extends MediaTrackConstraintSet {
  echoCancellationType?: 'system' | 'browser'
  resizeMode?: 'none' | 'crop-and-scale'
}

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | {
      [prop: string]: Json | undefined
    }

// HTMLVideoElement interface に setSinkId を追加
export interface CustomHTMLVideoElement extends HTMLVideoElement {
  setSinkId(audioId: string): void
}

// RTCMediaStreamTrackStats に jitterBuffer 関連を追加
export interface RTCMediaStreamTrackStats extends RTCStats {
  ssrc: number
  kind: string
  trackId: string
  trackIdentifier: string
  transportId: string
  codecId: string
  mediaType: string
  jitter: number
  packetsLost: number
  remoteId: string
  packetsReceived: number
  fecPacketsReceived: number
  fecPacketsDiscarded: number
  bytesReceived: number
  headerBytesReceived: number
  lastPacketReceivedTimestamp: number
  jitterBufferDelay: number
  jitterBufferEmittedCount: number
  totalSamplesReceived: number
  concealedSamples: number
  silentConcealedSamples: number
  concealmentEvents: number
  insertedSamplesForDeceleration: number
  removedSamplesForAcceleration: number
  audioLevel: number
  totalAudioEnergy: number
  totalSamplesDuration: number
  estimatedPlayoutTimestamp: number
  prevJitterBufferDelay: number
  prevJitterBufferEmittedCount: number
}

// RTCInboundRtpStreamStats に jitterBuffer 関連を追加
// ref: https://w3c.github.io/webrtc-stats/#dom-rtcinboundrtpstreamstats
export interface RTCInboundRtpStreamStats extends RTCReceivedRtpStreamStats {
  // 元々定義されてたやつ
  firCount?: number
  framesDecoded?: number
  nackCount?: number
  pliCount?: number
  qpSum?: number
  remoteId?: string

  // 新しく追加したやつ
  trackIdentifier: string
  kind: string
  jitterBufferDelay?: number
  jitterBufferTargetDelay?: number
  jitterBufferEmittedCount?: number
  jitterBufferMinimumDelay?: number
}

// Debug log message の Type
export type LogMessage = {
  timestamp: number
  message: {
    title: string
    description: string
  }
}

// Sora on notify callback の引数 Type
export type SoraNotifyMessage = {
  type: 'notify'
  event_type: string
  [x: string]: unknown
}

// Debug notify message の Type
export type NotifyMessage = {
  timestamp: number
  message: SoraNotifyMessage
  transportType: TransportType
}

// Sora on push callback の引数 Type
export type SoraPushMessage = {
  type: 'push'
  data: {
    [x: string]: unknown
  }
}

// Debug push message の Type
export type PushMessage = {
  timestamp: number
  message: SoraPushMessage
  transportType: TransportType
}

// Debug signaling message の Type
export type SignalingMessage = {
  timestamp: number
  type: string
  transportType: TransportType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
}

// Debug data channel message の Type
export type DataChannelMessage = {
  timestamp: number
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
}

// Debug 表示タブ選択状態用の Type
export type DebugType = (typeof DEBUG_TYPES)[number]

// クエリ文字列から取得する parameter の Type
export type QueryStringParameters = Omit<
  SoraDevtoolsState,
  | 'alertMessages'
  | 'dataChannelMessages'
  | 'debugFilterText'
  | 'fakeContents'
  | 'focusedSpotlightConnectionIds'
  | 'logMessages'
  | 'notifyMessages'
  | 'pushMessages'
  | 'signalingMessages'
  | 'soraContents'
  | 'timelineMessages'
  | 'version'
>

// sora-js-sdk の接続オプションで使用する state
export type ConnectionOptionsState = Pick<
  SoraDevtoolsState,
  | 'audio'
  | 'audioBitRate'
  | 'audioCodecType'
  | 'audioStreamingLanguageCode'
  | 'bundleId'
  | 'clientId'
  | 'dataChannelSignaling'
  | 'dataChannels'
  | 'e2ee'
  | 'enabledAudioStreamingLanguageCode'
  | 'enabledBundleId'
  | 'enabledClientId'
  | 'enabledDataChannel'
  | 'enabledSignalingNotifyMetadata'
  | 'enabledForwardingFilter'
  | 'enabledVideoVP9Params'
  | 'enabledVideoH264Params'
  | 'enabledVideoAV1Params'
  | 'ignoreDisconnectWebSocket'
  | 'lyraParamsBitrate'
  | 'multistream'
  | 'signalingNotifyMetadata'
  | 'forwardingFilter'
  | 'simulcast'
  | 'simulcastRid'
  | 'spotlight'
  | 'spotlightFocusRid'
  | 'spotlightNumber'
  | 'spotlightUnfocusRid'
  | 'video'
  | 'videoBitRate'
  | 'videoCodecType'
  | 'videoVP9Params'
  | 'videoH264Params'
  | 'videoAV1Params'
>

// ダウンロードレポートに使用するパラメーター
export type DownloadReportParameters = Omit<
  SoraDevtoolsState,
  | 'alertMessages'
  | 'apiUrl'
  | 'blurRadius'
  | 'dataChannelMessages'
  | 'debugFilterText'
  | 'debugType'
  | 'fakeContents'
  | 'focusedSpotlightConnectionIds'
  | 'lightAdjustment'
  | 'lightAdjustmentProcessor'
  | 'logMessages'
  | 'mediaProcessorsNoiseSuppression'
  | 'mute'
  | 'noiseSuppressionProcessor'
  | 'notifyMessages'
  | 'pushMessages'
  | 'showStats'
  | 'signalingMessages'
  | 'soraContents'
  | 'timelineMessages'
  | 'version'
  | 'virtualBackgroundProcessor'
>

export type DownloadReport = {
  userAgent: string
  'sora-devtools': string
  'sora-js-sdk': string
  parameters: DownloadReportParameters
  timeline: unknown[]
  notify: unknown[]
  stats: unknown[]
}
