// Window インターフェースの拡張
interface Window {
  webkitAudioContext: typeof AudioContext;
  readonly CropTarget: {
    fromElement(element: Element): Promise<CropTarget>;
  };
}

// MediaStreamTrack インターフェースの拡張
interface MediaStreamTrack {
  cropTo(cropTarget: CropTarget): Promise<void>;
}

// CropTarget 型定義
type CropTarget = {
  symbol: "CropTarget";
};
