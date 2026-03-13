import path from "path";
import preactPlugin from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [preactPlugin(), tailwindcss()],
  build: {
    minify: true,
    target: "esnext",
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "./index.html"),
      },
      output: {
        manualChunks: {
          preact: ["preact"],
          "mp4-media-stream": ["@shiguredo/mp4-media-stream"],
          "noise-suppression": ["@shiguredo/noise-suppression"],
          "virtual-background": ["@shiguredo/virtual-background"],
          "sora-js-sdk": ["sora-js-sdk"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
