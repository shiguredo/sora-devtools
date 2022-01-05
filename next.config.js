module.exports = {
  compress: true,
  swcMinify: false,
  generateBuildId: async () => "sora_demo",
  exportPathMap: async (defaultPathMap, _settings) => {
    return defaultPathMap;
  },
};
