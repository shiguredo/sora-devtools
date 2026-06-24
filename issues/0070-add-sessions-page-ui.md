# /sessions ページに過去セッション一覧・詳細・フィルタ UI を実装する

- Priority: Medium
- Created: 2026-06-24
- Completed: YYYY-MM-DD
- Model: GLM-5.2
- Branch: feature/add-sessions-page-ui
- Polished: YYYY-MM-DD

## 目的

#0066 で導入した preact-iso ルーティング基盤の上に、`/sessions` ページの実際の UI を実装する。#0067 / #0068 で永続化したセッション・接続メタデータ・WebRTC stats を DuckDB-Wasm のクエリで取得し、過去セッションの一覧・詳細・フィルタを提供する。

## 優先度根拠

Medium。#0065 エピックの完了条件である「`/sessions` ページで過去セッションの一覧が表示でき、各セッションの詳細で stats を確認できること」を満たすための必須作業である。ただし、#0066 / #0067 / #0068 が完了していることが前提となる。

## 現状

- #0066 で `src/routes/Sessions.tsx` に仮ページコンポーネントが作成される（default export のみ）
- #0067 で `src/sessionDatabase.ts` に DuckDB-Wasm のクエリ実行 API が実装される
- #0068 で `webrtc_stats` テーブルに stats が永続化される
- `src/components/Header/index.tsx` に `SessionsButton` が配置される（#0066 で実施）

## 設計方針

- `src/routes/Sessions.tsx` に一覧・詳細・フィルタ UI を実装する
- `src/components/Sessions/` に一覧・詳細・フィルタの各コンポーネントを作成する
- セッション一覧: channelId / sessionId / connectionId / 接続時刻 / 切断時刻 / 状態（`ended_at` の有無で切断済み / 切断不確定 / 接続中を判定）
- セッション詳細: connection メタデータ、webrtc stats 集計・時系列グラフ
- webrtc stats 表示は全件テーブルではなく、以下の形式で提供する
  - 集計値（平均ビットレート、総パケット数、パケットロス率、最大 / 最小 / 平均 RTT 等）
  - 時系列サンプリング（1 秒間隔を 10 秒 / 1 分間隔に間引いたデータ）
  - ページネーション付き生データテーブル（必要な場合のみ）
- クエリストリングによる絞り込み（`sessionId` / `connectionId` / `channelId` / `from` / `to`）
- UI 上には「データは端末内の OPFS に保存され、外部サーバーには送信されない」ことを明示する
- `connections` / `webrtc_stats` テーブルの `session_db_id`（#0067 / #0068 で追加）を用いて `sessions` テーブルと結合する
- #0062（三項演算子禁止）がマージ済みの場合は三項演算子を使用しない

## 完了条件

- `/sessions` ページで過去セッションの一覧が表示できること
- 各セッションの詳細で webrtc stats の集計値と時系列サンプリングが確認できること
- クエリストリングによる絞り込み（`sessionId` / `connectionId` / `channelId` / `from` / `to`）が機能すること
- ページネーション付き生データテーブルが表示できること
- `build` / `test` / `check` が成功すること
- `CHANGES.md` に `- [ADD] /sessions ページに過去セッション一覧・詳細・フィルタ UI を実装する` を記載すること

## 解決方法

1. `src/components/Sessions/SessionList.tsx` を作成し、セッション一覧を表示する
2. `src/components/Sessions/SessionDetail.tsx` を作成し、セッション詳細を表示する
3. `src/components/Sessions/SessionFilter.tsx` を作成し、クエリストリングによる絞り込みを提供する
4. `src/components/Sessions/StatsChart.tsx` を作成し、webrtc stats の集計値と時系列サンプリングを表示する
5. `src/routes/Sessions.tsx` を仮ページから実際の UI に書き換える
6. `src/sessionDatabase.ts` に一覧取得・詳細取得・stats 集計のクエリメソッドを追加する（#0067 で作成された API を拡張）
7. Playwright E2E テストで `/sessions` ページの一覧・詳細・フィルタを検証する

## テスト方針

- Vitest 単体テスト: クエリストリングのパース・集計値の計算など、ブラウザ API に依存しない純粋関数を対象とする
- Playwright E2E テスト:
  - `/sessions` ページで過去セッションの一覧が表示されること
  - セッション詳細で stats が表示されること
  - クエリストリングによる絞り込みが機能すること
  - Sora 接続が必要なテストでは #0063 で導入される `requireSoraConnectionEnv()` を使用し、`E2E_TEST_SORA_SIGNALING_URL` 未設定時は `test.skip()` で skip する

## 関連 issue

- #0065: DuckDB-Wasm + OPFS で過去セッションの stats / メタデータを永続化し /sessions ページで確認できるようにする（親 issue）
- #0066: preact-iso を導入して `/sessions` ページへのルーティング基盤を追加する
- #0067: DuckDB-Wasm + OPFS でセッション・接続メタデータを永続化する
- #0068: WebRTC stats を DuckDB-Wasm + OPFS に永続化する
