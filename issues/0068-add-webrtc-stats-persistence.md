# WebRTC stats を DuckDB-Wasm + OPFS に永続化する

- Priority: Medium
- Created: 2026-06-24
- Completed: YYYY-MM-DD
- Model: Kimi K2.7 Code
- Branch: feature/add-webrtc-stats-persistence
- Polished: 2026-06-24

## 目的

1 秒間隔で取得される WebRTC stats を過去のセッション単位で振り返れるよう、DuckDB-Wasm + OPFS に永続化する。主要なフィールドは正規化カラムとして保存し、集計・検索を可能にする。

## 優先度根拠

Medium。接続品質や帯域・パケットロスなどの時系列変化を確認する上で重要な情報であり、DevTools のデバッグ価値を大きく高める。

## 現状

- WebRTC stats は `src/app/actions.ts` の `setStatsReportInternal()` で取得され、`signals.statsReport` に保持される
- `startStatsReportTimer()` で 1 秒間隔に取得され、切断時に停止される
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

| カラム                     | 型                                                        | 説明                                                                                                                                                                                                    |
| -------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                         | BIGINT PRIMARY KEY DEFAULT nextval('seq_webrtc_stats_id') | 自動採番                                                                                                                                                                                                |
| session_id                 | VARCHAR                                                   | Sora session_id（未確定時は NULL）                                                                                                                                                                      |
| connection_id              | VARCHAR                                                   | Sora connection_id（未確定時は NULL）                                                                                                                                                                   |
| channel_id                 | VARCHAR                                                   | channelId                                                                                                                                                                                               |
| timestamp_ms               | DOUBLE                                                    | `RTCStats.timestamp`（ms、小数点以下を保持）。stats の時系列分析にはこの値を使用する                                                                                                                    |
| stats_type                 | VARCHAR                                                   | `RTCStatsType`                                                                                                                                                                                          |
| stats_id                   | VARCHAR                                                   | `RTCStats.id`                                                                                                                                                                                           |
| kind                       | VARCHAR                                                   | 'audio' / 'video' / NULL                                                                                                                                                                                |
| ssrc                       | UBIGINT                                                   | `RTCRtpStreamStats.ssrc`（32bit unsigned integer）                                                                                                                                                      |
| track_identifier           | VARCHAR                                                   | `trackIdentifier`                                                                                                                                                                                       |
| transport_id               | VARCHAR                                                   | `transportId`                                                                                                                                                                                           |
| codec_id                   | VARCHAR                                                   | `codecId`                                                                                                                                                                                               |
| mid                        | VARCHAR                                                   | `mid`                                                                                                                                                                                                   |
| remote_id                  | VARCHAR                                                   | `remoteId`                                                                                                                                                                                              |
| packets_received           | BIGINT                                                    | `packetsReceived`                                                                                                                                                                                       |
| packets_lost               | BIGINT                                                    | `packetsLost`（負の値を取りうる）                                                                                                                                                                       |
| packets_sent               | BIGINT                                                    | `packetsSent`                                                                                                                                                                                           |
| bytes_received             | BIGINT                                                    | `bytesReceived`                                                                                                                                                                                         |
| bytes_sent                 | BIGINT                                                    | `bytesSent`                                                                                                                                                                                             |
| header_bytes_sent          | BIGINT                                                    | `headerBytesSent`                                                                                                                                                                                       |
| retransmitted_packets_sent | BIGINT                                                    | `retransmittedPacketsSent`                                                                                                                                                                              |
| retransmitted_bytes_sent   | BIGINT                                                    | `retransmittedBytesSent`                                                                                                                                                                                |
| total_packet_send_delay    | DOUBLE                                                    | `totalPacketSendDelay`                                                                                                                                                                                  |
| nack_count                 | BIGINT                                                    | `nackCount`                                                                                                                                                                                             |
| frame_width                | INTEGER                                                   | `frameWidth`                                                                                                                                                                                            |
| frame_height               | INTEGER                                                   | `frameHeight`                                                                                                                                                                                           |
| frames_per_second          | DOUBLE                                                    | `framesPerSecond`                                                                                                                                                                                       |
| frames_received            | BIGINT                                                    | `framesReceived`                                                                                                                                                                                        |
| round_trip_time            | DOUBLE                                                    | `roundTripTime`                                                                                                                                                                                         |
| total_round_trip_time      | DOUBLE                                                    | `totalRoundTripTime`                                                                                                                                                                                    |
| available_outgoing_bitrate | DOUBLE                                                    | `availableOutgoingBitrate`                                                                                                                                                                              |
| available_incoming_bitrate | DOUBLE                                                    | `availableIncomingBitrate`                                                                                                                                                                              |
| local_candidate_id         | VARCHAR                                                   | `localCandidateId`                                                                                                                                                                                      |
| remote_candidate_id        | VARCHAR                                                   | `remoteCandidateId`                                                                                                                                                                                     |
| candidate_pair_state       | VARCHAR                                                   | `candidate-pair.state`                                                                                                                                                                                  |
| nominated                  | BOOLEAN                                                   | `candidate-pair.nominated`                                                                                                                                                                              |
| selected_candidate_pair_id | VARCHAR                                                   | `transport.selectedCandidatePairId`                                                                                                                                                                     |
| raw_json                   | JSON                                                      | 正規化カラムに含まれない残りのフィールド。`codec` / `media-source` / `local-candidate` / `remote-candidate` / `peer-connection` / `data-channel` / `certificate` / `media-playout` 等のフィールドを含む |
| created_at                 | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                       | DuckDB へのバッチ INSERT 実行時刻。デバッグ用であり、時系列分析には `timestamp_ms` を使用する                                                                                                           |

### 正規化方針

- W3C 仕様で定義された `RTCStatsType` ごとの主要フィールドを正規化カラムに展開する
- 同一フィールド名が複数の type で使われている場合は、1 つのカラムに集約して保存する
- 使用頻度が低い・type 固有の・ブラウザ間で差分のあるフィールドは `raw_json` に退避する
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

- `src/webrtcStatsNormalizer.ts` を作成し、`RTCStatsReport` を受け取り、W3C 仕様に基づいて `webrtc_stats` テーブルのカラムにマッピングする
- `stats_type` ごとに必要なフィールドを抽出し、存在しないカラムは `NULL` とする
- 正規化カラムに含まれないフィールドはすべて `raw_json` に JSON として格納する
- ブラウザ固有の拡張フィールドも `raw_json` に格納する

### 容量上限・ローテーション方針

- 第 1 段階では以下を採用する
  - 1 接続あたり 10,000 件を上限とし、超過分を 10 件ごとに 1 件の比率でサンプリングして保持する
  - 例: 20,000 件の場合、古い 10,000 件を 1/10 サンプリングして 1,000 件に減らし、新しい 10,000 件は全件保持する
  - サンプリングは `webrtc_stats.id` または `timestamp_ms` に基づいて行う
  - 具体的な閾値・サンプリング方式は実装時に測定し、必要に応じて調整する
- `/sessions` ページでの生データテーブル表示はページネーションを行い、デフォルトでは最新 100 件を表示する

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
- 失敗したバッチは捨てず、キューの先頭に戻して次回のバッチ挿入時に再試行する
- 最大 3 回まで再試行し、それでも失敗した場合は console warn を出力して該当バッチを破棄する

### 識別子未確定時の扱い

- `sessionId` / `connectionId` が未確定の場合は、stats をメモリ上の一時バッファに保持する
- `connection.created` notify 受信後に `sessionId` / `connectionId` が確定したら、一時バッファの stats に識別子を設定して `webrtc_stats` テーブルへまとめて INSERT する
- 識別子確定後は通常通りバッチ INSERT する
- 切断時には一時バッファ・通常バッファの両方をフラッシュする

## 完了条件

- 1 秒間隔で取得した `RTCStats` が DuckDB に保存されること
- `webrtc_stats` テーブルから `sessionId` / `connectionId` / `channelId` / `stats_type` / `kind` / `ssrc` で絞り込み・集計できること
- ブラウザを閉じて再度開いても、過去の stats が読み出せること
- 主要な stats フィールドが正規化カラムとして保存され、DuckDB の集計関数で利用できること
- 高頻度な stats 取得中も UI がカクつかないこと
- `CHANGES.md` に `- [ADD] WebRTC stats を DuckDB-Wasm + OPFS に永続化する` を記載すること

## 解決方法

1. `webrtc_stats` テーブルのスキーマを定義する
   - `CREATE SEQUENCE IF NOT EXISTS seq_webrtc_stats_id START 1` を作成し、`id` カラムの `DEFAULT nextval(...)` と組み合わせる
2. `src/webrtcStatsNormalizer.ts` を作成し、`RTCStats` の正規化関数を実装する
3. `src/app/actions.ts` の `setStatsReportInternal()` で正規化関数を呼び出し、永続化フックを `void` で非同期に投げ、`.catch()` でエラーを捕捉する
4. `src/sessionDatabase.ts` に stats 用のバッチ挿入機構を実装する
   - 一時バッファ（識別子未確定用）と通常バッファ（識別子確定後用）を持つ
   - 識別子確定後は一時バッファの内容を通常バッファに移して即座にフラッシュする
5. `src/app/actions.ts` の `handleConnectionCreatedNotify()` で識別子確定後、`sessionDatabase` に一時バッファのフラッシュを指示する
6. 切断時に一時バッファ・通常バッファの残りの stats をフラッシュする
7. Playwright E2E テストで stats の保存・読み出しを検証する

## テスト方針

- Vitest 単体テスト: `webrtcStatsNormalizer.ts` の正規化関数を対象とする。ブラウザから取得した実際の `RTCStats` オブジェクトに近いテスト fixture データを使用する（モックやスタブは使用しない）
- Playwright E2E テスト:
  - 接続中に `webrtc_stats` テーブルへ stats が保存されること
  - `sessionId` / `connectionId` / `stats_type` / `kind` で絞り込めること
  - ブラウザリロード後も stats が読み出せること
  - Sora 接続が必要なテストでは既存テストと同様に `process.env.E2E_TEST_SORA_SIGNALING_URL` / `E2E_TEST_SORA_CHANNEL_ID_PREFIX` / `E2E_TEST_ACCESS_TOKEN` を直接使用し、未設定の場合は `test.skip()` する

## リスクと対策

| リスク                                                       | 対策                                                           |
| ------------------------------------------------------------ | -------------------------------------------------------------- |
| 高頻度な stats 書き込みで UI スレッドがブロックする          | `AsyncDuckDB` の内部 Worker を使用し、バッチ挿入を行う         |
| `webrtc_stats` テーブルが肥大化して OPFS quota を圧迫する    | 接続ごと・期間ごとの容量上限・ローテーション方針を別途検討する |
| ブラウザ間で `RTCStats` フィールドに差分があり正規化が漏れる | `raw_json` に退避し、必要に応じてカラムを追加する              |
| `ssrc` 等の符号なし整数がオーバーフローする                  | `UBIGINT` 等の適切な型を使用する                               |

## 未解決課題

- バッチ挿入のバッファサイズ・間隔の最適値は実装時に測定して調整する（初期値は 1000 件 / 5 秒）

## 関連 issue

- #0065: DuckDB-Wasm + OPFS で過去セッションの記録を永続化する（親 issue）
- #0066: preact-iso を導入して `/sessions` ページへのルーティング基盤を追加する
- #0067: DuckDB-Wasm + OPFS でセッション・接続メタデータを永続化する
- #0069: DownloadReportButton と DownloadReport 関連機能を削除する
