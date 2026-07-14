# DuckDB-Wasm に timeline / notify / signaling / log / push を永続化し /sessions 詳細で確認できるようにする

- Priority: Medium
- Created: 2026-07-14
- Completed: YYYY-MM-DD
- Model: Cursor Grok 4.5
- Branch: feature/add-session-debug-message-persistence
- Polished: 2026-07-14

## 目的

#0065 第 1 段階でセッション・接続メタデータと WebRTC stats は DuckDB-Wasm + OPFS に永続化され `/sessions` で確認できる。一方、接続調査で重要な timeline / notify / signaling / log / push はメモリ上の signal のみで、ブラウザを閉じると失われる。これらを同じ DB に永続化し、`/sessions` 詳細から過去セッションのデバッグメッセージを振り返れるようにする（#0065 が第 2 段階として「別 issue で検討」とした対象本体）。

## 優先度根拠

Medium。接続失敗や signaling 異常の調査には notify / signaling / timeline が不可欠であり、stats だけの履歴では再現・切り分けが弱い。ただし接続機能そのものを阻害しない範囲で、第 1 段階の基盤（#0067 / #0068 / #0070 / #0073）の上に段階的に載せる。

## 現状

- #0065 の第 1 段階子 issue（#0066 / #0067 / #0068 / #0070）と follow-up（#0072 / #0073）は完了済み。`src/sessionDatabase.ts` に `sessions` / `connections` / `webrtc_stats`、書き込み・読み取り API、`deleteSession` / `resetSessionDatabase` がある
- timeline / notify / signaling / log / push は主に `src/app/actions.ts` の `setSoraCallbacks()` 内で SDK イベントを受け取り、`signals.setTimelineMessage` / `setNotifyMessages` / `setSignalingMessage` / `setLogMessages` / `setPushMessages` へ append-only で積む。timeline / log は `connectSora()` / `createMediaStream()` などコールバック外からも追加される
- 型は `src/types.ts` の `TimelineMessage` / `NotifyMessage` / `SignalingMessage` / `LogMessage` / `PushMessage`（いずれも `timestamp` を持つ）。`DataChannelMessage` は `ArrayBuffer` を含み別扱い
- `setLogMessages` だけ引数が `LogMessage["message"]`（`title` / `description`）で、`timestamp` は `signals.ts` 内で `Date.now()` 付与。他種別は `actions.ts` 側で timestamp 付きオブジェクトを渡す
- `LogMessage.message.description` は SDK `log` コールバックおよび media 系で既に `JSON.stringify` 済みの **string** である（`maskSensitiveMetadata` は非オブジェクトをそのまま返すため、stringify 後に掛けるとマスクが効かない）
- メモリ上の notify のみ `maxNotifyMessages`（デフォルト 1000）で上限切り詰めがある。他種別は無制限に signal へ積む
- `/sessions` 詳細（`src/components/Sessions/SessionDetail.tsx`）はメタデータ・connections・stats 集計 / 時系列 / 生データのみ。メッセージ履歴 UI は無い
- 書き込み経路は `src/sessionDatabaseLoader.ts` 経由（`__SESSIONS_ENABLED__` 無効時は no-op）。読み取り UI は Sessions lazy chunk から `sessionDatabase` を直接 import する。`enqueueWrite` は `sessionDatabase.ts` の非 export
- `deleteSession(sessionDbId)` は `webrtc_stats` → `connections` → `sessions` の順で削除する（#0073）
- 既存 OPFS DB は `CREATE TABLE IF NOT EXISTS` で拡張する方針（#0068 と同様。マイグレーション機構は無し）
- `connectSora` / `reconnectSoraImpl` は `start-connection` / `start-reconnect` の timeline を **`insertSession` より前**に書く。`getCurrentSessionDbId()` は `insertSession` 成功時にセットされ、`updateSessionEndedAt` 成功時に clear される

## 設計方針

### スコープ

対象（必須）:

- `timeline_messages` / `notify_messages` / `signaling_messages` / `log_messages` / `push_messages` のスキーマ・書き込み・読み取り
- `/sessions` 詳細での種別ごとの閲覧 UI（ページネーション付き）

対象外:

- `data_channel_messages`（`ArrayBuffer` の扱い・容量が大きく、別 issue とする）
- DownloadReport 削除（#0069）、`/sessions` の Header 出し分け（#0071）
- #0065 第 1 段階完了条件への遡及変更、および #0065 を closed にする判断（エピック closed は別判断）

### 用語

| 用語                            | 意味                                                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `session_db_id` / `sessions.id` | DuckDB の接続試行単位の内部 ID（INTEGER）                                                                            |
| 接続試行                        | `connectSora()` / `reconnectSoraImpl()` の 1 呼び出し。`attemptReconnection()` の最大 10 回リトライを含む            |
| 永続化対象期間                  | 当該接続試行の `insertSession` 成功後から、切断シーケンス内の残メッセージ（cleanup timeline / log 含む）書き込みまで |

### テーブル定義（第 1 カットで固定）

共通方針:

- `session_db_id` に INDEX を付ける
- 参照は論理参照のみ（FOREIGN KEY は張らない）
- `CREATE SEQUENCE IF NOT EXISTS` + `CREATE TABLE IF NOT EXISTS` で既存 OPFS DB に追加する
- `timestamp_ms` は `webrtc_stats` に合わせて **DOUBLE**（`Date.now()` / メッセージ側 `timestamp`）
- `payload_json` の中身は種別表の定義に従う（timeline / notify / signaling / push はマスク後のメッセージ全体。log はマスク後の `{ title, description }`）。正規化カラムに出したキーも payload に残してよい（第 1 カットは重複許容）
- `connection_id` は判明していれば Sora connection_id。未確定時は NULL。確定後に過去行を UPDATE しない（#0068 stats と同方針）

#### `timeline_messages`

| カラム        | 型                                                             | 説明                                                                             |
| ------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| id            | BIGINT PRIMARY KEY DEFAULT nextval('seq_timeline_messages_id') | 自動採番                                                                         |
| session_db_id | INTEGER                                                        | `sessions.id`                                                                    |
| connection_id | VARCHAR                                                        | 未確定時 NULL                                                                    |
| timestamp_ms  | DOUBLE                                                         | `TimelineMessage.timestamp`                                                      |
| type          | VARCHAR                                                        | `TimelineMessage.type`                                                           |
| log_type      | VARCHAR                                                        | `TimelineMessage.logType`                                                        |
| payload_json  | JSON                                                           | マスク後のメッセージ全体（`data` / `dataChannelId` / `dataChannelLabel` を含む） |
| created_at    | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                            | INSERT 時刻                                                                      |

INDEX: `idx_timeline_messages_session_db_id` on `(session_db_id)`

#### `notify_messages`

| カラム         | 型                                                           | 説明                                                             |
| -------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| id             | BIGINT PRIMARY KEY DEFAULT nextval('seq_notify_messages_id') | 自動採番                                                         |
| session_db_id  | INTEGER                                                      | `sessions.id`                                                    |
| connection_id  | VARCHAR                                                      | 未確定時 NULL                                                    |
| timestamp_ms   | DOUBLE                                                       | `NotifyMessage.timestamp`                                        |
| event_type     | VARCHAR                                                      | `NotifyMessage.message.event_type`（実行時に無ければ NULL）      |
| transport_type | VARCHAR                                                      | `NotifyMessage.transportType`（`"websocket"` / `"datachannel"`） |
| payload_json   | JSON                                                         | マスク後のメッセージ全体                                         |
| created_at     | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                          | INSERT 時刻                                                      |

INDEX: `idx_notify_messages_session_db_id` on `(session_db_id)`

#### `signaling_messages`

| カラム         | 型                                                              | 説明                             |
| -------------- | --------------------------------------------------------------- | -------------------------------- |
| id             | BIGINT PRIMARY KEY DEFAULT nextval('seq_signaling_messages_id') | 自動採番                         |
| session_db_id  | INTEGER                                                         | `sessions.id`                    |
| connection_id  | VARCHAR                                                         | 未確定時 NULL                    |
| timestamp_ms   | DOUBLE                                                          | `SignalingMessage.timestamp`     |
| type           | VARCHAR                                                         | `SignalingMessage.type`          |
| transport_type | VARCHAR                                                         | `SignalingMessage.transportType` |
| payload_json   | JSON                                                            | マスク後のメッセージ全体         |
| created_at     | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                             | INSERT 時刻                      |

INDEX: `idx_signaling_messages_session_db_id` on `(session_db_id)`

#### `log_messages`

| カラム        | 型                                                        | 説明                                                                    |
| ------------- | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| id            | BIGINT PRIMARY KEY DEFAULT nextval('seq_log_messages_id') | 自動採番                                                                |
| session_db_id | INTEGER                                                   | `sessions.id`                                                           |
| connection_id | VARCHAR                                                   | 未確定時 NULL                                                           |
| timestamp_ms  | DOUBLE                                                    | `LogMessage.timestamp`                                                  |
| title         | VARCHAR                                                   | `LogMessage.message.title`                                              |
| payload_json  | JSON                                                      | マスク後の `{ title, description }`（`description` はマスク済み文字列） |
| created_at    | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                       | INSERT 時刻                                                             |

INDEX: `idx_log_messages_session_db_id` on `(session_db_id)`

#### `push_messages`

| カラム         | 型                                                         | 説明                        |
| -------------- | ---------------------------------------------------------- | --------------------------- |
| id             | BIGINT PRIMARY KEY DEFAULT nextval('seq_push_messages_id') | 自動採番                    |
| session_db_id  | INTEGER                                                    | `sessions.id`               |
| connection_id  | VARCHAR                                                    | 未確定時 NULL               |
| timestamp_ms   | DOUBLE                                                     | `PushMessage.timestamp`     |
| transport_type | VARCHAR                                                    | `PushMessage.transportType` |
| payload_json   | JSON                                                       | マスク後のメッセージ全体    |
| created_at     | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                        | INSERT 時刻                 |

INDEX: `idx_push_messages_session_db_id` on `(session_db_id)`

### 書き込み API と loader（必須）

`src/sessionDatabase.ts` に次を追加し、いずれも内部で `enqueueWrite` 経由の 1 行 INSERT とする（stats のようなバッファは第 1 カットでは作らない。イベント頻度は stats より低い前提。キュー競合は受容し、問題が出たら別 issue）。

| API                      | シグネチャ                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| `insertTimelineMessage`  | `(sessionDbId: number, connectionId: string \| null, message: TimelineMessage) => Promise<void>`  |
| `insertNotifyMessage`    | `(sessionDbId: number, connectionId: string \| null, message: NotifyMessage) => Promise<void>`    |
| `insertSignalingMessage` | `(sessionDbId: number, connectionId: string \| null, message: SignalingMessage) => Promise<void>` |
| `insertLogMessage`       | `(sessionDbId: number, connectionId: string \| null, message: LogMessage) => Promise<void>`       |
| `insertPushMessage`      | `(sessionDbId: number, connectionId: string \| null, message: PushMessage) => Promise<void>`      |

- マスク・正規化カラム抽出・容量刈り込みは **API 内**で行う（呼び出し側は完成メッセージを渡すだけ）
- DuckDB 未初期化・`resetInProgress`・INSERT 失敗時は接続を止めず、`notifyPersistenceError`（英語・末尾ピリオドなし）で通知する
- JSON 化できない値は該当フィールドを落としてでも INSERT を試み、恒久失敗時のみ通知して捨てる
- **メッセージ INSERT / 容量 DELETE では `runCheckpointUnlocked` を呼ばない**（毎回 CHECKPOINT すると切断時の `ended_at` / stats flush とキュー競合する）。CHECKPOINT は既存の sessions/connections 更新・`deleteSession`・定期タイマーに任せる

`src/sessionDatabaseLoader.ts` に上記 5 API を **必須で** 追加する。戻りは `Promise<void>`（`insertConnection` 等と同型の非同期 no-op ラッパー）。`enqueueStats` のような同期 API にはしない。

- `__SESSIONS_ENABLED__` 無効時・動的 import 失敗時・モジュール未ロード時は no-op（resolved Promise）
- `actions.ts` は loader のみ import する（`sessionDatabase` 直 import 禁止）
- 呼び出しは `void insertX(...).catch(...)`（または同等）。メインスレッドで `await` して UI を止めない

### 書き込みフック（`actions.ts`）

- 永続化フックは `src/app/actions.ts` に置く。`signals.ts` の append 経路には置かない
- `actions.ts` 内に薄いヘルパー（例: `persistTimelineMessage(sessionDbId, connectionId, message)`）を置き、signal 更新と loader 呼び出しを対で行う。呼び出し点漏れを防ぐため、新規に timeline / log 等を増やす箇所でも同ヘルパー経由とする

#### log の timestamp（固定）

`setLogMessages` は timestamp を内部付与するため、永続化時は次を守る。

1. `actions.ts` で `const timestamp = Date.now()` を同期取得する
2. `const logMessage: LogMessage = { timestamp, message: { title, description } }` を組み立てる
3. signal へは従来どおり `setLogMessages({ title, description })`（内部で別の `Date.now()` になりうるが、DB の `timestamp_ms` は手順 1 の値を使う）
4. `void insertLogMessage(sessionDbId, connectionId, logMessage).catch(...)`

他種別は現行どおり actions 側で timestamp 付きオブジェクトを組み立て、同一オブジェクトを signal と INSERT に渡す。

#### 切断シーケンスへの `sessionDbId` 受け渡し（固定）

現状 `cleanupSoraMediaState` / `stopLocalVideoTrack` / `stopLocalAudioTrack` は `sessionDbId` を受け取らず、内部で timeline / log を書く。`updateSessionEndedAt` 成功後は `getCurrentSessionDbId()` が null になる。加えて abend 再接続では `void reconnectSora()` が `await cleanupSoraMediaState()` より先に並走する（`actions.ts` 既存）。

そのため次を **必須**とする。

1. モジュールローカルの `disconnectPersistence: { sessionDbId: number; connectionId: string | null } | null` を置く
2. セットタイミング（いずれも `persistSessionEndedAt` より前）: `disconnect` コールバック、`disconnectSora`、reconnect 失敗パス、`connectSora` の失敗 / abort で ended_at を書く経路。クリアは当該経路の `cleanupSoraMediaState`（または同等 cleanup）完了後の finally
3. persist ヘルパーは **`sessionDbId: number | null` を必須引数**とし、null なら no-op する。`disconnectPersistence` への暗黙フォールバックは **禁止**
4. `stopLocalVideoTrack` / `stopLocalAudioTrack`（および必要なら `cleanupSoraMediaState`）は `sessionDbId` / `connectionId` を **引数で受け取り**、内部の timeline / log 永続化にその引数を明示渡しする。呼び出し元の供給ルール:
   - 切断系（上記 2）: `disconnectPersistence` の値（セット済み前提）
   - 接続中（`updateMediaStreamImpl` / `setMicDeviceAction` / `setCameraDeviceAction` 等）: `getCurrentSessionDbId()` と `getCurrentConnectionId()`
   - `setSoraCallbacks` 経由: `persistence.sessionDbId` 等
5. 接続中の `createMediaStream` 内 timeline / log も、呼び出し元から渡した `sessionDbId`（無ければ `getCurrentSessionDbId()`）を明示渡しする

これにより abend 並走時も、旧切断の cleanup は旧 `session_db_id`、新 reconnect / 接続中 media 更新は新または current の `session_db_id` に分離される。

`setSoraCallbacks` 内の `disconnected` timeline はクロージャの `persistence.sessionDbId` でよい。

`handleTrackEvent` は `setSoraCallbacks` の `track` ハンドラ（`isCurrent()` 通過後）からのみ呼ばれる。永続化はハンドラ側で `persistence.sessionDbId` を明示して行うか、`handleTrackEvent` に `sessionDbId` / `connectionId` を引数追加する（どちらか一方でよいが、`getCurrentSessionDbId()` は使わない）。

#### `session_db_id` の決定（固定）

| 経路                                                                | 使う ID                                | 備考                   |
| ------------------------------------------------------------------- | -------------------------------------- | ---------------------- |
| `setSoraCallbacks` 内（`isCurrent()` 後。`handleTrackEvent` 含む）  | `persistence.sessionDbId` を明示渡し   | null なら no-op        |
| `disconnect` / `removetrack` の timeline（`isCurrent()` **前**）    | `persistence.sessionDbId`              | 旧接続のクロージャ     |
| `connectSora` / `reconnectSoraImpl` 内で `insertSession` **成功後** | ローカル `persistence.sessionDbId`     | クロージャ優先         |
| 切断系の `stopLocal*` / `cleanupSoraMediaState`                     | 引数（元は `disconnectPersistence`）   | 暗黙フォールバック禁止 |
| 接続中の `stopLocal*` / `updateMediaStream` / `createMediaStream`   | 引数（元は `getCurrentSessionDbId()`） | null なら no-op        |

#### 意図的に永続化しないもの（完了条件外）

- `insertSession` 成功前のメッセージ（`start-connection` / `start-reconnect`、INSERT 前の `event-connect-cancelled` 等）。再 Connect 時に旧 id が残っていても、INSERT 前に `getCurrentSessionDbId()` で書かない
- 接続試行外の media プレビュー経路（`requestMedia` / デバイス変更からの `createMediaStream` 等で `getCurrentSessionDbId() === null`）
- 旧接続の SDK `timeline` / `notify` / `signaling` / `log` / `push`（現行どおり `isCurrent()` 後のみ signal に載るため、永続化対象にもしない）
- `setAlertMessagesAndLogMessages` 経由で `logMessages` に直接積む行（`setSoraInfoAlertMessage` / `setSoraErrorAlertMessage` / `setAPI*` / `setRPC*` 等。`setLogMessages` を通らない）。永続化 hooks は `actions.ts` のみとし、alert 由来 log は Debug の log タブと完全一致させない（第 1 カットで受容）

#### `connection_id` の決定（固定）

- コールバック内: `connectionIdFromPersistence(persistence) ?? getCurrentConnectionId()`（いずれも無ければ null）
- コールバック外: `getCurrentConnectionId()`（無ければ null）
- `signals.connectionId` / `soraConnection.connectionId` を遅延 disconnect 経路で読まない（#0067 / #0068 と同禁止）

### 機密情報

マスクは **INSERT API 内**で既存の `maskSensitiveMetadata` を適用する。既存 `SENSITIVE_KEY_NORMALIZED` のみを使い、セット拡張は本 issue の完了条件外（独自キー名の平文残りは第 1 カットで受容）。

| 種別      | マスク入力                                                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| timeline  | メッセージ全体。`data` が文字列（SDP 等）の場合はそのフィールドは identity                                                                        |
| notify    | `{ timestamp, message, transportType }` 全体                                                                                                      |
| signaling | `{ timestamp, type, transportType, data }` 全体                                                                                                   |
| push      | `{ timestamp, message, transportType }` 全体                                                                                                      |
| log       | `description` が string のとき: JSON.parse を試み、成功したらオブジェクトをマスクして再 stringify。parse 失敗時はそのまま。`title` はマスク対象外 |

純粋関数として export する（Vitest 用）:

- `maskLogDescription(description: string): string` — parse → mask → stringify（または parse 失敗時 identity）
- `buildMaskedMessagePayload(kind, message): Json` — 種別ごとの payload 組み立て（実装名は可）

### 容量上限（第 1 カットで固定）

- 単位: `session_db_id` × メッセージ種別ごと（`attemptReconnection` の最大 10 試行も同一 `session_db_id` で件数を共有する。第 1 カットで受容）
- 初期上限: **各種別 1000 件**（メモリ上の `maxNotifyMessages` デフォルトと同値。揃える必然は無いが出発点とする）
- 発火: 当該種別の INSERT 成功直後に、その `session_db_id` の件数を数え、1000 超なら実行する
- 方式: `timestamp_ms` 昇順（同値は `id` 昇順）で古い行から超過分を DELETE し、**最新側を残す**
- SDK timeline の本体 + `${type}-sdp` 二重行も 2 件として数える（第 1 カットで受容）
- Vitest では超過時 DELETE の件数契約を検証する（上限値変更・バイト上限・横断ローテーションは未解決課題）

容量判定の純粋関数（Vitest 用）:

- `selectMessageIdsToDelete(sortedIdsOldestFirst: number[], totalCount: number, limit: number): number[]` — 超過分の id 列（実装名は可）

### 削除との整合

`deleteSession` の DELETE 順（固定）:

1. `timeline_messages` / `notify_messages` / `signaling_messages` / `log_messages` / `push_messages`（順不同でよいがすべて `session_db_id` で DELETE）
2. `webrtc_stats`
3. `connections`
4. `sessions`
5. `runCheckpointUnlocked`（既存どおり）

`resetSessionDatabase` は OPFS 再作成のため追加対応不要（スキーマは reopen 時に IF NOT EXISTS で作られる）。

### 読み取り API

`sessionDatabase.ts` に種別ごとのページネーション付き読み取りを追加する。命名・契約は `queryStatsPage` / `StatsPageRow` に揃える。

| API                                                 | 備考 |
| --------------------------------------------------- | ---- |
| `queryTimelineMessagesPage(sessionDbId, options?)`  |      |
| `queryNotifyMessagesPage(sessionDbId, options?)`    |      |
| `querySignalingMessagesPage(sessionDbId, options?)` |      |
| `queryLogMessagesPage(sessionDbId, options?)`       |      |
| `queryPushMessagesPage(sessionDbId, options?)`      |      |

共通契約:

- `options.limit` デフォルト 50、整数 **1..200** 以外は throw
- `options.offset` デフォルト 0、非負整数以外は throw
- 戻り: `{ rows, totalCount }`
- 並び: **`ORDER BY timestamp_ms DESC, id DESC`**（`queryStatsPage` の ASC とは意図的に異なる。デバッグ閲覧は新しい順）
- DuckDB 未初期化時は `{ rows: [], totalCount: 0 }`
- Sessions UI は既存どおり `sessionDatabase` 直接 import

行型（export。`StatsPageRow` と同パターン）:

```ts
interface TimelineMessagePageRow {
  id: number;
  session_db_id: number;
  connection_id: string | null;
  timestamp_ms: number;
  type: string | null;
  log_type: string | null;
  payload_json: Json; // mapper で常に Json に正規化（string なら JSON.parse、失敗時は文字列を Json として扱える形に落とす）
}
```

notify / signaling / log / push も同様に、正規化カラム + `payload_json: Json` + `id` / `session_db_id` / `connection_id` / `timestamp_ms` を持つ行型を export する。`created_at` は UI 必須でないため行型に含めなくてよい。

### UI（`SessionDetail`）

- `SessionDetail` に種別タブ（timeline / notify / signaling / log / push）を追加する。DebugPane コンポーネントは再利用しない（DB 読み取り専用の子コンポーネントを新設）
- 一覧列: 時刻（`timestamp_ms`）・正規化カラム（timeline: `type` + `log_type`、notify: `event_type` + `transport_type`、signaling: `type` + `transport_type`、push: `transport_type` のみ、log: `title`）・`connection_id`・`payload_json` の折りたたみ表示（timeline の DC id/label は payload 内）
- log の `description` 表示時に DebugPane 同様 `parseLogDescription` 相当で見やすくしてよい（必須ではない）
- 全文検索・コピー・自動ライブ更新は必須にしない（手動再読込またはタブ切替・ページ送りで足りる）
- 空状態・読み取り失敗は詳細エリア内に表示する（`alertMessages` に載せない。#0070 と同方針）
- 新規 UI では三項演算子を使わない（#0062 が open のまま。Sessions 系の慣習に合わせる）
- E2E 用 `data-testid` 最低セット: `session-messages-tab-timeline` / `session-messages-tab-notify` / `session-messages-tab-signaling` / `session-messages-tab-log` / `session-messages-tab-push` / `session-messages-list` / `session-messages-page-prev` / `session-messages-page-next`

### テスト（`CODEBASE.md` に従いテストを先に書く）

- 上記純粋関数は Vitest。ブラウザ API 非依存なら `*.prop.ts` も可。モック・スタブは使わない
- Playwright E2E（`requireSoraConnectionEnv()` ハード依存、`serial` + `cleanupSessionDatabase`、timeout は最大 10 秒）。追加先は `tests/session-database.test.ts` への describe 追加、または `tests/session-debug-messages.test.ts` 新規（どちらか一方でよい）:
  - 接続〜切断後、少なくとも **timeline と signaling** が当該 `session_db_id` で `COUNT(*) >= 1`
  - 可能なら notify も断言する（環境で出ない場合は必須にしない旨をテストコメントに書く）
  - リロード後も `/sessions` 詳細のメッセージ UI から読めること
  - `deleteSession` 後に 5 メッセージテーブルいずれも 0 件であること
- 既存 `tests/session-database.test.ts` の `deleteSession` ケースを 5 テーブル分に拡張する
- `tests/helpers/sessionDatabase.ts` に次を追加する:

```ts
type MessageTableName =
  | "timeline_messages"
  | "notify_messages"
  | "signaling_messages"
  | "log_messages"
  | "push_messages";

countMessageRows(page: Page, table: MessageTableName, sessionDbId: number): Promise<number>
waitForMessageRows(page: Page, table: MessageTableName, sessionDbId: number, minCount: number): Promise<void>
```

- マスクは Vitest fixture で「stringify 済み log.description 内の token がマスクされる」「notify/signaling の機密キーがマスクされる」を検証する

### 未解決課題（完了条件外）

- 種別上限 1000 の調整、バイト上限、横断ローテーション
- メッセージ書き込みのバッファ／バッチ化
- 機密キーセットの拡張
- DownloadReport 相当の JSON エクスポート復元（本 issue は DB 閲覧のみ。#0069 の Soft 依存とは別問題）

## 完了条件

- `insertSession` 成功後の接続試行中（切断シーケンス後半の書き込みを含む）に発生した timeline / notify / signaling / log / push が DuckDB-Wasm + OPFS に `session_db_id` 付きで保存されること（INSERT 前・接続試行外は対象外）
- ブラウザを閉じて再度開いても、`/sessions` 詳細から当該メッセージを確認できること
- 機密キーがマスクされて保存されること（特に stringify 済み `log.description` 経路を含む）
- `__SESSIONS_ENABLED__` 無効時および DuckDB / OPFS 失敗時に、既存の接続・デバッグ機能が動作し続けること
- `deleteSession` で 5 メッセージテーブルの行も削除されること
- `vp build` / `vp test run` / `vp check` が成功すること
- `CHANGES.md` の `## develop` に次を追加すること（担当者行はエントリより 2 文字インデント）:

```
- [ADD] timeline / notify / signaling / log / push を DuckDB-Wasm + OPFS に永続化し /sessions 詳細で確認できるようにする
  - @voluntas
```

## 解決方法

1. 失敗する Vitest / E2E（マスク・容量超過 DELETE・メッセージ INSERT / ページ読み取り / `deleteSession` カスケード）を先に追加する
2. `createSchema` に 5 テーブルと sequence / INDEX を追加する
3. `sessionDatabase.ts` に INSERT・ページ読み取り・容量刈り込み・`deleteSession` 拡張を追加する（メッセージ経路は CHECKPOINT しない）
4. `sessionDatabaseLoader.ts` に 5 書き込み API の非同期 no-op ラッパーを追加する
5. `actions.ts` に persist ヘルパー（`sessionDbId` 必須引数）と `disconnectPersistence` を入れ、各 append 点から明示 ID で呼ぶ（INSERT 前除外・log timestamp・abend 並走分離に注意）
6. `SessionDetail`（およびメッセージ用子コンポーネント）に種別タブ UI を追加する
7. E2E ヘルパーと `tests/session-database.test.ts` / Sessions 系 E2E を更新し、CHANGES.md を更新する

## 関連 issue

- #0065: DuckDB-Wasm + OPFS セッション履歴エピック（第 2 段階の親）
- #0067 / #0068 / #0070 / #0073: 第 1 段階の永続化・UI・削除
- #0069: DownloadReport 削除（完了条件外）
- #0071: `/sessions` Header 出し分け（完了条件外）
