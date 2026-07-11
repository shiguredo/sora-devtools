import path from "node:path";
import preactPlugin from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "vite-plus/test/browser/providers/playwright";
import { defineConfig } from "vite-plus/test/config";

const rootDir = import.meta.dirname;

export default defineConfig({
  plugins: [preactPlugin(), tailwindcss()],
  // ブラウザテストにもビルド時定数を埋め込む（既定は無効）
  define: {
    __SESSIONS_ENABLED__: JSON.stringify(process.env.VITE_ENABLE_SESSIONS === "true"),
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  optimizeDeps: {
    include: ["vitest-browser-preact"],
  },
  test: {
    globals: true,
    include: ["src/**/*.ct.tsx"],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
    setupFiles: ["vitest-browser-preact"],
    browser: {
      enabled: true,
      provider: playwright({
        contextOptions: {
          permissions: ["clipboard-read", "clipboard-write"],
        },
      }),
      headless: true,
      instances: [{ browser: "chromium", headless: true }],
    },
  },
});
