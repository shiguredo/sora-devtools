# DuckDB-Wasm + OPFS でセッション・接続メタデータを永続化する

- Priority: Medium
- Created: 2026-06-24
- Completed: YYYY-MM-DD
- Model: Kimi K2.7 Code
- Branch: feature/add-duckdb-wasm-opfs-persistence
- Polished: 2026-06-24

## 目的

ブラウザを閉じても過去のセッション・接続情報が失われないよう、DuckDB-Wasm + OPFS でメタデータを永続化する。まずは session / connection のメタデータを保存対象とし、timeline / notify / signaling / log は後続で拡張する。

## 優先度根拠

Medium。過去セッションを識別・検索するための基盤であり、stats 永続化の前提となる。

## 現状

- セッション識別子は `connection.created` notify 受信後に `sessionId` / `connectionId` / `soraClientId` として確定する
- 切断時にこれらの識別子はクリアされる
- 既存の OPFS 永続化は `src/opfs.ts` の signaling URL 設定保存のみ
- `src/app/actions.ts` の `handleConnectionCreatedNotify()` で識別子が設定される
- `src/app/actions.ts` の `disconnect` コールバックで識別子がクリアされる
- `src/app/actions.ts` の `reconnectSoraImpl()` では同じ `channelId` / `role` で再接続する

## 設計方針

### DuckDB-Wasm 初期化

- npm パッケージ `@duckdb/duckdb-wasm` を使用する。バージョンは stable 版を明示的に指定する
- `AsyncDuckDB` は内部に Worker を作成して動作するため、メインスレッドをブロックしない
- Vite では `selectBundle()` に必要な WASM / Worker ファイルを `?url` import で提供する
  - `@duckdb/duckdb-wasm@1.32.0` の `dist` ディレクトリから以下を `?url` import する
    - `duckdb-eh.wasm` / `duckdb-browser-eh.worker.js`（Extended Hardware バンドル）
    - 必要に応じて `duckdb-mvp.wasm` / `duckdb-browser-mvp.worker.js`（Minimum Viable Product バンドル）も登録する
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

  - `vite.config.ts` では `assetsInlineLimit: 0` を設定し、WASM / Worker ファイルが base64 インライン化されないようにする

- OPFS 上のデータベースファイルパスは既存の `signaling-url-candidates.json` と衝突しないよう、`opfs://sora-devtools-sessions.db` を使用する
- 高頻度な stats 書き込みを考慮し、`SET checkpoint_threshold` はデフォルト値を維持する。正常終了時の `close()` または必要に応じた明示的な `CHECKPOINT` で永続化を確実にする
- 初期化失敗時は、既存の接続・デバッグ機能が動作し続けるようにフォールバックする
  - `sessionDatabase` の各メソッドは nullable な接続を許容し、未初期化時は no-op または console warn とする
  - OPFS 非対応ブラウザでは完全に永続化しない

### OPFS の特性

- OPFS は同一オリジン・同一ブラウザプロファイル内のアプリケーションのみアクセスできる
- このため、metadata / signaling URL / SDP / TURN URL などの接続記録を外部サーバーに送信せずに保存できる
- credentials / API キーなどの高機密情報は永続化対象から除外する。`metadata` にこれらが含まれる場合は保存前にマスクまたは除外する
  - マスク対象キー名の具体例は #0065 のセキュリティ・プライバシー方針に従う（`api_key` / `apikey` / `apiKey` / `x_api_key` / `x-api-key` / `authorization` / `auth` / `token` / `access_token` / `refresh_token` / `password` / `secret` / `credential` / `credentials` 等）
  - マスク処理は `maskSensitiveMetadata(metadata: unknown): Json` のような純粋関数として実装し、`src/sessionDatabase.ts` または `src/utils.ts` に配置する
  - 単体テストで各種キー名・ネストケースを検証する
- ただし、ブラウザの開発者ツールや同一オリジンで動作する悪意のあるスクリプトからは読み出せるため、絶対的な隔離ではないことを認識する
- UI 上では「データは端末内の OPFS に保存され、外部サーバーには送信されない」ことを明示する

### テーブル構成

`sessions` テーブル:

| カラム     | 型                                                     | 説明                                                                              |
| ---------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| id         | INTEGER PRIMARY KEY DEFAULT nextval('seq_sessions_id') | 自動採番                                                                          |
| session_id | VARCHAR                                                | Sora の session_id                                                                |
| channel_id | VARCHAR                                                | channelId                                                                         |
| role       | VARCHAR                                                | role（sendonly / recvonly / sendrecv 等）                                         |
| started_at | TIMESTAMP                                              | `connectSora()` 呼び出し時刻。`channel_id` / `role` / `metadata` も同時に保存する |
| ended_at   | TIMESTAMP                                              | 切断時刻（切断時に更新）                                                          |
| metadata   | JSON                                                   | 接続時の metadata（文字列を JSON パースして保存、無効な場合は NULL）              |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                    | レコード作成時刻                                                                  |

`connections` テーブル:

| カラム         | 型                                                        | 説明                                                                                                                                                |
| -------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| id             | INTEGER PRIMARY KEY DEFAULT nextval('seq_connections_id') | 自動採番                                                                                                                                            |
| session_id     | VARCHAR                                                   | 外部キー相当                                                                                                                                        |
| connection_id  | VARCHAR                                                   | Sora の connection_id                                                                                                                               |
| sora_client_id | VARCHAR                                                   | Sora の client_id                                                                                                                                   |
| channel_id     | VARCHAR                                                   | channelId                                                                                                                                           |
| signaling_url  | VARCHAR                                                   | 接続先 signaling URL（`soraConnection.connectedSignalingUrl`）。`connection.created` 受信後に取得可能な場合は設定し、取得できない場合は NULL とする |
| started_at     | TIMESTAMP                                                 | `connection.created` 受信時刻                                                                                                                       |
| ended_at       | TIMESTAMP                                                 | 切断時刻                                                                                                                                            |
| created_at     | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                       | レコード作成時刻                                                                                                                                    |

### 永続化フロー

1. 接続試行開始時（`connectSora()` / `reconnectSoraImpl()` 呼び出し時）:
   - `sessions` テーブルに `session_id` を `NULL` とした仮レコードを INSERT する
   - `started_at` / `channel_id` / `role` / `metadata` は signals から取得した値を保存する
   - `metadata` は `parseMetadata()` で JSON パースし、機密キーをマスクしてから保存する
2. `connection.created` notify 受信時:
   - `handleConnectionCreatedNotify()` 内で `sessions` レコードの `session_id` を UPDATE する
   - `connections` レコードを `connection_id` / `sora_client_id` / `signaling_url` 付きで INSERT する
3. 切断時:
   - `disconnect` コールバック内で識別子をクリアする前に、`sessions.ended_at` と `connections.ended_at` を UPDATE する
4. 再接続時:
   - `reconnectSoraImpl()` 内で、前接続の `sessions.ended_at` / `connections.ended_at` を更新してから、新しい `sessions` 仮レコードを INSERT する
   - `disconnect` コールバックから呼ばれる場合は既に前接続の `ended_at` が更新されているが、手動で `reconnectSora()` が呼ばれた場合を考慮して、新規 `sessions` レコード INSERT 前に前接続の終了時刻を確実に更新する
   - 同じ `session_id` が返された場合でも、新しい接続試行には新しい `sessions` レコードを作成する
   - `connections` レコードは `connection_id` ごとに新規作成する
5. 接続失敗 / キャンセル時:
   - `connectSora()` / `reconnectSoraImpl()` 内の `abortIfCancelled()` や例外ハンドラで、`sessions.ended_at` を更新する
   - `connection.created` 前に終了した場合、`session_id` は `NULL` のまま残る。これは「失敗またはキャンセルされた接続試行」として扱う

### 識別子確定前のデータ扱い

- `sessions` / `connections` テーブル:
  - `sessionId` / `connectionId` 確定前に発生したデータは、`NULL` 許容カラムに保存する
  - `connection.created` notify 受信後に `session_id` を `UPDATE` して紐付ける
- `webrtc_stats` テーブル:
  - #0068 と統一し、`sessionId` / `connectionId` 確定前はメモリ上の一時バッファに保持する
  - 識別子確定後にまとめて INSERT する

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
- `CHANGES.md` に `- [ADD] DuckDB-Wasm + OPFS でセッション・接続メタデータを永続化する` を記載すること

## 解決方法

1. `package.json` の `dependencies` に `@duckdb/duckdb-wasm` を追加する
   - `vp install @duckdb/duckdb-wasm` で `node_modules` を同期し、その後 `package.json` のバージョン指定を `^x.y.z` から `x.y.z` 形式に揃える
   - 現状の最新版 (`1.32.0`) は十分にリリースから時間が経っており `minimumReleaseAge` の制約に引っかからない。`pnpm-workspace.yaml` の `minimumReleaseAgeExclude` への追記は不要
2. `.pnpmfile.cjs` で `@duckdb/duckdb-wasm` および `apache-arrow` の依存関係に問題がある場合のみ調整する
   - `@duckdb/duckdb-wasm@1.32.0` は `apache-arrow: ^17.0.0` を direct dependency として持つ。pnpm が自動的に `apache-arrow` をインストールするため、基本的に `.pnpmfile.cjs` への追記は不要
   - 問題が発生した場合のみ `packageExtensions` で補完する。具体的な調整内容は `vp install` 実行後のエラーメッセージを見て確定する
3. `vite.config.ts` で DuckDB-Wasm の WASM / Worker ファイルを `?url` import できるように設定する
   - `build.assetsInlineLimit: 0` を設定し、WASM / Worker ファイルが base64 インライン化されないようにする
4. `src/sessionDatabase.ts` を作成し、DuckDB-Wasm + OPFS の初期化とクエリ実行 API を実装する
   - `App.tsx` マウント時または `main.tsx` レンダリング後に非同期で `createSessionDatabase()` を呼び出す
   - `AsyncDuckDB` を `selectBundle()` で初期化する
   - `opfs://sora-devtools-sessions.db` に接続する
   - `CREATE SEQUENCE IF NOT EXISTS` で `seq_sessions_id` / `seq_connections_id` / `seq_webrtc_stats_id` を作成する（`seq_webrtc_stats_id` は #0068 と共有）
   - `CREATE TABLE IF NOT EXISTS` で `sessions` / `connections` テーブルを作成する
   - 初期化失敗時は console warn を出力し、以降の永続化フックは no-op とする
   - `close()` メソッドを提供し、`beforeunload` 時に DuckDB-Wasm の接続を close する
5. `sessions` / `connections` テーブルのスキーマを定義する
6. `src/app/actions.ts` の `connectSora()` / `handleConnectionCreatedNotify()` / `disconnect` コールバックで永続化フックを呼び出す
7. `src/app/actions.ts` の `connectSora()` / `reconnectSoraImpl()` 内の `abortIfCancelled()` 各検知ポイントおよび `try/catch` の例外ハンドラで、`sessions.ended_at` を更新する
8. `src/app/actions.ts` の `reconnectSoraImpl()` でも永続化フックを呼び出す
9. `src/sessionDatabase.ts` に `maskSensitiveMetadata()` を実装する
10. #0066 で `DevTools.tsx` に設定した `beforeunload` の `handleBeforeUnload` に `void sessionDatabase.close()` を追加する
11. Playwright E2E テストで OPFS 読み書きを検証する

## テスト方針

- Vitest 単体テスト: `sessionDatabase` の SQL 組み立てやデータ変換関数を対象とする（DuckDB-Wasm 初期化はブラウザ API に依存しない純粋関数に限る）
- Playwright E2E テスト:
  - DuckDB-Wasm + OPFS でデータベースが初期化されること
  - 接続確立後に `sessions` / `connections` レコードが保存されること
  - 切断後に `ended_at` が更新されること
  - ブラウザリロード後もデータが読み出せること
  - Sora 接続が必要なテストでは #0063 で導入される `requireSoraConnectionEnv()` を使用し、`E2E_TEST_SORA_SIGNALING_URL` 未設定時は `test.skip()` で skip する

## リスクと対策

| リスク                                           | 対策                                                                                                                                                                                    |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DuckDB-Wasm 初期化失敗で既存機能が動かなくなる   | 初期化を非同期で行い、失敗時は永続化をスキップして既存機能を継続する                                                                                                                    |
| OPFS quota 不足で書き込み失敗                    | エラーをキャッチし、UI 上でユーザーに通知する                                                                                                                                           |
| 高頻度な stats 書き込みで UI がカクつく          | `AsyncDuckDB` の内部 Worker を使用し、#0068 でバッチ挿入を行う                                                                                                                          |
| 複数タブから同時に OPFS の DB ファイルに書き込む | DuckDB-Wasm は単一プロセスを前提としており、複数タブでの同時書き込みはサポート外とする。UI 上で「複数タブで同時に開くとデータ破損のリスクがある」と警告する                             |
| credentials / API キーが `metadata` に含まれる   | 保存前にマスクまたは除外する                                                                                                                                                            |
| OPFS 上の DB ファイルが破損して開けなくなる      | 初期化時に開けない場合は DB ファイルを削除して再作成するフォールバックを実装する。正常終了時は `beforeunload` またはページ終了処理で close し、切断時・定期的に `CHECKPOINT` を実行する |

## 未解決課題

- 複数タブ同時接続時の OPFS 書き込み競合の扱い（実装時に DuckDB-Wasm の concurrency 制限を確認）
  - DuckDB は単一プロセスでの読み書きを前提としており、ブラウザの各タブは別プロセスとして扱われるため、同一 OPFS ファイルへの同時書き込みは公式にサポートされていない
  - 2 つ目以降のタブで `AsyncDuckDB.open()` または `INSERT` / `UPDATE` 時にどのようなエラーが発生するかは実装時に確認し、UI 上の警告文言とエラーハンドリングを確定する

## 関連 issue

- #0065: DuckDB-Wasm + OPFS で過去セッションの記録を永続化する（親 issue）
- #0066: preact-iso を導入して `/sessions` ページへのルーティング基盤を追加する
- #0068: WebRTC stats を DuckDB-Wasm + OPFS に永続化する
- #0069: DownloadReportButton と DownloadReport 関連機能を削除する
