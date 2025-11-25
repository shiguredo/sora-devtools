import type { Mp4MediaStream } from '@shiguredo/mp4-media-stream'
import { NoiseSuppressionProcessor } from '@shiguredo/noise-suppression'
import { VirtualBackgroundProcessor } from '@shiguredo/virtual-background'
import type {
  ConnectionPublisher,
  ConnectionSubscriber,
  DataChannelConfiguration,
  Role,
} from 'sora-js-sdk'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

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
  setIgnoreDisconnectWebSocket: (
    ignoreDisconnectWebSocket: SoraDevtoolsState['ignoreDisconnectWebSocket'],
  ) => void
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
  setSimulcastRequestRid: (simulcastRequestRid: SoraDevtoolsState['simulcastRequestRid']) => void
  setSimulcastRidAuto: (simulcastRidAuto: SoraDevtoolsState['simulcastRidAuto']) => void
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
  setSoraReconnectingTrials: (
    trials: SoraDevtoolsState['soraContents']['reconnectingTrials'],
  ) => void
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
  setDebugApiUrl: (debugApiUrl: string) => void
  clearDataChannelMessages: () => void
  setAspectRatio: (aspectRatio: SoraDevtoolsState['aspectRatio']) => void
  setResizeMode: (resizeMode: SoraDevtoolsState['resizeMode']) => void
  setBlurRadius: (blurRadius: SoraDevtoolsState['blurRadius']) => void
  setMediaProcessorsNoiseSuppression: (
    mediaProcessorsNoiseSuppression: SoraDevtoolsState['mediaProcessorsNoiseSuppression'],
  ) => void
  setBundleId: (bundleId: SoraDevtoolsState['bundleId']) => void
  setEnabledBundleId: (enabledBundleId: SoraDevtoolsState['enabledBundleId']) => void
  setFacingMode: (facingMode: SoraDevtoolsState['facingMode']) => void
  setAudioStreamingLanguageCode: (
    audioStreamingLanguageCode: SoraDevtoolsState['audioStreamingLanguageCode'],
  ) => void
  setRpcObject: (rpcObject: SoraDevtoolsState['rpcObjects'][number]) => void
  clearRpcObjects: () => void
  setApiObject: (apiObject: SoraDevtoolsState['apiObjects'][number]) => void
  clearApiObjects: () => void
  setEnabledAudioStreamingLanguageCode: (
    enabledAudioStreamingLanguageCode: SoraDevtoolsState['enabledAudioStreamingLanguageCode'],
  ) => void
  setForceStereoOutput: (forceStereoOutput: SoraDevtoolsState['forceStereoOutput']) => void
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
  simulcastRidAuto: '',
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

function createAlertMessage(
  alertMessages: SoraDevtoolsState['alertMessages'],
  logMessages: SoraDevtoolsState['logMessages'],
  alertMessage: AlertMessage,
): { alertMessages: AlertMessage[]; logMessages: LogMessage[] } {
  const newAlertMessages = [...alertMessages]
  if (newAlertMessages.length >= 10) {
    for (let i = 0; i <= newAlertMessages.length - 5; i++) {
      newAlertMessages.pop()
    }
  }
  newAlertMessages.unshift(alertMessage)
  const newLogMessages = [
    ...logMessages,
    {
      timestamp: alertMessage.timestamp,
      message: {
        title: `ALERT MESSAGE ${alertMessage.title}`,
        description: JSON.stringify({
          title: alertMessage.title,
          type: alertMessage.type,
          message: alertMessage.message,
        }),
      },
    },
  ]
  return { alertMessages: newAlertMessages, logMessages: newLogMessages }
}

export const useSoraDevtoolsStore = create<SoraDevtoolsState & SoraDevtoolsActions>()(
  devtools(
    (set) => ({
      ...initialState,
      resetState: () => set(() => ({ ...initialState })),
      setAudio: (audio) => set(() => ({ audio })),
      setAudioInput: (audioInput) => set(() => ({ audioInput })),
      setAudioOutput: (audioOutput) => set(() => ({ audioOutput })),
      setAudioBitRate: (audioBitRate) => set(() => ({ audioBitRate })),
      setAudioCodecType: (audioCodecType) => set(() => ({ audioCodecType })),
      setAudioContentHint: (audioContentHint) =>
        set((state) => {
          if (state.soraContents.localMediaStream) {
            for (const track of state.soraContents.localMediaStream.getAudioTracks()) {
              track.contentHint = audioContentHint
            }
          }
          return { audioContentHint }
        }),
      setAutoGainControl: (autoGainControl) => set(() => ({ autoGainControl })),
      setClientId: (clientId) => set(() => ({ clientId })),
      setChannelId: (channelId) => set(() => ({ channelId })),
      setTimelineMessage: (message) =>
        set((state) => ({ timelineMessages: [...state.timelineMessages, message] })),
      setDataChannelSignaling: (dataChannelSignaling) => set(() => ({ dataChannelSignaling })),
      setDataChannels: (dataChannels) => set(() => ({ dataChannels })),
      setDataChannelMessage: (message) =>
        set((state) => ({ dataChannelMessages: [...state.dataChannelMessages, message] })),
      setGoogCpuOveruseDetection: (googCpuOveruseDetection) =>
        set(() => ({ googCpuOveruseDetection })),
      setDisplayResolution: (displayResolution) => set(() => ({ displayResolution })),
      setEchoCancellation: (echoCancellation) => set(() => ({ echoCancellation })),
      setEchoCancellationType: (echoCancellationType) => set(() => ({ echoCancellationType })),
      setEnabledClientId: (enabledClientId) => set(() => ({ enabledClientId })),
      setEnabledDataChannels: (enabledDataChannels) => set(() => ({ enabledDataChannels })),
      setEnabledDataChannel: (enabledDataChannel) => set(() => ({ enabledDataChannel })),
      setEnabledMetadata: (enabledMetadata) => set(() => ({ enabledMetadata })),
      setIgnoreDisconnectWebSocket: (ignoreDisconnectWebSocket) =>
        set(() => ({ ignoreDisconnectWebSocket })),
      setSignalingMessage: (message) =>
        set((state) => ({ signalingMessages: [...state.signalingMessages, message] })),
      setEnabledForwardingFilters: (enabledForwardingFilters) =>
        set(() => ({ enabledForwardingFilters })),
      setEnabledForwardingFilter: (enabledForwardingFilter) =>
        set(() => ({ enabledForwardingFilter })),
      setEnabledSignalingNotifyMetadata: (enabledSignalingNotifyMetadata) =>
        set(() => ({ enabledSignalingNotifyMetadata })),
      setEnabledSignalingUrlCandidates: (enabledSignalingUrlCandidates) =>
        set(() => ({ enabledSignalingUrlCandidates })),
      setEnabledVideoVP9Params: (enabledVideoVP9Params) => set(() => ({ enabledVideoVP9Params })),
      setEnabledVideoH264Params: (enabledVideoH264Params) =>
        set(() => ({ enabledVideoH264Params })),
      setEnabledVideoH265Params: (enabledVideoH265Params) =>
        set(() => ({ enabledVideoH265Params })),
      setEnabledVideoAV1Params: (enabledVideoAV1Params) => set(() => ({ enabledVideoAV1Params })),
      setFakeVolume: (fakeVolume) =>
        set((state) => {
          const volume = Number.parseFloat(fakeVolume)
          let newFakeVolume: string
          if (Number.isNaN(volume)) {
            newFakeVolume = '0'
          } else if (volume > 1) {
            newFakeVolume = '1'
          } else {
            newFakeVolume = String(volume)
          }
          if (state.fakeContents.gainNode) {
            state.fakeContents.gainNode.gain.setValueAtTime(Number.parseFloat(newFakeVolume), 0)
          }
          return { fakeVolume: newFakeVolume }
        }),
      setFakeContentsGainNode: (gainNode) =>
        set((state) => ({
          fakeContents: { ...state.fakeContents, gainNode },
        })),
      setInitialFakeContents: () =>
        set((state) => {
          const colorCode = Math.floor(Math.random() * 0xffffff)
          let worker: Worker | null = null
          if (URL.createObjectURL) {
            const url = URL.createObjectURL(
              new Blob([WORKER_SCRIPT], { type: 'application/javascript' }),
            )
            worker = new Worker(url)
          }
          return {
            fakeContents: { ...state.fakeContents, colorCode, worker },
          }
        }),
      setFrameRate: (frameRate) => set(() => ({ frameRate })),
      setMute: (mute) => set(() => ({ mute })),
      setMediaStats: (mediaStats) => set(() => ({ mediaStats })),
      setMp4MediaStream: (mp4MediaStream) => set(() => ({ mp4MediaStream })),
      setNoiseSuppression: (noiseSuppression) => set(() => ({ noiseSuppression })),
      setMediaType: (mediaType) => set(() => ({ mediaType })),
      setMetadata: (metadata) => set(() => ({ metadata })),
      setResolution: (resolution) => set(() => ({ resolution })),
      setSignalingNotifyMetadata: (signalingNotifyMetadata) =>
        set(() => ({ signalingNotifyMetadata })),
      setSignalingUrlCandidates: (signalingUrlCandidates) =>
        set(() => ({ signalingUrlCandidates })),
      setForwardingFilters: (forwardingFilters) => set(() => ({ forwardingFilters })),
      setForwardingFilter: (forwardingFilter) => set(() => ({ forwardingFilter })),
      setSimulcastRid: (simulcastRid) => set(() => ({ simulcastRid })),
      setSimulcastRequestRid: (simulcastRequestRid) => set(() => ({ simulcastRequestRid })),
      setSimulcastRidAuto: (simulcastRidAuto) => set(() => ({ simulcastRidAuto })),
      setSpotlightNumber: (spotlightNumber) => set(() => ({ spotlightNumber })),
      setSpotlightFocusRid: (spotlightFocusRid) => set(() => ({ spotlightFocusRid })),
      setSpotlightUnfocusRid: (spotlightUnfocusRid) => set(() => ({ spotlightUnfocusRid })),
      setVideo: (video) => set(() => ({ video })),
      setVideoInput: (videoInput) => set(() => ({ videoInput })),
      setVideoBitRate: (videoBitRate) => set(() => ({ videoBitRate })),
      setVideoCodecType: (videoCodecType) => set(() => ({ videoCodecType })),
      setVideoContentHint: (videoContentHint) =>
        set((state) => {
          if (state.soraContents.localMediaStream) {
            for (const track of state.soraContents.localMediaStream.getVideoTracks()) {
              track.contentHint = videoContentHint
            }
          }
          return { videoContentHint }
        }),
      setVideoVP9Params: (videoVP9Params) => set(() => ({ videoVP9Params })),
      setVideoH264Params: (videoH264Params) => set(() => ({ videoH264Params })),
      setVideoH265Params: (videoH265Params) => set(() => ({ videoH265Params })),
      setVideoAV1Params: (videoAV1Params) => set(() => ({ videoAV1Params })),
      setSora: (sora) =>
        set((state) => ({
          soraContents: {
            ...state.soraContents,
            sora,
            dataChannels: sora ? state.soraContents.dataChannels : [],
          },
        })),
      setSoraSessionId: (sessionId) =>
        set((state) => ({
          soraContents: { ...state.soraContents, sessionId },
        })),
      setSoraConnectionId: (connectionId) =>
        set((state) => ({
          soraContents: { ...state.soraContents, connectionId },
        })),
      setSoraClientId: (clientId) =>
        set((state) => ({
          soraContents: { ...state.soraContents, clientId },
        })),
      setSoraTurnUrl: (turnUrl) =>
        set((state) => ({
          soraContents: { ...state.soraContents, turnUrl },
        })),
      setSoraConnectionStatus: (connectionStatus) =>
        set((state) => ({
          soraContents: { ...state.soraContents, connectionStatus },
        })),
      setSoraReconnecting: (reconnecting) =>
        set((state) => ({
          soraContents: {
            ...state.soraContents,
            reconnecting,
            reconnectingTrials: reconnecting === false ? 0 : state.soraContents.reconnectingTrials,
          },
        })),
      setSoraReconnectingTrials: (reconnectingTrials) =>
        set((state) => ({
          soraContents: { ...state.soraContents, reconnectingTrials },
        })),
      setSoraDataChannels: (dataChannel) =>
        set((state) => ({
          soraContents: {
            ...state.soraContents,
            dataChannels: [...state.soraContents.dataChannels, dataChannel],
          },
        })),
      setLocalMediaStream: (localMediaStream) =>
        set((state) => {
          if (state.soraContents.localMediaStream) {
            state.soraContents.localMediaStream.getTracks().forEach((track) => {
              track.stop()
            })
          }
          return {
            soraContents: { ...state.soraContents, localMediaStream },
          }
        }),
      setRemoteClient: (remoteClient) =>
        set((state) => ({
          soraContents: {
            ...state.soraContents,
            remoteClients: [...state.soraContents.remoteClients, remoteClient],
          },
        })),
      setSoraRemoteClientId: (payload) =>
        set((state) => ({
          soraContents: {
            ...state.soraContents,
            remoteClients: state.soraContents.remoteClients.map((client) =>
              client.connectionId === payload.connectionId
                ? { ...client, clientId: payload.clientId }
                : client,
            ),
          },
        })),
      setStatsReport: (statsReport) =>
        set((state) => ({
          soraContents: {
            ...state.soraContents,
            prevStatsReport: state.soraContents.statsReport,
            statsReport,
          },
        })),
      removeRemoteClient: (connectionId) =>
        set((state) => ({
          soraContents: {
            ...state.soraContents,
            remoteClients: state.soraContents.remoteClients.filter(
              (client) => client.connectionId !== connectionId,
            ),
          },
        })),
      removeAllRemoteClients: () =>
        set((state) => ({
          soraContents: { ...state.soraContents, remoteClients: [] },
        })),
      setAudioInputDevices: (audioInputDevices) => set(() => ({ audioInputDevices })),
      setVideoInputDevices: (videoInputDevices) => set(() => ({ videoInputDevices })),
      setAudioOutputDevices: (audioOutputDevices) => set(() => ({ audioOutputDevices })),
      setSoraInfoAlertMessage: (message) =>
        set((state) => {
          const alertMessage: AlertMessage = {
            title: 'Sora info',
            type: 'info',
            message: message,
            timestamp: Date.now(),
          }
          return createAlertMessage(state.alertMessages, state.logMessages, alertMessage)
        }),
      setSoraErrorAlertMessage: (message) =>
        set((state) => {
          const alertMessage: AlertMessage = {
            title: 'Sora error',
            type: 'error',
            message: message,
            timestamp: Date.now(),
          }
          return createAlertMessage(state.alertMessages, state.logMessages, alertMessage)
        }),
      setAPIInfoAlertMessage: (message) =>
        set((state) => {
          const alertMessage: AlertMessage = {
            title: 'API info',
            type: 'info',
            message: message,
            timestamp: Date.now(),
          }
          return createAlertMessage(state.alertMessages, state.logMessages, alertMessage)
        }),
      setAPIErrorAlertMessage: (message) =>
        set((state) => {
          const alertMessage: AlertMessage = {
            title: 'API error',
            type: 'error',
            message: message,
            timestamp: Date.now(),
          }
          return createAlertMessage(state.alertMessages, state.logMessages, alertMessage)
        }),
      deleteAlertMessage: (timestamp) =>
        set((state) => ({
          alertMessages: state.alertMessages.filter(
            (alertMessage) => alertMessage.timestamp !== timestamp,
          ),
        })),
      setDebug: (debug) => set(() => ({ debug })),
      setDebugFilterText: (debugFilterText) => set(() => ({ debugFilterText })),
      setDebugType: (debugType) => set(() => ({ debugFilterText: '', debugType })),
      setLogMessages: (message) =>
        set((state) => ({
          logMessages: [
            ...state.logMessages,
            {
              timestamp: Date.now(),
              message: {
                title: message.title,
                description: message.description,
              },
            },
          ],
        })),
      setNotifyMessages: (message) =>
        set((state) => ({ notifyMessages: [...state.notifyMessages, message] })),
      setPushMessages: (message) =>
        set((state) => ({ pushMessages: [...state.pushMessages, message] })),
      setFocusedSpotlightConnectionId: (connectionId) =>
        set((state) => ({
          focusedSpotlightConnectionIds: {
            ...state.focusedSpotlightConnectionIds,
            [connectionId]: true,
          },
        })),
      setUnFocusedSpotlightConnectionId: (connectionId) =>
        set((state) => ({
          focusedSpotlightConnectionIds: {
            ...state.focusedSpotlightConnectionIds,
            [connectionId]: false,
          },
        })),
      deleteFocusedSpotlightConnectionId: (connectionId) =>
        set((state) => {
          const { [connectionId]: _, ...rest } = state.focusedSpotlightConnectionIds
          return { focusedSpotlightConnectionIds: rest }
        }),
      setShowStats: (showStats) => set(() => ({ showStats })),
      setCameraDevice: (cameraDevice) => set(() => ({ cameraDevice })),
      setMicDevice: (micDevice) => set(() => ({ micDevice })),
      setAudioTrack: (audioTrack) =>
        set((state) => {
          if (state.soraContents.localMediaStream) {
            for (const track of state.soraContents.localMediaStream.getAudioTracks()) {
              track.enabled = audioTrack
            }
          }
          return { audioTrack }
        }),
      setVideoTrack: (videoTrack) =>
        set((state) => {
          if (state.soraContents.localMediaStream) {
            for (const track of state.soraContents.localMediaStream.getVideoTracks()) {
              track.enabled = videoTrack
            }
          }
          return { videoTrack }
        }),
      setRole: (role) => set(() => ({ role })),
      setSimulcast: (simulcast) => set(() => ({ simulcast })),
      setSpotlight: (spotlight) => set(() => ({ spotlight })),
      setReconnect: (reconnect) => set(() => ({ reconnect })),
      setApiUrl: (apiUrl) => set(() => ({ apiUrl })),
      setDebugApiUrl: (debugApiUrl) => set(() => ({ debugApiUrl })),
      clearDataChannelMessages: () => set(() => ({ dataChannelMessages: [] })),
      setRpcObject: (rpcObject) =>
        // 開発ツールとして RPC の結果を全て保持するため、意図的に件数制限は行わない
        // メモリーリークの可能性があるが、開発目的のため許容する
        set((state) => ({ rpcObjects: [rpcObject, ...state.rpcObjects] })),
      clearRpcObjects: () => set(() => ({ rpcObjects: [] })),
      setApiObject: (apiObject) =>
        // 開発ツールとして API の結果を全て保持するため、意図的に件数制限は行わない
        // メモリーリークの可能性があるが、開発目的のため許容する
        set((state) => ({ apiObjects: [apiObject, ...state.apiObjects] })),
      clearApiObjects: () => set(() => ({ apiObjects: [] })),
      setAspectRatio: (aspectRatio) => set(() => ({ aspectRatio })),
      setResizeMode: (resizeMode) => set(() => ({ resizeMode })),
      setBlurRadius: (blurRadius) =>
        set((state) => {
          if (blurRadius !== '' && state.virtualBackgroundProcessor === null) {
            const assetsPath = import.meta.env.VITE_VIRTUAL_BACKGROUND_ASSETS_PATH || ''
            const processor = new VirtualBackgroundProcessor(assetsPath)
            return { blurRadius, virtualBackgroundProcessor: processor }
          }
          return { blurRadius }
        }),
      setMediaProcessorsNoiseSuppression: (mediaProcessorsNoiseSuppression) =>
        set((state) => {
          if (mediaProcessorsNoiseSuppression && state.noiseSuppressionProcessor === null) {
            const processor = new NoiseSuppressionProcessor()
            return { mediaProcessorsNoiseSuppression, noiseSuppressionProcessor: processor }
          }
          return { mediaProcessorsNoiseSuppression }
        }),
      setBundleId: (bundleId) => set(() => ({ bundleId })),
      setEnabledBundleId: (enabledBundleId) => set(() => ({ enabledBundleId })),
      setFacingMode: (facingMode) => set(() => ({ facingMode })),
      setAudioStreamingLanguageCode: (audioStreamingLanguageCode) =>
        set(() => ({ audioStreamingLanguageCode })),
      setEnabledAudioStreamingLanguageCode: (enabledAudioStreamingLanguageCode) =>
        set(() => ({ enabledAudioStreamingLanguageCode })),
      setForceStereoOutput: (forceStereoOutput) => set(() => ({ forceStereoOutput })),
    }),
    {
      name: 'sora-devtools',
      enabled: import.meta.env.VITE_ZUSTAND_DEVTOOLS === 'true',
    },
  ),
)

export type RootState = SoraDevtoolsState
export type AppDispatch = SoraDevtoolsActions
