# 0028-enhance-extract-geterrormessage-utility

Created: 2026-05-10
Model: deepseek-v4-pro

## 背景

`feature/vite-plus-migrate` ブランチの review-diff-code 2 周目で検出。

`error instanceof Error ? error.message : String(error)` のエラーメッセージ抽出パターンが `actions.ts` 内の 8 箇所以上にコピペされている。

## 内容

```typescript
// 現状: 各 catch ブロックに散在
const message = error instanceof Error ? error.message : String(error);
signals.setSoraErrorAlertMessage(message);
```

## 期待される結果

`utils.ts` に以下のユーティリティ関数を追加し、全箇所から使用する:

```typescript
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
```
