module.exports = {
  hooks: {
    readPackage(packageJson) {
      if (packageJson.name === 'next') {
        packageJson.version = '14.0.4'
      }
      return packageJson
    },
  },
  packageExtensions: {
    'sora-js-sdk': {
      peerDependencyMeta: {
        'sora-js-sdk': {
          optional: true,
        },
      },
      dependencies: {
        'sora-js-sdk': ({ version }) => (version.includes('canary') ? 'canary' : 'latest'),
      },
    },
  },
}
