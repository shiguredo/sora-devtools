import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // 環境変数 .env.local が読み込まれる
  globalSetup: require.resolve('./tests/global-setup.ts'),
  testDir: 'tests',
  // fullyParallel: true,
  reporter: 'html',
  use: {
    launchOptions: {
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        // "--use-file-for-fake-video-capture=/app/sample.mjpeg",
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  webServer: {
    // next.js で起動している
    // TODO: ポート指定方法を後で調べる
    command: 'pnpm run dev',
    url: 'http://localhost:3333/',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
