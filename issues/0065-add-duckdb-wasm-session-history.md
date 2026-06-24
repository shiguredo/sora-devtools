# DuckDB-Wasm + OPFS で過去セッションの stats / メタデータを永続化し /sessions ページで確認できるようにする

- Priority: Medium
- Created: 2026-06-24
- Completed: YYYY-MM-DD
- Model: GLM-5.2
- Polished: 2026-06-24
- 本 issue はエピック。実装作業は #0066 / #0067 / #0068 / #0069 / #0070 で行うため作業ブランチは切らない

## 目的

現在、sora-devtools は 1 セッションでブラウザを閉じると、webrtc stats / signaling / notify / timeline / log などの接続記録がすべて失われる。過去のセッションを振り返り、統計情報や問題調査に活用できるようにするため、これらの記録をブラウザ内に永続化し、専用ページで確認できるようにする。

## 優先度根拠

Medium。sora-devtools は開発・検証用ツールであり、過去の接続状況を振り返る機能はデバッグ効率を大きく向上させる。ただし、接続機能そのものを阻害しない範囲で段階的に導入する。

## 現状

- WebRTC stats は `src/app/actions.ts` の `setStatsReportInternal()` / `startStatsReportTimer()` で 1 秒間隔に取得され、`signals.statsReport` / `signals.prevStatsReport` に保持される
- signaling / notify / timeline / log / push は `src/app/actions.ts` の `setSoraCallbacks()` 内で SDK イベントを受け取り、それぞれの signal に append-only で保持される
- 既存の OPFS 永続化は `src/opfs.ts` の signaling URL 設定保存のみ
- 既存のエクスポート機能は `src/components/Header/DownloadReportButton.tsx` で現在のセッションを JSON ダウンロードするのみ
- `sessionId` / `connectionId` / `soraClientId` は `handleConnectionCreatedNotify()` で `connection.created` notify 受信後に確定する
- 切断時に `disconnect` コールバック内で `sora` / `sessionId` / `connectionId` / `soraClientId` / `soraTurnUrl` の識別子がクリアされる。ただし `timelineMessages` / `notifyMessages` / `signalingMessages` / `logMessages` / `pushMessages` は切断時にはクリアされず、ページリロード時の `resetState()` でのみクリアされる

## 技術選定

### DuckDB-Wasm を選ぶ理由

- 過去セッションの WebRTC stats をチャンネル・セッション・接続単位で集計・分析する必要がある
- 例: 同一 channelId での過去接続の平均ビットレート、パケットロス率の時系列変化、特定 connection_id の RTT 推移など
- 単なる JSON ファイル保存では、複数セッションにまたがる集計や時系列分析を都度 JavaScript で実装する必要があり、メンテナンスコストが高い
- IndexedDB などのキーバリューストアでは、複雑な集計クエリや window 関数を使った時系列分析が困難
- DuckDB-Wasm はブラウザ上で SQL 集計が可能であり、window 関数、`GROUP BY`、時系列集計などを利用できる
- OPFS と組み合わせることで、stats データをブラウザ内に永続化しつつ、DuckDB のクエリエンジンで高速に集計できる

### 代替案の検討

- **SQLite-Wasm (wa-sqlite / sql.js)**: SQLite もブラウザ上で SQL を実行できるが、OPFS サポートの成熟度・パフォーマンス・API の使い勝手で DuckDB-Wasm に差がある。DuckDB は分析系クエリ（window 関数・時系列集計）に特化しており、本用途（stats 集計）により適している
- **IndexedDB + カスタムインデックス + JS 集計**: 小規模データなら実現可能だが、数万件の stats 時系列データに対する集計クエリを JS で都度実装するメンテナンスコストが高い。DuckDB-Wasm 自体も新規依存でメンテナンスコストが発生するが、SQL による宣言的集計で実装コードを削減できる

### OPFS を選ぶ理由

- 永続化データは開発・検証用の接続記録であり、同一ユーザーの端末内に閉じていれば十分
- OPFS は同一オリジン・同一ブラウザプロファイル内のアプリケーションのみアクセスできるため、接続記録を外部サーバーに送信せずに保存できる
- ただし、ブラウザの開発者ツールや同一オリジンで動作する悪意のあるスクリプトからは読み出せるため、絶対的な隔離ではない

## 設計方針

### 全体アーキテクチャ

```
[Sessions] ──────▶ [src/sessionDatabase.ts] ──────▶ [DuckDB-Wasm AsyncDuckDB] ──────▶ [OPFS: sora-devtools-sessions.db]
                        ▲
                        │ 永続化フック
                   [DevTools]
```

- `src/sessionDatabase.ts` は DuckDB-Wasm の初期化、テーブル作成、クエリ実行、永続化フックを提供する
- DevTools ページは接続中のセッションで永続化フックを呼び出し、Sessions ページは DuckDB-Wasm にクエリを発行して結果を表示する
- OPFS 上のデータベースファイル名は `sora-devtools-sessions.db` とし、既存の `signaling-url-candidates.json` と衝突しないようにする

### 永続化対象（段階的導入）

第 1 段階（本 issue 群の対象）:

- `sessions` テーブル: 1 回の Sora 接続試行に紐づくセッション単位のメタデータ
- `connections` テーブル: `connection.created` notify 確定後の接続単位メタデータ
- `webrtc_stats` テーブル: 1 秒間隔で取得される RTCStats

第 2 段階（将来拡張）:

- `timeline_messages` テーブル
- `notify_messages` テーブル
- `signaling_messages` テーブル
- `log_messages` テーブル

第 1 段階で timeline / notify / signaling / log を除外する理由は、stats 永続化と UI の基盤を先に確立するためである。第 2 段階は別 issue で検討する。

### セッション識別子の扱い

- `sessions` テーブルは「接続試行単位」のレコードとする。`reconnectSoraImpl()` 開始時に 1 つの `sessions` 仮レコードを INSERT し、リトライ全体（`attemptReconnection()` の最大 10 回）で 1 試行として扱う。各リトライで `connections` レコードは個別に作成する
  - `connectSora()` または `reconnectSoraImpl()` 開始時に `session_id` を `NULL` とした仮レコードを `INSERT` する。`reconnectSoraImpl()` の場合は `createMediaStream()` の前に INSERT すること（`createMediaStream()` 失敗時に `sessions.ended_at` を更新するため）
  - INSERT 戻り値の自動採番 `id` は `connectSora()` / `reconnectSoraImpl()` の**ローカル変数**で保持し、`setSoraCallbacks()` のクロージャにキャプチャする。モジュールローカル変数には保持しない（`connectSora()` が非同期で並走した際に上書きされるのを防ぐため）。永続化フックにはこの `id` を引数として渡す
  - `sessions.id` を `createSoraConnectionByRole()` / `setSoraCallbacks()` / `setStatsReportInternal()` / `startStatsReportTimer()` のシグネチャに追加し、受け渡しパスを確保すること。#0067 / #0068 で対応すること
  - `connection.created` notify 受信後にクロージャにキャプチャした `id` をキーに `session_id` を `UPDATE` する（`channel_id` / `role` / `metadata` は `connectSora()` 開始時に既に保存されている）。#0067 で `sessions` テーブルに `connection_id` カラム（NULL 許容）を追加し、`connection.created` 受信時に UPDATE すること
  - 同じ `session_id` が返された場合でも、新しい接続試行では新しい `sessions` レコードを作成する
  - これにより、SDK の自動 reconnect と手動 reconnect の違いに依存せず、接続試行ごとの started_at / ended_at を正しく記録できる
- `connections` / `webrtc_stats` テーブルから `sessions` への外部キーは Sora の `session_id`（VARCHAR）だけでは同一 `session_id` で複数レコードが存在するため曖昧になる。#0067 / #0068 で `connections` / `webrtc_stats` テーブルに `session_db_id INTEGER`（`sessions.id` への参照）カラムを追加すること
- `connections` テーブルは `connection_id` ごとに 1 レコード作成する
  - `connection.created` notify 受信後に `INSERT` する
  - 再接続で新しい `connection_id` が発行された場合は新しい `connections` レコードを追加する

- 切断時の `ended_at` 更新:
  - `disconnect` コールバックの `isCurrent()` ガードの**前**（`signals.setTimelineMessage(...)` の直後）に永続化フックを配置する。これにより旧接続の disconnect でも `ended_at` 更新が実行される。#0067 でフックの配置位置を実装すること
  - 旧接続（`isCurrent() == false`）の `sessions.ended_at` 更新は、クロージャにキャプチャした `sessions.id`（主キー）で検索する。`sessions.connection_id` は `attemptReconnection()` のリトライで上書きされるため、旧接続のレコード特定には使えない。`connections.ended_at` 更新は `soraConnection.connectionId` で `connections.connection_id` を検索する。#0067 で実装すること
  - `soraConnection.connectionId` が `null`（`connection.created` 受信前）の場合は `connections` レコードが未作成のため `connections.ended_at` の更新は不要。`sessions.ended_at` のみ `sessions.id`（クロージャ）で更新する
  - SDK は `disconnect` コールバックの戻り値 Promise を待たないため、永続化フックは識別子を同期的にキャプチャしてから `void` で非同期に投げ、`.catch()` でエラーを捕捉する（#0068 の stats 永続化と同じパターン）

- `reconnectSoraImpl()` は `disconnect` コールバック内の `void reconnectSora()` からのみ呼ばれる。`disconnect` コールバックが識別子をクリアした後に `reconnectSoraImpl()` が実行されるため、`reconnectSoraImpl()` 内で signals から前接続の識別子は取得できない。前接続の `ended_at` は `disconnect` コールバック内の永続化フックで更新済みである。#0067 では `reconnectSoraImpl()` 内での前接続 `ended_at` 更新は不要とし、存在しない「手動 `reconnectSora()`」経路のための冗長な更新を記載しないこと

- 接続失敗・キャンセル時の `ended_at` 更新:
  - `connectSora()` 内の `abortIfCancelled()`（検知ポイント 2 / 3 / 4 / 5）および `try/catch` 例外ハンドラで、ローカル変数の `sessions.id` を使って `sessions.ended_at` を更新する。`connection.created` 受信済みの場合は `connections.ended_at` も更新する
  - 検知ポイント 1（`actions.ts` の既存接続あり時の `await soraValue.disconnect()` 直後）は `abortIfCancelled()` を使わず直接 `return` するため、個別に `sessions.ended_at` を更新すること。#0067 で対応すること
  - `reconnectSoraImpl()` には `abortIfCancelled()` は存在しない。`createMediaStream()` 失敗経路、`attemptReconnection()` 内の `signals.reconnecting.value` チェックでのキャンセル経路、`attemptReconnection()` 内の `catch` ブロック（`connect()` 失敗時）、全リトライ枯渇時（`soraConnection === undefined`）のいずれの経路でも、ローカル変数の `sessions.id` を使って `sessions.ended_at` を更新すること。`connection.created` 受信済みの場合は `connections.ended_at` も更新する。#0067 でこれらの経路での `ended_at` 更新を実装すること
  - ブラウザ終了等で `ended_at` が更新できなかった場合、`ended_at` が `NULL` のまま残る。これは「切断不確定または接続中の試行」として扱い、`/sessions` 一覧では `ended_at` の有無でフィルタできるようにする

### DuckDB-Wasm 初期化

- npm パッケージ `@duckdb/duckdb-wasm` を使用する。バージョンは stable 版を明示的に指定する
- 初期化の詳細（`selectBundle()` / `?url` import / `assetsInlineLimit` / checkpoint 方針 / フォールバック）は #0067 に委譲する
- 初期化失敗時は既存の接続・デバッグ機能が動作し続けるようにフォールバックする

### WebRTC stats の保存方針

- 主要な集計・検索フィールドを正規化カラムに展開し、残りを `raw_json` カラムに退避する（詳細は #0068）

### パフォーマンス・容量方針

- `sessions` / `connections` テーブルは件数制限を設けず、全履歴を保持する
- `webrtc_stats` テーブルの容量上限・サンプリング方針は #0068 で実装時に測定し調整する
- `/sessions` ページでの stats 表示は全件テーブル表示ではなく、集計・ページネーション・時系列サンプリングを組み合わせる
- 将来、保持期間・件数上限・ローテーション方針を別 issue で検討する

### セキュリティ・プライバシー方針

- OPFS のアクセス範囲については「OPFS を選ぶ理由」を参照。metadata / signaling URL / SDP / TURN URL などの接続記録を外部サーバーに送信せずに保存できる
- credentials や API キーなどの高機密情報は永続化対象から除外する。`metadata` に含まれる場合は保存前にマスクする。マスク処理の詳細（対象キー名・置換規則・実装配置先）は #0067 に委譲する
- `local-candidate` / `remote-candidate` 等に含まれる IP アドレス・ポートは接続記録として保存するが、UI 上では「接続記録に端末情報が含まれる」ことを明示する
- UI 上では「データは端末内の OPFS に保存され、外部サーバーには送信されない」ことを明示する
- `shiguredo-no-secrets` スキルの規約に従い、機密情報を含む接続記録の取り扱いを設計に含める

### UI/UX 方針

- Header の `DownloadReportButton` の位置に `Sessions` ボタンを配置する（#0066 / #0069 と連携）
- `/sessions` ページでは以下を提供する
  - 過去セッションの一覧（channelId / sessionId / connectionId / 接続時刻 / 切断時刻 / 状態）
  - セッション詳細（connection メタデータ、webrtc stats 集計・時系列グラフ）
  - クエリストリングによる絞り込み（`sessionId` / `connectionId` / `channelId` / `from` / `to`）
- `/sessions` ページのルーティング基盤は #0066 で導入する。#0066 では仮ページのみを作成し、実際の UI（一覧・詳細・フィルタ・ページネーション・時系列サンプリング）は #0070 で実装する

### 横断的設計事項

複数の子 issue にまたがる設計事項を以下に整理する。各子 issue の実装時にこれらの制約を満たすこと。

#### `beforeunload` での実行順序とリスナー配置

- #0066 で `DevTools.tsx` の cleanup から `disconnectSora()` を削除し、`beforeunload` イベントリスナーに移す
- #0067 は同じ `beforeunload` ハンドラに `void sessionDatabase.close()` を追加する
- `beforeunload` 内での非同期完了は保証できないため、`disconnectSora()` と `sessionDatabase.close()` の実行順序を厳密に保証することはできない。`ended_at` が NULL のまま残るレコードは「切断不確定」として扱う（セッション識別子の扱いで既述）。#0067 では `close()` を `disconnectSora()` の後に呼ぶようコード上で順序を示すが、保証ではないことをコメントで明記すること
- **`beforeunload` リスナーと `setInitialParameter()` / `resetState()` は `DevTools.tsx` ではなく `App.tsx`（SPA ナビゲーションでアンマウントしない階層）に配置すること**。preact-iso のルーティングで `/sessions` に遷移すると `DevTools` がアンマウントされるため、`DevTools.tsx` に `beforeunload` リスナーを登録すると `/sessions` ページからブラウザを閉じた際に `disconnectSora()` / `sessionDatabase.close()` が呼ばれなくなる。また `DevTools` 再マウント時の `setInitialParameter()` → `resetState()` が生きた Sora 接続の signal 参照を破棄し、ゾンビ化させる。#0066 で `setInitialParameter()` / `resetState()` と `beforeunload` リスナーを `App.tsx` レベルに移行すること

#### `assetsInlineLimit: 0` の全局影響

- #0067 で `vite.config.ts` に `build.assetsInlineLimit: 0` を設定するが、これは DuckDB-Wasm の WASM / Worker ファイルだけでなく全アセットの base64 インライン化を無効にする
- 現在 `vite.config.ts` に `assetsInlineLimit` は未設定（デフォルト 4096 bytes）。小さなアセットが個別ファイルになることで HTTP リクエストが増加する可能性がある
- #0067 で DuckDB-Wasm の WASM / Worker ファイルのみを対象化する方法（例: `rolldownOptions.output.assetFileNames` での条件分け等）を検討し、全局変更の影響を最小化すること

#### `manualChunks` への DuckDB 追加

- `vite.config.ts` の `manualChunks` に `@duckdb/duckdb-wasm` / `apache-arrow` を追加し、初期 bundle に含まれないよう独立 chunk に分離すること。#0067 で対応すること
- #0066 で `preact-iso` を `manualChunks` に追加する際、`preact` との誤マッチ問題（`moduleId.includes("node_modules/preact")` が `node_modules/preact-iso` に一致する）に注意すること。#0058 が先にマージされればこの問題は解決済みとなるため、#0058 の実施状況を確認すること

#### `preact-iso` の peer dependency

- `preact-iso@2.12.0` の peerDependencies は `{ preact: '>=10', 'preact-render-to-string': '>=6.4.0' }` である。プロジェクトに `preact-render-to-string` は未導入のため、#0066 で pnpm が自動インストールするか確認し、必要に応じて `package.json` にピン留めすること

#### `connectedSignalingUrl` の空文字列初期化

- sora-js-sdk の `connectedSignalingUrl` は `string` 型（`string | null` ではない）で、初期値は空文字列 `""` である。#0067 の `connections.signaling_url` では空文字列と `NULL` の両方を扱うこと

#### E2E テストの URL パス

- 既存 E2E テストは `http://localhost:3333/devtools/` に遷移する。#0066 で `/` を DevTools とするルーティングを導入する際、`/devtools/` へのフォールバックまたは既存テストの URL 更新を検討すること

#### #0062（三項演算子禁止）との整合性

- #0062 がマージ済みの場合、新規追加コードで三項演算子を使用しないこと。未マージの場合は `no-ternary` が `off` のため影響ない。#0066 / #0067 / #0068 / #0069 / #0070 の実装時に確認すること

#### #0066 と #0069 の実施順序

- #0066 は `DownloadReportButton` の位置に `SessionsButton` を配置する。#0069 は `DownloadReportButton` を削除する。#0069 が先にマージされれば #0066 は空いた位置に `SessionsButton` を配置できる。実施順序は #0069 → #0066 を推奨するが、同時実施も可能

#### #0063 / #0037 への依存

- #0067 / #0068 の E2E テストは #0063 で導入される `requireSoraConnectionEnv()` を前提とする。#0063 は #0037（Page Object Model）に依存する。両 issue が未完了の場合、E2E テストの実装がブロックされるため、#0063 / #0037 の完了を前提とするか、フォールバック（`process.env` 直接読み取り等）を検討すること

## 完了条件

- 0066 / 0067 / 0068 / 0069 / 0070 の各子 issue が完了していること
- `/sessions` ページで過去セッションの一覧が表示でき、各セッションの詳細で stats を確認できること
- ブラウザを閉じて再度開いても、過去のセッション記録が読み出せること
- 再接続時や同じ channelId での複数接続が正しく区別されて保存されること
- DuckDB-Wasm 初期化失敗・OPFS アクセス不可時でも、既存の接続・デバッグ機能が動作し続けること
- `metadata` 内の機密情報がマスクされて保存されること
- 子 issue の各 `build` / `test` / `check` が成功すること（エピック自身はコード変更を伴わないため、エピック単独での `build` / `test` / `check` は不要）
- 子 issue (#0066 / #0067 / #0068 / #0069 / #0070) の `CHANGES.md` エントリで本エピックの変更履歴を代弁する（エピック独自のエントリは不要）

## 解決方法

1. `preact-iso` を導入し、`src/main.tsx` / `src/App.tsx` をルーティング対応に変更する（詳細は #0066）
2. DuckDB-Wasm + OPFS の初期化処理を `src/sessionDatabase.ts` に実装する（詳細は #0067）
3. `src/app/actions.ts` / `src/app/signals.ts` のメッセージ追加・stats 更新箇所に永続化フックを追加する（詳細は #0067 / #0068）
4. `src/routes/Sessions.tsx` と `src/components/Sessions/*` を作成し、一覧・詳細・フィルタ UI を実装する（#0070 で実装。#0066 で作成する仮ページとは別物）
5. WebRTC stats 用の正規化スキーマを定義し、主要カラムを `webrtc_stats` テーブルに保存する（詳細は #0068）
6. `vite.config.ts` / `package.json` で新規外部依存に関する設定を行う（詳細は #0066 / #0067）
7. Playwright E2E テストで DuckDB-Wasm + OPFS の読み書きを検証する（詳細は各子 issue のテスト方針）

## テスト方針

- Vitest 単体テスト: `RTCStats` の正規化関数、`sessionDatabase` のクエリビルダー、`maskSensitiveMetadata()` など、ブラウザ API に依存しない純粋関数を対象とする。`maskSensitiveMetadata()` には PBT (fast-check) による性質検証（任意のネスト深さの metadata について機密キーが全てマスクされる）を適用すること
- Playwright E2E テスト: DuckDB-Wasm + OPFS の初期化、接続時の `sessions` / `connections` レコード作成、切断時の `ended_at` 更新、stats の保存と読み出しを検証する
- E2E テストでは OPFS へのアクセスを `navigator.storage.getDirectory()` 経由で検証する
- E2E テスト間で OPFS 内のデータが残らないよう、各テスト終了時に DuckDB-Wasm の接続を close し、OPFS 上の `sora-devtools-sessions.db` を削除する。クリーンアップヘルパーの実装箇所は #0067 で対応すること

## リスクと対策

| リスク                                                           | 対策                                                                                                                                                                  |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 複数タブから同時に OPFS の DB ファイルに書き込む                 | DuckDB-Wasm は単一プロセスを前提とし、複数タブでの同時書き込みはサポート外とする。UI 上で「複数タブで同時に開くとデータ破損のリスクがある」と警告する（詳細は #0067） |
| DevTools アンマウント/リマウントで生きた Sora 接続がゾンビ化する | `setInitialParameter()` / `resetState()` と `beforeunload` リスナーを `App.tsx` レベルに移行する（横断的設計事項で既述、#0066 で対応）                                |

## 関連 issue

- #0066: preact-iso を導入して `/sessions` ページへのルーティング基盤を追加する
- #0067: DuckDB-Wasm + OPFS でセッション・接続メタデータを永続化する
- #0068: WebRTC stats を DuckDB-Wasm + OPFS に永続化する
- #0069: DownloadReportButton と DownloadReport 関連機能を削除する
- #0070: /sessions ページに過去セッション一覧・詳細・フィルタ UI を実装する
- #0063: Sora 接続が必要な E2E テストで環境変数未設定時に skip する仕組みを追加する（#0067 / #0068 / #0070 の E2E テストが依存）
- #0058: `vite.config.ts` の `manualChunks` で `moduleId.includes()` の誤マッチを防ぐ（#0066 の `preact-iso` 追加と関連）
