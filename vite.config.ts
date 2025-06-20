import path from 'path'
import react from '@vitejs/plugin-react-oxc'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    minify: true,
    target: 'esnext',
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, './index.html'),
      },
      output: {
        advancedChunks: {
          groups: [
            {
              test: /node_modules\/(react|react-dom|react-bootstrap)/,
              name: 'react',
            },
            {
              test: /node_modules\/(zustand|immer)/,
              name: 'zustand',
            },
            {
              test: /node_modules\/@shiguredo\/mp4-media-stream/,
              name: 'mp4-media-stream',
            },
            {
              test: /node_modules\/@shiguredo\/noise-suppression/,
              name: 'noise-suppression',
            },
            {
              test: /node_modules\/@shiguredo\/virtual-background/,
              name: 'virtual-background',
            },
            {
              test: /node_modules\/sora-js-sdk/,
              name: 'sora-js-sdk',
            },
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
