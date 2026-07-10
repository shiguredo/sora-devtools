# DuckDB-Wasm + OPFS でセッション・接続メタデータを永続化する

- Priority: Medium
- Created: 2026-06-24
- Completed: 2026-07-11
- Model: GLM-5.2
- Branch: feature/add-duckdb-wasm-opfs-persistence
- Polished: 2026-07-10

## 目的

ブラウザを閉じても過去のセッション・接続情報が失われないよう、DuckDB-Wasm + OPFS でメタデータを永続化する。まずは session / connection のメタデータを保存対象とし、timeline / notify / signaling / log / push は後続（親エピック第 2 段階）で拡張する。WebRTC stats の永続化は #0068、`/sessions` UI は #0070 の担当とする。

## 優先度根拠

Medium。過去セッションを識別・検索するための基盤であり、stats 永続化（#0068）と Sessions UI（#0070）の前提となる。

## 現状

- #0066 は完了済み。`src/App.tsx` に `preact-iso` Router、`/sessions` 仮ページ、`beforeunload` → `void disconnectSora()` がある。本 issue はマウント時に `createSessionDatabase()` を呼ぶ。`beforeunload` は既存の `disconnectSora` のみとし、ハンドラ本体には追記しない（`close()` も呼ばない。後述の方針 2）
- #0037 / #0063 は完了済み。`tests/helpers/env.ts` の `requireSoraConnectionEnv()` を E2E でハード依存する（`process.env` 直接読み取りのフォールバックは行わない）
- セッション識別子は `connection.created` notify 受信後に `sessionId` / `connectionId` / `soraClientId` として確定する（`handleConnectionCreatedNotify()`）
- 切断時に `disconnect` コールバック内で `sora` / `sessionId` / `connectionId` / `soraClientId` / `soraTurnUrl` がクリアされる
- `reconnectSoraImpl()` は `disconnect` コールバック内の `void reconnectSora()` からのみ呼ばれる
- 既存の OPFS 永続化は `src/opfs.ts` の signaling URL 設定保存のみ（`signaling-url-candidates.json`）。DuckDB の `opfs://` 経路とは別スタック
- `src/sessionDatabase.ts` は未作成。`package.json` に `@duckdb/duckdb-wasm` は未導入
- `vite.config.ts` の `manualChunks` に duckdb / apache-arrow は未追加。`assetsInlineLimit` も未設定

## 設計方針

本 issue は親エピック #0065 が固定した横断モデルに従う。INSERT タイミング・`ended_at` 更新ルール・`getCurrentSessionDbId`・`beforeunload` の `close()` 安全性は親決定を本 issue の実装仕様として転記する。

### DuckDB-Wasm 初期化

- npm パッケージ `@duckdb/duckdb-wasm` を使用する。バージョンは stable 版を明示的にピン留めする（例: `1.32.0`。導入時点の最新 stable を確認して固定）
- `@duckdb/duckdb-wasm` 本体は **動的 import** とし、`vite.config.ts` の `manualChunks` で独立 chunk に分離する。静的 `import` で初期 HTML / 初期 JS のパースをブロックしない
- `AsyncDuckDB` は内部に Worker を作成して動作するため、メインスレッドをブロックしない
- Vite では `selectBundle()` に必要な WASM / Worker ファイルを `?url` import で提供する
  - `@duckdb/duckdb-wasm` の `dist` から Extended Hardware バンドル（`duckdb-eh.wasm` / `duckdb-browser-eh.worker.js`）を `?url` import する
  - 具体例（動的 import 前提。`sessionDatabase.ts` 内で実行）:

    ```ts
    const duckdb = await import("@duckdb/duckdb-wasm");
    const duckdbWasmEh = (await import("@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url")).default;
    const duckdbWorkerEh = (
      await import("@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url")
    ).default;

    const bundle = await duckdb.selectBundle({
      eh: {
        mainModule: duckdbWasmEh,
        mainWorker: duckdbWorkerEh,
      },
    });
    const worker = new Worker(bundle.mainWorker!);
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule);
    await db.open({ path: "opfs://sora-devtools-sessions.db" });
    ```

- `vite.config.ts` の決定事項:
  - `build.assetsInlineLimit: 0` を設定する（第 1 段階では全局変更を受容する。WASM / Worker の base64 インライン化を防ぐのが目的）
  - `manualChunks` に `@duckdb/duckdb-wasm` と `apache-arrow` を追加する。`moduleId.includes(\`node_modules/${mod}\`)` の誤マッチに注意し、より長いパッケージ名を先にマッチさせる（#0058 と同型の問題）
- `apache-arrow` は `@duckdb/duckdb-wasm` の transitive dependency だが、`manualChunks` で独立 chunk に分離するため `package.json` の `dependencies` に直接ピン留めする
- OPFS 上のデータベースファイルパスは既存の `signaling-url-candidates.json` と衝突しないよう、`opfs://sora-devtools-sessions.db` を使用する
- `SET checkpoint_threshold` はデフォルト値を維持する。切断時および定期（例: 1 分ごと）の明示的な `CHECKPOINT` で永続化を補完する。定期 CHECKPOINT は耐久性の補助であり、完了条件の必須検証対象ではない
- **呼び出しタイミング**: `App.tsx` マウント時に `createSessionDatabase()` を非同期で開始する（Connect ボタン無効化や connect 側 await は行わない）
- **初期化完了前の接続**: 未初期化中の永続化 API は no-op とする。ページロード直後の接続が永続化されないレースは第 1 段階では受容する
- 初期化失敗時は既存の接続・デバッグ機能が動作し続けるようにフォールバックする
  - 各メソッドは nullable な接続を許容し、未初期化時は no-op + console warn（ログメッセージは英語）
  - OPFS 非対応ブラウザでは完全に永続化しない
  - 初期化時に DB ファイルが開けない場合は削除して再作成するフォールバックを実装する

### `sessionDatabase` のモジュール構成

- `src/sessionDatabase.ts` はモジュールレベルシングルトンとする。`App.tsx` で `createSessionDatabase()` を呼び出して初期化し、`actions.ts` の永続化フックはモジュールレベルの API を呼ぶ
- `createSessionDatabase()` は副作用でシングルトンをセットし、失敗時は接続を null のまま残す（戻り値で呼び出し側が分岐する必要はない）
- 主要な API:
  - `createSessionDatabase(): Promise<void>`: 動的 import で `AsyncDuckDB` を初期化し、SEQUENCE / テーブルを作成する。完了（成功・失敗）で `whenReady()` が settle する
  - `whenReady(): Promise<void>`: 初期化完了を待つ共有 Promise。E2E が connect 前に await する
  - `getCurrentSessionDbId(): number | null`: 進行中の接続試行の `sessions.id`。UI「接続中」判定と、クロージャ外の明示パス（`disconnectSora` / `beforeunload` 経由）用。INSERT 成功時に set、`updateSessionEndedAt` 成功時に当該 id と一致するときだけ clear。接続試行フック用のローカル変数（クロージャ）とは別物。単一タブ前提で並走時は後勝ち
  - `insertSession(channelId, role, metadata): Promise<number | null>`: `sessions` 仮レコードを INSERT し、`RETURNING id` で自動採番 `id` を返す。未初期化時は `null`
  - `updateSessionIdAndConnectionId(id, sessionId, connectionId): Promise<void>`: `connection.created` 受信時に `session_id` と `connection_id`（last-only）を UPDATE する
  - `insertConnection(sessionDbId, sessionId, connectionId, soraClientId, channelId, signalingUrl): Promise<void>`: `connections` レコードを INSERT する
  - `updateSessionEndedAt(id): Promise<void>`: `sessions.ended_at` を更新する。成功時、`getCurrentSessionDbId() === id` のときだけ current を clear する（無条件 clear 禁止。明示パスもこの関数経由に寄せる）
  - `updateConnectionEndedAt(connectionId): Promise<void>`: `connections.ended_at` を更新する（キーはクロージャの `soraConnection.connectionId`。`signals` の connection_id は読まない。`connectionId` が falsy なら no-op）
  - `close(): Promise<void>`: DuckDB-Wasm の接続を close する（E2E クリーンアップ等の明示経路用。`beforeunload` では呼ばない。後述）

### 機密情報のマスク

- credentials や API キーなどの高機密情報は永続化対象から除外する。`metadata` に含まれる場合は保存前にマスクする
  - マスク対象キー名: `api_key` / `apikey` / `apiKey` / `x_api_key` / `x-api-key` / `authorization` / `auth` / `token` / `access_token` / `refresh_token` / `password` / `secret` / `credential` / `credentials` 等（大文字小文字・スネークケース・ケバブケース・キャメルケースを考慮）
  - 値の型が文字列の場合は `"***"` に置換、オブジェクトの場合は `{"masked": true}` に置換する
  - ネストしたオブジェクト内のキーも再帰的に走査する
  - `maskSensitiveMetadata(metadata: unknown): Json` の純粋関数として `src/sessionDatabase.ts` に配置する
  - Vitest 単体テスト + PBT（`src/sessionDatabase.prop.ts`。`CODEBASE.md` の `*.prop.ts` 規約）で検証する
- ブラウザの開発者ツールや同一オリジンの悪意あるスクリプトからは読み出せるため、絶対的な隔離ではない
  - `/sessions` 上のプライバシー文言（端末内保存・端末情報を含む旨）の表示は **#0070** の担当。本 issue の複数タブ警告は初期化時の console warn のみとする（UI 表示・状態フラグは #0070）

### テーブル構成

`sessions` テーブル:

| カラム        | 型                                                     | 説明                                                                                                              |
| ------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| id            | INTEGER PRIMARY KEY DEFAULT nextval('seq_sessions_id') | 自動採番（接続試行単位の内部 ID。`session_db_id`）                                                                |
| session_id    | VARCHAR                                                | Sora の session_id（`connection.created` 受信後に UPDATE。同一値で複数行があり得る）                              |
| connection_id | VARCHAR                                                | Sora の connection_id（`connection.created` 受信後に UPDATE。last-only。行特定や一覧必須には使わない。NULL 許容） |
| channel_id    | VARCHAR                                                | channelId                                                                                                         |
| role          | VARCHAR                                                | role（sendonly / recvonly / sendrecv 等）                                                                         |
| started_at    | TIMESTAMP                                              | 接続試行開始時刻。`channel_id` / `role` / `metadata` も同時に保存する                                             |
| ended_at      | TIMESTAMP                                              | 接続試行全体の終了時刻（後述の更新ルールに従う）                                                                  |
| metadata      | JSON                                                   | 接続時の metadata（`parseMetadata()` 済みの `Json                                                                 | undefined` をマスクして保存。`undefined` は SQL NULL） |
| created_at    | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                    | レコード作成時刻                                                                                                  |

`connections` テーブル:

| カラム         | 型                                                        | 説明                                                                                                       |
| -------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| id             | INTEGER PRIMARY KEY DEFAULT nextval('seq_connections_id') | 自動採番                                                                                                   |
| session_db_id  | INTEGER                                                   | `sessions.id` への参照。Sora `session_id` ではなく内部 ID で紐づける                                       |
| session_id     | VARCHAR                                                   | Sora の session_id                                                                                         |
| connection_id  | VARCHAR                                                   | Sora の connection_id                                                                                      |
| sora_client_id | VARCHAR                                                   | Sora の client_id                                                                                          |
| channel_id     | VARCHAR                                                   | channelId                                                                                                  |
| signaling_url  | VARCHAR                                                   | 接続先 signaling URL（`soraConnection.connectedSignalingUrl`）。空文字列 `""` は `NULL` に変換して保存する |
| started_at     | TIMESTAMP                                                 | `connection.created` 受信時刻                                                                              |
| ended_at       | TIMESTAMP                                                 | 切断時刻                                                                                                   |
| created_at     | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                       | レコード作成時刻                                                                                           |

### レコード粒度（親で固定）

- `sessions` は「接続試行単位」。`connectSora()` / `reconnectSoraImpl()` の 1 呼び出しにつき 1 行。`attemptReconnection()` の最大 10 回リトライは同一 `sessions` 行に属する
- 各リトライ（および初回接続）で `connection.created` が来た場合、`connections` レコードを個別に作成する
- 同じ Sora `session_id` が返されても、新しい接続試行では新しい `sessions` 行を作成する

### `sessions.id` の受け渡し

- INSERT 戻り値の `sessions.id` は `connectSora()` / `reconnectSoraImpl()` の**ローカル変数**で保持し、クロージャにキャプチャする。接続試行のフック用 ID をモジュールローカルに置いて並走上書きする設計は禁止する
- 受け渡しパスに含める関数: `attemptReconnection` / `createSoraConnectionByRole` / `setSoraCallbacks` / `handleConnectionCreatedNotify`（引数または notify ハンドラ内ローカル関数化）
- `reconnectSoraImpl` で 1 回 INSERT した id を `attemptReconnection` のループ全体で使い回す
- 現行の `handleConnectionCreatedNotify` はモジュールレベル関数でクロージャを持たない。`sessions.id` を引数で渡すか、`setSoraCallbacks` 内の notify ハンドラから UPDATE / INSERT を行う（「クロージャにキャプチャした」と誤読しないこと）

### INSERT タイミング（親で固定）

- **`connectSora()`**: 検知ポイント 1（既存接続の `disconnect` 直後のキャンセル判定）を通過した**後**、`prepareSignalingConnection()` で `metadata` を取得し、`createSoraConnectionByRole()` を呼ぶ**前**に `sessions` を INSERT する
  - 検知ポイント 1 で return する場合、新しい `sessions` 行はまだ存在しないため `ended_at` 更新は**不要**
  - 旧接続の `ended_at` は、検知ポイント 1 より前の `await soraValue.disconnect()` に伴う `disconnect` コールバック側の永続化フックで更新する
- **`reconnectSoraImpl()`**: `prepareSignalingConnection()` の後、`createMediaStream()` の前に INSERT する（`createMediaStream()` 失敗時に `sessions.ended_at` を更新するため）
- `started_at` / `channel_id` / `role` / `metadata` は INSERT 時点の値を保存する。`metadata` は `prepareSignalingConnection()` の戻り値を `maskSensitiveMetadata()` してから保存する

### `ended_at` 更新ルール（親で固定）

`sessions.ended_at` を更新してよいのは「接続試行全体の終了」だけである。

**`disconnect` フックでの `sessions.ended_at` 更新条件（両方必須）:**

1. `isCurrent() === true`
2. `signals.reconnecting.value === false`

フックの配置位置は `isCurrent()` ガードの**前**（`signals.setTimelineMessage(...)` の直後）。配置が前でも、`sessions` / `connections` の更新分岐は次表に従う。`signals` の connection_id を読んで `connections.ended_at` を更新してはならない（遅延 disconnect 時に成功接続側の ID になっている）。

| 事象                                                                                                   | `sessions.ended_at`                                                                                               | `connections.ended_at`                                                               |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `disconnect` フックで `isCurrent() && !reconnecting`（通常切断・abend による再接続開始時の旧接続切断） | 更新する                                                                                                          | クロージャの `soraConnection.connectionId` で更新する                                |
| `disconnect` フックで `isCurrent() && reconnecting`（リトライ中の失敗切断）                            | **更新しない**                                                                                                    | クロージャの `soraConnection.connectionId` で更新する                                |
| `disconnect` フックで `!isCurrent()`（成功後の遅延 disconnect 等）                                     | **更新しない**                                                                                                    | クロージャの `soraConnection.connectionId` で更新する                                |
| リトライ途中の `attemptReconnection` の `catch`（`connect()` 失敗）                                    | **更新しない**                                                                                                    | 当該試行で `connections` INSERT 済みなら、そのとき保持した `connectionId` で更新する |
| `createMediaStream()` 失敗 / reconnecting キャンセル / 全リトライ枯渇                                  | 更新する（明示パス）                                                                                              | 当該試行で `connections` INSERT 済みなら更新する                                     |
| `connectSora` の `abortIfCancelled` / `try/catch` 失敗                                                 | 更新する（明示パス）                                                                                              | 当該試行で `connections` INSERT 済みなら更新する                                     |
| `disconnectSora` による切断（`reconnecting` 中にユーザーが止めた場合を含む）                           | 更新する（明示パス。`getCurrentSessionDbId()` で行を特定。early return 前に `setSoraReconnecting(false)` も呼ぶ） | フックまたは明示パスで更新する                                                       |
| `connection.created` 前の切断                                                                          | 上記ルールに従う                                                                                                  | レコード未作成のため不要                                                             |

- abend 再接続開始時: フック時点ではまだ `setSoraReconnecting(true)` 前かつ `isCurrent() === true` なので旧 `sessions` は終了する。その後 `reconnectSoraImpl` が新しい `sessions` 行を INSERT する
- `abortConnectSoraResources` は `setSora(null)` の**後**に `disconnect()` するため、後続フックは `!isCurrent()` になり `sessions.ended_at` を書けない。これらの経路は必ず明示パスで書く
- 「`connections` INSERT 済み」の判定: `soraConnection.connectionId` の有無では不十分（offer 時点で入り得て、`connections` INSERT より早い）。接続試行ローカルで `connections` INSERT 成功時に `connectionId` を保持し、catch / 明示パスはその値でのみ `updateConnectionEndedAt` する
- SDK は `disconnect` コールバックの戻り値 Promise を待たないため、永続化は識別子を同期キャプチャしてから `void` + `.catch()` で投げる（#0068 と同じパターン）
- ブラウザ終了等で `ended_at` が更新できなかった場合、`ended_at` は `NULL` のまま残る（UI 上は #0070 が「切断不確定」として扱う）

### `connection.created` 時の更新

- `sessions.session_id` / `sessions.connection_id`（last-only）を UPDATE する
- `connections` 行を INSERT する（`session_db_id` 付き）

### 永続化エラーの UI 通知

- DevTools 利用中の永続化失敗（書き込み・flush・OPFS quota 等）は既存の `setSoraErrorAlertMessage`（`alertMessages` 経路）で通知する。基盤は本 issue。#0068 の stats 失敗も同じ経路に乗る
- `sessionDatabase.ts` は `@/app/signals` から `setSoraErrorAlertMessage` を直接 import する。`actions.ts` 経由は循環依存になるため禁止
- メッセージは英語。末尾ピリオドなし（`CODEBASE.md`）
- 連続失敗で alert が連打されないよう、同一原因の通知は抑制してよい（実装時に簡易デバウンス可）

### `beforeunload` の `close()` 安全性（本 issue で固定）

親が示した二択のうち、**(2) を採用する**（親本文に「`beforeunload` に `close()` を追加」と併記があるが、方針 2 採用により本 issue では適用しない）:

- `beforeunload` では `sessionDatabase.close()` を**呼ばない**
- `beforeunload` の既存 `void disconnectSora()` 経由で、**関数先頭（最初の `await` より前）**に同期キャプチャ＋ fire-and-forget の `ended_at` 更新と、必要なら `setSoraReconnecting(false)` を行う（後述の `disconnectSora` 手順）
- `close()` は E2E クリーンアップ、および将来の明示的 teardown 用に API として残す
- 耐久性は切断時・定期の `CHECKPOINT` で補完する。定期 CHECKPOINT は `createSessionDatabase` 成功後に `sessionDatabase` 内の `setInterval`（例: 1 分）で行い、切断時は書き込み API 側で明示 `CHECKPOINT` する。完了条件の必須検証対象ではない
- `beforeunload` 内の非同期完了は保証できないことをコメントで明記する
- 単一タブの通常クローズ後に DB が開けなくなる状態は許容しない（`close()` を beforeunload で競合させないことで担保）

### マイグレーション機構

- 第 1 段階では `CREATE SEQUENCE IF NOT EXISTS` / `CREATE TABLE IF NOT EXISTS` のみを使用する
- 第 2 段階でテーブル追加・スキーマ変更が必要になった場合は、別 issue でマイグレーション戦略を検討する

## 完了条件

- DuckDB-Wasm + OPFS でデータベースファイルが初期化できること（動的 import + 独立 chunk）
- `connectSora` / `reconnectSoraImpl` の接続試行開始時（上記 INSERT タイミング）に `sessions` レコードが保存され、`getCurrentSessionDbId()` がセットされること
- `connection.created` 受信時に `sessions` の `session_id` / `connection_id` が UPDATE され、`connections` レコードが保存されること
- 切断時に上記 `ended_at` 更新ルールどおり `sessions.ended_at` / `connections.ended_at` が更新され、終了時に `getCurrentSessionDbId()` が clear されること
- `disconnectSora` 明示パス（再接続中のユーザー停止を含む）で `sessions.ended_at` が更新されること
- ブラウザを閉じて再度開いても、過去の `sessions` / `connections` レコードが読み出せること（対応ブラウザは Chromium 系を必須とし、未対応時は永続化 no-op）
- 再接続時や同じ channelId での複数接続試行が、DB 上で複数の `sessions` / `connections` 行として区別されて保存されること（親エピックの検証オーナー分担どおり、本 issue は DB 上の区別を検証する）
- DuckDB-Wasm 初期化失敗・OPFS アクセス不可時も既存機能が動作し続けること
- `metadata` 内の機密情報がマスクされて保存されること
- `vp build` / `vp test run` / `vp check` が成功すること
- `CHANGES.md` の `## develop` に `- [ADD] DuckDB-Wasm + OPFS でセッション・接続メタデータを永続化する` を記載すること（担当者行 `- @voluntas`）

## 解決方法

1. `@duckdb/duckdb-wasm` 1.32.0 と `apache-arrow` 17.0.0 を dependencies にピン留め追加した
2. `vite.config.ts` に `assetsInlineLimit: 0` と `manualChunks`（`duckdb-wasm` / `apache-arrow`）を追加した
3. `src/sessionDatabase.ts` を新設し、動的 import で OPFS DB を初期化、sessions / connections API と `maskSensitiveMetadata` を実装した。AsyncDuckDBConnection への並行 query を避けるため書き込みを `enqueueWrite` で直列化し、`close()` はキュー排水後にハンドルを解放する
4. `App.tsx` マウント時に `createSessionDatabase()` を呼ぶ。`beforeunload` には `close()` を追加しない
5. `actions.ts` に接続試行ローカルの永続化コンテキストを渡し、INSERT / UPDATE / ended_at ルールどおりフックした。INSERT と disconnect のレースは connectionId 単位の pending Set で補完する。sora-js-sdk は `disconnect` コールバック前に `initializeConnection()` で `connectionId` を null 化するため、フックでは `observedConnectionId` / `persistedConnectionId` / `getCurrentConnectionId()` を使い、`disconnectSora` 明示パスでも connections.ended_at を更新する
6. Vitest（`sessionDatabase.test.ts` / `.prop.ts`）と Playwright E2E（`tests/session-database.test.ts` + helpers）を追加した。E2E の SQL は `querySessionDatabaseForE2e` を Vite 経由で呼ぶ
7. `CHANGES.md` の `## develop` に `[ADD]` を追記した
8. `vp check` / `vp test run` / `vp build` で確認した

## テスト方針

- Vitest 単体テスト: `maskSensitiveMetadata()` と空文字→NULL 変換等の純粋関数のみ。ファイルは `src/sessionDatabase.test.ts`
- PBT: `src/sessionDatabase.prop.ts`。任意のネスト深さの metadata について機密キーが全てマスクされること
- Playwright E2E（Chromium）:
  - DuckDB-Wasm + OPFS でデータベースが初期化されること
  - 接続確立後に `sessions` / `connections` レコードが保存されること
  - 切断後に `ended_at` が更新されること（通常切断と `disconnectSora` 経路）
  - ブラウザリロード後もデータが読み出せること
  - 再接続または別接続試行で同一 channelId の複数 `sessions` 行が残ること
  - Sora 接続が必要なテストは `requireSoraConnectionEnv()` を使用する（フォールバックなし）

## リスクと対策

| リスク                                                 | 対策                                                                                         |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| DuckDB-Wasm 初期化失敗で既存機能が動かなくなる         | 初期化を非同期で行い、失敗時は永続化をスキップして既存機能を継続する                         |
| OPFS quota 不足で書き込み失敗                          | エラーをキャッチし、`setSoraErrorAlertMessage` で通知する                                    |
| 複数タブから同時に OPFS の DB ファイルに書き込む       | サポート外。初期化時に console warn（UI 文言は #0070）                                       |
| credentials / API キーが `metadata` に含まれる         | 保存前に `maskSensitiveMetadata()` でマスク。単体テスト + PBT で検証する                     |
| OPFS 上の DB ファイルが破損して開けなくなる            | 初期化時に開けない場合は削除して再作成。`beforeunload` では `close()` しない（方針 2）       |
| リトライ中の失敗 disconnect が接続試行全体を終了させる | `sessions.ended_at` は `isCurrent() && !reconnecting` のときだけ disconnect フックで更新する |
| DuckDB-Wasm の bundle サイズで初期表示が遅延する       | 動的 import + 独立 chunk とし、初期 DevTools 表示をブロックしない                            |

## 未解決課題

- 複数タブ同時接続時に 2 つ目以降のタブで `AsyncDuckDB.open()` または書き込みが返す具体的なエラー種別は実装時に確認し、console warn / alert の文言を確定する（サポート外である方針自体は固定済み）

## 関連 issue

- #0065: DuckDB-Wasm + OPFS で過去セッションの stats / メタデータを永続化し /sessions ページで確認できるようにする（親エピック）
- #0066: preact-iso を導入して `/sessions` ページへのルーティング基盤を追加する（closed。本 issue の前提）
- #0068: WebRTC stats を DuckDB-Wasm + OPFS に永続化する
- #0069: DownloadReportButton と DownloadReport 関連機能を削除する（関連。本 issue スコープ外）
- #0070: /sessions ページに過去セッション一覧・詳細・フィルタ UI を実装する（プライバシー文言・一覧 UI の担当）
- #0037: e2e テストに Page Object Model を導入する（closed。E2E ハード依存）
- #0063: Sora 接続が必要な E2E テストで環境変数未設定時に即座に失敗させる（closed。`requireSoraConnectionEnv`）
- #0058: `vite.config.ts` の `manualChunks` で `moduleId.includes()` の誤マッチを防ぐ（ソフト依存）
- #0062: 三項演算子を全面禁止する（マージ済みなら新規コードで遵守）
