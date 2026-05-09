# 0013 DebugPane の typo とコメントアウトされた API タブを整理する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

1. `src/components/DebugPane/index.tsx:59` に typo: `title="Notfiy"` → 正しくは `"Notify"`
2. `src/components/DebugPane/index.tsx:7, :36, :82-86` で API タブがコメントアウトされているが、`src/constants.ts:81-92` の `DEBUG_TYPES` には `"api"` が残っているため、URL パラメータ `debugType=api` で無効な状態になる
3. `src/components/DebugPane/Api.tsx:179, :194` に `console.log` / `console.error` が残っている
4. `src/components/DebugPane/Rpc.tsx:81` にも `console` 出力が残っている可能性がある

## 修正方針

- typo を `"Notify"` に修正する
- API タブを復活させるか、`DEBUG_TYPES` から `"api"` を削除しコメントアウトコードも削除する
- デバッグ用の `console.log` / `console.error` を削除する（CLAUDE.md に準拠）
