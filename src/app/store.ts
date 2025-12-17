import type { Mp4MediaStream } from '@shiguredo/mp4-media-stream'
import { NoiseSuppressionProcessor } from '@shiguredo/noise-suppression'
import { VirtualBackgroundProcessor } from '@shiguredo/virtual-background'
import { signal } from '@preact/signals'
import type {
  ConnectionPublisher,
  ConnectionSubscriber,
  DataChannelConfiguration,
  Role,
} from 'sora-js-sdk'

import packageJSON from '../../package.json'
import { WORKER_SCRIPT } from '../constants.ts'
import type {
  AlertMessage,
  DataChannelMessage,
  DebugType,
  LogMessage,
  NotifyMessage,
  PushMessage,
  RemoteClient,
  SignalingMessage,
  SoraDevtoolsState,
  TimelineMessage,
} from '../types.ts'

// 初期状態
const initialState: SoraDevtoolsState = {
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
  debugApiUrl: 'http://localhost:3000',
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
  forceStereoOutput: false,
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
  simulcastRequestRid: '',
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
  noiseSuppressionProcessor: null,
  virtualBackgroundProcessor: null,
  facingMode: '',
  rpcObjects: [],
  apiObjects: [],
}

// Signal ストア
export const store = signal<SoraDevtoolsState>(structuredClone(initialState))

// クローン不可能なオブジェクトを保持しつつ状態をディープクローンする関数
function cloneState(state: SoraDevtoolsState): SoraDevtoolsState {
  // クローン不可能なオブジェクトを一時的に退避
  const nonCloneableRefs = {
    worker: state.fakeContents.worker,
    gainNode: state.fakeContents.gainNode,
    sora: state.soraContents.sora,
    localMediaStream: state.soraContents.localMediaStream,
    mp4MediaStream: state.mp4MediaStream,
    noiseSuppressionProcessor: state.noiseSuppressionProcessor,
    virtualBackgroundProcessor: state.virtualBackgroundProcessor,
  }

  // クローン不可能なオブジェクトを null に設定してクローン
  state.fakeContents.worker = null
  state.fakeContents.gainNode = null
  state.soraContents.sora = null
  state.soraContents.localMediaStream = null
  state.mp4MediaStream = null
  state.noiseSuppressionProcessor = null
  state.virtualBackgroundProcessor = null

  const cloned = structuredClone(state)

  // 元の状態とクローンした状態に参照を復元
  state.fakeContents.worker = nonCloneableRefs.worker
  state.fakeContents.gainNode = nonCloneableRefs.gainNode
  state.soraContents.sora = nonCloneableRefs.sora
  state.soraContents.localMediaStream = nonCloneableRefs.localMediaStream
  state.mp4MediaStream = nonCloneableRefs.mp4MediaStream
  state.noiseSuppressionProcessor = nonCloneableRefs.noiseSuppressionProcessor
  state.virtualBackgroundProcessor = nonCloneableRefs.virtualBackgroundProcessor

  cloned.fakeContents.worker = nonCloneableRefs.worker
  cloned.fakeContents.gainNode = nonCloneableRefs.gainNode
  cloned.soraContents.sora = nonCloneableRefs.sora
  cloned.soraContents.localMediaStream = nonCloneableRefs.localMediaStream
  cloned.mp4MediaStream = nonCloneableRefs.mp4MediaStream
  cloned.noiseSuppressionProcessor = nonCloneableRefs.noiseSuppressionProcessor
  cloned.virtualBackgroundProcessor = nonCloneableRefs.virtualBackgroundProcessor

  return cloned
}

// ヘルパー関数: 状態を更新
function updateStore(updater: (state: SoraDevtoolsState) => void): void {
  const newState = cloneState(store.value)
  updater(newState)
  store.value = newState
}

// アラートメッセージとログメッセージを同時に追加するヘルパー
function setAlertMessagesAndLogMessages(alertMessage: AlertMessage): void {
  updateStore((state) => {
    if (state.alertMessages.length >= 10) {
      for (let i = 0; i <= state.alertMessages.length - 5; i++) {
        state.alertMessages.pop()
      }
    }
    state.alertMessages.unshift(alertMessage)
    state.logMessages.push({
      timestamp: alertMessage.timestamp,
      message: {
        title: `ALERT MESSAGE ${alertMessage.title}`,
        description: JSON.stringify({
          title: alertMessage.title,
          type: alertMessage.type,
          message: alertMessage.message,
        }),
      },
    })
  })
}

// アクション
export const resetState = (): void => {
  store.value = structuredClone(initialState)
}

export const setAudio = (audio: boolean): void => {
  updateStore((state) => {
    state.audio = audio
  })
}

export const setAudioInput = (audioInput: string): void => {
  updateStore((state) => {
    state.audioInput = audioInput
  })
}

export const setAudioOutput = (audioOutput: string): void => {
  updateStore((state) => {
    state.audioOutput = audioOutput
  })
}

export const setAudioBitRate = (audioBitRate: SoraDevtoolsState['audioBitRate']): void => {
  updateStore((state) => {
    state.audioBitRate = audioBitRate
  })
}

export const setAudioCodecType = (audioCodecType: SoraDevtoolsState['audioCodecType']): void => {
  updateStore((state) => {
    state.audioCodecType = audioCodecType
  })
}

export const setAudioContentHint = (
  audioContentHint: SoraDevtoolsState['audioContentHint'],
): void => {
  updateStore((state) => {
    state.audioContentHint = audioContentHint
    if (state.soraContents.localMediaStream) {
      for (const track of state.soraContents.localMediaStream.getAudioTracks()) {
        track.contentHint = state.audioContentHint
      }
    }
  })
}

export const setAutoGainControl = (autoGainControl: SoraDevtoolsState['autoGainControl']): void => {
  updateStore((state) => {
    state.autoGainControl = autoGainControl
  })
}

export const setClientId = (clientId: string): void => {
  updateStore((state) => {
    state.clientId = clientId
  })
}

export const setChannelId = (channelId: string): void => {
  updateStore((state) => {
    state.channelId = channelId
  })
}

export const setTimelineMessage = (message: TimelineMessage): void => {
  updateStore((state) => {
    state.timelineMessages.push(message)
  })
}

export const setDataChannelSignaling = (
  dataChannelSignaling: SoraDevtoolsState['dataChannelSignaling'],
): void => {
  updateStore((state) => {
    state.dataChannelSignaling = dataChannelSignaling
  })
}

export const setDataChannels = (dataChannels: string): void => {
  updateStore((state) => {
    state.dataChannels = dataChannels
  })
}

export const setDataChannelMessage = (message: DataChannelMessage): void => {
  updateStore((state) => {
    state.dataChannelMessages.push(message)
  })
}

export const setGoogCpuOveruseDetection = (googCpuOveruseDetection: boolean): void => {
  updateStore((state) => {
    state.googCpuOveruseDetection = googCpuOveruseDetection
  })
}

export const setDisplayResolution = (
  displayResolution: SoraDevtoolsState['displayResolution'],
): void => {
  updateStore((state) => {
    state.displayResolution = displayResolution
  })
}

export const setEchoCancellation = (
  echoCancellation: SoraDevtoolsState['echoCancellation'],
): void => {
  updateStore((state) => {
    state.echoCancellation = echoCancellation
  })
}

export const setEchoCancellationType = (
  echoCancellationType: SoraDevtoolsState['echoCancellationType'],
): void => {
  updateStore((state) => {
    state.echoCancellationType = echoCancellationType
  })
}

export const setEnabledClientId = (enabled: boolean): void => {
  updateStore((state) => {
    state.enabledClientId = enabled
  })
}

export const setEnabledDataChannels = (enabled: boolean): void => {
  updateStore((state) => {
    state.enabledDataChannels = enabled
  })
}

export const setEnabledDataChannel = (enabled: boolean): void => {
  updateStore((state) => {
    state.enabledDataChannel = enabled
  })
}

export const setEnabledMetadata = (enabled: boolean): void => {
  updateStore((state) => {
    state.enabledMetadata = enabled
  })
}

export const setIgnoreDisconnectWebSocket = (
  ignoreDisconnectWebSocket: SoraDevtoolsState['ignoreDisconnectWebSocket'],
): void => {
  updateStore((state) => {
    state.ignoreDisconnectWebSocket = ignoreDisconnectWebSocket
  })
}

export const setSignalingMessage = (message: SignalingMessage): void => {
  updateStore((state) => {
    state.signalingMessages.push(message)
  })
}

export const setEnabledForwardingFilters = (enabled: boolean): void => {
  updateStore((state) => {
    state.enabledForwardingFilters = enabled
  })
}

export const setEnabledForwardingFilter = (enabled: boolean): void => {
  updateStore((state) => {
    state.enabledForwardingFilter = enabled
  })
}

export const setEnabledSignalingNotifyMetadata = (enabled: boolean): void => {
  updateStore((state) => {
    state.enabledSignalingNotifyMetadata = enabled
  })
}

export const setEnabledSignalingUrlCandidates = (enabled: boolean): void => {
  updateStore((state) => {
    state.enabledSignalingUrlCandidates = enabled
  })
}

export const setEnabledVideoVP9Params = (enabled: boolean): void => {
  updateStore((state) => {
    state.enabledVideoVP9Params = enabled
  })
}

export const setEnabledVideoH264Params = (enabled: boolean): void => {
  updateStore((state) => {
    state.enabledVideoH264Params = enabled
  })
}

export const setEnabledVideoH265Params = (enabled: boolean): void => {
  updateStore((state) => {
    state.enabledVideoH265Params = enabled
  })
}

export const setEnabledVideoAV1Params = (enabled: boolean): void => {
  updateStore((state) => {
    state.enabledVideoAV1Params = enabled
  })
}

export const setFakeVolume = (fakeVolume: string): void => {
  updateStore((state) => {
    const volume = Number.parseFloat(fakeVolume)
    if (Number.isNaN(volume)) {
      state.fakeVolume = '0'
    } else if (volume > 1) {
      state.fakeVolume = '1'
    } else {
      state.fakeVolume = String(volume)
    }
    if (state.fakeContents.gainNode) {
      state.fakeContents.gainNode.gain.setValueAtTime(Number.parseFloat(state.fakeVolume), 0)
    }
  })
}

export const setFakeContentsGainNode = (gainNode: GainNode | null): void => {
  updateStore((state) => {
    state.fakeContents.gainNode = gainNode
  })
}

export const setInitialFakeContents = (): void => {
  updateStore((state) => {
    state.fakeContents.colorCode = Math.floor(Math.random() * 0xffffff)
    if (URL.createObjectURL) {
      const url = URL.createObjectURL(new Blob([WORKER_SCRIPT], { type: 'application/javascript' }))
      state.fakeContents.worker = new Worker(url)
    }
  })
}

export const setFrameRate = (frameRate: SoraDevtoolsState['frameRate']): void => {
  updateStore((state) => {
    state.frameRate = frameRate
  })
}

export const setMute = (mute: boolean): void => {
  updateStore((state) => {
    state.mute = mute
  })
}

export const setMediaStats = (mediaStats: boolean): void => {
  updateStore((state) => {
    state.mediaStats = mediaStats
  })
}

export const setMp4MediaStream = (mp4MediaStream: Mp4MediaStream | null): void => {
  updateStore((state) => {
    state.mp4MediaStream = mp4MediaStream
  })
}

export const setNoiseSuppression = (
  noiseSuppression: SoraDevtoolsState['noiseSuppression'],
): void => {
  updateStore((state) => {
    state.noiseSuppression = noiseSuppression
  })
}

export const setMediaType = (mediaType: SoraDevtoolsState['mediaType']): void => {
  updateStore((state) => {
    state.mediaType = mediaType
  })
}

export const setMetadata = (metadata: string): void => {
  updateStore((state) => {
    state.metadata = metadata
  })
}

export const setResolution = (resolution: SoraDevtoolsState['resolution']): void => {
  updateStore((state) => {
    state.resolution = resolution
  })
}

export const setSignalingNotifyMetadata = (signalingNotifyMetadata: string): void => {
  updateStore((state) => {
    state.signalingNotifyMetadata = signalingNotifyMetadata
  })
}

export const setSignalingUrlCandidates = (signalingUrlCandidates: string[]): void => {
  updateStore((state) => {
    state.signalingUrlCandidates = signalingUrlCandidates
  })
}

export const setForwardingFilters = (forwardingFilters: string): void => {
  updateStore((state) => {
    state.forwardingFilters = forwardingFilters
  })
}

export const setForwardingFilter = (forwardingFilter: string): void => {
  updateStore((state) => {
    state.forwardingFilter = forwardingFilter
  })
}

export const setSimulcastRid = (simulcastRid: SoraDevtoolsState['simulcastRid']): void => {
  updateStore((state) => {
    state.simulcastRid = simulcastRid
  })
}

export const setSimulcastRequestRid = (
  simulcastRequestRid: SoraDevtoolsState['simulcastRequestRid'],
): void => {
  updateStore((state) => {
    state.simulcastRequestRid = simulcastRequestRid
  })
}

export const setSpotlightNumber = (spotlightNumber: SoraDevtoolsState['spotlightNumber']): void => {
  updateStore((state) => {
    state.spotlightNumber = spotlightNumber
  })
}

export const setSpotlightFocusRid = (
  spotlightFocusRid: SoraDevtoolsState['spotlightFocusRid'],
): void => {
  updateStore((state) => {
    state.spotlightFocusRid = spotlightFocusRid
  })
}

export const setSpotlightUnfocusRid = (
  spotlightUnfocusRid: SoraDevtoolsState['spotlightUnfocusRid'],
): void => {
  updateStore((state) => {
    state.spotlightUnfocusRid = spotlightUnfocusRid
  })
}

export const setVideo = (video: boolean): void => {
  updateStore((state) => {
    state.video = video
  })
}

export const setVideoInput = (videoInput: string): void => {
  updateStore((state) => {
    state.videoInput = videoInput
  })
}

export const setVideoBitRate = (videoBitRate: SoraDevtoolsState['videoBitRate']): void => {
  updateStore((state) => {
    state.videoBitRate = videoBitRate
  })
}

export const setVideoCodecType = (videoCodecType: SoraDevtoolsState['videoCodecType']): void => {
  updateStore((state) => {
    state.videoCodecType = videoCodecType
  })
}

export const setVideoContentHint = (
  videoContentHint: SoraDevtoolsState['videoContentHint'],
): void => {
  updateStore((state) => {
    state.videoContentHint = videoContentHint
    if (state.soraContents.localMediaStream) {
      for (const track of state.soraContents.localMediaStream.getVideoTracks()) {
        track.contentHint = state.videoContentHint
      }
    }
  })
}

export const setVideoVP9Params = (videoVP9Params: string): void => {
  updateStore((state) => {
    state.videoVP9Params = videoVP9Params
  })
}

export const setVideoH264Params = (videoH264Params: string): void => {
  updateStore((state) => {
    state.videoH264Params = videoH264Params
  })
}

export const setVideoH265Params = (videoH265Params: string): void => {
  updateStore((state) => {
    state.videoH265Params = videoH265Params
  })
}

export const setVideoAV1Params = (videoAV1Params: string): void => {
  updateStore((state) => {
    state.videoAV1Params = videoAV1Params
  })
}

export const setSora = (sora: ConnectionPublisher | ConnectionSubscriber | null): void => {
  updateStore((state) => {
    state.soraContents.sora = sora as any
    if (!state.soraContents.sora) {
      state.soraContents.dataChannels = []
    }
  })
}

export const setSoraSessionId = (sessionId: string | null): void => {
  updateStore((state) => {
    state.soraContents.sessionId = sessionId
  })
}

export const setSoraConnectionId = (connectionId: string | null): void => {
  updateStore((state) => {
    state.soraContents.connectionId = connectionId
  })
}

export const setSoraClientId = (clientId: string | null): void => {
  updateStore((state) => {
    state.soraContents.clientId = clientId
  })
}

export const setSoraTurnUrl = (turnUrl: string | null): void => {
  updateStore((state) => {
    state.soraContents.turnUrl = turnUrl
  })
}

export const setSoraConnectionStatus = (
  status: SoraDevtoolsState['soraContents']['connectionStatus'],
): void => {
  updateStore((state) => {
    state.soraContents.connectionStatus = status
  })
}

export const setSoraReconnecting = (
  reconnecting: SoraDevtoolsState['soraContents']['reconnecting'],
): void => {
  updateStore((state) => {
    state.soraContents.reconnecting = reconnecting
    if (state.soraContents.reconnecting === false) {
      state.soraContents.reconnectingTrials = 0
    }
  })
}

export const setSoraReconnectingTrials = (
  trials: SoraDevtoolsState['soraContents']['reconnectingTrials'],
): void => {
  updateStore((state) => {
    state.soraContents.reconnectingTrials = trials
  })
}

export const setSoraDataChannels = (dataChannel: DataChannelConfiguration): void => {
  updateStore((state) => {
    state.soraContents.dataChannels.push(dataChannel)
  })
}

export const setLocalMediaStream = (mediaStream: MediaStream | null): void => {
  updateStore((state) => {
    if (state.soraContents.localMediaStream) {
      state.soraContents.localMediaStream.getTracks().forEach((track) => {
        track.stop()
      })
    }
    state.soraContents.localMediaStream = mediaStream
  })
}

export const setRemoteClient = (remoteClient: RemoteClient): void => {
  updateStore((state) => {
    state.soraContents.remoteClients.push(remoteClient)
  })
}

export const setSoraRemoteClientId = (payload: {
  connectionId: string
  clientId: string
}): void => {
  updateStore((state) => {
    for (const client of state.soraContents.remoteClients) {
      if (client.connectionId === payload.connectionId) {
        client.clientId = payload.clientId
      }
    }
  })
}

export const setStatsReport = (statsReport: RTCStats[]): void => {
  updateStore((state) => {
    state.soraContents.prevStatsReport = state.soraContents.statsReport
    state.soraContents.statsReport = statsReport
  })
}

export const removeRemoteClient = (connectionId: string): void => {
  updateStore((state) => {
    const remoteClients = state.soraContents.remoteClients.filter(
      (client) => client.connectionId !== connectionId,
    )
    state.soraContents.remoteClients = remoteClients
  })
}

export const removeAllRemoteClients = (): void => {
  updateStore((state) => {
    state.soraContents.remoteClients = []
  })
}

export const setAudioInputDevices = (devices: MediaDeviceInfo[]): void => {
  updateStore((state) => {
    state.audioInputDevices = devices
  })
}

export const setVideoInputDevices = (devices: MediaDeviceInfo[]): void => {
  updateStore((state) => {
    state.videoInputDevices = devices
  })
}

export const setAudioOutputDevices = (devices: MediaDeviceInfo[]): void => {
  updateStore((state) => {
    state.audioOutputDevices = devices
  })
}

export const setSoraInfoAlertMessage = (message: string): void => {
  const alertMessage: AlertMessage = {
    title: 'Sora info',
    type: 'info',
    message: message,
    timestamp: Date.now(),
  }
  setAlertMessagesAndLogMessages(alertMessage)
}

export const setSoraErrorAlertMessage = (message: string): void => {
  const alertMessage: AlertMessage = {
    title: 'Sora error',
    type: 'error',
    message: message,
    timestamp: Date.now(),
  }
  setAlertMessagesAndLogMessages(alertMessage)
}

export const setAPIInfoAlertMessage = (message: string): void => {
  const alertMessage: AlertMessage = {
    title: 'API info',
    type: 'info',
    message: message,
    timestamp: Date.now(),
  }
  setAlertMessagesAndLogMessages(alertMessage)
}

export const setAPIErrorAlertMessage = (message: string): void => {
  const alertMessage: AlertMessage = {
    title: 'API error',
    type: 'error',
    message: message,
    timestamp: Date.now(),
  }
  setAlertMessagesAndLogMessages(alertMessage)
}

export const setRPCErrorAlertMessage = (message: string): void => {
  const alertMessage: AlertMessage = {
    title: 'RPC error',
    type: 'error',
    message: message,
    timestamp: Date.now(),
  }
  setAlertMessagesAndLogMessages(alertMessage)
}

export const deleteAlertMessage = (timestamp: number): void => {
  updateStore((state) => {
    const filterdAlertMessages = state.alertMessages.filter(
      (alertMessage) => alertMessage.timestamp !== timestamp,
    )
    state.alertMessages = filterdAlertMessages
  })
}

export const setDebug = (debug: boolean): void => {
  updateStore((state) => {
    state.debug = debug
  })
}

export const setDebugFilterText = (text: string): void => {
  updateStore((state) => {
    state.debugFilterText = text
  })
}

export const setDebugType = (type: DebugType): void => {
  updateStore((state) => {
    state.debugFilterText = ''
    state.debugType = type
  })
}

export const setLogMessages = (message: LogMessage['message']): void => {
  updateStore((state) => {
    state.logMessages.push({
      timestamp: Date.now(),
      message: {
        title: message.title,
        description: message.description,
      },
    })
  })
}

export const setNotifyMessages = (message: NotifyMessage): void => {
  updateStore((state) => {
    state.notifyMessages.push(message)
  })
}

export const setPushMessages = (message: PushMessage): void => {
  updateStore((state) => {
    state.pushMessages.push(message)
  })
}

export const setFocusedSpotlightConnectionId = (connectionId: string): void => {
  updateStore((state) => {
    state.focusedSpotlightConnectionIds[connectionId] = true
  })
}

export const setUnFocusedSpotlightConnectionId = (connectionId: string): void => {
  updateStore((state) => {
    state.focusedSpotlightConnectionIds[connectionId] = false
  })
}

export const deleteFocusedSpotlightConnectionId = (connectionId: string): void => {
  updateStore((state) => {
    delete state.focusedSpotlightConnectionIds[connectionId]
  })
}

export const setShowStats = (showStats: boolean): void => {
  updateStore((state) => {
    state.showStats = showStats
  })
}

export const setCameraDevice = (cameraDevice: boolean): void => {
  updateStore((state) => {
    state.cameraDevice = cameraDevice
  })
}

export const setMicDevice = (micDevice: boolean): void => {
  updateStore((state) => {
    state.micDevice = micDevice
  })
}

export const setAudioTrack = (audioTrack: boolean): void => {
  updateStore((state) => {
    state.audioTrack = audioTrack
    if (state.soraContents.localMediaStream) {
      for (const track of state.soraContents.localMediaStream.getAudioTracks()) {
        track.enabled = state.audioTrack
      }
    }
  })
}

export const setVideoTrack = (videoTrack: boolean): void => {
  updateStore((state) => {
    state.videoTrack = videoTrack
    if (state.soraContents.localMediaStream) {
      for (const track of state.soraContents.localMediaStream.getVideoTracks()) {
        track.enabled = state.videoTrack
      }
    }
  })
}

export const setRole = (role: Role): void => {
  updateStore((state) => {
    state.role = role
  })
}

export const setSimulcast = (simulcast: SoraDevtoolsState['simulcast']): void => {
  updateStore((state) => {
    state.simulcast = simulcast
  })
}

export const setSpotlight = (spotlight: SoraDevtoolsState['spotlight']): void => {
  updateStore((state) => {
    state.spotlight = spotlight
  })
}

export const setReconnect = (reconnect: boolean): void => {
  updateStore((state) => {
    state.reconnect = reconnect
  })
}

export const setApiUrl = (apiUrl: string): void => {
  updateStore((state) => {
    state.apiUrl = apiUrl
  })
}

export const setDebugApiUrl = (debugApiUrl: string): void => {
  updateStore((state) => {
    state.debugApiUrl = debugApiUrl
  })
}

export const clearDataChannelMessages = (): void => {
  updateStore((state) => {
    state.dataChannelMessages = []
  })
}

export const setRpcObject = (rpcObject: SoraDevtoolsState['rpcObjects'][number]): void => {
  updateStore((state) => {
    state.rpcObjects.unshift(rpcObject)
  })
}

export const clearRpcObjects = (): void => {
  updateStore((state) => {
    state.rpcObjects = []
  })
}

export const setApiObject = (apiObject: SoraDevtoolsState['apiObjects'][number]): void => {
  updateStore((state) => {
    state.apiObjects.unshift(apiObject)
  })
}

export const clearApiObjects = (): void => {
  updateStore((state) => {
    state.apiObjects = []
  })
}

export const setAspectRatio = (aspectRatio: SoraDevtoolsState['aspectRatio']): void => {
  updateStore((state) => {
    state.aspectRatio = aspectRatio
  })
}

export const setResizeMode = (resizeMode: SoraDevtoolsState['resizeMode']): void => {
  updateStore((state) => {
    state.resizeMode = resizeMode
  })
}

export const setBlurRadius = (blurRadius: SoraDevtoolsState['blurRadius']): void => {
  updateStore((state) => {
    if (blurRadius !== '' && state.virtualBackgroundProcessor === null) {
      const assetsPath = import.meta.env.VITE_VIRTUAL_BACKGROUND_ASSETS_PATH || ''
      const processor = new VirtualBackgroundProcessor(assetsPath)
      state.virtualBackgroundProcessor = processor
    }
    state.blurRadius = blurRadius
  })
}

export const setMediaProcessorsNoiseSuppression = (
  mediaProcessorsNoiseSuppression: SoraDevtoolsState['mediaProcessorsNoiseSuppression'],
): void => {
  updateStore((state) => {
    if (mediaProcessorsNoiseSuppression && state.noiseSuppressionProcessor === null) {
      const processor = new NoiseSuppressionProcessor()
      state.noiseSuppressionProcessor = processor
    }
    state.mediaProcessorsNoiseSuppression = mediaProcessorsNoiseSuppression
  })
}

export const setBundleId = (bundleId: SoraDevtoolsState['bundleId']): void => {
  updateStore((state) => {
    state.bundleId = bundleId
  })
}

export const setEnabledBundleId = (enabledBundleId: SoraDevtoolsState['enabledBundleId']): void => {
  updateStore((state) => {
    state.enabledBundleId = enabledBundleId
  })
}

export const setFacingMode = (facingMode: SoraDevtoolsState['facingMode']): void => {
  updateStore((state) => {
    state.facingMode = facingMode
  })
}

export const setAudioStreamingLanguageCode = (
  audioStreamingLanguageCode: SoraDevtoolsState['audioStreamingLanguageCode'],
): void => {
  updateStore((state) => {
    state.audioStreamingLanguageCode = audioStreamingLanguageCode
  })
}

export const setEnabledAudioStreamingLanguageCode = (
  enabledAudioStreamingLanguageCode: SoraDevtoolsState['enabledAudioStreamingLanguageCode'],
): void => {
  updateStore((state) => {
    state.enabledAudioStreamingLanguageCode = enabledAudioStreamingLanguageCode
  })
}

export const setForceStereoOutput = (
  forceStereoOutput: SoraDevtoolsState['forceStereoOutput'],
): void => {
  updateStore((state) => {
    state.forceStereoOutput = forceStereoOutput
  })
}

// Zustand 互換の getState 関数
export const getState = (): SoraDevtoolsState => store.value

// Zustand 互換の useSoraDevtoolsStore フック
// @preact/signals では signal.value をコンポーネント内でアクセスすると自動的に再レンダリングされる
export function useSoraDevtoolsStore<T>(selector: (state: SoraDevtoolsState) => T): T {
  return selector(store.value)
}

// 型エクスポート
export type RootState = SoraDevtoolsState
