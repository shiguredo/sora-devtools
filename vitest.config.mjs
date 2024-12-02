import react from '@vitejs/plugin-react'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    // 一旦 app.spec.ts だけをテストするようにする
    include: ['src/app/app.spec.ts'],
    globals: true,
    environment: 'jsdom',
  },
})
