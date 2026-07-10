# /sessions ページに過去セッション一覧・詳細・フィルタ UI を実装する

- Priority: Medium
- Created: 2026-06-24
- Completed: YYYY-MM-DD
- Model: GLM-5.2
- Branch: feature/add-sessions-page-ui
- Polished: 2026-07-11

## 目的

#0066 で導入した preact-iso ルーティング基盤の上に、`/sessions` ページの実際の UI と、親 #0065 が固定した DuckDB 読み取り API を実装する。#0067 / #0068 で永続化したセッション・接続メタデータ・WebRTC stats を一覧・詳細・フィルタで確認できるようにする。

## 優先度根拠

Medium。#0065 エピックの完了条件である「`/sessions` ページで過去セッションの一覧が表示でき、各セッションの詳細で stats を確認できること」を満たすための必須作業である。#0066 / #0067 / #0068 は完了済みで、残る第 1 段階の必須ピースが本 issue である。

## 現状

- #0066 / #0067 / #0068 は `issues/closed/` にあり develop へマージ済み
- `src/App.tsx` に `/` / `/sessions` / default→DevTools の Router、`createSessionDatabase()` 初期化、`beforeunload` での `disconnectSora()` がある
- `src/routes/Sessions.tsx` は仮ページ（`<h1>Sessions</h1>` の default export）のみ。`src/components/Sessions/` は未作成
- `src/components/Header/SessionsButton.tsx` は `route("/sessions")` で遷移する（クエリストリングは引き継がない）
- `src/sessionDatabase.ts` にはスキーマ（`sessions` / `connections` / `webrtc_stats`）、書き込み API、`getCurrentSessionDbId()` / `whenReady()` / `enqueueWrite`（非 export の直列化）がある。親が固定した読み取り API（`listSessions` 等）は未実装
- E2E 用に `querySessionDatabaseForE2e` と `tests/helpers/sessionDatabase.ts`（`cleanupSessionDatabase` / `listSessionRows` 等）がある。本番 UI の読み取り雛形ではない（アプリ側 close 前提）
- #0063 の `requireSoraConnectionEnv()` は導入済み（`tests/helpers/env.ts`）。フォールバック禁止
- `package.json` にチャートライブラリ依存は無い
- #0062（三項演算子禁止）は open のまま（`vite.config.ts` の `no-ternary` は off）。新規コードでは三項演算子を使わないことを推奨する

## 設計方針

### スコープ

本 issue が担うもの:

- `src/sessionDatabase.ts` への読み取り API 追加（親 #0065 固定名）
- `/sessions` の一覧・詳細・フィルタ UI（`src/routes/Sessions.tsx` + `src/components/Sessions/`）
- プライバシー文言の表示
- 読み取り失敗時のページ内エラー表示
- Vitest / Playwright E2E / ct 追従（再接続・同一 channelId の区別表示を含む）
- `CHANGES.md` の `[ADD]` エントリ

本 issue のスコープ外:

- Header / Footer のページ別出し分け（#0071）
- `DownloadReportButton` 削除（#0069）
- 新規チャートライブラリの追加（必要になったら別 issue）
- #0066 が「#0070 側で整理」とした `/sessions?...` → DevTools signal 汚染の根治（`setInitialParameter` を pathname でスキップする等）。第 1 段階では #0066 どおり受容する。本 issue では Sessions が独自に QS をパースし、フィルタ適用を DevTools signals に**書かない**ことだけを行う。キー名は親どおり `channelId` 等を使い、別名にはしない

### 用語

| 用語                          | 意味                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------- |
| `sessionDbId` / `sessions.id` | DuckDB の接続試行単位の内部 ID（INTEGER）                                       |
| Sora `session_id`             | Sora が発行するセッション ID（VARCHAR）。同一値で複数の `sessions` 行があり得る |
| Sora `connection_id`          | Sora が発行する接続 ID（VARCHAR）                                               |

一覧・フィルタ・API 引数で両者を混同しない。詳細の選択キーは必ず `sessionDbId` とする。

### 読み取り API（親 #0065 固定。本 issue で実装）

`src/sessionDatabase.ts` に次を追加する。DuckDB の同一 `AsyncDuckDBConnection` への並行 query は想定外のため、読み取りも既存の書き込み直列化（`enqueueWrite` 相当）経由で実行する。

| API                                          | 責務                                                                                                           |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `listSessions(filter)`                       | 一覧（**session 行単位**）。`connectionId` フィルタは `connections` への EXISTS / JOIN で session 行を絞り込む |
| `getSession(sessionDbId)`                    | 詳細（session + 紐づく connections）。無ければ `null`                                                          |
| `queryStatsAggregates(sessionDbId)`          | 集計値（当該 session の全 stats。connection 絞り込みは第 1 段階では付けない）                                  |
| `queryStatsTimeseries(sessionDbId, options)` | 時系列サンプリング                                                                                             |
| `queryStatsPage(sessionDbId, options)`       | ページネーション付き生データ                                                                                   |

第 1 段階のストリーム識別は **`stats_id` のみ**とする（`connection_id` との複合パーティションは付けない）。同一 `session_db_id` に複数 connection がある場合、同名 `stats_id` が衝突しうる点は第 1 段階で受容する（詳細の connection 一覧で接続は区別できる）。

`filter` のフィールド（いずれも省略可。指定時は完全一致）:

- `sessionId`: Sora `session_id`
- `connectionId`: Sora `connection_id`（EXISTS / JOIN。完全一致）
- `channelId`: `sessions.channel_id`
- `from` / `to`: **`sessions.started_at`** を対象とする

`from` / `to` の形式と境界（固定）:

- 形式: `YYYY-MM-DD`（日付のみ）
- タイムゾーン: **UTC**
- `from`: その日 00:00:00.000 UTC **以上**（inclusive）
- `to`: その日の翌日 00:00:00.000 UTC **未満**（exclusive end）。`to` 未指定なら上限なし

並び順（固定）:

- `listSessions`: `ORDER BY started_at DESC NULLS LAST, id DESC`
- `getSession` 内の connections: `ORDER BY started_at ASC NULLS LAST, id ASC`
- `queryStatsTimeseries` / `queryStatsPage`: `ORDER BY timestamp_ms ASC, id ASC`

`queryStatsTimeseries` の `options`（固定）:

- `intervalSec`: 省略時は `10`。指定時は `10` または `60`（それ以外は Error を throw）
- バケット: `bucket = floor(timestamp_ms / (intervalSec * 1000))`
- ストリーム差分は `stats_id` 単位で先に計算する。同一バケットに複数 `stats_id` があるとき: `bitrate_send_bps` / `bitrate_recv_bps` は合算、`round_trip_time` は平均（全て欠測なら `null`）
- 各メトリクスのバケット代表値は、上記畳み込み後の系列に対する **last**（`timestamp_ms` 最大。同値なら `id` 最大）
- 戻り: `{ timestamp_ms, bitrate_send_bps, bitrate_recv_bps, round_trip_time }[]`（欠測は `null`）。`timestamp_ms` はバケット代表時刻（`bucket * intervalSec * 1000`）

`queryStatsPage` の `options`（固定）:

- `limit`: デフォルト `50`。`1..200` 以外は Error を throw（clamp しない）
- `offset`: デフォルト `0`。負なら Error
- 戻り: `{ rows, totalCount }`。`totalCount` は **当該 `sessionDbId` の `webrtc_stats` 全件数**（limit/offset 適用前）
- `rows` の各要素: `{ id, timestamp_ms, stats_type, stats_id, kind, packets_received, packets_sent, bytes_received, bytes_sent, round_trip_time }`（欠測は `null`）

`queryStatsAggregates` の戻り（固定。欠測は `null`）:

- `packets_received` / `packets_sent` / `packet_loss_rate`
- `rtt_min` / `rtt_max` / `rtt_avg`
- `bitrate_send_bps` / `bitrate_recv_bps`

戻り値の最小形状（TypeScript 型名は実装時に付けてよい）:

- `listSessions` の各行: `{ id, session_id, channel_id, role, started_at, ended_at }`。時刻は **ISO 8601 文字列**（SQL 側で `CAST(... AS VARCHAR)` または同等）。`session_id` / `ended_at` は `null` 可
- `getSession`: `{ session: 上記行, connections: ConnectionRow[] } | null`
- `ConnectionRow`: `{ id, session_db_id, session_id, connection_id, sora_client_id, channel_id, signaling_url, started_at, ended_at }`（時刻は同様に文字列化）
- 状態ラベル（切断済み / 接続中 / 切断不確定）は API に含めず、UI の `deriveSessionStatus(endedAt, sessionDbId, currentSessionDbId)` で付与する

未初期化（`whenReady()` 前）や永続化 no-op（OPFS 非対応等）のとき:

- 一覧・時系列は空配列、ページは `{ rows: [], totalCount: 0 }`、詳細は `null`
- 呼び出し側 UI は「データなし」と「読み取り失敗」を区別して表示する（後述）

クエリ例外は throw し、UI がページ内エラーにする。DevTools の `alertMessages` 経路には載せない。

### セッション状態（3 状態。親 #0065 定義）

`ended_at` の有無だけでは 2 値しか取れない。表示は次で判定する。

- **切断済み**: `ended_at IS NOT NULL`
- **接続中**: `ended_at IS NULL` かつ `getCurrentSessionDbId()` が当該 `sessions.id` と一致
- **切断不確定**: `ended_at IS NULL` かつ上記以外（強制終了・`beforeunload` 未完了・別タブの残骸など）

`/sessions` をリロードした直後は、生きた接続が無ければ `ended_at IS NULL` はすべて「切断不確定」として表示する。判定は純粋関数（例: `deriveSessionStatus`）に切り出し Vitest する。

### 一覧 UI

- 粒度: `sessions` 行を 1 行とする
- 必須表示カラム: `channelId` / Sora `session_id` / `started_at` / `ended_at` / 状態（上記 3 状態）
- **`connectionId` は一覧の必須カラムにしない**（詳細の `connections` 一覧で示す）
- `session_id` / `ended_at` が `null` のときは `—`（または同等の欠測表示）とする。時刻文字列はそのまま表示してよい（追加のローカル TZ 変換は第 1 段階では必須にしない）
- 空一覧時は「保存されたセッションはありません」等の空状態を出す
- 再取得: マウント時、およびフィルタ / `sessionDbId` QS 変更時。手動更新ボタンは任意（無くてよい）

### 詳細 UI と URL

- ルートは既存の `/sessions` のみを使う（`/sessions/:id` は追加しない）
- 詳細選択はクエリストリング `sessionDbId=<sessions.id>` で行う
- フィルタ用 QS と共存する: `sessionId` / `connectionId` / `channelId` / `from` / `to` / `sessionDbId`
- Sessions は `parseSessionsSearchParams` / `buildSessionsSearchParams`（仮名可）で独自に QS を読み書きする。`preact-iso` の `useLocation` / `route` を使う
- `SessionsButton` は QS 無しの `/sessions` へ遷移する現状を維持する（フィルタ付き URL の保持はしない）
- `sessionDbId` が非整数・欠落・存在しない行（`getSession` が `null`）のとき: 詳細エリアは空状態とし、ページ全体エラーにはしない。不正値は QS から除去して `buildSessionsSearchParams` で正規化してよい
- `from` / `to` が `YYYY-MM-DD` 以外、または `from` の日付が `to` より後のとき: 未指定扱いとし、QS から除去して正規化する（ページ全体エラーにはしない）
- 詳細内容: session メタデータ、紐づく `connections` 一覧、webrtc stats の集計・時系列・生データテーブル

### webrtc stats 表示

全件を一度に出さない。次の 3 形式を提供する（いずれも必須）。

1. **集計値**（`queryStatsAggregates`）
2. **時系列サンプリング**（`queryStatsTimeseries`）
3. **ページネーション付き生データテーブル**（`queryStatsPage`）

#### 第 1 段階の必須集計（これ以外は任意）

WebRTC のパケット / バイト系は **累積カウンタのスナップショット**である。行を単純 `sum` するとセッション長に比例して膨張するため禁止する。ストリーム単位（`stats_id`）で **最新行**（`timestamp_ms` 最大。同値なら `id` 最大）を取り、その後に合算する。

| 表示名                                 | 算出方針                                                                                                                                                                                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 総 `packets_received` / `packets_sent` | `inbound-rtp` / `outbound-rtp` それぞれについて `stats_id` 単位の最新行を取り、`packets_*` を合算                                                                                                                                            |
| パケットロス率                         | 上記と同様に `inbound-rtp` の最新行群で `sum(packets_lost) / nullif(sum(packets_received)+sum(packets_lost), 0)`。欠測時は `null`。`packets_lost` は仕様上負にもなり得る（#0068）。第 1 段階ではクランプせずそのまま使う                     |
| RTT 最小 / 最大 / 平均                 | `candidate-pair` の `stats_id` 単位最新行の `round_trip_time` に対する min / max / avg（行が無ければ `null`）                                                                                                                                |
| 平均ビットレート（送受信）             | `outbound-rtp` / `inbound-rtp` について `PARTITION BY stats_id ORDER BY timestamp_ms, id` の window で `bytes_*` 差分 ÷ 時間差（秒）を計算し、正の差分のみ平均する。正の差分が 0 件なら `null`。`bitrate_bps` カラムは持たない（#0068 方針） |

#0068 の容量サンプリング（古い側の間引き）後も、最新行ベースなら最終値は新しい側に残りやすい。E2E では集計の厳密一致を求めず、「詳細で集計または時系列が 1 件以上見える」程度に留める。

`kind` が欠ける環境（fake media）があるため、集計の必須断言に `kind` 分割は含めない。

#### 時系列

- メトリクス: 上記 window 差分のビットレート（send / recv）、および `candidate-pair` 最新寄りの `round_trip_time`
- 間隔: デフォルト 10 秒。UI で 1 分（`intervalSec=60`）に切り替え可能
- 元データは 1 秒間隔想定。間引きは SQL または純粋関数で行い、契約を Vitest できる形にする
- window / 間引きは必ず `stats_id` でパーティションする（第 1 段階は `connection_id` を混ぜない）

#### 生データページネーション

- デフォルト `limit=50`、`offset` ベース（上述の `queryStatsPage` 契約）
- 必須カラム: `timestamp_ms` / `stats_type` / `stats_id` / `kind` / `packets_received` / `packets_sent` / `bytes_received` / `bytes_sent` / `round_trip_time`

#### チャート描画

- **新規チャートライブラリを追加しない**
- SVG または Canvas の自前描画、もしくは集計テーブル + 簡易スパークラインに留める
- コンポーネント名は `StatsChart.tsx` でよいが、依存追加は禁止

### プライバシー文言（親 #0065。本 issue 担当）

`/sessions` ページ上部に次を明示する（文言は実装時に日本語で固定してよい）。

1. データは端末内の OPFS に保存され、外部サーバーには送信されない
2. 接続記録に端末情報（IP アドレス等）が含まれる
3. 複数タブで同時に開くとデータ破損のリスクがある（#0067 は初期化時 `console.warn` 済み。UI 文言は本 issue）

### エラー・空状態・初期化待ち

- マウント時に `await whenReady()` してから読み取る
- 読み取り例外: ページ内エラー表示（リトライボタンは任意。無くてよい）
- 永続化 no-op / 空 DB: エラーではなく空状態
- UI 文字列は日本語。ログ・Error message は英語（AGENTS.md）

### コンポーネント構成

- `src/routes/Sessions.tsx`: ページ組み立て（フィルタ・一覧・詳細・文言・エラー）
- `src/components/Sessions/SessionList.tsx`
- `src/components/Sessions/SessionDetail.tsx`
- `src/components/Sessions/SessionFilter.tsx`
- `src/components/Sessions/StatsChart.tsx`（自前描画）
- 純粋関数は `src/components/Sessions/` 配下または `src/sessions*.ts` に置き、Vitest する

### 後方互換

- `CODEBASE.md` に従い製品の後方互換は考慮しない
- 既存の仮ページ見出しに依存する ct / E2E（`SessionsButton.ct.tsx` / `tests/routing.test.ts`）は本 issue で追従更新する

## 完了条件

- `/sessions` で過去セッションの一覧（session 行単位）が表示できること。必須カラムは channelId / Sora session_id / started_at / ended_at / 状態（親定義の 3 状態）
- 一覧に `connectionId` を必須表示していないこと
- `sessionDbId` QS で詳細を開け、connections と webrtc stats の集計・時系列（10 秒 / 1 分）・ページネーション付き生データが確認できること
- クエリストリング絞り込み（`sessionId` / `connectionId` / `channelId` / `from` / `to`）が機能し、`from` / `to` が `sessions.started_at` を対象にしていること
- プライバシー文言 3 点が表示されること
- 読み取り失敗時にページ内エラーが表示されること
- 新規チャートライブラリ依存を追加していないこと
- 切断→再接続（または別接続試行）後、同一 channelId の複数 `sessions` 行が一覧・詳細で区別して表示できること（Playwright E2E 最低 1 本）
- 仮ページ前提の ct / routing E2E が新 UI に追従していること
- `vp build` / `vp test run` / `pnpm test:ct` / `pnpm test:e2e` / `vp check` が成功すること
- `CHANGES.md` の `## develop` に次を記載すること（`shiguredo-changelog` どおり担当者行はエントリの次行・インデント 2 スペース）

```text
- [ADD] /sessions ページに過去セッション一覧・詳細・フィルタ UI を実装する
  - @voluntas
```

## 解決方法

1. 失敗するテストを先に追加する（`CODEBASE.md`）。モック・スタブは使わない
   - Vitest: `deriveSessionStatus`、`parseSessionsSearchParams` / `buildSessionsSearchParams`、時系列間引き等の純粋関数
   - Playwright: `tests/sessions-page.test.ts`（仮）を `serial` + `cleanupSessionDatabase` + `requireSoraConnectionEnv()` で追加。一覧・フィルタ・詳細・再接続区別をカバーする
2. `sessionDatabase.ts` に `listSessions` / `getSession` / `queryStatsAggregates` / `queryStatsTimeseries` / `queryStatsPage` を実装する（読み取りも直列化キュー経由）
3. `src/components/Sessions/` に List / Detail / Filter / StatsChart を実装する
4. `src/routes/Sessions.tsx` を仮ページから実 UI に書き換える（`whenReady`・プライバシー文言・エラー表示を含む）
5. 仮ページ依存の `SessionsButton.ct.tsx` / `tests/routing.test.ts` を更新する
6. `CHANGES.md` に `[ADD]` と `- @voluntas` を追記する

## テスト方針

### Vitest（モック・スタブ禁止）

- Chai の `test` / `assert` を使う。Jest API（`it` / `describe` / `expect`）は使わない
- 対象: QS パース、3 状態判定、間引き・集計の純粋部分
- PBT を使う場合は `*.prop.ts`

### Playwright E2E

- ファイル: `tests/sessions-page.test.ts`（新設）。`test.describe.configure({ mode: "serial" })` と `cleanupSessionDatabase` の before/after を必須とする
- `requireSoraConnectionEnv()` ハード依存。`process.env` フォールバック禁止
- UI 断言は DOM を主とする
- `cleanupSessionDatabase` は before/after のみ使う。シナリオ中に `listSessionRows` 等（内部でアプリ DB を close するヘルパー）を使う場合は、その後に UI 再読込または `reopenAppSessionDatabase` 後の DOM 再取得を必須とする
- `tests/routing.test.ts` の接続維持断言は Header の TURN URL 表示に依存する。#0071 が先行して Header を隠した場合は、本 issue または #0071 側で断言の置き場を移す（ソフト依存）
- 最低シナリオ:
  1. 接続→切断後に `/sessions` で一覧に当該 session 行が出る
  2. フィルタ QS が効く
  3. 詳細で集計または時系列が 1 件以上見える（厳密な数値一致は求めない）
  4. 切断→再接続（または別試行）後、同一 channelId で複数行が区別できる
- channelId suffix 例: `sessions-page-ui`

## 関連 issue

- #0065: DuckDB-Wasm + OPFS で過去セッションの stats / メタデータを永続化し /sessions ページで確認できるようにする（親）
- #0066: preact-iso を導入して `/sessions` ページへのルーティング基盤を追加する（完了）
- #0067: DuckDB-Wasm + OPFS でセッション・接続メタデータを永続化する（完了）
- #0068: WebRTC stats を DuckDB-Wasm + OPFS に永続化する（完了）
- #0063: Sora 接続が必要な E2E で環境変数未設定時に即座に失敗させる（完了。本 issue E2E が依存）
- #0069: DownloadReportButton 削除（本 issue 完了後推奨。スコープ外）
- #0071: `/sessions` では DevTools 専用 Header 操作を出さない（スコープ外）
- #0062: 三項演算子禁止（open。新規コードでは三項を避ける）
