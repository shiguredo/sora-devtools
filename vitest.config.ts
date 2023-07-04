import react from '@vitejs/plugin-react'
import { defineConfig, UserConfigExport } from 'vitest/config'

// https://vitejs.dev/config/
const config: UserConfigExport = {
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
}

export default defineConfig(config)
