import { type Action, type ThunkAction, configureStore } from '@reduxjs/toolkit'
import { logger } from 'redux-logger'
import type { ConnectionPublisher, ConnectionSubscriber } from 'sora-js-sdk'
import { create } from 'zustand'

import type { AUDIO_CODEC_TYPES, AUDIO_CONTENT_HINTS, CONNECTION_STATUS } from '@/constants'
import { copy2clipboard, createSignalingURL } from '@/utils'

import type { LogMessage, SoraDevtoolsState, TimelineMessage } from '@/types.ts'
import { slice } from './slice.ts'

/**
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript#correct-typings-for-the-dispatch-type
 */
export const store = configureStore({
  reducer: slice.reducer,
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'soraDevtools/setSora',
          'soraDevtools/setLocalMediaStream',
          'soraDevtools/setRemoteClient',
          'soraDevtools/setFakeContentsGainNode',
          'soraDevtools/setDataChannelMessage',
          'soraDevtools/setMp4MediaStream',
        ],
        ignoredPaths: [
          'soraContents',
          'fakeContents',
          'dataChannelMessages',
          'logMessages',
          'mp4MediaStream',
          'notifyMessages',
          'pushMessages',
          'signalingMessages',
          'lightAdjustmentProcessor',
          'virtualBackgroundProcessor',
          'noiseSuppressionProcessor',
        ],
      },
      immutableCheck: {
        ignoredPaths: [
          'soraContents',
          'fakeContents',
          'dataChannelMessages',
          'logMessages',
          'notifyMessages',
          'pushMessages',
          'signalingMessages',
          'noiseSuppressionProcessor',
        ],
      },
    })
    if (import.meta.env.VITE_REDUX_LOGGER === 'true') {
      middleware.concat(logger)
    }
    return middleware
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>

// types にある SoraDevToolsState と同じ構造にしていく
export type SoraDevToolsState = {
  audio: boolean
  audioBitRate: string
  audioCodecType: (typeof AUDIO_CODEC_TYPES)[number]
  audioContentHint: (typeof AUDIO_CONTENT_HINTS)[number]
  audioInput: string
  audioInputDevices: MediaDeviceInfo[]
  audioOutput: string
  audioOutputDevices: MediaDeviceInfo[]

  clientId: string
  enabledClientId: boolean
  bundleId: string
  enabledBundleId: boolean

  soraContents: {
    connectionStatus: (typeof CONNECTION_STATUS)[number]
    sora: ConnectionPublisher | ConnectionSubscriber | null
  }

  timelineMessages: TimelineMessage[]
  signalingUrlCandidates: string[]
  enabledSignalingUrlCandidates: boolean
  logMessages: LogMessage[]

  setAudio: (audio: boolean) => void
  setAudioBitRate: (audioBitRate: string) => void
  setAudioCodecType: (audioCodecType: (typeof AUDIO_CODEC_TYPES)[number]) => void
  setAudioContentHint: (audioContentHint: (typeof AUDIO_CONTENT_HINTS)[number]) => void
  setAudioInput: (audioInput: string) => void
  setAudioInputDevices: (audioInputDevices: MediaDeviceInfo[]) => void
  setAudioOutput: (audioOutput: string) => void
  setAudioOutputDevices: (audioOutputDevices: MediaDeviceInfo[]) => void

  setClientId: (clientId: string) => void
  setEnabledClientId: (enabledClientId: boolean) => void

  setBundleId: (bundleId: string) => void
  setEnabledBundleId: (enabledBundleId: boolean) => void

  setMediaDevices: (devices: MediaDeviceInfo[]) => void

  setSoraConnectionStatus: (
    connectionStatus: SoraDevtoolsState['soraContents']['connectionStatus'],
  ) => void

  setTimelineMessage: (message: TimelineMessage) => void
  setLogMessages: (message: LogMessage['message']) => void

  setClipboard: () => void
  setURLSearchParams: (params: URLSearchParams) => void

  connectSora: () => void
  disconnectSora: () => void
}

export const useStore = create<SoraDevToolsState>()((set, get) => ({
  audio: true,
  audioBitRate: '',
  audioCodecType: '',
  audioContentHint: '',
  audioInput: '',
  audioInputDevices: [],
  audioOutput: '',
  audioOutputDevices: [],

  clientId: '',
  enabledClientId: false,
  bundleId: '',
  enabledBundleId: false,

  soraContents: {
    connectionStatus: 'initializing',
    sora: null,
  },

  timelineMessages: [],
  signalingUrlCandidates: [],
  enabledSignalingUrlCandidates: false,
  logMessages: [],

  setAudio: (audio) => {
    set({ audio })
  },
  setAudioBitRate: (audioBitRate) => {
    set({ audioBitRate })
  },
  setAudioCodecType: (audioCodecType) => {
    set({ audioCodecType })
  },
  setAudioContentHint: (audioContentHint) => {
    set({ audioContentHint })
  },
  setAudioInput: (audioInput) => {
    set({ audioInput })
  },
  setAudioInputDevices: (audioInputDevices) => {
    set({ audioInputDevices })
  },
  setAudioOutput: (audioOutput) => {
    set({ audioOutput })
  },
  setAudioOutputDevices: (audioOutputDevices) => {
    set({ audioOutputDevices })
  },

  setClientId: (clientId) => {
    set({ clientId })
  },
  setEnabledClientId: (enabledClientId) => {
    set({ enabledClientId })
  },

  setBundleId: (bundleId) => {
    set({ bundleId })
  },
  setEnabledBundleId: (enabledBundleId) => {
    set({ enabledBundleId })
  },

  setSoraConnectionStatus: (
    connectionStatus: SoraDevtoolsState['soraContents']['connectionStatus'],
  ) => {
    set((state) => ({
      soraContents: {
        ...state.soraContents,
        connectionStatus,
      },
    }))
  },

  setTimelineMessage: (message: TimelineMessage) => {
    set((state) => ({
      timelineMessages: [...state.timelineMessages, message],
    }))
  },

  setLogMessages: (message: LogMessage['message']) => {
    set((state) => ({
      logMessages: [
        ...state.logMessages,
        {
          timestamp: Date.now(),
          message,
        },
      ],
    }))
  },

  setMediaDevices: (devices: MediaDeviceInfo[]) => {
    const audioInputDevices: MediaDeviceInfo[] = []
    const audioOutputDevices: MediaDeviceInfo[] = []
    const videoInputDevices: MediaDeviceInfo[] = []
    devices.filter((deviceInfo) => {
      if (deviceInfo.deviceId === '') {
        return
      }
      if (deviceInfo.kind === 'audioinput') {
        audioInputDevices.push(deviceInfo.toJSON())
      } else if (deviceInfo.kind === 'audiooutput') {
        audioOutputDevices.push(deviceInfo.toJSON())
      } else if (deviceInfo.kind === 'videoinput') {
        videoInputDevices.push(deviceInfo.toJSON())
      }
    })
    set({ audioInputDevices })
    set({ audioOutputDevices })
    // 未実装
    // set({ videoInputDevices })
  },

  // URLSearchParams を状態から生成する
  // Zustand と Redux の状態を同居するための仕組み
  // 最終的には内部で new URLSearchParams() を生成するようにする
  // 名前は copyURL とかにしたいが、重複してしまうので、避ける
  // redux 側を reduxCopyURL とかにする方がいい気がする
  setClipboard: () => {
    const { audio, audioBitRate, audioCodecType, clientId, bundleId } = get()
    const params = new URLSearchParams(window.location.search)

    params.set('audio', audio.toString())

    if (audioBitRate) {
      params.set('audioBitRate', audioBitRate)
    }

    if (audioCodecType) {
      params.set('audioCodecType', audioCodecType)
    }

    if (clientId) {
      params.set('clientId', clientId)
    }

    if (bundleId) {
      params.set('bundleId', bundleId)
    }

    copy2clipboard(`${location.origin}${location.pathname}?${params.toString()}`)
    window.history.replaceState(null, '', `${location.pathname}?${params.toString()}`)
  },

  // URLParams から状態に反映する
  setURLSearchParams: (params: URLSearchParams) => {
    // TODO: validator を経由してからここに入ってくるべき

    const audio = params.get('audio')
    // audioParam が null の場合は audio の値をそのまま使用する
    // ここのバリデーションがちょっと怖いので、どうするか考える
    if (audio !== null) {
      set({ audio: audio === 'true' })
    }

    const audioBitRate = params.get('audioBitRate')
    if (audioBitRate !== null) {
      set({ audioBitRate: audioBitRate })
    }

    const audioCodecType = params.get('audioCodecType')
    if (audioCodecType !== null) {
      set({
        audioCodecType:
          audioCodecType === null
            ? get().audioCodecType
            : (audioCodecType as (typeof AUDIO_CODEC_TYPES)[number]),
      })
    }

    // const audioInputDevice = get().audioInputDevices.find(
    //   (d) => d.kind === 'audioinput' && d.deviceId === params.get('audioInput'),
    // )
    // set({ audioInput: audioInputDevice ? audioInputDevice.deviceId : '' })

    // const audioOutputDevice = get().audioOutputDevices.find(
    //   (d) => d.kind === 'audiooutput' && d.deviceId === params.get('audioOutput'),
    // )
    // set({ audioOutput: audioOutputDevice ? audioOutputDevice.deviceId : '' })

    // null ではなくかつ空文字でなければ clientId をセットする
    const clientId = params.get('clientId')
    if (clientId !== null && clientId !== '') {
      set({ clientId })
      set({ enabledClientId: true })
    }

    // null ではなくかつ空文字でなければ bundleId をセットする
    const bundleId = params.get('bundleId')
    if (bundleId !== null && bundleId !== '') {
      set({ bundleId })
      set({ enabledBundleId: true })
    }
  },

  connectSora: async () => {
    const state = get()
    state.setSoraConnectionStatus('preparing')
    // 強制的に state.soraContents.localMediaStream を作り直すかどうか
    let forceCreateMediaStream = false
    // 接続中の場合は切断する
    if (state.soraContents.sora && state.soraContents.connectionStatus === 'disconnected') {
      await state.soraContents.sora.disconnect()
      // 接続中の再接続の場合は、MediaStream を作り直し、state.soraContents.localMediaStream を更新する
      forceCreateMediaStream = true
    }
    // シグナリング候補のURLリストを作成する
    const signalingUrlCandidates = createSignalingURL(
      state.enabledSignalingUrlCandidates,
      state.signalingUrlCandidates,
    )
    state.setLogMessages({
      title: 'SIGNALING_URL',
      description: JSON.stringify(signalingUrlCandidates),
    })
  },
  disconnectSora: async () => {
    const { soraContents, setSoraConnectionStatus } = get()
    if (soraContents.sora && soraContents.connectionStatus === 'connected') {
      setSoraConnectionStatus('disconnecting')
      await soraContents.sora.disconnect()
      setSoraConnectionStatus('disconnected')
    }
  },
}))
