# 0013 DebugPane の typo とコメントアウトされた API タブを整理する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

1. `src/components/DebugPane/index.tsx:59` に typo: `title="Notfiy"` → 正しくは `"Notify"`
2. `src/components/DebugPane/index.tsx:7, :36, :82-86` で API タブがコメントアウトされているが、`src/constants.ts:81-92` の `DEBUG_TYPES` には `"api"` が残っているため、URL パラメータ `debugType=api` で無効な状態になる
3. `src/components/DebugPane/Api.tsx:179, :194` に `console.log` / `console.error` が残っている
4. `src/components/DebugPane/Rpc.tsx:81` にも `console` 出力が残っている可能性がある

## 修正方針

1. `src/components/DebugPane/index.tsx:59` の `title="Notfiy"` を `title="Notify"` に修正する
2. API タブのコメントアウト (`index.tsx:7, :36, :82-86`) を完全に削除する。API 機能は別の形で提供済みのため、コメントアウトでの放置は不適切
3. `src/constants.ts:81-92` の `DEBUG_TYPES` から `"api"` を削除する。現状 API タブは存在しないため、URL パラメータで無効な状態を指定可能なのはバグ
4. `src/components/DebugPane/Api.tsx:179` の `console.log` および `:194` の `console.error` を削除する
5. `src/components/DebugPane/Rpc.tsx` の `console` 出力があれば同様に削除する

## テスト戦略

- typo 修正と `console` 削除はコードレビューで確認
- `DEBUG_TYPES` から `"api"` 削除後、`parseQueryString` に `debugType=api` を渡しても `debugType` が設定されないこと（既存の PBT でカバー可能）
