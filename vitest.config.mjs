import react from '@vitejs/plugin-react'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/app/app.test.ts', 'src/utils.test.ts', 'src/utils.pbt.test.ts'],
    globals: true,
    environment: 'jsdom',
  },
})
