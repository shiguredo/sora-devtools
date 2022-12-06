module.exports = {
  compress: true,
  swcMinify: false,
  generateBuildId: async () => "sora_demo",
  webpack: (config) => {
    config.resolve.fallback = { 'lyra.wasm': false, 'lyra.worker.js': false };

    return config;
  }
};
