# 0024-enhance-extract-contenthint-utility

Created: 2026-05-10
Model: deepseek-v4-pro

## 背景

`feature/vite-plus-migrate` ブランチの review-diff-code で検出。`contentHint` の機能検出（`"contentHint" in track`）が 3 ファイル 5 箇所に重複している。

## 内容

同一のパターンが以下の箇所に分散している:

| ファイル             | 行  | コンテキスト                                      |
| -------------------- | --- | ------------------------------------------------- |
| `src/app/actions.ts` | 651 | `applyTrackSettings` (video トラックループ)       |
| `src/app/actions.ts` | 657 | `applyTrackSettings` (audio トラックループ)       |
| `src/app/actions.ts` | 705 | `createDisplayMediaStream` (video トラックループ) |
| `src/app/signals.ts` | 238 | `setAudioContentHint`                             |
| `src/app/signals.ts` | 428 | `setVideoContentHint`                             |

全箇所が以下の同一コードと同一コメントを持つ:

```typescript
// contentHint は Firefox が未対応のため "contentHint" in track で機能検出する
// c.f. https://caniuse.com/mdn-api_mediastreamtrack_contenthint
if ("contentHint" in track) {
  track.contentHint = value;
}
```

## 期待される結果

```typescript
function setTrackContentHint(track: MediaStreamTrack, hint: string): void {
  if ("contentHint" in track) {
    track.contentHint = hint;
  }
}
```

上記のユーティリティ関数を抽出し、全 5 箇所から呼び出す。
