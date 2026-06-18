module.exports = {
  packageExtensions: {
    "sora-js-sdk": {
      peerDependencyMeta: {
        "sora-js-sdk": {
          optional: true,
        },
      },
      dependencies: {
        "sora-js-sdk": ({ version }) => (version.includes("canary") ? "canary" : "latest"),
      },
    },
  },
};
