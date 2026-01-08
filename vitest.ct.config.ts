import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [preact(), tailwindcss()],
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
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium", headless: true }],
    },
  },
});
