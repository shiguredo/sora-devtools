# RPC タブでサーバーが返したエラーの code / message / data を表示できない問題を修正する

- Created: 2026-09-29
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-rpc-error-details
- Polished: {YYYY-MM-DD}

## 目的

RPC タブでサーバーが返したエラーの `code` / `message` / `data` を確認できるようにする。sora-js-sdk 2026.1.0 への更新でエラーの内容が失われるようになり、その後 sora-js-sdk 側が修正されたため、devtools をこれに追従させる。

## 現状

### エラーが表示されなくなった経緯

- `src/rpc.ts` の `rpc()` は、reject された値が `Error` ならアラートを表示して return し、それ以外 (サーバーが返した JSON-RPC エラーオブジェクト) は `setRpcObject` で記録する
- sora-js-sdk 2025.2.0 では JSON-RPC エラーオブジェクトがそのまま reject されていたため、RPC Results の Error 欄に `code` / `message` / `data` が表示されていた
- sora-js-sdk 2026.1.0 の `ConnectionBase.rpc` は reject を `new Error(String(reason))` で包むようになったため、reject される値が常に `Error` になり、`Error("[object Object]")` のアラートが出るだけで RPC Results に何も残らなくなった
- devtools は `sora-js-sdk` 2026.1.0 を固定しており、この状態のまま

### sora-js-sdk 側の修正

- `handleRPCResponse` (`src/base.ts`) が `createErrorFromJSONRPCError` (`src/utils.ts`) の返す `Error` を reject するようになった
- `createErrorFromJSONRPCError` は `message` に JSON-RPC の `message`、`cause` にオブジェクト全体 (`{ code, message, data }`) を設定する。`cause` が設定されていればサーバーが返したエラー、という片方向の契約が `rpc()` の TSDoc と `skills/sora-js-sdk/SKILL.md` に記載されている
- この修正は `2026.2.0-canary.0` として公開されている。devtools は未追従

### 現在の症状

- RPC タブで Call を押してサーバーがエラーを返すと、アラートに `[object Object]` が出るだけで、RPC Results に失敗したリクエストもエラーの内容も残らない
- Video ペインの Spotlight / Simulcast ボタンも `rpc()` を呼ぶため、サーバーエラー時のアラートは同じく `[object Object]` になる

## 設計方針

- `sora-js-sdk` を修正を含むバージョン (`2026.2.0-canary.0` 以降) に上げる。devtools はこれまでも canary を利用している
- `src/rpc.ts` の catch で、`error instanceof Error` かつ `error.cause` がオブジェクトの場合はサーバーが返したエラーとみなし、`RpcObject` として記録する。RPC Results の Error 欄に `cause` が JsonTree で表示される (`RpcObjectItem` は変更しない)
- **アラートの挙動は現状のまま維持する**。サーバーが返したエラーでもアラートを表示し、sora-js-sdk の修正により `message` がサーバーの message (`[object Object]` ではない) になる
  - 維持する理由: `rpc()` は Video ペインの Spotlight / Simulcast ボタンからも呼ばれ、それらは RPC Results を参照しない。アラートを出さないと、サーバーエラー時に何も表示されずボタンが無反応に見える
- クライアント側のエラー (DataChannel 未接続、リクエストタイムアウト、notification 送信失敗) の挙動は変更しない
- `cause` は `unknown` なので、オブジェクトであることを確認してから `RpcObject` の `error` として扱う
- 後方互換は考慮しない (`CODEBASE.md` の方針)

## 完了条件

- サーバーがエラーを返したとき、RPC Results の Error 欄に `code` / `message` / `data` が表示される
- 失敗したリクエスト (method / params / options) が RPC Results に残る
- サーバーが返したエラーのアラートは従来どおり表示され、内容がサーバーの `message` になる (`[object Object]` にならない)
- Video ペインの Spotlight / Simulcast ボタンから呼んだ場合も、サーバーエラー時にアラートが表示される
- クライアント側のエラー (DataChannel 未接続、リクエストタイムアウト、notification 送信失敗) は従来どおりアラートのみで、RPC Results には記録されない
- 成功時は従来どおり `result` が RPC Results に表示される
- サーバーがエラーを返す経路のテストが追加されている (jsdom には `RTCDataChannel` がないため、`vitest.ct.config.ts` の browser テストで実 `RTCPeerConnection` の `rpc` DataChannel を使い、サーバー役に JSON-RPC エラーを返させる)
- `sora-js-sdk` のバージョンが修正を含むものになっている
- `pnpm check` / `pnpm test` / `pnpm test:ct` が通る
- `CHANGES.md` の `## develop` に `[FIX]` を追記する (sora-js-sdk のバージョン更新は misc の `[UPDATE]`)
