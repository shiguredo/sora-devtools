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

`src/utils.ts:617-619` の catch ブロックで `return undefined;` に変更する:

```typescript
try {
  return JSON.parse(metadata);
} catch {
  return undefined; // JSON パース失敗時は undefined を返す
}
```

この変更により以下の全呼び出し元に影響する（いずれも raw string が返るより安全）:

| 呼び出し元 (utils.ts)     | 行  | 備考                                                           |
| ------------------------- | --- | -------------------------------------------------------------- |
| `videoVP9Params`          | 740 | `enabledMetadata=true` 固定                                    |
| `videoAV1Params`          | 743 | 同上                                                           |
| `videoH264Params`         | 746 | 同上                                                           |
| `videoH265Params`         | 749 | 同上                                                           |
| `signalingNotifyMetadata` | 804 | 同上                                                           |
| `forwardingFilters`       | 810 | `as ForwardingFilter[]` でキャスト。undefined ならキャスト不要 |

UI 側でも JSON パースエラーをユーザーに通知できるよう、`metadata` や `forwardingFilters` 入力欄の枠線を赤くする等のフィードバックを追加する（別 issue で対応するか本 issue に含めるかは要判断）。

## テスト戦略

- `parseMetadata(true, '{"valid": "json"}')` がパース済みオブジェクトを返すこと
- `parseMetadata(true, '{invalid}')` が `undefined` を返すこと
- `parseMetadata(false, ...)` が常に `undefined` を返すこと
- 上記を PBT で検証（`fc.json()` で有効な JSON、`fc.string()` で任意文字列入力）
