import { getDefaultMiddleware } from "@reduxjs/toolkit";

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

export default middleware;
