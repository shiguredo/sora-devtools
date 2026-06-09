# 0037-refactor-introduce-e2e-page-object

- Priority: High
- Created: 2026-06-08
- Model: deepseek-v4-pro

## 目的

Playwright の e2e テストに Page Object Model を導入し、既存テストの重複を解消する。今後の e2e テスト追加の基盤を整備する。

## 優先度根拠

後続の e2e テスト追加（#0038, #0039）の前提となる基盤であり、先に整備する必要がある。また、既存の `sendrecv.test.ts` / `sendonly.test.ts` / `recvonly.test.ts` の 3 ファイルはほぼ同一コードであり、新たなロールテストを追加する前に共通化すべき。

## 現状

- `tests/sendrecv.test.ts`, `tests/sendonly.test.ts`, `tests/recvonly.test.ts` の 3 ファイルは、チャンネル ID の suffix 以外が完全に同一のコード
- 各テストファイルに selector（`button[name="connect"]`, `#local-video-connection-id` 等）がハードコードされている
- Sora サーバーが利用できない環境でもテストが実行され、環境変数不足で失敗する
- `tests/` 配下にヘルパーや共通ページオブジェクトが存在しない

## 設計方針

1. `tests/pages/DevtoolsPage.ts` を作成し、Devtools ページの操作をカプセル化する
   - `navigate(params?: Record<string, string>)`: URL パラメータ付きでページ遷移
   - `connect()`: 接続ボタンクリック
   - `disconnect()`: 切断ボタンクリック
   - `waitForConnection(timeout?: number)`: 接続 ID 表示まで待機
   - `getConnectionId()`: 接続 ID を取得
2. `tests/helpers/env.ts` を作成し、Sora 接続用環境変数の読み込みと検証を共通化する
   - `getSoraConnectionEnv()`: `E2E_TEST_SORA_SIGNALING_URL`, `E2E_TEST_SORA_CHANNEL_ID_PREFIX`, `E2E_TEST_ACCESS_TOKEN` を読み込み
   - 環境変数が未設定の場合はテストを skip するヘルパー
3. 既存の 3 テスト（`sendrecv.test.ts`, `sendonly.test.ts`, `recvonly.test.ts`）を、Page Object とヘルパーを使ってリファクタリングする
4. `.env.local` が存在しない場合や必要な環境変数が未設定の場合に、Sora サーバー依存テストを skip する機構を導入する
   - Playwright の `test.skip()` または `test.describe` の条件付き skip を利用

## 完了条件

- `tests/pages/DevtoolsPage.ts` が作成され、接続・切断・待機の基本操作がカプセル化されている
- `tests/helpers/env.ts` が作成され、環境変数の読み込みと skip の仕組みが提供されている
- 既存の `sendrecv.test.ts`, `sendonly.test.ts`, `recvonly.test.ts` が Page Object を使う形にリファクタリングされている
- 3 つのテストが重複なく記述されている
- 全 e2e テストが通過すること（`pnpm test:e2e`）

## 解決方法

1. `tests/pages/DevtoolsPage.ts` を新規作成
2. `tests/helpers/env.ts` を新規作成
3. `tests/sendrecv.test.ts`, `tests/sendonly.test.ts`, `tests/recvonly.test.ts` を修正
