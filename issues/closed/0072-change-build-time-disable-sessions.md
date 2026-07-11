# ビルド時に Sessions 機能を無効化できるようにする

- Priority: Medium
- Created: 2026-07-11
- Completed: 2026-07-12
- Model: Kimi Code CLI
- Branch: feature/change-build-time-disable-sessions
- Polished: 2026-07-11

## 目的

DuckDB-Wasm を使った Sessions 機能を、ビルド時に環境変数で有効化・無効化できるようにする。デフォルトは無効とし、必要な環境でのみ明示的に有効化することで、安全に作りこめるようにする。

## 優先度根拠

Medium。必須機能ではない Sessions をデフォルト無効化し、必要な環境でのみ有効化することで、リスクを避けながら機能を継続して開発できるようにする。

## 現状

- `src/App.tsx` でマウント時に `createSessionDatabase()` を呼び出している
- `src/components/Header/index.tsx` に `SessionsButton` を表示している
- `src/routes/Sessions.tsx` で `/sessions` ページを提供している
- `src/app/actions.ts` で `connectSora` / `disconnectSora` / `reconnectSora` / stats 収集の各所で `sessionDatabase.ts` の API を呼び出している
- `src/sessionDatabase.ts` が `@duckdb/duckdb-wasm` に依存している
- `vite.config.ts` で DuckDB-Wasm 用の `manualChunks` を行っている

## 設計方針

- Vite の `loadEnv` + `define` でビルド時に `__SESSIONS_ENABLED__` という boolean 定数を埋め込む
  - `vite.config.ts` をコールバック形式にし、`const env = loadEnv(mode, rootDir, "VITE_");` で読み込む
  - `process.env.VITE_ENABLE_SESSIONS` が存在する場合のみ `env` にマージし、CI / ワークフローでの環境変数設定を反映できるようにする
  - `VITE_ENABLE_SESSIONS` が `"true"` の場合のみ有効とし、未定義またはそれ以外は無効とする
  - `define: { __SESSIONS_ENABLED__: JSON.stringify(env.VITE_ENABLE_SESSIONS === "true") }` とし、実行時には boolean リテラルが埋め込まれる
- `src/constants.ts` に `export const SESSIONS_ENABLED = __SESSIONS_ENABLED__;` を追加する
- `SESSIONS_ENABLED` が `false` の場合は以下を無効化する
  - `src/App.tsx` の `/sessions` ルートと `createSessionDatabase()` 呼び出し
  - `src/components/Header/index.tsx` の `SessionsButton` 表示
  - `src/app/actions.ts` からの `sessionDatabase.ts` 関連の呼び出し
- `src/app/actions.ts` から `sessionDatabase.ts` への静的 import 参照を除去し、有効時のみ動的 import で読み込むラッパーに集約する
  - 無効時は no-op 関数を提供し、`disconnectSora` 内の `getCurrentSessionDbId()` / `getCurrentConnectionId()` などの同期 API 呼び出しも安全にする
  - no-op 関数は呼び出し元の型に合わせた戻り値（`null` / `false` 等）を返すように定義する
  - 有効時は初回 import 後にモジュールをキャッシュし、同期 API 呼び出しにも安全に応答する
  - 可能であれば `App.tsx` 側の動的 import と同じ Promise を共有するか、ラッパー側でトップレベルで preload を開始し、接続開始時までにモジュールがロード済みであるようにする
  - これにより無効ビルドでは import グラフから `sessionDatabase.ts` / `@duckdb/duckdb-wasm` が切り離され、関連 chunk が生成されなくなる
- `src/App.tsx` から `createSessionDatabase` の静的 import も除去し、`SESSIONS_ENABLED` が真のときだけ動的 import で呼び出す
- `src/routes/Sessions.tsx` の `lazy(...)` 定義も `SESSIONS_ENABLED` で条件分岐する
  - `const Sessions = SESSIONS_ENABLED ? lazy(async () => import("./routes/Sessions.tsx")) : null;`
  - `Route` は `SESSIONS_ENABLED && Sessions !== null && <Route path="/sessions" component={Sessions} />` のように式で分岐し、`Sessions` が non-null であることを保証して条件付きレンダリングする
- `vite.config.ts` の `manualChunks` は、該当モジュールが graph に残っていない場合は何もしないよう扱う
  - chunk 名の割り当てを制御するだけで、モジュールを graph から除外する機能ではない
- `.env.template` に `VITE_ENABLE_SESSIONS=false` を追加する（デフォルト無効化の意図。`.env.local` で `true` を設定すれば開発時に有効化できる）
- CI / E2E / デプロイは `VITE_ENABLE_SESSIONS=true` で実行し、Sessions 機能が引き続き検証・提供されるようにする
  - `.github/workflows/ci.yml` の `vp build`、`vp test run` に `VITE_ENABLE_SESSIONS=true` を設定する
  - `.github/workflows/ci.yml` に無効ビルド用のステップを追加し、`VITE_ENABLE_SESSIONS=false` を設定して `vp build` を実行する
  - 無効ビルド後、`dist/assets` に `duckdb*` / `apache-arrow*` / `uplot*` / `uPlot*` 等のファイルが含まれていないことを検証する
  - `.github/workflows/e2e-test.yml` の `vp build` と Playwright 実行に `VITE_ENABLE_SESSIONS=true` を設定する
  - `.github/workflows/deploy-r2.yml` の `vp build` に `VITE_ENABLE_SESSIONS=true` を設定する
- ローカルで unit test を実行する場合、`.env.test` 等を使わず `VITE_ENABLE_SESSIONS=true` を指定するか、テスト対象が DuckDB 依存モジュールを静的 import する場合があることに注意する
- `src/vite-env.d.ts` に `declare const __SESSIONS_ENABLED__: boolean;` を追加する
- `src/vite-env.d.ts` の `interface ImportMetaEnv` に `VITE_ENABLE_SESSIONS?: string;` を追加する

## 完了条件

- `VITE_ENABLE_SESSIONS` 未定義または `"true"` 以外でビルドした場合、Sessions ボタンが表示されず、`/sessions` へアクセスしても default route がマッチし DevTools が表示される
- 無効ビルドの `dist/assets` に `duckdb-mvp`、`duckdb-eh`、`duckdb-wasm`、`apache-arrow`、`uplot` 関連のファイルが含まれない
- `VITE_ENABLE_SESSIONS=true` でビルドした場合、既存の Sessions 機能が動作する
- CI / E2E / unit test は `VITE_ENABLE_SESSIONS=true` で実行され、既存の Sessions 関連テストが通る
- CI に無効ビルド用のビルド検証ステップを追加し、無効ビルドが成功することを確認する
- 変更履歴を `CHANGES.md` に追記する（例：`- [CHANGE] Sessions 機能をビルド時にデフォルト無効化し、環境変数で有効化できるようにする`）

## 解決方法

設計方針どおり、Vite の `define` で埋め込むビルド時定数 `__SESSIONS_ENABLED__` による切り替えを実装した。

- `vite.config.ts` をコールバック形式に変更し、`loadEnv(mode, rootDir, "VITE_")` + `process.env.VITE_ENABLE_SESSIONS` の優先マージで `define: { __SESSIONS_ENABLED__ }` を設定した
- 新規 `src/sessionDatabaseLoader.ts` に `sessionDatabase.ts` への全アクセスを集約し、動的 import + no-op フォールバックを実装した
  - 無効ビルドでは全 API が no-op（`null` / `false` / `void`）になる
  - 動的 import が失敗した場合はキャッシュをリセットして再試行可能にし、各 API は no-op にフォールバックする（永続化失敗でも接続は継続する従来の契約を維持）
  - モジュールのロード成功時に実モジュールの `createSessionDatabase()` を冪等に呼び、`whenReady()` が必ず settle するようにした
- `src/app/actions.ts` の import 元を `sessionDatabase.ts` から `sessionDatabaseLoader.ts` に切り替えた
- `src/App.tsx` の `/sessions` ルートと `createSessionDatabase()` 呼び出しをガードし、`src/components/Header/index.tsx` の Sessions ボタン表示を `SESSIONS_ENABLED` で切り替えた
- 新規 `src/sessionDatabaseLoader.test.ts` でラッパーの no-op 契約を検証した（無効ビルド時のみ実行、有効ビルドでは `test.skipIf` で skip）
- `playwright.config.ts` の `webServer.env` に `VITE_ENABLE_SESSIONS: "true"` を追加し、ローカル E2E でも Sessions が有効になるようにした
- CI に無効ビルドの検証ステップ（アセット不在チェック + 無効モードでの unit test）を追加し、CI / E2E / デプロイの各ワークフローで `VITE_ENABLE_SESSIONS=true` を設定した

設計方針からの主な乖離と理由:

- 動的 import のガードは `SESSIONS_ENABLED`（`src/constants.ts` 経由）ではなく `__SESSIONS_ENABLED__` の直接参照とした。クロスモジュールの定数経由だとバンドラのデッドコード除去が効かず、無効ビルドにも Sessions 関連 chunk が出力されてしまうため。`SESSIONS_ENABLED` は UI の表示切り替え専用とした
- `/sessions` の `Route` は `&&` による条件描画ではなく配列での分岐とした。preact-iso の `Router` の children 型が `NestedArray<VNode>` であり、`false | Element` では型エラーになるため
- `src/App.tsx` から `createSessionDatabase` の import は除去せず、loader への静的 import + `__SESSIONS_ENABLED__` ガードとした。loader 自体が no-op を持つため簡潔になり、無効ビルドでは実モジュールへの動的 import が到達不能になる
- `src/vite-env.d.ts` の `ImportMetaEnv` への `VITE_ENABLE_SESSIONS` 宣言は、`import.meta.env` 経由で読むコードが存在せず未使用となるため追加しなかった
- `e2e-test.yml` の Playwright 実行ステップへの `VITE_ENABLE_SESSIONS` 設定は、`playwright.config.ts` の `webServer.env` で恒常有効化されるため冗長となり、追加しなかった（`vp build` ステップ側には設定済み）
- 無効ビルド検証の grep パターンに `Sessions|sessionDatabase` を追加し、Sessions ページ関連の chunk も検証対象にした

検証:

- 無効ビルドで Sessions ボタン非表示、`/sessions` が default route で DevTools 表示、`dist/assets` に Sessions 関連アセットが無いことをブラウザ実機と grep で確認した
- 有効ビルドで Sessions ボタン表示、`/sessions` ページ表示、関連 chunk 生成を確認した
- unit test（有効・無効両モード）、component test、`vp check` が全て通過することを確認した
