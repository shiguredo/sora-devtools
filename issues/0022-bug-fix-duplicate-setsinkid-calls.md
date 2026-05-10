# 0022-bug-fix-duplicate-setsinkid-calls

Created: 2026-05-10
Model: deepseek-v4-pro

## 背景

`feature/vite-plus-migrate` ブランチの review-diff-code で検出。`Video.tsx` 内で `setSinkId` が 2 つの別々の useEffect で呼び出される可能性がある。

## 内容

### Video.tsx:28,74 — setSinkId の二重呼び出し

```typescript
// 1つ目の useEffect — L27-28 (依存: [setHeight, audioOutput, stream])
if (audioOutput && stream && stream.getAudioTracks().length > 0) {
  void videoRef.current.setSinkId(audioOutput);
}

// 3つ目の useEffect — L74-76 (依存: [stream, audioOutput])
if (audioOutput && stream.getAudioTracks().length > 0) {
  void videoElement.setSinkId(audioOutput);
}
```

`audioOutput` 変更時、両方の useEffect が実行され `setSinkId` が 2 回発火する。また 1 つ目の useEffect は `setHeight` 変更時も発火し不要な `setSinkId` 呼び出しが発生する。

## 再現手順

1. `audioOutput` を変更する
2. 両方の useEffect が実行され `setSinkId` が 2 回連続で呼ばれる

## 期待される結果

1 つ目の useEffect から `setSinkId` 呼び出しを削除し、ResizeObserver 専用にする。`setSinkId` の呼び出しは `srcObject` 設定後（3 つ目の useEffect）のみで十分。
