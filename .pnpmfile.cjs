module.exports = {
  hooks: {
    readPackage(packageJson) {
      if (packageJson.name === 'next') {
        packageJson.version = '14.0.4'
      }
      return packageJson
    },
  },
}
