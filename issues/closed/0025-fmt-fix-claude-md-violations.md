# 0025-fmt-fix-claude-md-violations

Created: 2026-05-10
Completed: 2026-05-10
Model: deepseek-v4-pro

## 背景

`feature/vite-plus-migrate` ブランチの review-diff-code で CLAUDE.md 違反が複数検出された。

## 内容

### 1. 英語 JSX コメント — DownloadReportButton.tsx:197（新規追加）

```tsx
{
  /* This is a hidden anchor used for programmatic file download */
}
```

日本語化する。既存の `biome-ignore` ディレクティブを置き換える際に新規追加された。

### 2. 英語 JSX コメント — Rpc.tsx:235,269（既存だが変更ファイル内）

```tsx
{
  /* Request */
}
{
  /* Response */
}
```

日本語化する。

### 3. 末尾コメント — fakeVideo.worker.ts:24-26

```typescript
const saturation = 70 + Math.sin(animationPhase * 0.7) * 5; // 65-75%
const lightness1 = 50 + Math.sin(animationPhase * 0.5) * 5; // 45-55%
const lightness2 = 40 + Math.sin(animationPhase * 0.5) * 5; // 35-45%
```

末尾コメントをコードの前の行に独立したコメント行として移動する。

### 4. ラテン語 `c.f.` の使用（5 箇所）

| ファイル                         | 行       |
| -------------------------------- | -------- |
| `src/app/actions.ts`             | 648, 704 |
| `src/app/signals.ts`             | 237, 427 |
| `src/components/Video/Video.tsx` | 57       |

`c.f.` → `参照:` に変更する。

## 根拠

CLAUDE.md:

- 「コメントは全て日本語」
- 「コメントに末尾コメントを利用しないこと」

## 解決方法

### 1. DownloadReportButton.tsx:197

`{/* This is a hidden anchor used for programmatic file download */}` を `{/* プログラムからファイルダウンロードを行うための非表示アンカー */}` に置き換えた。

### 2. Rpc.tsx:235,269

`{/* Request */}` を `{/* リクエスト */}` に、`{/* Response */}` を `{/* レスポンス */}` に置き換えた。

### 3. fakeVideo.worker.ts:24-26

末尾コメント `// 65-75%` `// 45-55%` `// 35-45%` を削除し、上の説明コメント行に「彩度は 65-75%、明度 1 は 45-55%、明度 2 は 35-45% の範囲で振動する」と注記を追加した。

### 4. ラテン語 `c.f.` の使用

`Video.tsx:54` の `c.f.` を `参照:` に置き換えた。`actions.ts:648,704` / `signals.ts:237,427` の `c.f.` は issue 0024 (`setTrackContentHint` 抽出) で対象行が削除済みのため別途対応不要。issue 0024 で `utils.ts` に追加した同一コメントは最初から `参照:` 表記とした。
