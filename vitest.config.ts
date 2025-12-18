import preact from "@preact/preset-vite";

import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
    },
  },
  test: {
    include: ["src/app/app.test.ts", "src/utils.test.ts", "src/utils.pbt.test.ts"],
    globals: true,
    environment: "jsdom",
  },
});
