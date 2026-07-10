# WebRTC stats を DuckDB-Wasm + OPFS に永続化する

- Priority: Medium
- Created: 2026-06-24
- Completed: YYYY-MM-DD
- Model: GLM-5.2
- Branch: feature/add-webrtc-stats-persistence
- Polished: 2026-07-11

## 目的

1 秒間隔で取得される WebRTC stats を過去のセッション単位で振り返れるよう、DuckDB-Wasm + OPFS に永続化する。主要なフィールドは正規化カラムとして保存し、集計・検索を可能にする。

## 優先度根拠

Medium。接続品質や帯域・パケットロスなどの時系列変化を確認する上で重要な情報であり、DevTools のデバッグ価値を大きく高める。

## 現状

- WebRTC stats は `src/app/actions.ts` の `setStatsReportInternal()` で `soraConnection.pc.getStats()` から `RTCStatsReport` を取得し、`stats.values()` で `RTCStats[]` に変換して `signals.setStatsReport()` に保持される。DuckDB への書き込みはまだ無い
- `startStatsReportTimer()` は引数なしで 1 秒間隔に取得し、切断時に `stopStatsReportTimer()` で停止する。`stopStatsReportTimer()` は `disconnect` コールバックの `isCurrent()` **後**に置かれている（親 #0065 の制約どおり）
- `#0067` 完了済み。`src/sessionDatabase.ts` に `sessions` / `connections`、書き込み直列化 `enqueueWrite`、`getCurrentSessionDbId()` / `getCurrentConnectionId()`、`notifyPersistenceError`（`setSoraErrorAlertMessage` 直呼び）がある。`createSchema` に `webrtc_stats` / `seq_webrtc_stats_id` は未追加
- 接続試行ローカルの `SessionPersistenceState`（`sessionDbId` / `persistedConnectionId` / `observedConnectionId` / `connectionEndedPendingIds`）が `createSoraConnectionByRole` → `setSoraCallbacks` → `handleConnectionCreatedNotify` に渡されている
- sora-js-sdk は `disconnect` コールバック前に `initializeConnection()` で `connectionId` を null 化する。識別子は `persistence.observedConnectionId` / `getCurrentConnectionId()` を使う（#0067）
- `beforeunload` は `void disconnectSora()` のみ。`sessionDatabase.close()` は呼ばない（#0067 方針）
- `RTCStats` は type ごとにフィールドが異なり、ブラウザ間でも差分がある。`src/types.ts` に拡張型がある
- E2E は `requireSoraConnectionEnv()` ハード依存（#0063 / #0037 完了済み）。`playwright.config.ts` は OPFS 競合回避で `workers: 1`。`tests/session-database.test.ts` は `serial` + `cleanupSessionDatabase`

## 設計方針

### 参照仕様

- WebRTC Statistics API（W3C）に基づいて `RTCStatsType` と各 type のフィールドを整理する
  - https://www.w3.org/TR/webrtc-stats/
- `RTCStatsType` の値は `codec`, `inbound-rtp`, `outbound-rtp`, `remote-inbound-rtp`, `remote-outbound-rtp`, `media-source`, `media-playout`, `peer-connection`, `data-channel`, `transport`, `candidate-pair`, `local-candidate`, `remote-candidate`, `certificate`
- 各 type は `RTCStats` の共通フィールド（`timestamp`, `type`, `id`）を持ち、type 固有の辞書が階層的に継承関係を持つ

### テーブル構成

`webrtc_stats` テーブル（第 1 段階）。`src/sessionDatabase.ts` の `createSchema` に `CREATE SEQUENCE IF NOT EXISTS seq_webrtc_stats_id` と `CREATE TABLE IF NOT EXISTS webrtc_stats` を追加する（既存 OPFS DB は IF NOT EXISTS で拡張。マイグレーション機構は第 1 段階では作らない）。

| カラム                     | 型                                                        | 説明                                                                                                                                                                                                                                                                |
| -------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                         | BIGINT PRIMARY KEY DEFAULT nextval('seq_webrtc_stats_id') | 自動採番                                                                                                                                                                                                                                                            |
| session_db_id              | INTEGER                                                   | `sessions.id` への参照。同一 Sora `session_id` で複数接続試行がある場合の曖昧性を解消する                                                                                                                                                                           |
| session_id                 | VARCHAR                                                   | Sora session_id（`connection.created` 前は NULL）                                                                                                                                                                                                                   |
| connection_id              | VARCHAR                                                   | Sora connection_id（`connection.created` 前は NULL）                                                                                                                                                                                                                |
| channel_id                 | VARCHAR                                                   | channelId                                                                                                                                                                                                                                                           |
| timestamp_ms               | DOUBLE                                                    | `RTCStats.timestamp`（ms、小数点以下を保持）。時系列分析にはこの値を使う                                                                                                                                                                                            |
| stats_type                 | VARCHAR                                                   | `RTCStatsType`                                                                                                                                                                                                                                                      |
| stats_id                   | VARCHAR                                                   | `RTCStats.id`                                                                                                                                                                                                                                                       |
| kind                       | VARCHAR                                                   | 'audio' / 'video' / NULL                                                                                                                                                                                                                                            |
| ssrc                       | UBIGINT                                                   | `RTCRtpStreamStats.ssrc`（32bit unsigned integer）                                                                                                                                                                                                                  |
| track_identifier           | VARCHAR                                                   | `trackIdentifier`                                                                                                                                                                                                                                                   |
| transport_id               | VARCHAR                                                   | `transportId`                                                                                                                                                                                                                                                       |
| codec_id                   | VARCHAR                                                   | `codecId`                                                                                                                                                                                                                                                           |
| mid                        | VARCHAR                                                   | `mid`                                                                                                                                                                                                                                                               |
| remote_id                  | VARCHAR                                                   | `remoteId`                                                                                                                                                                                                                                                          |
| packets_received           | BIGINT                                                    | `packetsReceived`                                                                                                                                                                                                                                                   |
| packets_lost               | BIGINT                                                    | `packetsLost`（負の値を取りうる）                                                                                                                                                                                                                                   |
| packets_sent               | BIGINT                                                    | `packetsSent`                                                                                                                                                                                                                                                       |
| bytes_received             | BIGINT                                                    | `bytesReceived`                                                                                                                                                                                                                                                     |
| bytes_sent                 | BIGINT                                                    | `bytesSent`                                                                                                                                                                                                                                                         |
| header_bytes_sent          | BIGINT                                                    | `headerBytesSent`                                                                                                                                                                                                                                                   |
| retransmitted_packets_sent | BIGINT                                                    | `retransmittedPacketsSent`                                                                                                                                                                                                                                          |
| retransmitted_bytes_sent   | BIGINT                                                    | `retransmittedBytesSent`                                                                                                                                                                                                                                            |
| total_packet_send_delay    | DOUBLE                                                    | `totalPacketSendDelay`                                                                                                                                                                                                                                              |
| nack_count                 | BIGINT                                                    | `nackCount`                                                                                                                                                                                                                                                         |
| frame_width                | INTEGER                                                   | `frameWidth`                                                                                                                                                                                                                                                        |
| frame_height               | INTEGER                                                   | `frameHeight`                                                                                                                                                                                                                                                       |
| frames_per_second          | DOUBLE                                                    | `framesPerSecond`                                                                                                                                                                                                                                                   |
| frames_received            | BIGINT                                                    | `framesReceived`                                                                                                                                                                                                                                                    |
| round_trip_time            | DOUBLE                                                    | `roundTripTime`                                                                                                                                                                                                                                                     |
| total_round_trip_time      | DOUBLE                                                    | `totalRoundTripTime`                                                                                                                                                                                                                                                |
| available_outgoing_bitrate | DOUBLE                                                    | `availableOutgoingBitrate`                                                                                                                                                                                                                                          |
| available_incoming_bitrate | DOUBLE                                                    | `availableIncomingBitrate`                                                                                                                                                                                                                                          |
| local_candidate_id         | VARCHAR                                                   | `localCandidateId`                                                                                                                                                                                                                                                  |
| remote_candidate_id        | VARCHAR                                                   | `remoteCandidateId`                                                                                                                                                                                                                                                 |
| candidate_pair_state       | VARCHAR                                                   | `candidate-pair.state`                                                                                                                                                                                                                                              |
| nominated                  | BOOLEAN                                                   | `candidate-pair.nominated`                                                                                                                                                                                                                                          |
| selected_candidate_pair_id | VARCHAR                                                   | `transport.selectedCandidatePairId`                                                                                                                                                                                                                                 |
| raw_json                   | JSON                                                      | 正規化カラムに含まれない残りのフィールド。正規化カラムに含まれるフィールドは `raw_json` から除外する。`codec` / `media-source` / `local-candidate` / `remote-candidate` / `peer-connection` / `data-channel` / `certificate` / `media-playout` 等のフィールドを含む |
| created_at                 | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                       | DuckDB へのバッチ INSERT 実行時刻。デバッグ用。時系列分析には `timestamp_ms` を使う                                                                                                                                                                                 |

第 1 段階の INDEX: `session_db_id` に対する INDEX を 1 本作る（一覧・集計の前提。`stats_type` 複合 INDEX は第 1 段階では作らない）。

### 正規化方針

- W3C 仕様で定義された `RTCStatsType` ごとの主要フィールドを正規化カラムに展開する
- 同一フィールド名が複数の type で使われている場合は、1 つのカラムに集約して保存する。`stats_type` で絞り込むことで区別する
- 使用頻度が低い・type 固有の・ブラウザ間で差分のあるフィールドは `raw_json` に退避する
- 正規化カラムに含まれるフィールドは `raw_json` から除外し、データ重複を防ぐ
- Chrome の `goog*` プレフィックス等のブラウザ固有非標準フィールドは `raw_json` に含める
- `bitrate_bps` のような派生値は保存せず、`bytes_sent` / `bytes_received` の時系列差分を DuckDB の window function で計算する
- 第 1 段階の正規化対象 type:
  - `inbound-rtp`, `outbound-rtp`: 送受信パケット数・バイト数・フレーム情報を正規化カラムに展開
  - `remote-inbound-rtp`, `remote-outbound-rtp`: `remote_id` 等を正規化カラムに展開
  - `candidate-pair`: RTT・bitrate・state・nominated 等を正規化カラムに展開
  - `transport`: `selectedCandidatePairId` を正規化カラムに展開
- 第 1 段階では `raw_json` に退避する type:
  - `codec`, `media-source`, `local-candidate`, `remote-candidate`, `peer-connection`, `data-channel`, `certificate`, `media-playout`
  - `local-candidate` / `remote-candidate` の IP・ポートは保存する（親 #0065 方針）が、正規化カラムには出さず `raw_json` に含める
- `NormalizedWebrtcStat` は上表の正規化カラム（`id` / `created_at` を除く）と 1:1 のフィールドを持つ型として `webrtcStatsNormalizer.ts` で export する。`raw_json` には正規化カラム名と一致するキーを入れない

### 正規化関数の責務

- `src/webrtcStatsNormalizer.ts` を作成し、`RTCStats[]` を受け取り `NormalizedWebrtcStat[]` を返す
- `stats_type` ごとに必要なフィールドを抽出し、存在しないカラムは `null` とする
- 正規化カラムに含まれるフィールドを `raw_json` から除外する
- ブラウザ固有の拡張フィールドも `raw_json` に格納する
- 正規化はメインスレッドで実行する。バッチ INSERT 本体は `enqueueWrite` → DuckDB Worker 経由

### `sessionDatabase` の stats 永続化 API

すべて内部で `enqueueWrite` 経由の DuckDB 操作とする（#0067 の並行 query 禁止を崩さない）。バッファ操作自体は JS メモリ上で行い、INSERT / DELETE / CHECKPOINT だけをキューに載せる。

- `enqueueStats(normalizedStats, sessionDbId, sessionId, connectionId, channelId): void`
  - `sessionDbId` は接続試行開始時に確定済みの `sessions.id`（必須）
  - `sessionId` / `connectionId` は Sora 識別子。未確定なら `null`（行は通常バッファに `session_db_id` 付きで溜め、識別子カラムだけ NULL）
  - 一時バッファは「Sora 識別子待ち」ではなく、バッチ未 flush の通常バッファと同一構造でよい。識別子確定後に NULL だった行を UPDATE する必要はなく、**以降の enqueue から非 NULL を書く**。確定前に溜まった行の `session_id` / `connection_id` は NULL のまま残してよい（親モデル: `session_db_id` が主参照）
- `flushStatsBuffer(sessionDbId?: number): Promise<void>`: バッファをバルク INSERT する。引数ありならその `session_db_id` 分だけ。省略時は全バッファ（切断明示パス用）
- `clearStatsBuffers(sessionDbId: number): void`: **指定 `session_db_id` のバッファだけ**消す。引数なし全消しは禁止（旧接続の未 flush を新接続開始時に消さない）
- 容量サンプリング用の DELETE も `enqueueWrite` 経由

### 容量上限・ローテーション方針（第 1 段階で固定）

- 単位: `session_db_id` ごと
- 発火: その `session_db_id` 向け `flushStatsBuffer` 成功直後に、DB 上の当該件数を数え、**10,000 件超**なら実行する
- 方式: `timestamp_ms` 昇順で古い側から、超過分を **10 件に 1 件残す**（`id % 10 = 0` 相当ではなく、古い N 件を走査して 10 件ごとに 1 件残し他を DELETE）
- 事後件数の厳密な硬上限は設けない（例: 20,000 → 古い 10,000 を約 1,000 に減らし新しい 10,000 と合わせて約 11,000）
- 初期閾値 10,000 の変更は「未解決課題」。完了条件の必須検証対象外（Vitest でアルゴリズムを合成データ検証する）

### バッチ挿入

- メモリ上でバッファリングし、次のいずれかでバルク INSERT する
  - 当該 `session_db_id` のバッファが 1000 件に達したとき
  - 当該バッファの先頭 enqueue から 5 秒経過したとき
  - 切断・明示パスで `flushStatsBuffer` したとき
- 永続化フックは `setStatsReportInternal()` 内で `await` せず、`void` + `.catch`（または既存 `runPersistenceTask`）で投げる
- バッチ INSERT 失敗時は `sessionDatabase` 内の `notifyPersistenceError` 相当で通知する（英語・末尾ピリオドなし。`actions` 経由は循環依存禁止）
- 再試行: 失敗バッチは最大 3 回まで同一 `enqueueWrite` チェーン上で再試行する。恒久エラー（メッセージに `QuotaExceeded` / `quota` / `ENOSPC` を含む、または OPFS 書き込み拒否）は即破棄 + 通知。一過性は再試行、3 回失敗で破棄 + warn
- DuckDB 未初期化・初期化失敗時は `enqueueStats` を no-op とし、`signals.statsReport` のみ更新する

### 識別子・クロージャ・タイマー

- `session_db_id` は `connectSora` / `reconnectSoraImpl` の INSERT 直後から使える。stats は常にこの id に紐づける
- Sora `session_id` / `connection_id` は `persistence` に保持する（`connection.created` で `observedConnectionId` と同様に `sessionId` を同期セット）。`signals.sessionId` / `signals.connectionId` を stats 永続化に使わない
- `startStatsReportTimer(soraConnection, persistence)` のように、開始時に `persistence.sessionDbId` と channelId をクロージャキャプチャする。毎 tick `getCurrentSessionDbId()` を読まない（並走後勝ちで誤紐付けしうる）
- `setStatsReportInternal(soraConnection, persistence)` も同様に persistence を受け取る
- `attemptReconnection` のリトライは同一 `sessionDbId` を使い回す。リトライ中の stats も同一 `session_db_id` に蓄積する
- **新接続試行の開始時に旧 `session_db_id` のバッファを `clear` しない**。旧バッファは切断フック / 明示パスの `flushStatsBuffer(旧 sessionDbId)` で排出する。`clearStatsBuffers(sessionDbId)` は「当該 id のバッファを破棄してよいと分かっているとき」（例: 永続化を諦めた失敗パスで flush せず捨てる）に限り使う。空の新 id に対する clear 呼び出しは不要

### 切断・明示パスでの flush（親制約）

| 経路                                                         | `flushStatsBuffer`                                                                                                                                                                                                            | `stopStatsReportTimer`                                       |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `disconnect` フック                                          | `isCurrent()` **前**に、クロージャの `persistence.sessionDbId` を同期キャプチャして `flushStatsBuffer(sessionDbId)` を void で投げる。`getCurrentSessionDbId()` は使わない（遅延 disconnect で新接続の id を誤 flush しない） | `isCurrent()` **後**（現行どおり。前に置かない）             |
| `disconnectSora` / `beforeunload`                            | 関数先頭（最初の `await` より前）で `getCurrentSessionDbId()` をキャプチャし void flush                                                                                                                                       | 既存どおり cleanup 後でも可（beforeunload 完了は保証しない） |
| `abortConnectSoraResources` / `abortIfCancelled` / try/catch | 明示パスで当該 `persistence.sessionDbId` を flush                                                                                                                                                                             | 既存どおり                                                   |
| `beforeunload`                                               | 上記 `disconnectSora` 経由。**`close()` は呼ばない**                                                                                                                                                                          | —                                                            |

## 完了条件

- 1 秒間隔で取得した `RTCStats` が、切断後（または明示 flush 後）に `webrtc_stats` へ保存されていること（E2E で当該 `session_db_id` の `COUNT(*) >= 1`）
- `webrtc_stats` を `session_db_id` / `session_id` / `connection_id` / `channel_id` / `stats_type` で SQL 絞り込みできること（E2E。`kind` は fake media 環境で欠けることがあるため必須断言にしない）
- ブラウザリロード後も、flush 済み stats が読み出せること（E2E。`awaitSessionDatabaseReady` 後）
- 正規化対象 type の主要フィールドが正規化カラムに入り、正規化カラム名が `raw_json` に重複しないこと（Vitest + fixture）
- バッチ INSERT / 正規化をメインスレッドで `await` して UI を止めないこと（設計遵守。定量 FPS 計測は完了条件に含めない）
- 容量サンプリングアルゴリズムが Vitest（合成 `NormalizedWebrtcStat[]`）で期待件数になること
- `vp build` / `vp test run` / `vp check` が成功すること
- `CHANGES.md` の `## develop` に `- [ADD] WebRTC stats を DuckDB-Wasm + OPFS に永続化する` と担当者行 `- @voluntas` を記載すること

## 解決方法

1. `src/sessionDatabase.ts` の `createSchema` に `seq_webrtc_stats_id` / `webrtc_stats` / `session_db_id` INDEX を追加する
2. `src/webrtcStatsNormalizer.ts` を作成し、正規化関数と `NormalizedWebrtcStat` を実装する
3. `sessionDatabase` に `enqueueStats` / `flushStatsBuffer` / `clearStatsBuffers`（`sessionDbId` 必須）とバッチ・再試行・サンプリングを実装する。DuckDB 操作はすべて `enqueueWrite` 経由。失敗は `notifyPersistenceError`
4. `SessionPersistenceState` に Sora `sessionId` を追加し、`connection.created` で同期セットする
5. `setStatsReportInternal(soraConnection, persistence)` / `startStatsReportTimer(soraConnection, persistence)` に persistence を渡し、正規化 → `enqueueStats` を fire-and-forget する。`connectSora` / `reconnectSoraImpl` の呼び出し箇所を更新する
6. `disconnect` フックでは `isCurrent()` **前**に `flushStatsBuffer(persistence.sessionDbId)` のみ（クロージャの id。`getCurrentSessionDbId()` 禁止）。`stopStatsReportTimer` は `isCurrent()` **後**のまま
7. `disconnectSora` 先頭で `getCurrentSessionDbId()` をキャプチャして void flush する（`beforeunload` 経路）。`close()` は追加しない
8. `abortConnectSoraResources` / 失敗明示パスでも当該 `persistence.sessionDbId` を flush する
9. 新接続試行開始時に旧 id のバッファを clear しない（切断側 flush に任せる）
10. Playwright E2E と Vitest / fixture を追加する（テスト方針どおり）
11. `App.tsx` は変更対象外（`createSessionDatabase` は #0067 済み）

## テスト方針

### Vitest（モック・スタブ禁止）

- `src/webrtcStatsNormalizer.test.ts`: fixture（`src/__fixtures__/webrtc-stats-*.json`）を使う。許可は静的 JSON。禁止は `vi.mock` / 偽 `RTCPeerConnection` / 偽 `getStats`
- 最低 type セット: `inbound-rtp`, `outbound-rtp`, `candidate-pair`, `transport` を 1 fixture に含める
- 正規化カラムが `raw_json` に重複しないこと、欠落フィールドが `null` になることを断言する
- サンプリング関数は合成配列で Vitest する（E2E では検証しない）
- アサーションは `assert`（Chai）。Playwright の `expect` と混同しない
- PBT は任意（第 1 段階では必須にしない）

### Playwright E2E

- ファイル: `tests/session-database.test.ts` に describe を足すか `tests/webrtc-stats-persistence.test.ts` を新設する。いずれでも `test.describe.configure({ mode: "serial" })` と `cleanupSessionDatabase` の before/after を必須とする（OPFS・`workers: 1`）
- `requireSoraConnectionEnv()` ハード依存。`process.env` フォールバックは禁止
- channelId suffix 例: `session-db-stats-persist`
- ヘルパー: `tests/helpers/sessionDatabase.ts` に `listWebrtcStatsRows` / `waitForWebrtcStats({ sessionDbId or connectionId, minCount, timeoutMs<=10000 })` を追加する
- **検証タイミング**: 原則「切断後に flush 完了を待ってから」読む。接続中断言する場合はバッファ 5 秒条件を満たすか、テストから明示 `flushStatsBuffer` を呼ぶ。固定 2〜3 秒待ちだけでは不足
- 最低断言: 当該接続試行の `COUNT(*) >= 1`。`kind` 必須にしない（fake media）
- リロード検証: disconnect → waitFor stats → 件数控え → navigate → `awaitSessionDatabaseReady` → 再読込（#0067 と同型）
- 既存 sendrecv 等への cleanup 波及は本 issue スコープ外（必要なら別 issue）

## リスクと対策

| リスク                                                       | 対策                                                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| 高頻度な stats 書き込みで UI スレッドがブロックする          | 正規化以外の INSERT は `enqueueWrite` + DuckDB Worker。メインで await しない         |
| `webrtc_stats` が OPFS quota を圧迫する                      | `session_db_id` 単位の 10,000 件超サンプリング（設計方針で固定）                     |
| ブラウザ間で `RTCStats` フィールドに差分があり正規化が漏れる | `raw_json` に退避し、必要に応じてカラムを追加する                                    |
| `ssrc` 等の符号なし整数がオーバーフローする                  | `UBIGINT` を使用する                                                                 |
| DuckDB-Wasm 初期化失敗で stats 永続化が動かなくなる          | `enqueueStats` を no-op とし、stats はメモリ上にのみ保持する                         |
| 旧接続の未 flush を新接続開始時に消す                        | 新接続開始時に旧 id を clear しない。切断フックで `persistence.sessionDbId` を flush |
| 旧 disconnect が新接続の stats タイマーを止める              | `stopStatsReportTimer` は `isCurrent()` 後のみ                                       |
| E2E が未 flush を読む / OPFS 競合                            | 切断後 wait + `serial` + cleanup + `workers: 1`                                      |

## 未解決課題

- バッチ挿入のバッファサイズ・間隔の最適値（初期値 1000 件 / 5 秒）。完了条件の必須検証対象外
- 容量上限 10,000 件が長時間接続に対して低すぎる場合の調整。完了条件の必須検証対象外

## 関連 issue

- #0065: 親エピック（第 1 段階に本 issue を含む）
- #0066: ルーティング基盤（完了済み）
- #0067: sessions / connections 永続化（完了済み。本 issue の前提）
- #0069: DownloadReportButton 削除（本エピック完了条件外。#0070 後推奨）
- #0070: /sessions UI（stats 読み出し API の一覧面は #0070。本 issue は書き込みと E2E の SQL 検証まで）
- #0063: `requireSoraConnectionEnv`（完了済み）
