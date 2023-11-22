const nextConfig = {
  output: 'export',
  // distDir: 'dist',
  distDir: process.env.NODE_ENV === 'production' ? 'dist' : 'dev',
  compress: true,
  swcMinify: true,
  generateBuildId: async () => 'sora_devtools',
  webpack: (config) => {
    config.resolve.fallback = {
      'lyra.wasm': false,
      'lyra.worker.js': false,
    }
    return config
  },
}

module.exports = nextConfig
