import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // 環境変数 .env.local が読み込まれる
  globalSetup: "./tests/global-setup.ts",
  testDir: "tests",
  // OPFS 上のセッション DB はオリジン共有のため、複数 worker だと永続化テストが競合する
  workers: 1,
  // fullyParallel: true,
  reporter: "html",
  use: {
    launchOptions: {
      args: [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
        // "--use-file-for-fake-video-capture=/app/sample.mjpeg",
      ],
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
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
    // vite で起動している
    command: "vp dev --port 3333",
    url: "http://localhost:3333/",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    // Sessions 機能を前提とする E2E が存在するため、dev server では常に有効化する
    env: {
      VITE_ENABLE_SESSIONS: "true",
    },
  },
});
