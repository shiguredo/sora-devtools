const nextConfig = {
  output: "export",
  distDir: 'dist',
  compress: true,
  swcMinify: false,
  generateBuildId: async () => "sora_devtools",
  webpack: (config) => {
    config.resolve.fallback = {
      'lyra.wasm': false,
      'lyra.worker.js': false,
    };
    return config;
  }
};

module.exports = nextConfig;
