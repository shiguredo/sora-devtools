import { type Action, type ThunkAction, configureStore } from '@reduxjs/toolkit'
import { logger } from 'redux-logger'
import { create } from 'zustand'

import type { CONNECTION_STATUS } from '@/constants'

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

  // 現時点では書いてるだけ
  soraContents: {
    connectionStatus: (typeof CONNECTION_STATUS)[number]
  }

  setAudio: (audio: boolean) => void

  // 現時点では書いてるだけ
  setSoraContents: (soraContents: {
    connectionStatus: (typeof CONNECTION_STATUS)[number]
  }) => void

  getURLSearchParams: () => URLSearchParams
  setURLSearchParams: (params: URLSearchParams) => void
}

export const useStore = create<StoreDevToolsState>()((set, get) => ({
  audio: true,
  soraContents: {
    connectionStatus: 'initializing',
  },

  setAudio: (audio) => {
    set({ audio })
  },
  setSoraContents: (soraContents) => set({ soraContents }),

  // URLSearchParams を状態から生成する
  // Zustand と Redux の状態を同居するための仕組み
  // 最終的には内部で new URLSearchParams() を生成するようにする
  getURLSearchParams: () => {
    const { audio } = get()
    const params = new URLSearchParams()
    params.set('audio', audio.toString())
    return params
  },

  // URLParams から状態に反映する
  setURLSearchParams: (params: URLSearchParams) => {
    const audioParam = params.get('audio')
    // audioParam が null の場合は audio の値をそのまま使用する
    set({ audio: audioParam === null ? get().audio : audioParam === 'true' })
  },
}))
