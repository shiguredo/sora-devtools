# 0010 copy2clipboard が失敗時にユーザーに通知されない問題を修正する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

`copy2clipboard` (`src/utils.ts:50-54`) が `navigator.clipboard` 未サポート時に `undefined` を返し、呼び出し元 (`src/app/actions.ts:570`) の `void copy2clipboard(...)` が失敗に気づけない。ユーザーにフィードバックがない。

```typescript
export async function copy2clipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  // navigator.clipboard がない場合、undefined が返る
}
```

呼び出し元：

```typescript
void copy2clipboard(`${location.origin}${location.pathname}?${queryStrings.join("&")}`);
```

## 再現手順

1. 非 HTTPS 環境または Clipboard API 未サポートのブラウザで Copy URL ボタンを押す
2. コピーに失敗するが、ユーザーに何も通知されない

## 期待される動作

コピー失敗時にユーザーにエラー通知が表示される。

## 修正方針

1. `src/utils.ts:50-54` の `copy2clipboard` を `copyToClipboard` にリネームし、戻り値型を `Promise<boolean>` に変更する:

```typescript
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}
```

2. `src/app/actions.ts:570` の呼び出し元で成否を確認し、失敗時にアラートを表示する:

```typescript
const success = await copyToClipboard(
  `${location.origin}${location.pathname}?${queryStrings.join("&")}`,
);
if (success) {
  globalThis.history.replaceState(null, "", `${location.pathname}?${queryStrings.join("&")}`);
} else {
  signals.setAPIErrorAlertMessage("failed to copy URL to clipboard");
}
```

## テスト戦略

- `navigator.clipboard` が存在する場合、`writeText` が呼ばれ `true` が返ること
- `navigator.clipboard` が存在しない場合、`false` が返ること
- `navigator.clipboard.writeText` が reject した場合の挙動（現状は catch されていないため、必要に応じて try/catch を追加）
