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

type StoreState = {
  audio: boolean

  soraContents: {
    connectionStatus: (typeof CONNECTION_STATUS)[number]
  }

  setAudio: (audio: boolean) => void
  setSoraContents: (soraContents: {
    connectionStatus: (typeof CONNECTION_STATUS)[number]
  }) => void
}

export const userStore = create<StoreState>()((set) => ({
  audio: true,
  soraContents: {
    connectionStatus: 'initializing',
  },

  setAudio: (audio) => {
    set({ audio })
  },
  setSoraContents: (soraContents) => set({ soraContents }),
}))
