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

- 関数名を `copyToClipboard` に変更する（省略形 `2` の排除）
- `navigator.clipboard` が使えない場合にエラーを throw または戻り値で通知する
- 呼び出し元で失敗時にアラートを表示する
