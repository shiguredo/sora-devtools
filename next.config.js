const nextConfig = {
  output: 'export',
  // distDir: 'dist',
  distDir: process.env.NODE_ENV === 'production' ? 'dist' : 'dev',
  compress: true,
  generateBuildId: async () => 'sora_devtools',
}

module.exports = nextConfig
