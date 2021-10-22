import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { logger } from "redux-logger";

import { reducer } from "./slice";

/**
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript#correct-typings-for-the-dispatch-type
 */
export const store = configureStore({
  reducer: reducer,
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "soraDevtools/setSora",
          "soraDevtools/setLocalMediaStream",
          "soraDevtools/setRemoteMediaStream",
          "soraDevtools/setFakeContentsGainNode",
        ],
        ignoredPaths: [
          "soraContents",
          "fakeContents",
          "dataChannelMessages",
          "logMessages",
          "notifyMessages",
          "pushMessages",
          "signalingMessages",
        ],
      },
      immutableCheck: {
        ignoredPaths: [
          "soraContents",
          "fakeContents",
          "dataChannelMessages",
          "logMessages",
          "notifyMessages",
          "pushMessages",
          "signalingMessages",
        ],
      },
    });
    if (process.env.NEXT_PUBLIC_REDUX_LOGGER === "true") {
      middleware.concat(logger);
    }
    return middleware;
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
