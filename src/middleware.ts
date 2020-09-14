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
      ignoredPaths: ["soraContents", "fakeContents"],
    },
    immutableCheck: {
      ignoredPaths: ["soraContents", "fakeContents"],
    },
  }),
];

if (process.env.NEXT_PUBLIC_REDUX_LOGGER === "true") {
  middleware.push(logger);
}

export default middleware;
