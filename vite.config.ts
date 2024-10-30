// biome-ignore lint/correctness/noNodejsModules: vite.config.ts では Node.js のモジュールを使う
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: process.env.NODE_ENV === 'production' ? 'dist' : 'dev',
    minify: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-bootstrap', 'react-draggable', 'react-redux'],
          redux: ['@reduxjs/toolkit', 'redux', 'redux-logger', 'redux-thunk'],
          shiguredo: [
            '@shiguredo/light-adjustment',
            '@shiguredo/mp4-media-stream',
            '@shiguredo/noise-suppression',
            '@shiguredo/virtual-background',
            'sora-js-sdk',
          ],
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
