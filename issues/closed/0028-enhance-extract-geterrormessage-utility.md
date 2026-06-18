# 0028-enhance-extract-geterrormessage-utility

Created: 2026-05-10
Completed: 2026-05-10
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

## 解決方法

`src/utils.ts` に上記の `getErrorMessage(error: unknown): string` を追加した。

`src/app/actions.ts` の 9 箇所 (1019, 1413, 1666, 1743, 1756, 1783, 1837, 1850, 1877) と `src/components/DebugPane/Rpc.tsx` の 1 箇所をこの関数呼び出しに置き換えた。`error instanceof Error ? error.message : String(error)` のパターンは `utils.ts` の実装のみが残る形となった。
