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
      ignoredPaths: ["immutable", "fakeContents"],
    },
    immutableCheck: {
      ignoredPaths: ["immutable", "fakeContents"],
    },
  }),
];

if (process.env.NODE_ENV === "development") {
  middleware.push(logger);
}

export default middleware;
