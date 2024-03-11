import react from '@vitejs/plugin-react'
import { type UserConfigExport, defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
const config: UserConfigExport = {
  plugins: [react()],
  test: {
    // 一旦 app.spec.ts だけをテストするようにする
    include: ['src/app/app.spec.ts'],
    globals: true,
    environment: 'jsdom',
  },
}

export default defineConfig(config)
