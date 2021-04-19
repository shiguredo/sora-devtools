import { getDefaultMiddleware } from "@reduxjs/toolkit";
import { logger } from "redux-logger";

const middleware = [
  ...getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [
        "soraDemo/setSora",
        "soraDemo/setLocalMediaStream",
        "soraDemo/setRemoteMediaStream",
        "soraDemo/setFakeContentsGainNode",
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
  }),
];

if (process.env.NEXT_PUBLIC_REDUX_LOGGER === "true") {
  middleware.push(logger);
}

export default middleware;
