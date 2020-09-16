/// <reference types="next" />
/// <reference types="next/types/global" />

interface Window {
  webkitAudioContext: AudioContext;
}

declare global {
  let window: Window;
}
