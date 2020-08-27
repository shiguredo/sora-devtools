module.exports = {
  compress: true,
  generateBuildId: async () => "sora_demo",
  exportPathMap: async (defaultPathMap, _settings) => {
    return defaultPathMap;
  },
};
