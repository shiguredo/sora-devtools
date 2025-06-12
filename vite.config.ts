import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', {
            runtimeModule: 'react-compiler-runtime',
            // コンパイラのオプション
            compilationMode: 'infer', // 'infer' | 'annotation' | 'all'
            panicThreshold: 'NONE', // エラーを無視しない
          }]
        ],
      },
    })
  ],
  build: {
    minify: true,
    target: 'esnext',
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, './index.html'),
      },
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-bootstrap'],
          zustand: ['zustand', 'immer'],
          'mp4-media-stream': ['@shiguredo/mp4-media-stream'],
          'noise-suppression': ['@shiguredo/noise-suppression'],
          'virtual-background': ['@shiguredo/virtual-background'],
          'sora-js-sdk': ['sora-js-sdk'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
