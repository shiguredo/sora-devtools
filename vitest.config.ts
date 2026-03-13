import preactPlugin from "@preact/preset-vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [preactPlugin()],
  test: {
    include: ["src/app/app.test.ts", "src/utils.test.ts", "src/utils.pbt.test.ts"],
    globals: true,
    environment: "jsdom",
  },
});
