import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import preactPlugin from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [preactPlugin(), tailwindcss()],
  build: {
    minify: "oxc",
    target: "esnext",
    rolldownOptions: {
      input: {
        index: path.resolve(__dirname, "./index.html"),
      },
      output: {
        manualChunks(moduleId) {
          const chunks: Record<string, string[]> = {
            preact: ["preact"],
            "mp4-media-stream": ["@shiguredo/mp4-media-stream"],
            "noise-suppression": ["@shiguredo/noise-suppression"],
            "virtual-background": ["@shiguredo/virtual-background"],
            "sora-js-sdk": ["sora-js-sdk"],
          };
          for (const [chunkName, modules] of Object.entries(chunks)) {
            if (modules.some((mod) => moduleId.includes(`node_modules/${mod}`))) {
              return chunkName;
            }
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["src/app/app.test.ts", "src/utils.test.ts", "src/utils.pbt.test.ts"],
    globals: true,
    environment: "jsdom",
  },
  lint: {
    ignorePatterns: ["dist/**"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    ignorePatterns: ["dist/**"],
  },
});
