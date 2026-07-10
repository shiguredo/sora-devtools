# DuckDB-Wasm + OPFS で過去セッションの stats / メタデータを永続化し /sessions ページで確認できるようにする

- Priority: Medium
- Branch: なし（エピック。実装作業は #0066 / #0067 / #0068 / #0070 で行うため作業ブランチは切らない）
- Created: 2026-06-24
- Completed: YYYY-MM-DD
- Model: GLM-5.2
- Polished: 2026-07-10

## 目的

現在、sora-devtools はブラウザを閉じると WebRTC stats や接続メタデータが失われる。過去の接続を振り返り問題調査に使えるよう、第 1 段階ではセッション / 接続メタデータと WebRTC stats をブラウザ内（DuckDB-Wasm + OPFS）に永続化し、`/sessions` ページで一覧・詳細を確認できるようにする。signaling / notify / timeline / log / push の永続化は第 2 段階（本エピック完了条件外）とする。

## 優先度根拠

Medium。sora-devtools は開発・検証用ツールであり、過去の接続状況を振り返る機能はデバッグ効率を大きく向上させる。ただし、接続機能そのものを阻害しない範囲で段階的に導入する。

## 現状

- WebRTC stats は `src/app/actions.ts` の `setStatsReportInternal()` / `startStatsReportTimer()` で 1 秒間隔に取得され、`signals.statsReport` / `signals.prevStatsReport` に保持される
- signaling / notify / timeline / log / push は主に `src/app/actions.ts` の `setSoraCallbacks()` 内で SDK イベントを受け取り、それぞれの signal に append-only で保持される。timeline / log は `connectSora()` や `createMediaStream()` などコールバック外からも追加される
- 既存の OPFS 永続化は `src/opfs.ts` の signaling URL 設定保存のみ（`signaling-url-candidates.json`）。Safari の `createWritable` 非対応に対する分岐がある
- 既存のエクスポート機能は `src/components/Header/DownloadReportButton.tsx` で現在のセッションを JSON ダウンロードするのみ
- `sessionId` / `connectionId` / `soraClientId` は `handleConnectionCreatedNotify()` で `connection.created` notify 受信後に確定する
- 切断時に `disconnect` コールバック内で `sora` / `sessionId` / `connectionId` / `soraClientId` / `soraTurnUrl` の識別子がクリアされる。ただし `timelineMessages` / `notifyMessages` / `signalingMessages` / `logMessages` / `pushMessages` は切断時にはクリアされず、`setInitialParameter()` → `resetState()` → `resetMessagesState()` でのみクリアされる。`dataChannelMessages` は同経路の `resetDataChannelState()` でクリアされる
- `reconnectSora()` の呼び出しは `disconnect` コールバック内の `void reconnectSora()` のみである（手動 reconnect 経路は存在しない）
- `src/DevTools.tsx` の `useEffect` で `setInitialParameter()` / `setMediaDevices()` / `unregisterServiceWorker()` を呼び、cleanup で `disconnectSora()` を呼んでいる。`src/App.tsx` は `<DevTools />` を直接描画するのみ
- `package.json` に `@duckdb/duckdb-wasm` / `preact-iso` は未導入

## 用語

| 用語                            | 意味                                                                                                           |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `sessions.id` / `session_db_id` | DuckDB の `sessions` テーブル主キー（INTEGER）。接続試行単位の内部 ID                                          |
| Sora `session_id`               | Sora が発行するセッション ID（VARCHAR）。同一値で複数の `sessions` 行があり得る                                |
| Sora `connection_id`            | Sora が発行する接続 ID（VARCHAR）。`connections` 行はこれごとに 1 レコード                                     |
| 接続試行                        | `connectSora()` または `reconnectSoraImpl()` の 1 呼び出し。`attemptReconnection()` の最大 10 回リトライを含む |

## 技術選定

### DuckDB-Wasm を選ぶ理由

- 過去セッションの WebRTC stats をチャンネル・セッション・接続単位で集計・分析する必要がある
- 例: 同一 channelId での過去接続の平均ビットレート、パケットロス率の時系列変化、特定 connection_id の RTT 推移など
- 単なる JSON ファイル保存では、複数セッションにまたがる集計や時系列分析を都度 JavaScript で実装する必要があり、メンテナンスコストが高い
- DuckDB-Wasm はブラウザ上で SQL 集計が可能であり、window 関数、`GROUP BY`、時系列集計などを利用できる
- OPFS と組み合わせることで、stats データをブラウザ内に永続化しつつ、DuckDB のクエリエンジンで高速に集計できる

### 代替案の検討

- **SQLite-Wasm (wa-sqlite / sql.js)**: ブラウザ上で SQL を実行できるが、本用途は分析系クエリ（window 関数・時系列集計）が中心であり、DuckDB-Wasm の方が適している
- **IndexedDB + カスタムインデックス + JS 集計**: 小規模データなら実現可能だが、数万件の stats 時系列データに対する集計クエリを JS で都度実装するメンテナンスコストが高い

### OPFS を選ぶ理由

- 永続化データは開発・検証用の接続記録であり、同一ユーザーの端末内に閉じていれば十分
- OPFS は同一オリジン・同一ブラウザプロファイル内のアプリケーションのみアクセスできるため、接続記録を外部サーバーに送信せずに保存できる
- ただし、ブラウザの開発者ツールや同一オリジンで動作する悪意のあるスクリプトからは読み出せるため、絶対的な隔離ではない
- 既存の `src/opfs.ts` は signaling URL 用であり、DuckDB の `opfs://` 経路とは別スタックである。Safari 等での DuckDB-Wasm + OPFS 対応は Chromium 系ほど確実ではない

## 設計方針

### 全体アーキテクチャ

```
[Sessions UI] ──クエリ──▶ [src/sessionDatabase.ts] ──▶ [DuckDB-Wasm AsyncDuckDB] ──▶ [OPFS: sora-devtools-sessions.db]
                              ▲
                              │ 永続化フック（第 1 段階）
                         [src/app/actions.ts]
                              ▲
                              │ 初期化 / beforeunload
                         [src/App.tsx]
```

- `src/sessionDatabase.ts` は DuckDB-Wasm の初期化、テーブル作成、書き込み API、読み取り API を提供する
- 第 1 段階の永続化フックは `src/app/actions.ts`（`connectSora` / `reconnectSoraImpl` / `setSoraCallbacks` / `setStatsReportInternal`）に置く。`signals.ts` の append 経路には置かない
- 初期化と `beforeunload` は `App.tsx` に置く（#0066 / #0067）
- OPFS 上のデータベースファイル名は `sora-devtools-sessions.db` とし、既存の `signaling-url-candidates.json` と衝突しないようにする

### 永続化対象（段階的導入）

第 1 段階（本エピックの対象。完了条件の範囲）:

- `sessions` テーブル: 1 回の接続試行に紐づくセッション単位のメタデータ
- `connections` テーブル: `connection.created` notify 確定後の接続単位メタデータ
- `webrtc_stats` テーブル: 1 秒間隔で取得される RTCStats

第 2 段階（将来拡張。本エピックの完了条件外）:

- `timeline_messages` / `notify_messages` / `signaling_messages` / `log_messages` / `push_messages` / （必要なら）`data_channel_messages`

第 1 段階で timeline / notify / signaling / log / push を除外する理由は、stats 永続化と UI の基盤を先に確立するためである。第 2 段階は別 issue で検討する。

**第 1 段階の機能ギャップ（明示的に受容する）:**

- #0069 で `DownloadReportButton` を削除すると、timeline / notify / log 等のオフライン JSON 持ち出し手段が第 2 段階まで無くなる
- 本エピック（`add`）の完了条件に #0069（`change`）は含めない。削除は独立した関連作業とし、実施時期は「#0070 完了後」を推奨する（Sessions UI が代替導線になるまで DownloadReport を残す）

### セッション識別子の扱い（横断モデル）

実装手順の詳細は #0067 / #0068 に委譲する。ここでは子 issue が守るべきモデルだけを固定する。

#### レコード粒度

- `sessions` は「接続試行単位」のレコードとする。`connectSora()` / `reconnectSoraImpl()` の 1 呼び出しにつき 1 行。`attemptReconnection()` の最大 10 回リトライは同一 `sessions` 行に属する
- 各リトライ（および初回接続）で `connection.created` が来た場合、`connections` レコードを個別に作成する
- 同じ Sora `session_id` が返されても、新しい接続試行では新しい `sessions` 行を作成する
- `connections` / `webrtc_stats` から `sessions` への参照は Sora `session_id` ではなく `session_db_id`（`sessions.id`）を使う

#### `sessions.id` の受け渡しと current 公開

- INSERT 戻り値の `sessions.id` は `connectSora()` / `reconnectSoraImpl()` の**ローカル変数**で保持し、クロージャにキャプチャする。接続試行のフック用 ID をモジュールローカルに置いて並走上書きする設計は禁止する
- 受け渡しパスに含める関数: `attemptReconnection` / `createSoraConnectionByRole` / `setSoraCallbacks` / `handleConnectionCreatedNotify` / `setStatsReportInternal` / `startStatsReportTimer`（およびタイマー内から呼ばれる経路）。詳細なシグネチャは #0067 / #0068 で実装する
- UI の「接続中」判定用、およびクロージャ外の明示パス（`disconnectSora` / `beforeunload` 経由の終端）用に、進行中の `sessions.id` を `getCurrentSessionDbId(): number | null`（または同等の signal）として公開する。所有者は #0067
  - INSERT 成功時に set、`sessions.ended_at` を書いた全経路で clear
  - 接続試行フック用のローカル変数（クロージャ）とは別物である。単一タブ前提で UI とクロージャ外書き込みが同じレジストリを共有してよい（並走時は後勝ち）
  - `disconnectSora` などクロージャ外の明示パスは、この `getCurrentSessionDbId()` で行を特定して `sessions.ended_at` を更新する

#### INSERT タイミング（親で固定。#0067 はこの決定に従う）

- **`connectSora()`**: 検知ポイント 1（既存接続の `disconnect` 直後のキャンセル判定）を通過した**後**、`prepareSignalingConnection()` で `metadata` を取得し、`createSoraConnectionByRole()` を呼ぶ**前**に `sessions` を INSERT する
  - 検知ポイント 1 で return する場合、新しい `sessions` 行はまだ存在しないため `ended_at` 更新は不要
  - 旧接続の `ended_at` は、検知ポイント 1 より前の `await soraValue.disconnect()` に伴う `disconnect` コールバック側の永続化フックで更新する
- **`reconnectSoraImpl()`**: `prepareSignalingConnection()` の後、`createMediaStream()` の前に INSERT する（`createMediaStream()` 失敗時に `sessions.ended_at` を更新するため）

#### `ended_at` 更新ルール（自己矛盾を避けるため親で固定）

`sessions.ended_at` を更新してよいのは「接続試行全体の終了」だけである。

**`disconnect` フックでの `sessions.ended_at` 更新条件（両方必須）:**

1. `isCurrent() === true`（成功後の遅延 disconnect や、他接続の残骸を除外）
2. `signals.reconnecting.value === false`（リトライ試行継続中の失敗 disconnect を除外）

`isCurrent()` 単独では不足する。`attemptReconnection` は `connect()` 前に `setSora(soraConnection)` するため、失敗に伴う `disconnect` が `setSora(null)` より先に届くとなお `isCurrent() === true` になる。このとき `reconnecting === true` なら試行は継続中なので `sessions.ended_at` を立ててはならない。

`reconnecting` 単独でも不足する。再接続成功後（`setSoraReconnecting(false)` 後）に失敗リトライ接続の遅延 `disconnect` が届くと `reconnecting === false` になるが、その時点では `isCurrent() === false` なので 1 で除外できる。

| 事象                                                                                                   | `sessions.ended_at`                                                                     | `connections.ended_at`                                                                           |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `disconnect` フックで `isCurrent() && !reconnecting`（通常切断・abend による再接続開始時の旧接続切断） | 更新する                                                                                | クロージャの `soraConnection.connectionId` で更新する                                            |
| `disconnect` フックで `isCurrent() && reconnecting`（リトライ中の失敗切断）                            | **更新しない**                                                                          | クロージャの `soraConnection.connectionId` で更新する                                            |
| `disconnect` フックで `!isCurrent()`（成功後の遅延 disconnect 等）                                     | **更新しない**                                                                          | クロージャの `soraConnection.connectionId` で更新する（`signals` 上の connection_id は使わない） |
| リトライ途中の `attemptReconnection` の `catch`（`connect()` 失敗）                                    | **更新しない**                                                                          | `connection.created` 済みなら、失敗した接続の `connectionId` で更新する                          |
| `createMediaStream()` 失敗 / reconnecting キャンセル / 全リトライ枯渇                                  | 更新する（明示パス）                                                                    | 受信済みなら更新する                                                                             |
| `connectSora` の `abortIfCancelled` / `try/catch` 失敗                                                 | 更新する（明示パス）                                                                    | 受信済みなら更新する                                                                             |
| `disconnectSora` による切断（`reconnecting` 中にユーザーが止めた場合を含む）                           | 更新する（明示パス。フックが `reconnecting === true` で sessions をスキップしうるため） | フックまたは明示パスで更新する                                                                   |
| `connection.created` 前の切断                                                                          | 上記ルールに従う                                                                        | レコード未作成のため不要                                                                         |

- `disconnect` コールバックの永続化フックは `isCurrent()` ガードの**前**（`signals.setTimelineMessage(...)` の直後）に置く。`sessions` / `connections` の更新分岐は上記表に従う
- abend 再接続開始時: フック時点ではまだ `setSoraReconnecting(true)` 前かつ `isCurrent() === true` なので旧 `sessions` は終了する。その後 `reconnectSoraImpl` が新しい `sessions` 行を INSERT する（正しい）
- `abortConnectSoraResources` および一部の失敗経路は `setSora(null)` の**後**に `disconnect()` するため、後続フックは `!isCurrent()` になり `sessions.ended_at` を書けない。これらの経路は必ず明示パスで `sessions.ended_at` を書く
- `sessions` 行の特定はクロージャの `sessions.id` で行う（`sessions.connection_id` は使わない）
- `connections.ended_at` の特定は、コールバックが紐づく `soraConnection.connectionId`（クロージャ）で行う。`signals` の connection_id を読んではならない（遅延 disconnect 時に成功接続側の ID になっている）
- SDK は `disconnect` コールバックの戻り値 Promise を待たないため、永続化は識別子を同期キャプチャしてから `void` + `.catch()` で投げる（#0068 と同じパターン）
- ブラウザ終了等で `ended_at` が更新できなかった場合、`ended_at` は `NULL` のまま残る

#### `connection.created` 時の `sessions` UPDATE（親で固定）

INSERT 時点では Sora `session_id` / `connection_id` は未確定である。`handleConnectionCreatedNotify()`（または同経路）で次を行う（#0067）。

- `sessions.session_id` / `sessions.connection_id`（last-only）を UPDATE する
- `connections` 行を INSERT する（`session_db_id` 付き）

`sessions.connection_id` カラムは持たせる。意味は last-only であり、行の特定や一覧の必須表示には使わない。

#### `ended_at` と UI 状態（3 状態の定義）

`ended_at` の有無だけでは 2 値しか取れない。一覧・詳細の状態表示は次で定義する。

- **切断済み**: `ended_at IS NOT NULL`
- **接続中**: `ended_at IS NULL` かつ `getCurrentSessionDbId()` が当該 `sessions.id` と一致
- **切断不確定**: `ended_at IS NULL` かつ上記以外（強制終了・`beforeunload` 未完了・別タブの残骸など）

`/sessions` をリロードした直後は、生きた接続が無ければ `ended_at IS NULL` はすべて「切断不確定」として表示する。

### DuckDB-Wasm 初期化

- npm パッケージ `@duckdb/duckdb-wasm` を使用する。バージョンは stable 版を明示的に指定する
- 初期化の詳細（`selectBundle()` / `?url` import / `assetsInlineLimit` / `manualChunks` / checkpoint / フォールバック）は #0067 に委譲する
- 初期化失敗時は既存の接続・デバッグ機能が動作し続けるようにフォールバックする
- **呼び出しタイミング**: `App.tsx` マウント時に `createSessionDatabase()` を非同期で開始する（DevTools 接続中の書き込みに間に合わせるため）。`@duckdb/duckdb-wasm` 本体は動的 import + `manualChunks` で独立 chunk とし、初期 HTML / 初期 JS のパースをブロックしない
- **初期化完了前の接続**: 未初期化中の永続化 API は no-op とする。ページロード直後の接続が永続化されないレースは第 1 段階では受容する。Connect ボタン無効化や connect 側 await は行わない

### WebRTC stats の保存方針

- 主要な集計・検索フィールドを正規化カラムに展開し、残りを `raw_json` カラムに退避する（詳細は #0068）

### `isCurrent()` 前に置いてよい副作用（横断制約）

- **置いてよい**: 当該接続ローカルな永続化（`sessions` / `connections` の `ended_at`、当該 `session_db_id` の stats flush）
- **置いてはならない**: モジュールグローバルな副作用。特に `stopStatsReportTimer()` は現行どおり `isCurrent()` **後**に置く（旧接続の disconnect で新接続の stats タイマーを止めてはならない）。#0068 はこの制約に従うこと

### パフォーマンス・容量方針

- `sessions` / `connections` テーブルは件数制限を設けず、全履歴を保持する
- `webrtc_stats` の接続単位の容量上限・サンプリングは #0068 で実装する
- セッション横断の保持期間・ローテーションは将来別 issue で検討する（無制限 × 長期利用で OPFS quota を圧迫しうる）
- `/sessions` ページでの stats 表示は全件テーブル表示ではなく、集計・ページネーション・時系列サンプリングを組み合わせる

### セキュリティ・プライバシー方針

- credentials や API キーなどの高機密情報は永続化対象から除外する。`metadata` に含まれる場合は保存前にマスクする。マスク処理の詳細は #0067 に委譲する
- `local-candidate` / `remote-candidate` 等に含まれる IP アドレス・ポートは接続記録として保存する
- UI 上の明示（担当は #0070）:
  - 「データは端末内の OPFS に保存され、外部サーバーには送信されない」
  - 「接続記録に端末情報（IP アドレス等）が含まれる」
  - 「複数タブで同時に開くとデータ破損のリスクがある」（複数タブ警告の表示タイミング詳細は #0067 と分担可）
- 第 1 段階の必須機能に「全履歴削除」「DB エクスポート」は含めない。必要になったら別 issue とする

### 永続化エラーの UI 通知方針

- DevTools 利用中の永続化失敗（書き込み・flush・quota 等）は既存の `alertMessages` 経路（`setSoraErrorAlertMessage` 等）でユーザーに通知する。基盤は #0067、stats 失敗は #0068 がそれに乗る
- `/sessions` ページ内の読み取り失敗は #0070 がページ内エラー表示で扱う
- 一過性エラーと恒久エラー（OPFS quota 超過等）の出し分け詳細は #0067 / #0068 で実装する

### 読み取り API の責務境界

スキーマ所有者は #0067（`sessions` / `connections`）と #0068（`webrtc_stats`）。`/sessions` が必要とする API の最小面は親で次を固定し、実装は #0067（current）と #0070（一覧・集計）が `sessionDatabase.ts` に追加する。

- `getCurrentSessionDbId()`: 進行中の接続試行 ID（#0067）
- `listSessions(filter)`: 一覧（session 行単位）。`connectionId` フィルタは `connections` への EXISTS / JOIN で session 行を絞り込む（#0070）
- `getSession(sessionDbId)`: 詳細（session + 紐づく connections）
- `queryStatsAggregates(sessionDbId, ...)`: 集計値
- `queryStatsTimeseries(sessionDbId, ...)`: 時系列サンプリング
- `queryStatsPage(sessionDbId, ...)`: ページネーション付き生データ

### UI/UX 方針

- Header に `Sessions` ボタンを配置し `/sessions` へ遷移する（#0066）
- `/sessions` のルーティング基盤は #0066（仮ページ）。実際の UI は #0070
- **一覧の粒度**: `sessions` 行を 1 行とする。表示カラムは channelId / Sora session_id / started_at / ended_at / 状態（上記 3 状態）。`connectionId` は一覧の必須カラムにしない（詳細の `connections` 一覧で示す）
- **詳細**: connection メタデータ、webrtc stats の集計・時系列・必要ならページネーション付き生データ
- クエリストリング絞り込み: `sessionId` / `connectionId` / `channelId` / `from` / `to`（`from` / `to` は `sessions.started_at` を対象とする）
- **時系列グラフの描画**: 第 1 段階では新規チャートライブラリを追加しない。SVG または Canvas の自前描画、もしくは集計テーブル + 簡易スパークラインで足りる範囲に留める。依存追加が必要になった場合は別 issue とする（`manualChunks` / 初期 bundle 方針との衝突を避けるため）

### 後方互換

- `CODEBASE.md` に従い製品の後方互換は考慮しない
- `/devtools/` を DevTools に落とす対応（#0066）は既存 E2E・ブックマーク便宜であり、BC 保証ではない
- #0069 の DownloadReport 削除は破壊的変更として、実施時に受容する（本エピック完了の必須条件ではない）

### 横断的設計事項

#### `beforeunload` での実行順序とリスナー配置

- #0066 で `setInitialParameter()` / `setMediaDevices()` / `unregisterServiceWorker()` と `beforeunload`（`void disconnectSora()`）を `App.tsx` に移す。`DevTools.tsx` の cleanup から `disconnectSora()` を削除する
- #0067 は同じ `beforeunload` ハンドラに `void sessionDatabase.close()` を追加する（コード上は `disconnectSora()` の後）。`beforeunload` 内の非同期完了は保証できないため、`pagehide` は第 1 段階では採用せず、未完了の `ended_at` は「切断不確定」として扱う
- **`close()` の安全性（親で固定）**: in-flight の書き込みと `close()` が競合して DB を破損させてはならない。#0067 では次のいずれか**一方**を選ぶ。(1) 書き込み中は `close()` が完了を待つ、(2) `beforeunload` では同期キャプチャ＋ fire-and-forget 書き込みのみ行い `close()` は呼ばない。単一タブの通常クローズ後に DB が開けなくなる状態は許容しない

#### E2E の `/devtools/` URL

- 既存 E2E は `http://localhost:3333/devtools/` に遷移する
- #0066 で `Router` の `default` フォールバックにより `/devtools/` を DevTools にルーティングする（完了条件として #0066 が固定済み）。既存 E2E の URL は変更しない

#### #0066 と #0069 の関係

- #0066 は Header に `SessionsButton` を追加する（`DownloadReportButton` と併存してよい）。#0069 は `DownloadReportButton` を削除する
- 推奨順序: `#0066 → #0067 → #0068 → #0070` の後に #0069。#0069 を先に実施すると、Sessions UI も DownloadReport も無い空白期間が生まれる

#### E2E 基盤への依存

- #0067 / #0068 / #0070 の Sora 接続が必要な E2E は #0063 の `requireSoraConnectionEnv()` を前提とする
- #0063 は #0037（Page Object Model）に依存する
- フォールバック（`process.env` 直接読み取りの二重実装）は行わない。#0037 → #0063 をハード依存とする

#### 推奨マージ順

```text
ハード依存:
  #0037 → #0063（E2E 基盤）
  #0066 → #0067 → #0068 → #0070

ソフト依存 / 関連:
  #0058（manualChunks の includes 誤マッチ修正。未完了なら #0066 で preact-iso を preact より先にマッチさせる）
  #0062（三項演算子禁止。マージ済みなら新規コードで三項演算子を使わない）
  #0069（DownloadReport 削除。#0070 完了後を推奨。本エピック完了条件外）
```

#### 完了条件「再接続・同一 channelId の複数接続の区別」の検証オーナー

検証シナリオは次を対象とする（Connect 中の載せ替え成功系は現行 `connectionStatus` 判定の制約があり、本エピックの必須検証には含めない）。

- 切断 → 再接続（または別接続試行）→ 同一 channelId で複数の `sessions` / `connections` が残る
- #0067: DB 上で区別されて保存されることを検証する
- #0070: `/sessions` 一覧・詳細上で区別して表示できることを E2E で検証する（最低 1 本）

#### 既存 E2E への永続化副作用

- connect / disconnect する既存 E2E（`tests/sendrecv.test.ts` 等）も OPFS にレコードを残しうる
- #0067 で導入する OPFS クリーンアップヘルパーを、新規永続化テストだけでなく必要に応じて既存 E2E の teardown からも使えるようにする（詳細は #0067）

#### 子 issue への同期要求

本エピックで固定したモデルに、次の子 issue 本文が未追従のまま残っている。実装着手前に各子を polish し、親決定へ合わせること。

- #0067: INSERT を検知ポイント 1 後に変更。ポイント 1 の `ended_at` 更新を削除。`ended_at` を `isCurrent() && !reconnecting` 分岐に合わせる。`getCurrentSessionDbId`（UI と `disconnectSora` 明示パス兼用）と `connection.created` 時の sessions UPDATE を追加。`connections.ended_at` はクロージャの `connectionId` を使う。`beforeunload` の `close()` 安全性を実装。E2E の `process.env` フォールバック検討を削除
- #0068: `stopStatsReportTimer()` を `isCurrent()` **後**に戻す（flush のみ前可）。E2E フォールバック検討を削除
- #0070: 一覧から `connectionId` 必須を外す。3 状態を親定義に合わせる。プライバシー文言（端末情報）・再接続 E2E・チャート新規依存禁止・読み取り API 名・`from`/`to` は `started_at` を追記

## 完了条件

- #0066 / #0067 / #0068 / #0070 の各子 issue が完了していること（#0069 は完了条件に含めない）
- `/sessions` ページで過去セッションの一覧（session 行単位）が表示でき、各セッションの詳細で stats の集計・時系列を確認できること
- ブラウザを閉じて再度開いても、過去のセッション記録が読み出せること（対応ブラウザは Chromium 系を必須とし、未対応時は永続化 no-op で既存機能が動作すること）
- 再接続時や同じ channelId での複数接続が正しく区別されて保存・表示されること（検証オーナーは上記）
- DuckDB-Wasm 初期化失敗・OPFS アクセス不可時でも、既存の接続・デバッグ機能が動作し続けること
- `metadata` 内の機密情報がマスクされて保存されること
- `/sessions` にプライバシー文言（端末内保存・端末情報を含む旨）が表示されること
- 子 issue の各 `vp build` / `vp test run` / `vp check` が成功すること（エピック自身はコード変更を伴わないため、エピック単独での実行は不要）
- 子 issue（#0066 / #0067 / #0068 / #0070）の `CHANGES.md` エントリで本エピックの変更履歴を代弁する（エピック独自のエントリは不要）。#0069 を実施する場合は #0069 自身のエントリとする

## 解決方法

1. #0066: `preact-iso` によるルーティング基盤と `App.tsx` への初期化 / `beforeunload` 移行、`SessionsButton`、`/sessions` 仮ページ
2. #0067: DuckDB-Wasm + OPFS 初期化、`sessions` / `connections` 書き込み、マスク、永続化フック（本エピックの INSERT / `ended_at` モデルに従う）
3. #0068: `webrtc_stats` 正規化・バッチ永続化（`isCurrent()` 前制約を守る）
4. #0070: `/sessions` 一覧・詳細・フィルタ UI と読み取り API
5. （関連・任意）#0069: #0070 完了後に DownloadReport 関連を削除

## テスト方針

- Vitest 単体テスト: ブラウザ API に依存しない純粋関数（`RTCStats` 正規化、`maskSensitiveMetadata()` 等）。PBT を使う場合のファイル名は `*.prop.ts`（CODEBASE.md）
- Playwright E2E: DuckDB-Wasm + OPFS の初期化、`sessions` / `connections` 作成、切断時の `ended_at`、stats の保存と読み出し、`/sessions` UI。詳細とクリーンアップヘルパーは各子 issue（主に #0067 / #0070）
- Sora 接続が必要な E2E は #0037 → #0063 を前提とし、未設定時は `requireSoraConnectionEnv()` が Error を throw して即座に fail する

## リスクと対策

| リスク                                                                                             | 対策                                                                                                       |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 複数タブから同時に OPFS の DB ファイルに書き込む                                                   | 複数タブ同時書き込みはサポート外。UI で警告する（#0067 / #0070）                                           |
| Safari 等で DuckDB-Wasm + OPFS が使えない                                                          | 初期化失敗時は永続化 no-op。Chromium 系を必須対象とし、E2E も chromium で検証する                          |
| `webrtc_stats` とセッション履歴の累積で OPFS quota を圧迫する                                      | 接続単位の上限は #0068。横断ローテーションは将来 issue                                                     |
| DuckDB-Wasm の bundle サイズで初期表示が遅延する                                                   | #0067 で動的 import + 独立 chunk とし、初期 DevTools 表示をブロックしない                                  |
| 失敗リトライ接続の遅延 / なお current な `disconnect` が成功または継続中の `sessions` を終了させる | `sessions.ended_at` は `isCurrent() && !reconnecting` のときだけ disconnect フックで更新する（上記ルール） |
| 子 issue 本文が親決定に未追従のまま実装される                                                      | 「子 issue への同期要求」に従い #0067 / #0068 / #0070 を先に polish する                                   |

## 関連 issue

- #0066: preact-iso を導入して `/sessions` ページへのルーティング基盤を追加する
- #0067: DuckDB-Wasm + OPFS でセッション・接続メタデータを永続化する
- #0068: WebRTC stats を DuckDB-Wasm + OPFS に永続化する
- #0070: /sessions ページに過去セッション一覧・詳細・フィルタ UI を実装する
- #0069: DownloadReportButton と DownloadReport 関連機能を削除する（関連。本エピック完了条件外。#0070 後推奨）
- #0037: e2e テストに Page Object Model を導入する（#0063 の前提）
- #0063: Sora 接続が必要な E2E テストで環境変数未設定時に即座に失敗させる（#0067 / #0068 / #0070 の E2E が依存）
- #0058: `vite.config.ts` の `manualChunks` で `moduleId.includes()` の誤マッチを防ぐ（#0066 の `preact-iso` 追加と関連）
- #0062: 三項演算子を全面禁止する（マージ済みなら新規コードで遵守）
- #0038 / #0019: #0069 実施時に DownloadReport 言及を除去する必要あり
