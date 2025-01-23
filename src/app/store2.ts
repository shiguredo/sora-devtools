import type {
  ASPECT_RATIO_TYPES,
  AUDIO_CODEC_TYPES,
  AUDIO_CONTENT_HINTS,
  AUTO_GAIN_CONTROLS,
  BLUR_RADIUS,
  CONNECTION_STATUS,
  DATA_CHANNEL_SIGNALING,
  ECHO_CANCELLATIONS,
  ECHO_CANCELLATION_TYPES,
  FACING_MODES,
  IGNORE_DISCONNECT_WEBSOCKET,
  LIGHT_ADJUSTMENT,
  MEDIA_TYPES,
  NOISE_SUPPRESSIONS,
  RESIZE_MODE_TYPES,
  SIMULCAST,
  SIMULCAST_RID,
  SPOTLIGHT,
  SPOTLIGHT_FOCUS_RIDS,
  SPOTLIGHT_NUMBERS,
  VIDEO_CODEC_TYPES,
  VIDEO_CONTENT_HINTS,
} from '@/constants'
import type {
  AlertMessage,
  DataChannelMessage,
  DebugType,
  LogMessage,
  NotifyMessage,
  PushMessage,
  RemoteClient,
  SignalingMessage,
  TimelineMessage,
} from '@/types'
import type { LightAdjustmentProcessor } from '@shiguredo/light-adjustment'
import type { Mp4MediaStream } from '@shiguredo/mp4-media-stream'
import type { NoiseSuppressionProcessor } from '@shiguredo/noise-suppression'
import type { VirtualBackgroundProcessor } from '@shiguredo/virtual-background'
import type {
  ConnectionPublisher,
  ConnectionSubscriber,
  DataChannelConfiguration,
  Role,
} from 'sora-js-sdk'
import { create } from 'zustand'
import packageJSON from '../../package.json'

type StoreState = {
  alertMessages: AlertMessage[]
  audio: boolean
  audioBitRate: string
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
  displayResolution: string
  echoCancellation: (typeof ECHO_CANCELLATIONS)[number]
  echoCancellationType: (typeof ECHO_CANCELLATION_TYPES)[number]
  enabledBundleId: boolean
  enabledClientId: boolean
  enabledDataChannels: boolean
  enabledDataChannel: boolean
  enabledMetadata: boolean
  enabledSignalingNotifyMetadata: boolean
  enabledSignalingUrlCandidates: boolean
  enabledForwardingFilters: boolean
  enabledForwardingFilter: boolean
  enabledVideoVP9Params: boolean
  enabledVideoH264Params: boolean
  enabledVideoH265Params: boolean
  enabledVideoAV1Params: boolean
  audioStreamingLanguageCode: string
  enabledAudioStreamingLanguageCode: boolean
  fakeContents: {
    worker: Worker | null
    colorCode: number
    gainNode: GainNode | null
  }
  fakeVolume: string
  frameRate: string
  soraContents: {
    connectionStatus: (typeof CONNECTION_STATUS)[number]
    reconnecting: boolean
    reconnectingTrials: number
    sora: ConnectionPublisher | ConnectionSubscriber | null
    connectionId: string | null
    clientId: string | null
    sessionId: string | null
    localMediaStream: MediaStream | null
    remoteClients: RemoteClient[]
    prevStatsReport: RTCStats[]
    statsReport: RTCStats[]
    dataChannels: DataChannelConfiguration[]
    turnUrl: string | null
  }
  ignoreDisconnectWebSocket: (typeof IGNORE_DISCONNECT_WEBSOCKET)[number]
  logMessages: LogMessage[]
  mediaProcessorsNoiseSuppression: boolean
  mediaStats: boolean
  mediaType: (typeof MEDIA_TYPES)[number]
  mp4MediaStream: Mp4MediaStream | null
  metadata: string
  mute: boolean
  noiseSuppression: (typeof NOISE_SUPPRESSIONS)[number]
  notifyMessages: NotifyMessage[]
  pushMessages: PushMessage[]
  resolution: string
  showStats: boolean
  signalingMessages: SignalingMessage[]
  signalingNotifyMetadata: string
  signalingUrlCandidates: string[]
  forwardingFilters: string
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
  videoBitRate: string
  videoCodecType: (typeof VIDEO_CODEC_TYPES)[number]
  videoContentHint: (typeof VIDEO_CONTENT_HINTS)[number]
  videoInput: string
  videoInputDevices: MediaDeviceInfo[]
  videoVP9Params: string
  videoH264Params: string
  videoH265Params: string
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

  setAudio: (audio: boolean) => void
  setAudioInput: (audioInput: string) => void
  setAudioOutput: (audioOutput: string) => void
  setAudioCodecType: (audioCodecType: (typeof AUDIO_CODEC_TYPES)[number]) => void
  setAudioBitRate: (audioBitRate: string) => void
  setAudioContentHint: (audioContentHint: (typeof AUDIO_CONTENT_HINTS)[number]) => void

  setVideo: (video: boolean) => void
  setVideoInput: (videoInput: string) => void
  setVideoInputDevices: (videoInputDevices: MediaDeviceInfo[]) => void

  setAspectRatio: (aspectRatio: (typeof ASPECT_RATIO_TYPES)[number]) => void

  updateMediaStream: () => void

  setEnabledAudioStreamingLanguageCode: (enabledAudioStreamingLanguageCode: boolean) => void
  setAudioStreamingLanguageCode: (audioStreamingLanguageCode: string) => void

  setAudioTrack: (audioTrack: boolean) => void

  copyURL: () => void
  setDebug: (debug: boolean) => void
  setAutoGainControl: (autoGainControl: (typeof AUTO_GAIN_CONTROLS)[number]) => void

  setBlurRadius: (blurRadius: (typeof BLUR_RADIUS)[number]) => void

  setBundleId: (bundleId: string) => void
  setEnabledBundleId: (enabledBundleId: boolean) => void

  setCameraDevice: (cameraDevice: boolean) => void
}

export const useStore = create<StoreState>()((set) => ({
  alertMessages: [],
  audio: true,
  audioBitRate: '',
  audioCodecType: '',
  audioContentHint: '',
  audioInput: '',
  audioInputDevices: [],
  audioOutput: '',
  audioOutputDevices: [],
  autoGainControl: '',
  blurRadius: '',
  bundleId: '',
  enabledBundleId: false,
  clientId: '',
  channelId: 'sora',
  googCpuOveruseDetection: null,
  timelineMessages: [],
  debug: false,
  debugFilterText: '',
  debugType: 'timeline',
  dataChannelSignaling: '',
  dataChannels: '',
  dataChannelMessages: [],
  displayResolution: '',
  echoCancellation: '',
  echoCancellationType: '',
  enabledClientId: false,
  enabledDataChannel: false,
  enabledDataChannels: false,
  enabledForwardingFilters: false,
  enabledForwardingFilter: false,
  enabledMetadata: false,
  enabledSignalingNotifyMetadata: false,
  enabledSignalingUrlCandidates: false,
  enabledVideoVP9Params: false,
  enabledVideoH264Params: false,
  enabledVideoH265Params: false,
  enabledVideoAV1Params: false,
  audioStreamingLanguageCode: '',
  enabledAudioStreamingLanguageCode: false,
  fakeVolume: '0',
  fakeContents: {
    worker: null,
    colorCode: 0,
    gainNode: null,
  },
  frameRate: '',
  soraContents: {
    connectionStatus: 'initializing',
    reconnecting: false,
    reconnectingTrials: 0,
    sora: null,
    connectionId: null,
    clientId: null,
    sessionId: null,
    localMediaStream: null,
    remoteClients: [],
    prevStatsReport: [],
    statsReport: [],
    dataChannels: [],
    turnUrl: null,
  },
  ignoreDisconnectWebSocket: '',
  logMessages: [],
  mediaProcessorsNoiseSuppression: false,
  mediaStats: false,
  mediaType: 'getUserMedia',
  metadata: '',
  mp4MediaStream: null,
  multistream: '',
  mute: false,
  noiseSuppression: '',
  notifyMessages: [],
  pushMessages: [],
  resolution: '',
  showStats: false,
  simulcast: '',
  spotlight: '',
  signalingMessages: [],
  signalingNotifyMetadata: '',
  signalingUrlCandidates: [],
  forwardingFilters: '',
  forwardingFilter: '',
  simulcastRid: '',
  spotlightNumber: '',
  spotlightFocusRid: '',
  spotlightUnfocusRid: '',
  focusedSpotlightConnectionIds: {},
  video: true,
  videoBitRate: '',
  videoCodecType: '',
  videoContentHint: '',
  videoInput: '',
  videoInputDevices: [],
  videoVP9Params: '',
  videoH264Params: '',
  videoH265Params: '',
  videoAV1Params: '',
  version: packageJSON.version,
  cameraDevice: true,
  videoTrack: true,
  micDevice: true,
  audioTrack: true,
  role: 'sendrecv',
  reconnect: false,
  apiUrl: null,
  aspectRatio: '',
  resizeMode: '',
  lightAdjustment: '',
  lightAdjustmentProcessor: null,
  noiseSuppressionProcessor: null,
  virtualBackgroundProcessor: null,
  facingMode: '',

  setAudio: (audio: boolean) => {
    set({ audio })
  },
  setAudioInput: (audioInput: string) => {
    set({ audioInput })
  },
  setAudioOutput: (audioOutput: string) => {
    set({ audioOutput })
  },
  setAudioBitRate: (audioBitRate: string) => {
    set({ audioBitRate })
  },
  setAudioCodecType: (audioCodecType: (typeof AUDIO_CODEC_TYPES)[number]) => {
    set({ audioCodecType })
  },
  setAudioContentHint: (audioContentHint: (typeof AUDIO_CONTENT_HINTS)[number]) => {
    set((state) => {
      if (state.soraContents.localMediaStream) {
        for (const track of state.soraContents.localMediaStream.getAudioTracks()) {
          track.contentHint = audioContentHint
        }
      }
      return { audioContentHint }
    })
  },
  setVideo: (video: boolean) => {
    set({ video })
  },
  setVideoInput: (videoInput: string) => {
    set({ videoInput })
  },
  setVideoInputDevices: (videoInputDevices: MediaDeviceInfo[]) => {
    set({ videoInputDevices })
  },
  setAspectRatio: (aspectRatio: (typeof ASPECT_RATIO_TYPES)[number]) => {
    set({ aspectRatio })
  },
  updateMediaStream: () => {
    set({})
  },
  setEnabledAudioStreamingLanguageCode: (enabledAudioStreamingLanguageCode: boolean) => {
    set({ enabledAudioStreamingLanguageCode })
  },
  setAudioStreamingLanguageCode: (audioStreamingLanguageCode: string) => {
    set({ audioStreamingLanguageCode })
  },
  setAudioTrack: (audioTrack: boolean) => {
    set({ audioTrack })
  },
  copyURL: () => {
    set({})
  },
  setDebug: (debug: boolean) => {
    set({ debug })
  },
  setAutoGainControl: (autoGainControl: (typeof AUTO_GAIN_CONTROLS)[number]) => {
    set({ autoGainControl })
  },
  setBlurRadius: (blurRadius: (typeof BLUR_RADIUS)[number]) => {
    set({ blurRadius })
  },
  setBundleId: (bundleId: string) => {
    set({ bundleId })
  },
  setEnabledBundleId: (enabledBundleId: boolean) => {
    set({ enabledBundleId })
  },
  setCameraDevice: (cameraDevice: boolean) => {
    set({ cameraDevice })
  },
}))
