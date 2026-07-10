# WebRTC stats を DuckDB-Wasm + OPFS に永続化する

- Priority: Medium
- Created: 2026-06-24
- Completed: YYYY-MM-DD
- Model: GLM-5.2
- Branch: feature/add-webrtc-stats-persistence
- Polished: 2026-06-24

## 目的

1 秒間隔で取得される WebRTC stats を過去のセッション単位で振り返れるよう、DuckDB-Wasm + OPFS に永続化する。主要なフィールドは正規化カラムとして保存し、集計・検索を可能にする。

## 優先度根拠

Medium。接続品質や帯域・パケットロスなどの時系列変化を確認する上で重要な情報であり、DevTools のデバッグ価値を大きく高める。

## 現状

- WebRTC stats は `src/app/actions.ts` の `setStatsReportInternal()` で `soraConnection.pc.getStats()` から `RTCStatsReport` を取得し、`stats.values()` で `RTCStats[]` に変換して `signals.setStatsReport()` に保持される
- `startStatsReportTimer()` で 1 秒間隔に取得され、切断時に `stopStatsReportTimer()` で停止される
- `RTCStats` は type ごとにフィールドが異なり、ブラウザ間でも差分がある
- `src/types.ts` に `RTCInboundRtpStreamStats` / `RTCMediaStreamTrackStats` / `RTCIceLocalCandidateStats` などの拡張型が定義されている

## 設計方針

### 参照仕様

- WebRTC Statistics API（W3C）に基づいて `RTCStatsType` と各 type のフィールドを整理する
  - https://www.w3.org/TR/webrtc-stats/
- `RTCStatsType` の値は `codec`, `inbound-rtp`, `outbound-rtp`, `remote-inbound-rtp`, `remote-outbound-rtp`, `media-source`, `media-playout`, `peer-connection`, `data-channel`, `transport`, `candidate-pair`, `local-candidate`, `remote-candidate`, `certificate`
- 各 type は `RTCStats` の共通フィールド（`timestamp`, `type`, `id`）を持ち、type 固有の辞書が階層的に継承関係を持つ

### テーブル構成

`webrtc_stats` テーブル（第 1 段階）:

| カラム                     | 型                                                        | 説明                                                                                                                                                                                                                                                                |
| -------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                         | BIGINT PRIMARY KEY DEFAULT nextval('seq_webrtc_stats_id') | 自動採番                                                                                                                                                                                                                                                            |
| session_db_id              | INTEGER                                                   | `sessions.id` への参照（外部キー）。同一 `session_id` で複数レコードが存在する場合の曖昧性を解消する                                                                                                                                                                |
| session_id                 | VARCHAR                                                   | Sora session_id（未確定時は NULL）                                                                                                                                                                                                                                  |
| connection_id              | VARCHAR                                                   | Sora connection_id（未確定時は NULL）                                                                                                                                                                                                                               |
| channel_id                 | VARCHAR                                                   | channelId                                                                                                                                                                                                                                                           |
| timestamp_ms               | DOUBLE                                                    | `RTCStats.timestamp`（ms、小数点以下を保持）。stats の時系列分析にはこの値を使用する                                                                                                                                                                                |
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
| created_at                 | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                       | DuckDB へのバッチ INSERT 実行時刻。デバッグ用であり、時系列分析には `timestamp_ms` を使用する                                                                                                                                                                       |

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
  - `local-candidate` / `remote-candidate` に含まれる IP アドレス・ポートは機密情報の可能性があるため、第 1 段階では正規化せず `raw_json` に含める
- 将来拡張: 第 2 段階以降で `codec` / `media-source` / `local-candidate` / `remote-candidate` 等の主要フィールドを追加検討する

### 正規化関数の責務

- `src/webrtcStatsNormalizer.ts` を作成し、`RTCStats[]` を受け取り、W3C 仕様に基づいて `webrtc_stats` テーブルのカラムにマッピングする
- `stats_type` ごとに必要なフィールドを抽出し、存在しないカラムは `NULL` とする
- 正規化カラムに含まれるフィールドを `raw_json` から除外する
- ブラウザ固有の拡張フィールドも `raw_json` に格納する
- 正規化関数はメインスレッドで実行する。1 秒間隔で数百件の正規化をメインスレッドで行うが、`AsyncDuckDB` のバッチ INSERT は内部 Worker で行うため UI スレッドのブロックは最小限に抑える

### `sessionDatabase` の stats 永続化 API

- `enqueueStats(normalizedStats: NormalizedWebrtcStat[], sessionDbId: number, sessionId: string | null, connectionId: string | null, channelId: string): void`: 正規化済み stats をバッファに追加する。`sessionDbId` は `sessions.id`（クロージャから渡される）
- `flushStatsBuffer(): Promise<void>`: バッファの内容をバルク INSERT する
- `flushTempStatsBuffer(sessionDbId: number, sessionId: string, connectionId: string): Promise<void>`: 識別子未確定時の一時バッファの内容に識別子を設定して通常バッファに移し、即座にフラッシュする
- `clearStatsBuffers(): void`: 接続試行ごとに一時バッファ・通常バッファを初期化する

### 容量上限・ローテーション方針

- 第 1 段階では以下を採用する
  - 1 接続あたり 10,000 件を上限とし、超過分を 10 件ごとに 1 件の比率でサンプリングして保持する
  - 例: 20,000 件の場合、古い 10,000 件を 1/10 サンプリングして 1,000 件に減らし、新しい 10,000 件は全件保持する
  - サンプリングは `webrtc_stats.id` または `timestamp_ms` に基づいて行う
  - 具体的な閾値・サンプリング方式は実装時に測定し、必要に応じて調整する。1 秒間隔で数十〜数百件の stats を取得するため、10,000 件は数分〜数十分で到達する可能性がある。長時間接続のデバッグでは初期値が低すぎる場合は実装時に調整すること

### バッチ挿入

- 1 秒間隔で取得される stats は 1 回の取得あたり数十〜数百件の `RTCStatsReport` エントリを含む
- そのまま逐次 INSERT すると UI スレッドをブロックする可能性がある
- メモリ上でバッファリングし、以下のいずれかの条件でバルク INSERT する
  - バッファが一定件数（初期値: 1000 件）に達したとき
  - 一定時間（初期値: 5 秒）経過したとき
  - 切断時に残りをフラッシュするとき
- 永続化フックは `setStatsReportInternal()` 内で `await` せず、`void` で非同期に投げる
- `typescript/no-floating-promises` 対策として、`.catch((error) => { console.warn(...) })` でエラーを捕捉する
- バッチ INSERT 失敗時は console warn を出力し、UI 上で永続化エラーを通知する（#0065 / #0067 の UI 通知方針と統一する）
- 失敗したバッチは捨てず、キューの先頭に戻して次回のバッチ挿入時に再試行する。ただし恒久的エラー（OPFS quota 超過等）は再試行せず即座にバッチ破棄 + ユーザー通知する
- 最大 3 回まで再試行し、それでも失敗した場合は console warn を出力して該当バッチを破棄する
- DuckDB-Wasm 初期化失敗時は `enqueueStats()` を no-op とし、stats はメモリ上の `signals.statsReport` にのみ保持する

### 識別子未確定時の扱い

- `sessionId` / `connectionId` が未確定の場合は、stats をメモリ上の一時バッファに保持する
- `connection.created` notify 受信後に `sessionId` / `connectionId` が確定したら、一時バッファの stats に識別子を設定して通常バッファに移し、即座にフラッシュする
- 識別子確定後は通常通りバッチ INSERT する
- 切断時には一時バッファ・通常バッファの両方をフラッシュする
- 一時バッファは接続試行ごとに初期化する（`clearStatsBuffers()` を `connectSora()` / `reconnectSoraImpl()` 開始時に呼ぶ）

## 完了条件

- 1 秒間隔で取得した `RTCStats` が DuckDB に保存されること
- `webrtc_stats` テーブルから `session_db_id` / `sessionId` / `connectionId` / `channelId` / `stats_type` / `kind` / `ssrc` で絞り込み・集計できること
- ブラウザを閉じて再度開いても、過去の stats が読み出せること
- 主要な stats フィールドが正規化カラムとして保存され、DuckDB の集計関数で利用できること
- 高頻度な stats 取得中も UI がカクつかないこと
- `build` / `test` / `check` が成功すること
- `CHANGES.md` の `## develop` に `- [ADD] WebRTC stats を DuckDB-Wasm + OPFS に永続化する` を記載すること

## 解決方法

1. `webrtc_stats` テーブルのスキーマを定義する（`session_db_id` カラムを含む）
   - `CREATE SEQUENCE IF NOT EXISTS seq_webrtc_stats_id START 1` を作成し、`id` カラムの `DEFAULT nextval(...)` と組み合わせる（#0067 では `seq_webrtc_stats_id` を作成しないため、#0068 で作成する）
2. `src/webrtcStatsNormalizer.ts` を作成し、`RTCStats[]` の正規化関数を実装する
3. `setStatsReportInternal()` / `startStatsReportTimer()` のシグネチャに `sessions.id` を追加し、受け渡しパスを確保する（#0067 で `createSoraConnectionByRole()` / `setSoraCallbacks()` のシグネチャ変更を行うため、それと整合する）
4. `src/app/actions.ts` の `setStatsReportInternal()` で正規化関数を呼び出し、`sessionDatabase.enqueueStats()` でバッファに追加する。`void` で非同期に投げ、`.catch()` でエラーを捕捉する
5. `src/sessionDatabase.ts` に stats 用のバッチ挿入機構を実装する
   - 一時バッファ（識別子未確定用）と通常バッファ（識別子確定後用）を持つ
   - 接続試行ごとに `clearStatsBuffers()` で初期化する
6. `src/app/actions.ts` の `handleConnectionCreatedNotify()` で識別子確定後、`sessionDatabase.flushTempStatsBuffer()` で一時バッファの内容に識別子を設定して通常バッファに移し、フラッシュする。`handleConnectionCreatedNotify()` に `sessions.id` を渡す経路を #0067 と協調して確保すること
7. 切断時に `disconnect` コールバックの `isCurrent()` ガードの**前**に `stopStatsReportTimer()` と `sessionDatabase.flushStatsBuffer()` を配置する（#0067 の `ended_at` 更新フックと同じ位置）
8. `connectSora()` の `abortConnectSoraResources()` 内でもバッファの残り stats をフラッシュする
9. Playwright E2E テストで stats の保存・読み出しを検証する

## テスト方針

- Vitest 単体テスト: `webrtcStatsNormalizer.ts` の正規化関数を対象とする。ブラウザから取得した実際の `RTCStats` オブジェクトに近いテスト fixture データを使用する（モックやスタブは使用しない）。fixture データは実際のブラウザから stats を JSON シリアライズして保存したものを `src/__fixtures__/` に配置する。手作り fixture は W3C 仕様に沿った構造の静的データであり、モックには該当しない
- Playwright E2E テスト:
  - 接続中に `webrtc_stats` テーブルへ stats が保存されること
  - `session_db_id` / `sessionId` / `connectionId` / `stats_type` / `kind` で絞り込めること
  - ブラウザリロード後も stats が読み出せること
  - stats は 1 秒間隔で取得されるため、E2E テストでは最低 2〜3 秒の接続を維持する。timeout は CODEBASE.md に従い 10 秒以内に収めること
  - Sora 接続が必要なテストでは #0063 で導入される `requireSoraConnectionEnv()` を使用し、`E2E_TEST_SORA_SIGNALING_URL` 未設定時は Error を throw して即座に fail する。#0063 / #0037 が未完了の場合は `process.env` 直接読み取り等のフォールバックを検討すること
  - #0062（三項演算子禁止）がマージ済みの場合は新規追加コードで三項演算子を使用しないこと

## リスクと対策

| リスク                                                       | 対策                                                                 |
| ------------------------------------------------------------ | -------------------------------------------------------------------- |
| 高頻度な stats 書き込みで UI スレッドがブロックする          | `AsyncDuckDB` の内部 Worker を使用し、バッチ挿入を行う               |
| `webrtc_stats` テーブルが肥大化して OPFS quota を圧迫する    | 1 接続あたりの容量上限・サンプリング方針を採用する（設計方針で既述） |
| ブラウザ間で `RTCStats` フィールドに差分があり正規化が漏れる | `raw_json` に退避し、必要に応じてカラムを追加する                    |
| `ssrc` 等の符号なし整数がオーバーフローする                  | `UBIGINT` 等の適切な型を使用する                                     |
| DuckDB-Wasm 初期化失敗で stats 永続化が動かなくなる          | `enqueueStats()` を no-op とし、stats はメモリ上にのみ保持する       |
| 一時バッファが再接続のリトライ間で混線する                   | 接続試行ごとに `clearStatsBuffers()` で初期化する                    |

## 未解決課題

- バッチ挿入のバッファサイズ・間隔の最適値は実装時に測定して調整する（初期値は 1000 件 / 5 秒）
- 容量上限 10,000 件が長時間接続に対して低すぎる場合は実装時に調整する

## 関連 issue

- #0065: DuckDB-Wasm + OPFS で過去セッションの stats / メタデータを永続化し /sessions ページで確認できるようにする（親 issue）
- #0066: preact-iso を導入して `/sessions` ページへのルーティング基盤を追加する
- #0067: DuckDB-Wasm + OPFS でセッション・接続メタデータを永続化する
- #0069: DownloadReportButton と DownloadReport 関連機能を削除する
- #0070: /sessions ページに過去セッション一覧・詳細・フィルタ UI を実装する
- #0063: Sora 接続が必要な E2E テストで環境変数未設定時に即座に失敗させる（E2E テストが依存）
