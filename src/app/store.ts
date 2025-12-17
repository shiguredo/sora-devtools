import type { Mp4MediaStream } from '@shiguredo/mp4-media-stream'
import { NoiseSuppressionProcessor } from '@shiguredo/noise-suppression'
import { VirtualBackgroundProcessor } from '@shiguredo/virtual-background'
import { signal, computed } from '@preact/signals'
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

// クローン不可能なオブジェクトかどうかを判定
function isNonCloneable(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value !== 'object') return false
  // Worker, MediaStream, AudioNode, Processor などはクローン不可
  const ctorName = (value as object).constructor?.name
  return (
    ctorName === 'Worker' ||
    ctorName === 'MediaStream' ||
    ctorName === 'GainNode' ||
    ctorName === 'AudioNode' ||
    value instanceof NoiseSuppressionProcessor ||
    value instanceof VirtualBackgroundProcessor ||
    ctorName === 'Mp4MediaStream'
  )
}

// Immer-like な produce 関数: 変更されたパスのみをシャロークローン
type Draft<T> = T
function produce<T extends object>(base: T, recipe: (draft: Draft<T>) => void): T {
  // 変更されたオブジェクトを追跡
  const modified = new WeakSet<object>()
  const copies = new WeakMap<object, object>()

  // オブジェクトのシャローコピーを取得（必要に応じて作成）
  function getCopy<O extends object>(obj: O): O {
    if (copies.has(obj)) {
      return copies.get(obj) as O
    }
    const copy = Array.isArray(obj) ? [...obj] : { ...obj }
    copies.set(obj, copy)
    return copy as O
  }

  // Proxy ハンドラを作成
  function createProxy<O extends object>(obj: O, parent?: object, key?: string | symbol): O {
    return new Proxy(obj, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver)
        // クローン不可能なオブジェクトはそのまま返す
        if (isNonCloneable(value)) {
          return value
        }
        // オブジェクトや配列の場合は Proxy でラップ
        if (value !== null && typeof value === 'object') {
          return createProxy(value as object, target, prop)
        }
        return value
      },
      set(target, prop, value) {
        // 親が変更されていることをマーク
        modified.add(target)
        // コピーを取得して更新
        const copy = getCopy(target)
        Reflect.set(copy, prop, value)
        // 親も更新が必要
        if (parent && key !== undefined) {
          modified.add(parent)
          const parentCopy = getCopy(parent)
          Reflect.set(parentCopy, key, copy)
        }
        return true
      },
    })
  }

  // recipe を実行
  const proxy = createProxy(base)
  recipe(proxy as Draft<T>)

  // 変更がなければ元のオブジェクトを返す
  if (!modified.has(base)) {
    return base
  }

  // ルートのコピーを返す
  return (copies.get(base) as T) ?? base
}

// ヘルパー関数: 状態を更新（Proxy ベースの部分更新）
function updateStore(updater: (state: SoraDevtoolsState) => void): void {
  const newState = produce(store.value, updater)
  if (newState !== store.value) {
    store.value = newState
  }
}

// === Computed signals for fine-grained reactivity ===
// すべての状態を computed として定義

// 基本設定
export const $audio = computed(() => store.value.audio)
export const $video = computed(() => store.value.video)
export const $channelId = computed(() => store.value.channelId)
export const $role = computed(() => store.value.role)
export const $simulcast = computed(() => store.value.simulcast)
export const $spotlight = computed(() => store.value.spotlight)
export const $reconnect = computed(() => store.value.reconnect)
export const $mediaType = computed(() => store.value.mediaType)

// Audio 設定
export const $audioCodecType = computed(() => store.value.audioCodecType)
export const $audioBitRate = computed(() => store.value.audioBitRate)
export const $audioContentHint = computed(() => store.value.audioContentHint)
export const $autoGainControl = computed(() => store.value.autoGainControl)
export const $noiseSuppression = computed(() => store.value.noiseSuppression)
export const $echoCancellation = computed(() => store.value.echoCancellation)
export const $echoCancellationType = computed(() => store.value.echoCancellationType)

// Video 設定
export const $videoCodecType = computed(() => store.value.videoCodecType)
export const $videoBitRate = computed(() => store.value.videoBitRate)
export const $videoContentHint = computed(() => store.value.videoContentHint)
export const $resolution = computed(() => store.value.resolution)
export const $frameRate = computed(() => store.value.frameRate)
export const $aspectRatio = computed(() => store.value.aspectRatio)
export const $resizeMode = computed(() => store.value.resizeMode)
export const $facingMode = computed(() => store.value.facingMode)
export const $blurRadius = computed(() => store.value.blurRadius)
export const $displayResolution = computed(() => store.value.displayResolution)

// Video codec params
export const $videoVP9Params = computed(() => store.value.videoVP9Params)
export const $videoH264Params = computed(() => store.value.videoH264Params)
export const $videoH265Params = computed(() => store.value.videoH265Params)
export const $videoAV1Params = computed(() => store.value.videoAV1Params)
export const $enabledVideoVP9Params = computed(() => store.value.enabledVideoVP9Params)
export const $enabledVideoH264Params = computed(() => store.value.enabledVideoH264Params)
export const $enabledVideoH265Params = computed(() => store.value.enabledVideoH265Params)
export const $enabledVideoAV1Params = computed(() => store.value.enabledVideoAV1Params)

// デバイス
export const $audioInput = computed(() => store.value.audioInput)
export const $audioOutput = computed(() => store.value.audioOutput)
export const $videoInput = computed(() => store.value.videoInput)
export const $audioInputDevices = computed(() => store.value.audioInputDevices)
export const $audioOutputDevices = computed(() => store.value.audioOutputDevices)
export const $videoInputDevices = computed(() => store.value.videoInputDevices)

// トラック・デバイス有効化
export const $audioTrack = computed(() => store.value.audioTrack)
export const $videoTrack = computed(() => store.value.videoTrack)
export const $micDevice = computed(() => store.value.micDevice)
export const $cameraDevice = computed(() => store.value.cameraDevice)
export const $mute = computed(() => store.value.mute)

// シグナリングオプション
export const $clientId = computed(() => store.value.clientId)
export const $bundleId = computed(() => store.value.bundleId)
export const $metadata = computed(() => store.value.metadata)
export const $signalingNotifyMetadata = computed(() => store.value.signalingNotifyMetadata)
export const $signalingUrlCandidates = computed(() => store.value.signalingUrlCandidates)
export const $dataChannelSignaling = computed(() => store.value.dataChannelSignaling)
export const $dataChannels = computed(() => store.value.dataChannels)
export const $ignoreDisconnectWebSocket = computed(() => store.value.ignoreDisconnectWebSocket)
export const $forwardingFilters = computed(() => store.value.forwardingFilters)
export const $forwardingFilter = computed(() => store.value.forwardingFilter)

// シグナリングオプション有効化フラグ
export const $enabledClientId = computed(() => store.value.enabledClientId)
export const $enabledBundleId = computed(() => store.value.enabledBundleId)
export const $enabledMetadata = computed(() => store.value.enabledMetadata)
export const $enabledSignalingNotifyMetadata = computed(
  () => store.value.enabledSignalingNotifyMetadata,
)
export const $enabledSignalingUrlCandidates = computed(
  () => store.value.enabledSignalingUrlCandidates,
)
export const $enabledDataChannel = computed(() => store.value.enabledDataChannel)
export const $enabledDataChannels = computed(() => store.value.enabledDataChannels)
export const $enabledForwardingFilters = computed(() => store.value.enabledForwardingFilters)
export const $enabledForwardingFilter = computed(() => store.value.enabledForwardingFilter)

// Simulcast/Spotlight 設定
export const $simulcastRid = computed(() => store.value.simulcastRid)
export const $simulcastRequestRid = computed(() => store.value.simulcastRequestRid)
export const $spotlightNumber = computed(() => store.value.spotlightNumber)
export const $spotlightFocusRid = computed(() => store.value.spotlightFocusRid)
export const $spotlightUnfocusRid = computed(() => store.value.spotlightUnfocusRid)

// Fake media
export const $fakeVolume = computed(() => store.value.fakeVolume)

// デバッグ
export const $debug = computed(() => store.value.debug)
export const $debugType = computed(() => store.value.debugType)
export const $debugFilterText = computed(() => store.value.debugFilterText)
export const $debugApiUrl = computed(() => store.value.debugApiUrl)

// メッセージ
export const $alertMessages = computed(() => store.value.alertMessages)
export const $timelineMessages = computed(() => store.value.timelineMessages)
export const $logMessages = computed(() => store.value.logMessages)
export const $notifyMessages = computed(() => store.value.notifyMessages)
export const $pushMessages = computed(() => store.value.pushMessages)
export const $signalingMessages = computed(() => store.value.signalingMessages)
export const $dataChannelMessages = computed(() => store.value.dataChannelMessages)
export const $rpcObjects = computed(() => store.value.rpcObjects)
export const $apiObjects = computed(() => store.value.apiObjects)

// Sora 接続状態
export const $connectionStatus = computed(() => store.value.soraContents.connectionStatus)
export const $sora = computed(() => store.value.soraContents.sora)
export const $connectionId = computed(() => store.value.soraContents.connectionId)
export const $soraClientId = computed(() => store.value.soraContents.clientId)
export const $sessionId = computed(() => store.value.soraContents.sessionId)
export const $localMediaStream = computed(() => store.value.soraContents.localMediaStream)
export const $remoteClients = computed(() => store.value.soraContents.remoteClients)
export const $statsReport = computed(() => store.value.soraContents.statsReport)
export const $prevStatsReport = computed(() => store.value.soraContents.prevStatsReport)
export const $soraDataChannels = computed(() => store.value.soraContents.dataChannels)
export const $turnUrl = computed(() => store.value.soraContents.turnUrl)
export const $reconnecting = computed(() => store.value.soraContents.reconnecting)
export const $reconnectingTrials = computed(() => store.value.soraContents.reconnectingTrials)

// その他
export const $showStats = computed(() => store.value.showStats)
export const $mediaStats = computed(() => store.value.mediaStats)
export const $version = computed(() => store.value.version)
export const $forceStereoOutput = computed(() => store.value.forceStereoOutput)
export const $mediaProcessorsNoiseSuppression = computed(
  () => store.value.mediaProcessorsNoiseSuppression,
)
export const $audioStreamingLanguageCode = computed(() => store.value.audioStreamingLanguageCode)
export const $enabledAudioStreamingLanguageCode = computed(
  () => store.value.enabledAudioStreamingLanguageCode,
)
export const $focusedSpotlightConnectionIds = computed(
  () => store.value.focusedSpotlightConnectionIds,
)

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

// getState 関数
export const getState = (): SoraDevtoolsState => store.value

// 型エクスポート
export type RootState = SoraDevtoolsState
