import { type Action, type ThunkAction, configureStore } from '@reduxjs/toolkit'
import { logger } from 'redux-logger'
import { create } from 'zustand'

import type { AUDIO_CODEC_TYPES, AUDIO_CONTENT_HINTS, CONNECTION_STATUS } from '@/constants'
import { copy2clipboard } from '@/utils'

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
type StoreDevToolsState = {
  audio: boolean
  audioBitRate: string
  audioCodecType: (typeof AUDIO_CODEC_TYPES)[number]
  audioContentHint: (typeof AUDIO_CONTENT_HINTS)[number]
  audioInput: string
  audioInputDevices: MediaDeviceInfo[]
  audioOutput: string
  audioOutputDevices: MediaDeviceInfo[]

  // 現時点では書いてるだけ
  soraContents: {
    connectionStatus: (typeof CONNECTION_STATUS)[number]
  }

  setAudio: (audio: boolean) => void
  setAudioBitRate: (audioBitRate: string) => void
  setAudioCodecType: (audioCodecType: (typeof AUDIO_CODEC_TYPES)[number]) => void
  setAudioContentHint: (audioContentHint: (typeof AUDIO_CONTENT_HINTS)[number]) => void
  setAudioInput: (audioInput: string) => void
  setAudioInputDevices: (audioInputDevices: MediaDeviceInfo[]) => void
  setAudioOutput: (audioOutput: string) => void
  setAudioOutputDevices: (audioOutputDevices: MediaDeviceInfo[]) => void
  // 現時点では書いてるだけ
  setSoraContents: (soraContents: {
    connectionStatus: (typeof CONNECTION_STATUS)[number]
  }) => void

  setMediaDevices: (devices: MediaDeviceInfo[]) => void

  setClipboard: () => void
  setURLSearchParams: (params: URLSearchParams) => void
}

export const useStore = create<StoreDevToolsState>()((set, get) => ({
  audio: true,
  audioBitRate: '',
  audioCodecType: '',
  audioContentHint: '',
  audioInput: '',
  audioInputDevices: [],
  audioOutput: '',
  audioOutputDevices: [],

  soraContents: {
    connectionStatus: 'initializing',
  },

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

  setSoraContents: (soraContents) => set({ soraContents }),

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
    const { audio, audioBitRate, audioCodecType } = get()
    const params = new URLSearchParams(window.location.search)

    params.set('audio', audio.toString())

    if (audioBitRate) {
      params.set('audioBitRate', audioBitRate)
    }

    if (audioCodecType) {
      params.set('audioCodecType', audioCodecType)
    }

    copy2clipboard(`${location.origin}${location.pathname}?${params.toString()}`)
    window.history.replaceState(null, '', `${location.pathname}?${params.toString()}`)
  },

  // URLParams から状態に反映する
  setURLSearchParams: (params: URLSearchParams) => {
    const audioParam = params.get('audio')
    // audioParam が null の場合は audio の値をそのまま使用する
    // ここのバリデーションがちょっと怖いので、どうするか考える
    set({ audio: audioParam === null ? get().audio : audioParam === 'true' })

    const audioBitRateParam = params.get('audioBitRate')
    set({ audioBitRate: audioBitRateParam === null ? get().audioBitRate : audioBitRateParam })

    const audioCodecTypeParam = params.get('audioCodecType')
    set({
      audioCodecType:
        audioCodecTypeParam === null
          ? get().audioCodecType
          : (audioCodecTypeParam as (typeof AUDIO_CODEC_TYPES)[number]),
    })

    // const audioInputDevice = get().audioInputDevices.find(
    //   (d) => d.kind === 'audioinput' && d.deviceId === params.get('audioInput'),
    // )
    // set({ audioInput: audioInputDevice ? audioInputDevice.deviceId : '' })

    // const audioOutputDevice = get().audioOutputDevices.find(
    //   (d) => d.kind === 'audiooutput' && d.deviceId === params.get('audioOutput'),
    // )
    // set({ audioOutput: audioOutputDevice ? audioOutputDevice.deviceId : '' })
  },
}))
