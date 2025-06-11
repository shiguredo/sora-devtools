import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { LightAdjustmentProcessor } from '@shiguredo/light-adjustment'
import type { Mp4MediaStream } from '@shiguredo/mp4-media-stream'
import { NoiseSuppressionProcessor } from '@shiguredo/noise-suppression'
import { VirtualBackgroundProcessor } from '@shiguredo/virtual-background'
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

interface SoraDevtoolsActions {
  resetState: () => void
  setAudio: (audio: boolean) => void
  setAudioInput: (audioInput: string) => void
  setAudioOutput: (audioOutput: string) => void
  setAudioBitRate: (audioBitRate: SoraDevtoolsState['audioBitRate']) => void
  setAudioCodecType: (audioCodecType: SoraDevtoolsState['audioCodecType']) => void
  setAudioContentHint: (audioContentHint: SoraDevtoolsState['audioContentHint']) => void
  setAutoGainControl: (autoGainControl: SoraDevtoolsState['autoGainControl']) => void
  setClientId: (clientId: string) => void
  setChannelId: (channelId: string) => void
  setTimelineMessage: (message: TimelineMessage) => void
  setDataChannelSignaling: (dataChannelSignaling: SoraDevtoolsState['dataChannelSignaling']) => void
  setDataChannels: (dataChannels: string) => void
  setDataChannelMessage: (message: DataChannelMessage) => void
  setGoogCpuOveruseDetection: (googCpuOveruseDetection: boolean) => void
  setDisplayResolution: (displayResolution: SoraDevtoolsState['displayResolution']) => void
  setEchoCancellation: (echoCancellation: SoraDevtoolsState['echoCancellation']) => void
  setEchoCancellationType: (echoCancellationType: SoraDevtoolsState['echoCancellationType']) => void
  setEnabledClientId: (enabled: boolean) => void
  setEnabledDataChannels: (enabled: boolean) => void
  setEnabledDataChannel: (enabled: boolean) => void
  setEnabledMetadata: (enabled: boolean) => void
  setIgnoreDisconnectWebSocket: (ignoreDisconnectWebSocket: SoraDevtoolsState['ignoreDisconnectWebSocket']) => void
  setSignalingMessage: (message: SignalingMessage) => void
  setEnabledForwardingFilters: (enabled: boolean) => void
  setEnabledForwardingFilter: (enabled: boolean) => void
  setEnabledSignalingNotifyMetadata: (enabled: boolean) => void
  setEnabledSignalingUrlCandidates: (enabled: boolean) => void
  setEnabledVideoVP9Params: (enabled: boolean) => void
  setEnabledVideoH264Params: (enabled: boolean) => void
  setEnabledVideoH265Params: (enabled: boolean) => void
  setEnabledVideoAV1Params: (enabled: boolean) => void
  setFakeVolume: (fakeVolume: string) => void
  setFakeContentsGainNode: (gainNode: GainNode | null) => void
  setInitialFakeContents: () => void
  setFrameRate: (frameRate: SoraDevtoolsState['frameRate']) => void
  setMute: (mute: boolean) => void
  setMediaStats: (mediaStats: boolean) => void
  setMp4MediaStream: (mp4MediaStream: Mp4MediaStream | null) => void
  setNoiseSuppression: (noiseSuppression: SoraDevtoolsState['noiseSuppression']) => void
  setMediaType: (mediaType: SoraDevtoolsState['mediaType']) => void
  setMetadata: (metadata: string) => void
  setResolution: (resolution: SoraDevtoolsState['resolution']) => void
  setSignalingNotifyMetadata: (signalingNotifyMetadata: string) => void
  setSignalingUrlCandidates: (signalingUrlCandidates: string[]) => void
  setForwardingFilters: (forwardingFilters: string) => void
  setForwardingFilter: (forwardingFilter: string) => void
  setSimulcastRid: (simulcastRid: SoraDevtoolsState['simulcastRid']) => void
  setSpotlightNumber: (spotlightNumber: SoraDevtoolsState['spotlightNumber']) => void
  setSpotlightFocusRid: (spotlightFocusRid: SoraDevtoolsState['spotlightFocusRid']) => void
  setSpotlightUnfocusRid: (spotlightUnfocusRid: SoraDevtoolsState['spotlightUnfocusRid']) => void
  setVideo: (video: boolean) => void
  setVideoInput: (videoInput: string) => void
  setVideoBitRate: (videoBitRate: SoraDevtoolsState['videoBitRate']) => void
  setVideoCodecType: (videoCodecType: SoraDevtoolsState['videoCodecType']) => void
  setVideoContentHint: (videoContentHint: SoraDevtoolsState['videoContentHint']) => void
  setVideoVP9Params: (videoVP9Params: string) => void
  setVideoH264Params: (videoH264Params: string) => void
  setVideoH265Params: (videoH265Params: string) => void
  setVideoAV1Params: (videoAV1Params: string) => void
  setSora: (sora: ConnectionPublisher | ConnectionSubscriber | null) => void
  setSoraSessionId: (sessionId: string | null) => void
  setSoraConnectionId: (connectionId: string | null) => void
  setSoraClientId: (clientId: string | null) => void
  setSoraTurnUrl: (turnUrl: string | null) => void
  setSoraConnectionStatus: (status: SoraDevtoolsState['soraContents']['connectionStatus']) => void
  setSoraReconnecting: (reconnecting: SoraDevtoolsState['soraContents']['reconnecting']) => void
  setSoraReconnectingTrials: (trials: SoraDevtoolsState['soraContents']['reconnectingTrials']) => void
  setSoraDataChannels: (dataChannel: DataChannelConfiguration) => void
  setLocalMediaStream: (mediaStream: MediaStream | null) => void
  setRemoteClient: (remoteClient: RemoteClient) => void
  setSoraRemoteClientId: (payload: { connectionId: string; clientId: string }) => void
  setStatsReport: (statsReport: RTCStats[]) => void
  removeRemoteClient: (connectionId: string) => void
  removeAllRemoteClients: () => void
  setAudioInputDevices: (devices: MediaDeviceInfo[]) => void
  setVideoInputDevices: (devices: MediaDeviceInfo[]) => void
  setAudioOutputDevices: (devices: MediaDeviceInfo[]) => void
  setSoraInfoAlertMessage: (message: string) => void
  setSoraErrorAlertMessage: (message: string) => void
  setAPIInfoAlertMessage: (message: string) => void
  setAPIErrorAlertMessage: (message: string) => void
  deleteAlertMessage: (timestamp: number) => void
  setDebug: (debug: boolean) => void
  setDebugFilterText: (text: string) => void
  setDebugType: (type: DebugType) => void
  setLogMessages: (message: LogMessage['message']) => void
  setNotifyMessages: (message: NotifyMessage) => void
  setPushMessages: (message: PushMessage) => void
  setFocusedSpotlightConnectionId: (connectionId: string) => void
  setUnFocusedSpotlightConnectionId: (connectionId: string) => void
  deleteFocusedSpotlightConnectionId: (connectionId: string) => void
  setShowStats: (showStats: boolean) => void
  setCameraDevice: (cameraDevice: boolean) => void
  setMicDevice: (micDevice: boolean) => void
  setAudioTrack: (audioTrack: boolean) => void
  setVideoTrack: (videoTrack: boolean) => void
  setRole: (role: Role) => void
  setSimulcast: (simulcast: SoraDevtoolsState['simulcast']) => void
  setSpotlight: (spotlight: SoraDevtoolsState['spotlight']) => void
  setReconnect: (reconnect: boolean) => void
  setApiUrl: (apiUrl: string) => void
  clearDataChannelMessages: () => void
  setAspectRatio: (aspectRatio: SoraDevtoolsState['aspectRatio']) => void
  setResizeMode: (resizeMode: SoraDevtoolsState['resizeMode']) => void
  setLightAdjustment: (lightAdjustment: SoraDevtoolsState['lightAdjustment']) => void
  setBlurRadius: (blurRadius: SoraDevtoolsState['blurRadius']) => void
  setMediaProcessorsNoiseSuppression: (mediaProcessorsNoiseSuppression: SoraDevtoolsState['mediaProcessorsNoiseSuppression']) => void
  setBundleId: (bundleId: SoraDevtoolsState['bundleId']) => void
  setEnabledBundleId: (enabledBundleId: SoraDevtoolsState['enabledBundleId']) => void
  setFacingMode: (facingMode: SoraDevtoolsState['facingMode']) => void
  setAudioStreamingLanguageCode: (audioStreamingLanguageCode: SoraDevtoolsState['audioStreamingLanguageCode']) => void
  setEnabledAudioStreamingLanguageCode: (enabledAudioStreamingLanguageCode: SoraDevtoolsState['enabledAudioStreamingLanguageCode']) => void
}

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
}

function setAlertMessagesAndLogMessages(
  alertMessages: SoraDevtoolsState['alertMessages'],
  logMessages: SoraDevtoolsState['logMessages'],
  alertMessage: AlertMessage,
): void {
  if (alertMessages.length >= 10) {
    for (let i = 0; i <= alertMessages.length - 5; i++) {
      alertMessages.pop()
    }
  }
  alertMessages.unshift(alertMessage)
  logMessages.push({
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
}

export const useSoraDevtoolsStore = create<SoraDevtoolsState & SoraDevtoolsActions>()(
  devtools(
    immer((set) => ({
      ...initialState,
      resetState: () => set(() => ({ ...initialState })),
      setAudio: (audio) => set((state) => { state.audio = audio }),
      setAudioInput: (audioInput) => set((state) => { state.audioInput = audioInput }),
      setAudioOutput: (audioOutput) => set((state) => { state.audioOutput = audioOutput }),
      setAudioBitRate: (audioBitRate) => set((state) => { state.audioBitRate = audioBitRate }),
      setAudioCodecType: (audioCodecType) => set((state) => { state.audioCodecType = audioCodecType }),
      setAudioContentHint: (audioContentHint) => set((state) => {
        state.audioContentHint = audioContentHint
        if (state.soraContents.localMediaStream) {
          for (const track of state.soraContents.localMediaStream.getAudioTracks()) {
            track.contentHint = state.audioContentHint
          }
        }
      }),
      setAutoGainControl: (autoGainControl) => set((state) => { state.autoGainControl = autoGainControl }),
      setClientId: (clientId) => set((state) => { state.clientId = clientId }),
      setChannelId: (channelId) => set((state) => { state.channelId = channelId }),
      setTimelineMessage: (message) => set((state) => { state.timelineMessages.push(message) }),
      setDataChannelSignaling: (dataChannelSignaling) => set((state) => { state.dataChannelSignaling = dataChannelSignaling }),
      setDataChannels: (dataChannels) => set((state) => { state.dataChannels = dataChannels }),
      setDataChannelMessage: (message) => set((state) => { state.dataChannelMessages.push(message) }),
      setGoogCpuOveruseDetection: (googCpuOveruseDetection) => set((state) => { state.googCpuOveruseDetection = googCpuOveruseDetection }),
      setDisplayResolution: (displayResolution) => set((state) => { state.displayResolution = displayResolution }),
      setEchoCancellation: (echoCancellation) => set((state) => { state.echoCancellation = echoCancellation }),
      setEchoCancellationType: (echoCancellationType) => set((state) => { state.echoCancellationType = echoCancellationType }),
      setEnabledClientId: (enabled) => set((state) => { state.enabledClientId = enabled }),
      setEnabledDataChannels: (enabled) => set((state) => { state.enabledDataChannels = enabled }),
      setEnabledDataChannel: (enabled) => set((state) => { state.enabledDataChannel = enabled }),
      setEnabledMetadata: (enabled) => set((state) => { state.enabledMetadata = enabled }),
      setIgnoreDisconnectWebSocket: (ignoreDisconnectWebSocket) => set((state) => { state.ignoreDisconnectWebSocket = ignoreDisconnectWebSocket }),
      setSignalingMessage: (message) => set((state) => { state.signalingMessages.push(message) }),
      setEnabledForwardingFilters: (enabled) => set((state) => { state.enabledForwardingFilters = enabled }),
      setEnabledForwardingFilter: (enabled) => set((state) => { state.enabledForwardingFilter = enabled }),
      setEnabledSignalingNotifyMetadata: (enabled) => set((state) => { state.enabledSignalingNotifyMetadata = enabled }),
      setEnabledSignalingUrlCandidates: (enabled) => set((state) => { state.enabledSignalingUrlCandidates = enabled }),
      setEnabledVideoVP9Params: (enabled) => set((state) => { state.enabledVideoVP9Params = enabled }),
      setEnabledVideoH264Params: (enabled) => set((state) => { state.enabledVideoH264Params = enabled }),
      setEnabledVideoH265Params: (enabled) => set((state) => { state.enabledVideoH265Params = enabled }),
      setEnabledVideoAV1Params: (enabled) => set((state) => { state.enabledVideoAV1Params = enabled }),
      setFakeVolume: (fakeVolume) => set((state) => {
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
      }),
      setFakeContentsGainNode: (gainNode) => set((state) => { state.fakeContents.gainNode = gainNode }),
      setInitialFakeContents: () => set((state) => {
        state.fakeContents.colorCode = Math.floor(Math.random() * 0xffffff)
        if (URL.createObjectURL) {
          const url = URL.createObjectURL(
            new Blob([WORKER_SCRIPT], { type: 'application/javascript' }),
          )
          state.fakeContents.worker = new Worker(url)
        }
      }),
      setFrameRate: (frameRate) => set((state) => { state.frameRate = frameRate }),
      setMute: (mute) => set((state) => { state.mute = mute }),
      setMediaStats: (mediaStats) => set((state) => { state.mediaStats = mediaStats }),
      setMp4MediaStream: (mp4MediaStream) => set((state) => { state.mp4MediaStream = mp4MediaStream }),
      setNoiseSuppression: (noiseSuppression) => set((state) => { state.noiseSuppression = noiseSuppression }),
      setMediaType: (mediaType) => set((state) => { state.mediaType = mediaType }),
      setMetadata: (metadata) => set((state) => { state.metadata = metadata }),
      setResolution: (resolution) => set((state) => { state.resolution = resolution }),
      setSignalingNotifyMetadata: (signalingNotifyMetadata) => set((state) => { state.signalingNotifyMetadata = signalingNotifyMetadata }),
      setSignalingUrlCandidates: (signalingUrlCandidates) => set((state) => { state.signalingUrlCandidates = signalingUrlCandidates }),
      setForwardingFilters: (forwardingFilters) => set((state) => { state.forwardingFilters = forwardingFilters }),
      setForwardingFilter: (forwardingFilter) => set((state) => { state.forwardingFilter = forwardingFilter }),
      setSimulcastRid: (simulcastRid) => set((state) => { state.simulcastRid = simulcastRid }),
      setSpotlightNumber: (spotlightNumber) => set((state) => { state.spotlightNumber = spotlightNumber }),
      setSpotlightFocusRid: (spotlightFocusRid) => set((state) => { state.spotlightFocusRid = spotlightFocusRid }),
      setSpotlightUnfocusRid: (spotlightUnfocusRid) => set((state) => { state.spotlightUnfocusRid = spotlightUnfocusRid }),
      setVideo: (video) => set((state) => { state.video = video }),
      setVideoInput: (videoInput) => set((state) => { state.videoInput = videoInput }),
      setVideoBitRate: (videoBitRate) => set((state) => { state.videoBitRate = videoBitRate }),
      setVideoCodecType: (videoCodecType) => set((state) => { state.videoCodecType = videoCodecType }),
      setVideoContentHint: (videoContentHint) => set((state) => {
        state.videoContentHint = videoContentHint
        if (state.soraContents.localMediaStream) {
          for (const track of state.soraContents.localMediaStream.getVideoTracks()) {
            track.contentHint = state.videoContentHint
          }
        }
      }),
      setVideoVP9Params: (videoVP9Params) => set((state) => { state.videoVP9Params = videoVP9Params }),
      setVideoH264Params: (videoH264Params) => set((state) => { state.videoH264Params = videoH264Params }),
      setVideoH265Params: (videoH265Params) => set((state) => { state.videoH265Params = videoH265Params }),
      setVideoAV1Params: (videoAV1Params) => set((state) => { state.videoAV1Params = videoAV1Params }),
      setSora: (sora) => set((state) => {
        state.soraContents.sora = sora as any
        if (!state.soraContents.sora) {
          state.soraContents.dataChannels = []
        }
      }),
      setSoraSessionId: (sessionId) => set((state) => { state.soraContents.sessionId = sessionId }),
      setSoraConnectionId: (connectionId) => set((state) => { state.soraContents.connectionId = connectionId }),
      setSoraClientId: (clientId) => set((state) => { state.soraContents.clientId = clientId }),
      setSoraTurnUrl: (turnUrl) => set((state) => { state.soraContents.turnUrl = turnUrl }),
      setSoraConnectionStatus: (status) => set((state) => { state.soraContents.connectionStatus = status }),
      setSoraReconnecting: (reconnecting) => set((state) => {
        state.soraContents.reconnecting = reconnecting
        if (state.soraContents.reconnecting === false) {
          state.soraContents.reconnectingTrials = 0
        }
      }),
      setSoraReconnectingTrials: (trials) => set((state) => { state.soraContents.reconnectingTrials = trials }),
      setSoraDataChannels: (dataChannel) => set((state) => { state.soraContents.dataChannels.push(dataChannel) }),
      setLocalMediaStream: (mediaStream) => set((state) => {
        if (state.soraContents.localMediaStream) {
          state.soraContents.localMediaStream.getTracks().filter((track) => {
            track.stop()
          })
        }
        state.soraContents.localMediaStream = mediaStream
      }),
      setRemoteClient: (remoteClient) => set((state) => { state.soraContents.remoteClients.push(remoteClient) }),
      setSoraRemoteClientId: (payload) => set((state) => {
        for (const client of state.soraContents.remoteClients) {
          if (client.connectionId === payload.connectionId) {
            client.clientId = payload.clientId
          }
        }
      }),
      setStatsReport: (statsReport) => set((state) => {
        state.soraContents.prevStatsReport = state.soraContents.statsReport
        state.soraContents.statsReport = statsReport
      }),
      removeRemoteClient: (connectionId) => set((state) => {
        const remoteClients = state.soraContents.remoteClients.filter(
          (client) => client.connectionId !== connectionId,
        )
        state.soraContents.remoteClients = remoteClients
      }),
      removeAllRemoteClients: () => set((state) => { state.soraContents.remoteClients = [] }),
      setAudioInputDevices: (devices) => set((state) => { state.audioInputDevices = devices }),
      setVideoInputDevices: (devices) => set((state) => { state.videoInputDevices = devices }),
      setAudioOutputDevices: (devices) => set((state) => { state.audioOutputDevices = devices }),
      setSoraInfoAlertMessage: (message) => set((state) => {
        const alertMessage: AlertMessage = {
          title: 'Sora info',
          type: 'info',
          message: message,
          timestamp: Date.now(),
        }
        setAlertMessagesAndLogMessages(state.alertMessages, state.logMessages, alertMessage)
      }),
      setSoraErrorAlertMessage: (message) => set((state) => {
        const alertMessage: AlertMessage = {
          title: 'Sora error',
          type: 'error',
          message: message,
          timestamp: Date.now(),
        }
        setAlertMessagesAndLogMessages(state.alertMessages, state.logMessages, alertMessage)
      }),
      setAPIInfoAlertMessage: (message) => set((state) => {
        const alertMessage: AlertMessage = {
          title: 'API info',
          type: 'info',
          message: message,
          timestamp: Date.now(),
        }
        setAlertMessagesAndLogMessages(state.alertMessages, state.logMessages, alertMessage)
      }),
      setAPIErrorAlertMessage: (message) => set((state) => {
        const alertMessage: AlertMessage = {
          title: 'API error',
          type: 'error',
          message: message,
          timestamp: Date.now(),
        }
        setAlertMessagesAndLogMessages(state.alertMessages, state.logMessages, alertMessage)
      }),
      deleteAlertMessage: (timestamp) => set((state) => {
        const filterdAlertMessages = state.alertMessages.filter(
          (alertMessage) => alertMessage.timestamp !== timestamp,
        )
        state.alertMessages = filterdAlertMessages
      }),
      setDebug: (debug) => set((state) => { state.debug = debug }),
      setDebugFilterText: (text) => set((state) => { state.debugFilterText = text }),
      setDebugType: (type) => set((state) => {
        state.debugFilterText = ''
        state.debugType = type
      }),
      setLogMessages: (message) => set((state) => {
        state.logMessages.push({
          timestamp: Date.now(),
          message: {
            title: message.title,
            description: message.description,
          },
        })
      }),
      setNotifyMessages: (message) => set((state) => { state.notifyMessages.push(message) }),
      setPushMessages: (message) => set((state) => { state.pushMessages.push(message) }),
      setFocusedSpotlightConnectionId: (connectionId) => set((state) => { state.focusedSpotlightConnectionIds[connectionId] = true }),
      setUnFocusedSpotlightConnectionId: (connectionId) => set((state) => { state.focusedSpotlightConnectionIds[connectionId] = false }),
      deleteFocusedSpotlightConnectionId: (connectionId) => set((state) => { delete state.focusedSpotlightConnectionIds[connectionId] }),
      setShowStats: (showStats) => set((state) => { state.showStats = showStats }),
      setCameraDevice: (cameraDevice) => set((state) => { state.cameraDevice = cameraDevice }),
      setMicDevice: (micDevice) => set((state) => { state.micDevice = micDevice }),
      setAudioTrack: (audioTrack) => set((state) => {
        state.audioTrack = audioTrack
        if (state.soraContents.localMediaStream) {
          for (const track of state.soraContents.localMediaStream.getAudioTracks()) {
            track.enabled = state.audioTrack
          }
        }
      }),
      setVideoTrack: (videoTrack) => set((state) => {
        state.videoTrack = videoTrack
        if (state.soraContents.localMediaStream) {
          for (const track of state.soraContents.localMediaStream.getVideoTracks()) {
            track.enabled = state.videoTrack
          }
        }
      }),
      setRole: (role) => set((state) => { state.role = role }),
      setSimulcast: (simulcast) => set((state) => { state.simulcast = simulcast }),
      setSpotlight: (spotlight) => set((state) => { state.spotlight = spotlight }),
      setReconnect: (reconnect) => set((state) => { state.reconnect = reconnect }),
      setApiUrl: (apiUrl) => set((state) => { state.apiUrl = apiUrl }),
      clearDataChannelMessages: () => set((state) => { state.dataChannelMessages = [] }),
      setAspectRatio: (aspectRatio) => set((state) => { state.aspectRatio = aspectRatio }),
      setResizeMode: (resizeMode) => set((state) => { state.resizeMode = resizeMode }),
      setLightAdjustment: (lightAdjustment) => set((state) => {
        if (lightAdjustment !== '' && state.lightAdjustmentProcessor === null) {
          const processor = new LightAdjustmentProcessor()
          state.lightAdjustmentProcessor = processor
        }
        state.lightAdjustment = lightAdjustment
      }),
      setBlurRadius: (blurRadius) => set((state) => {
        if (blurRadius !== '' && state.virtualBackgroundProcessor === null) {
          const assetsPath = import.meta.env.VITE_VIRTUAL_BACKGROUND_ASSETS_PATH || ''
          const processor = new VirtualBackgroundProcessor(assetsPath)
          state.virtualBackgroundProcessor = processor
        }
        state.blurRadius = blurRadius
      }),
      setMediaProcessorsNoiseSuppression: (mediaProcessorsNoiseSuppression) => set((state) => {
        if (mediaProcessorsNoiseSuppression && state.noiseSuppressionProcessor === null) {
          const processor = new NoiseSuppressionProcessor()
          state.noiseSuppressionProcessor = processor
        }
        state.mediaProcessorsNoiseSuppression = mediaProcessorsNoiseSuppression
      }),
      setBundleId: (bundleId) => set((state) => { state.bundleId = bundleId }),
      setEnabledBundleId: (enabledBundleId) => set((state) => { state.enabledBundleId = enabledBundleId }),
      setFacingMode: (facingMode) => set((state) => { state.facingMode = facingMode }),
      setAudioStreamingLanguageCode: (audioStreamingLanguageCode) => set((state) => { state.audioStreamingLanguageCode = audioStreamingLanguageCode }),
      setEnabledAudioStreamingLanguageCode: (enabledAudioStreamingLanguageCode) => set((state) => { state.enabledAudioStreamingLanguageCode = enabledAudioStreamingLanguageCode }),
    })),
    {
      name: 'sora-devtools',
      enabled: import.meta.env.VITE_REDUX_LOGGER === 'true',
    }
  )
)

export type RootState = SoraDevtoolsState
export type AppDispatch = SoraDevtoolsActions