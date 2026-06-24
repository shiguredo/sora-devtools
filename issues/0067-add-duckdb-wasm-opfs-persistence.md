# DuckDB-Wasm + OPFS でセッション・接続メタデータを永続化する

- Priority: Medium
- Created: 2026-06-24
- Completed: YYYY-MM-DD
- Model: GLM-5.2
- Branch: feature/add-duckdb-wasm-opfs-persistence
- Polished: 2026-06-24

## 目的

ブラウザを閉じても過去のセッション・接続情報が失われないよう、DuckDB-Wasm + OPFS でメタデータを永続化する。まずは session / connection のメタデータを保存対象とし、timeline / notify / signaling / log は後続で拡張する。

## 優先度根拠

Medium。過去セッションを識別・検索するための基盤であり、stats 永続化の前提となる。

## 現状

- セッション識別子は `connection.created` notify 受信後に `sessionId` / `connectionId` / `soraClientId` として確定する
- 切断時に `disconnect` コールバック内で `sora` / `sessionId` / `connectionId` / `soraClientId` / `soraTurnUrl` がクリアされる
- 既存の OPFS 永続化は `src/opfs.ts` の signaling URL 設定保存のみ
- `src/app/actions.ts` の `handleConnectionCreatedNotify()` で識別子が設定される
- `src/app/actions.ts` の `reconnectSoraImpl()` は `disconnect` コールバック内の `void reconnectSora()` からのみ呼ばれる

## 設計方針

### DuckDB-Wasm 初期化

- npm パッケージ `@duckdb/duckdb-wasm` を使用する。バージョンは stable 版を明示的に指定する
- `AsyncDuckDB` は内部に Worker を作成して動作するため、メインスレッドをブロックしない
- Vite では `selectBundle()` に必要な WASM / Worker ファイルを `?url` import で提供する
  - `@duckdb/duckdb-wasm@1.32.0` の `dist` ディレクトリから `duckdb-eh.wasm` / `duckdb-browser-eh.worker.js`（Extended Hardware バンドル）を `?url` import する
  - 具体例:

    ```ts
    import * as duckdb from "@duckdb/duckdb-wasm";
    import duckdbWasmEh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
    import duckdbWorkerEh from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";

    const bundle = await duckdb.selectBundle({
      eh: {
        mainModule: duckdbWasmEh,
        mainWorker: duckdbWorkerEh,
      },
    });
    const worker = new Worker(bundle.mainWorker);
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule);
    await db.open({ path: "opfs://sora-devtools-sessions.db" });
    ```

  - `vite.config.ts` では `build.assetsInlineLimit: 0` を設定し、WASM / Worker ファイルが base64 インライン化されないようにする。ただし `assetsInlineLimit: 0` は全アセットの base64 インライン化を無効にするため、DuckDB-Wasm の WASM / Worker ファイルのみを対象化する方法（例: `rolldownOptions.output.assetFileNames` での条件分け等）を検討し、全局変更の影響を最小化すること

- OPFS 上のデータベースファイルパスは既存の `signaling-url-candidates.json` と衝突しないよう、`opfs://sora-devtools-sessions.db` を使用する
- 高頻度な stats 書き込みを考慮し、`SET checkpoint_threshold` はデフォルト値を維持する。正常終了時の `close()` または必要に応じた明示的な `CHECKPOINT` で永続化を確実にする
- 初期化失敗時は、既存の接続・デバッグ機能が動作し続けるようにフォールバックする
  - `sessionDatabase` の各メソッドは nullable な接続を許容し、未初期化時は no-op または console warn とする（ログメッセージは英語とする）
  - OPFS 非対応ブラウザでは完全に永続化しない

### `sessionDatabase` のモジュール構成

- `src/sessionDatabase.ts` はモジュールレベルシングルトンとする。`App.tsx` で `createSessionDatabase()` を呼び出して初期化し、`actions.ts` の永続化フックはモジュールレベルの `sessionDatabase` インスタンスのメソッドを呼ぶ
- 主要な API:
  - `createSessionDatabase()`: `AsyncDuckDB` を初期化し、テーブルを作成する
  - `insertSession(channelId, role, metadata): Promise<number>`: `sessions` 仮レコードを INSERT し、`RETURNING id` で自動採番 `id` を返す
  - `updateSessionIdAndConnectionId(id, sessionId, connectionId): Promise<void>`: `connection.created` 受信時に `session_id` と `connection_id` を UPDATE する
  - `insertConnection(sessionDbId, sessionId, connectionId, soraClientId, channelId, signalingUrl): Promise<void>`: `connections` レコードを INSERT する
  - `updateSessionEndedAt(id): Promise<void>`: `sessions.ended_at` を更新する
  - `updateConnectionEndedAt(connectionId): Promise<void>`: `connections.ended_at` を更新する
  - `close(): Promise<void>`: DuckDB-Wasm の接続を close する

### OPFS の特性

- OPFS は同一オリジン・同一ブラウザプロファイル内のアプリケーションのみアクセスできる。metadata / signaling URL などの接続記録を外部サーバーに送信せずに保存できる
- credentials や API キーなどの高機密情報は永続化対象から除外する。`metadata` に含まれる場合は保存前にマスクする
  - マスク対象キー名: `api_key` / `apikey` / `apiKey` / `x_api_key` / `x-api-key` / `authorization` / `auth` / `token` / `access_token` / `refresh_token` / `password` / `secret` / `credential` / `credentials` 等（大文字小文字・スネークケース・ケバブケース・キャメルケースを考慮）
  - 値の型が文字列の場合は `"***"` に置換、オブジェクトの場合は `{"masked": true}` に置換する
  - ネストしたオブジェクト内のキーも再帰的に走査する
  - マスク処理は `maskSensitiveMetadata(metadata: unknown): Json` の純粋関数として実装し、`src/sessionDatabase.ts` に配置する
  - 単体テストで各種キー名・ネストケースを検証する。PBT (fast-check) による性質検証（任意のネスト深さの metadata について機密キーが全てマスクされる）を適用すること
- ただし、ブラウザの開発者ツールや同一オリジンで動作する悪意のあるスクリプトからは読み出せるため、絶対的な隔離ではない
- UI 上では「データは端末内の OPFS に保存され、外部サーバーには送信されない」ことを明示する

### テーブル構成

`sessions` テーブル:

| カラム        | 型                                                     | 説明                                                                              |
| ------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| id            | INTEGER PRIMARY KEY DEFAULT nextval('seq_sessions_id') | 自動採番                                                                          |
| session_id    | VARCHAR                                                | Sora の session_id（`connection.created` 受信後に UPDATE）                        |
| connection_id | VARCHAR                                                | Sora の connection_id（`connection.created` 受信後に UPDATE、NULL 許容）          |
| channel_id    | VARCHAR                                                | channelId                                                                         |
| role          | VARCHAR                                                | role（sendonly / recvonly / sendrecv 等）                                         |
| started_at    | TIMESTAMP                                              | `connectSora()` 呼び出し時刻。`channel_id` / `role` / `metadata` も同時に保存する |
| ended_at      | TIMESTAMP                                              | 切断時刻（切断時に更新）                                                          |
| metadata      | JSON                                                   | 接続時の metadata（文字列を JSON パースして保存、無効な場合は NULL）              |
| created_at    | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                    | レコード作成時刻                                                                  |

`connections` テーブル:

| カラム         | 型                                                        | 説明                                                                                                                                           |
| -------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| id             | INTEGER PRIMARY KEY DEFAULT nextval('seq_connections_id') | 自動採番                                                                                                                                       |
| session_db_id  | INTEGER                                                   | `sessions.id` への参照（外部キー）。同一 `session_id` で複数レコードが存在する場合の曖昧性を解消する                                           |
| session_id     | VARCHAR                                                   | Sora の session_id                                                                                                                             |
| connection_id  | VARCHAR                                                   | Sora の connection_id                                                                                                                          |
| sora_client_id | VARCHAR                                                   | Sora の client_id                                                                                                                              |
| channel_id     | VARCHAR                                                   | channelId                                                                                                                                      |
| signaling_url  | VARCHAR                                                   | 接続先 signaling URL（`soraConnection.connectedSignalingUrl`）。空文字列 `""` と `NULL` の両方を扱う。空文字列は `NULL` に変換して保存すること |
| started_at     | TIMESTAMP                                                 | `connection.created` 受信時刻                                                                                                                  |
| ended_at       | TIMESTAMP                                                 | 切断時刻                                                                                                                                       |
| created_at     | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                       | レコード作成時刻                                                                                                                               |

### 永続化フロー

1. 接続試行開始時（`connectSora()` / `reconnectSoraImpl()` 呼び出し時）:
   - `sessions` テーブルに `session_id` / `connection_id` を `NULL` とした仮レコードを INSERT する。INSERT は `INSERT ... RETURNING id` で自動採番 `id` を取得する
   - `started_at` / `channel_id` / `role` / `metadata` は signals から取得した値を保存する
   - `metadata` は `parseMetadata()` で JSON パースし、`maskSensitiveMetadata()` で機密キーをマスクしてから保存する
   - `connectSora()` の場合: INSERT は検知ポイント 1（`actions.ts` の既存接続あり時の `await soraValue.disconnect()` 直後）の前に行う必要がある。`metadata` は `prepareSignalingConnection()` の戻り値から取得するため、`prepareSignalingConnection()` を先に呼ぶか、signals から直接 `parseMetadata()` で取得するかの設計判断が必要
   - `reconnectSoraImpl()` の場合: INSERT は `createMediaStream()` の前に行うこと（`createMediaStream()` 失敗時に `sessions.ended_at` を更新するため）。`prepareSignalingConnection()` の後であること（`metadata` 取得のため）
   - INSERT 戻り値の `id` は `connectSora()` / `reconnectSoraImpl()` の**ローカル変数**で保持し、`setSoraCallbacks()` のクロージャにキャプチャする。モジュールローカル変数には保持しない（`connectSora()` が非同期で並走した際に上書きされるのを防ぐため）。`createSoraConnectionByRole()` / `setSoraCallbacks()` のシグネチャに `sessions.id` を追加し、受け渡しパスを確保すること

2. `connection.created` notify 受信時:
   - `handleConnectionCreatedNotify()` 内でクロージャにキャプチャした `sessions.id` をキーに `session_id` と `connection_id` を UPDATE する
   - `connections` レコードを `session_db_id` / `session_id` / `connection_id` / `sora_client_id` / `signaling_url` 付きで INSERT する

3. 切断時:
   - `disconnect` コールバックの `isCurrent()` ガードの**前**（`signals.setTimelineMessage(...)` の直後）に永続化フックを配置する。これにより旧接続の disconnect でも `ended_at` 更新が実行される
   - `sessions.ended_at` はクロージャにキャプチャした `sessions.id`（主キー）で検索して更新する。`sessions.connection_id` は `attemptReconnection()` のリトライで上書きされるため、旧接続のレコード特定には使えない
   - `connections.ended_at` は `soraConnection.connectionId` で `connections.connection_id` を検索して更新する
   - `soraConnection.connectionId` が `null`（`connection.created` 受信前）の場合は `connections` レコードが未作成のため `connections.ended_at` の更新は不要。`sessions.ended_at` のみ `sessions.id`（クロージャ）で更新する
   - SDK は `disconnect` コールバックの戻り値 Promise を待たないため、永続化フックは識別子を同期的にキャプチャしてから `void` で非同期に投げ、`.catch()` でエラーを捕捉する（#0068 の stats 永続化と同じパターン）

4. 再接続時:
   - `reconnectSoraImpl()` は `disconnect` コールバック内の `void reconnectSora()` からのみ呼ばれる。前接続の `ended_at` は `disconnect` コールバック内の永続化フックで更新済みであるため、`reconnectSoraImpl()` 内での前接続 `ended_at` 更新は不要とする
   - 同じ `session_id` が返された場合でも、新しい接続試行には新しい `sessions` レコードを作成する
   - `connections` レコードは `connection_id` ごとに新規作成する

5. 接続失敗・キャンセル時:
   - `connectSora()` 内の `abortIfCancelled()`（検知ポイント 2 / 3 / 4 / 5）および `try/catch` 例外ハンドラで、ローカル変数の `sessions.id` を使って `sessions.ended_at` を更新する。`connection.created` 受信済みの場合は `connections.ended_at` も更新する
   - 検知ポイント 1（`actions.ts` の既存接続あり時の `await soraValue.disconnect()` 直後）は `abortIfCancelled()` を使わず直接 `return` するため、個別に `sessions.ended_at` を更新すること
   - `reconnectSoraImpl()` には `abortIfCancelled()` は存在しない。以下の全経路でローカル変数の `sessions.id` を使って `sessions.ended_at` を更新すること。`connection.created` 受信済みの場合は `connections.ended_at` も更新する:
     - `createMediaStream()` 失敗経路
     - `attemptReconnection()` 内の `signals.reconnecting.value` チェックでのキャンセル経路
     - `attemptReconnection()` 内の `catch` ブロック（`connect()` 失敗時）
     - 全リトライ枯渇時（`soraConnection === undefined`）
   - `connection.created` 前に終了した場合、`session_id` は `NULL` のまま残る。これは「失敗またはキャンセルされた接続試行」として扱う

### マイグレーション機構

- 第 1 段階では `CREATE TABLE IF NOT EXISTS` のみを使用する
- 第 2 段階でテーブル追加・スキーマ変更が必要になった場合は、別 issue でマイグレーション戦略を検討する

## 完了条件

- DuckDB-Wasm + OPFS でデータベースファイルが初期化できること
- 接続確立時に `sessions` / `connections` レコードが保存されること
- 切断時に `sessions.ended_at` / `connections.ended_at` が更新されること
- ブラウザを閉じて再度開いても、過去の `sessions` / `connections` レコードが読み出せること
- 再接続時に新しい `connection_id` で `connections` レコードが作成されること
- DuckDB-Wasm 初期化失敗・OPFS アクセス不可時も既存機能が動作し続けること
- `build` / `test` / `check` が成功すること
- `CHANGES.md` の `## develop` に `- [ADD] DuckDB-Wasm + OPFS でセッション・接続メタデータを永続化する` を記載すること

## 解決方法

1. `package.json` の `dependencies` に `@duckdb/duckdb-wasm` を追加する
   - `vp install @duckdb/duckdb-wasm` で `node_modules` を同期し、その後 `package.json` のバージョン指定を `^x.y.z` から `x.y.z` 形式に揃える
   - `@duckdb/duckdb-wasm@1.32.0` は `apache-arrow: ^17.0.0` を direct dependency として持つ。pnpm が自動的に `apache-arrow` をインストールするため、基本的に `.pnpmfile.cjs` への追記は不要。問題が発生した場合のみ `packageExtensions` で補完する
   - `apache-arrow` は transitive dependency としてインストールされるが、`manualChunks` で独立 chunk に分離するため `package.json` に直接依存としてピン留めすることを検討する
   - 現状の最新版 (`1.32.0`) は十分にリリースから時間が経っており `minimumReleaseAge` の制約に引っかからない
2. `vite.config.ts` で DuckDB-Wasm の WASM / Worker ファイルを `?url` import できるように設定する
   - `build.assetsInlineLimit: 0` を設定し、WASM / Worker ファイルが base64 インライン化されないようにする。DuckDB-Wasm の WASM / Worker ファイルのみを対象化する方法（例: `rolldownOptions.output.assetFileNames` での条件分け等）を検討し、全局変更の影響を最小化すること
3. `vite.config.ts` の `manualChunks` に `@duckdb/duckdb-wasm` / `apache-arrow` を追加し、初期 bundle に含まれないよう独立 chunk に分離すること
4. `src/sessionDatabase.ts` を作成し、DuckDB-Wasm + OPFS の初期化とクエリ実行 API を実装する
   - `App.tsx` マウント時に非同期で `createSessionDatabase()` を呼び出す
   - `AsyncDuckDB` を `selectBundle()` で初期化する
   - `opfs://sora-devtools-sessions.db` に接続する
   - `CREATE SEQUENCE IF NOT EXISTS` で `seq_sessions_id` / `seq_connections_id` を作成する（`seq_webrtc_stats_id` は #0068 で作成する）
   - `CREATE TABLE IF NOT EXISTS` で `sessions` / `connections` テーブルを作成する（`sessions.connection_id` / `connections.session_db_id` カラムを含む）
   - 初期化失敗時は console warn を出力し、以降の永続化フックは no-op とする
   - `close()` メソッドを提供し、`beforeunload` 時に DuckDB-Wasm の接続を close する
5. `src/sessionDatabase.ts` に `maskSensitiveMetadata()` を実装する
6. `src/app/actions.ts` の `connectSora()` / `handleConnectionCreatedNotify()` / `disconnect` コールバックで永続化フックを呼び出す
   - `disconnect` コールバックの `isCurrent()` ガードの前にフックを配置する
   - 永続化フックは識別子を同期的にキャプチャしてから `void` で非同期に投げ、`.catch()` でエラーを捕捉する
7. `src/app/actions.ts` の `connectSora()` / `reconnectSoraImpl()` 内の各失敗・キャンセル経路で `sessions.ended_at`（および `connection.created` 受信済みの場合は `connections.ended_at`）を更新する
   - 検知ポイント 1 での個別の `sessions.ended_at` 更新を含む
   - `reconnectSoraImpl()` の `createMediaStream()` 失敗、`attemptReconnection()` のキャンセル / `catch` / 全リトライ枯渇の各経路を含む
8. `createSoraConnectionByRole()` / `setSoraCallbacks()` のシグネチャに `sessions.id` を追加し、受け渡しパスを確保する
9. #0066 で `App.tsx` に設定した `beforeunload` の `handleBeforeUnload` に `void sessionDatabase.close()` を追加する。`beforeunload` 内での非同期完了は保証できないため、コメントで明記すること。定期的な `CHECKPOINT`（例: 1 分ごと）および切断時の `CHECKPOINT` で永続化を補完する
10. Playwright E2E テストで OPFS 読み書きを検証する
    - E2E テストでは OPFS へのアクセスを `page.evaluate()` 経由で `navigator.storage.getDirectory()` を呼んで検証する
    - 各テスト終了時に DuckDB-Wasm の接続を close し、OPFS 上の `sora-devtools-sessions.db` を削除するクリーンアップヘルパーを実装する

## テスト方針

- Vitest 単体テスト: `sessionDatabase` の SQL 組み立てやデータ変換関数、`maskSensitiveMetadata()` を対象とする（DuckDB-Wasm 初期化はブラウザ API に依存しない純粋関数に限る）。`maskSensitiveMetadata()` には PBT (fast-check) による性質検証を適用すること
- Playwright E2E テスト:
  - DuckDB-Wasm + OPFS でデータベースが初期化されること
  - 接続確立後に `sessions` / `connections` レコードが保存されること
  - 切断後に `ended_at` が更新されること
  - ブラウザリロード後もデータが読み出せること
  - Sora 接続が必要なテストでは #0063 で導入される `requireSoraConnectionEnv()` を使用し、`E2E_TEST_SORA_SIGNALING_URL` 未設定時は `test.skip()` で skip する。#0063 / #0037 が未完了の場合は `process.env` 直接読み取り等のフォールバックを検討すること
  - #0062（三項演算子禁止）がマージ済みの場合は新規追加コードで三項演算子を使用しないこと

## リスクと対策

| リスク                                                   | 対策                                                                                                                                                                                    |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DuckDB-Wasm 初期化失敗で既存機能が動かなくなる           | 初期化を非同期で行い、失敗時は永続化をスキップして既存機能を継続する                                                                                                                    |
| OPFS quota 不足で書き込み失敗                            | エラーをキャッチし、UI 上でユーザーに通知する                                                                                                                                           |
| 複数タブから同時に OPFS の DB ファイルに書き込む         | DuckDB-Wasm は単一プロセスを前提とし、複数タブでの同時書き込みはサポート外とする。UI 上で「複数タブで同時に開くとデータ破損のリスクがある」と警告する                                   |
| credentials / API キーが `metadata` に含まれる           | 保存前にマスクする。`maskSensitiveMetadata()` で単体テスト + PBT で検証する                                                                                                             |
| OPFS 上の DB ファイルが破損して開けなくなる              | 初期化時に開けない場合は DB ファイルを削除して再作成するフォールバックを実装する。正常終了時は `beforeunload` またはページ終了処理で close し、切断時・定期的に `CHECKPOINT` を実行する |
| `beforeunload` 内で `close()` の非同期完了が保証されない | `beforeunload` 内での非同期完了は保証できないことをコメントで明記する。定期的な `CHECKPOINT` で永続化を補完する                                                                         |

## 未解決課題

- 複数タブ同時接続時の OPFS 書き込み競合の扱い（実装時に DuckDB-Wasm の concurrency 制限を確認）
  - DuckDB は単一プロセスでの読み書きを前提としており、ブラウザの各タブは別プロセスとして扱われるため、同一 OPFS ファイルへの同時書き込みは公式にサポートされていない
  - 2 つ目以降のタブで `AsyncDuckDB.open()` または `INSERT` / `UPDATE` 時にどのようなエラーが発生するかは実装時に確認し、UI 上の警告文言とエラーハンドリングを確定する

## 関連 issue

- #0065: DuckDB-Wasm + OPFS で過去セッションの stats / メタデータを永続化し /sessions ページで確認できるようにする（親 issue）
- #0066: preact-iso を導入して `/sessions` ページへのルーティング基盤を追加する
- #0068: WebRTC stats を DuckDB-Wasm + OPFS に永続化する
- #0069: DownloadReportButton と DownloadReport 関連機能を削除する
- #0070: /sessions ページに過去セッション一覧・詳細・フィルタ UI を実装する
- #0063: Sora 接続が必要な E2E テストで環境変数未設定時に skip する仕組みを追加する（E2E テストが依存）
