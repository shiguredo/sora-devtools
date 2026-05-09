# 0017 signals.ts のボイラープレートセッターを削減する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

`src/app/signals.ts:214-704` に 60 以上のセッター関数が定義されているが、大半は単なる `signal.value = value` のラッパーであり、ファイルを 885 行に肥大化させている。

```typescript
export const setAudio = (value: boolean): void => {
  audio.value = value;
};
export const setAudioBitRate = (value: string): void => {
  audioBitRate.value = value;
};
// ... 同様のパターンが 50 以上続く
```

## 問題点

- Preact signals は直接 `.value` 代入が可能であり、ラッパー関数は不要
- 副作用を持つ一部のセッター（`setAudioContentHint` 等）と単純セッターの区別がない
- コードレビュー時にどれが副作用を持つか判別しづらい
- ファイルの約 50% がボイラープレート

## 修正方針

1. 副作用のないセッター（全値代入のみ）を削除する
2. コンポーネント側で `signal.value = newValue` を直接使う
3. 副作用を持つセッター（`setAudioContentHint`, `setVideoContentHint`, `setFakeVolume`, `setBlurRadius` 等）は残す
4. `setFakeContentsGainNode` のようなスプレッド演算子を使うセッターは関数として残す
5. セッター削除に伴い、`actions.ts:1811-1901` の再エクスポートブロックからも削除し、最終的に再エクスポートブロック全体を削除する（#0015 と連携）
