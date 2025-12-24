/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ZUSTAND_DEVTOOLS: string;
  readonly VITE_SORA_SIGNALING_URL: string;
  readonly VITE_VIRTUAL_BACKGROUND_ASSETS_PATH: string;
  readonly VITE_NOISE_SUPPRESSION_ASSETS_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
