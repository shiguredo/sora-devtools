/// <reference types="vite/client" />

// vite.config.ts の define でビルド時に埋め込まれる定数
declare const __SESSIONS_ENABLED__: boolean;

interface ImportMetaEnv {
  readonly VITE_SORA_SIGNALING_URL: string;
  readonly VITE_VIRTUAL_BACKGROUND_ASSETS_PATH: string;
  readonly VITE_NOISE_SUPPRESSION_ASSETS_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
