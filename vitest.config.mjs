import react from '@vitejs/plugin-react'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/app/app.spec.ts', 'src/utils.test.ts'],
    globals: true,
    environment: 'jsdom',
  },
})
