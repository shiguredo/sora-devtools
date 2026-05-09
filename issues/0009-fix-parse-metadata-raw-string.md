# 0009 parseMetadata が JSON パース失敗時に生文字列を返す問題を修正する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

`parseMetadata` (`src/utils.ts:614-624`) が JSON パースに失敗した場合、生の文字列をそのまま返す。この値は `soraConnection.metadata = metadata` (`src/app/actions.ts:1244`) で Sora SDK に渡されるが、SDK はオブジェクトを期待している可能性が高い。

```typescript
export function parseMetadata(enabledMetadata: boolean, metadata: string): Json | undefined {
  if (!enabledMetadata) {
    return undefined;
  }
  try {
    return JSON.parse(metadata);
  } catch {
    // JSON parse に失敗しても何もしない
  }
  return metadata; // ← 生文字列が返る
}
```

## 再現手順

1. metadata 入力欄に無効な JSON 文字列を入力する（例: `{invalid}`）
2. `enabledMetadata` を有効にして接続する
3. 生文字列が Sora SDK に metadata として渡される

## 期待される動作

JSON パースに失敗した場合は `undefined` を返し、SDK には metadata が送信されない。

## 修正方針

catch ブロックで `return undefined;` に変更する。またはパースエラーをユーザーに通知する（現在は silently fail）。
