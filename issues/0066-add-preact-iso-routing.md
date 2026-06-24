# preact-iso を導入して /sessions ページへのルーティング基盤を追加する

- Priority: Medium
- Created: 2026-06-24
- Completed: YYYY-MM-DD
- Model: GLM-5.2
- Branch: feature/add-preact-iso-routing
- Polished: 2026-06-24

## 目的

過去セッション一覧ページ `/sessions` を別ページとして実現するため、preact-iso によるルーティング基盤を導入する。

## 優先度根拠

Medium。後続の DuckDB-Wasm 永続化機能の UI 実装に必要な前提基盤であるが、現状の DevTools 機能には影響しない。

## 現状

- `src/main.tsx` は `render(<App />, rootElement)` だけの純粋な SPA 構成
- `src/App.tsx` は `<DevTools />` を直接描画している
- 既存の URL パラメータは `location.search` を直接読み書きしている
  - `src/app/actions.ts` の `copyURL()` は `location.origin` / `location.pathname` / `location.search` を参照し、`history.replaceState()` で URL を更新する
  - `src/app/actions.ts` の `setInitialParameter()` は `new URLSearchParams(location.search)` を参照する
- `src/components/Header/index.tsx` には `DownloadReportButton` / `CopyUrlButton` が配置されている
- `src/DevTools.tsx` の `useEffect` で `setInitialParameter()` / `setMediaDevices()` / `unregisterServiceWorker()` を呼び、cleanup で `disconnectSora()` を呼んでいる
- 既存 E2E テスト 5 件（`tests/sendrecv.test.ts` 等）はすべて `http://localhost:3333/devtools/` に遷移する

## 技術選定

- `preact-iso` は Preact 公式のルーティング・データ取得ライブラリであり、本プロジェクトの Preact 10 スタックと親和性が高い
- 純粋な SPA なので `hydrate` ではなく `render` + `LocationProvider` を使用する
- `lazy()` を使うことで `/sessions` ページを初期 bundle から切り離せる

## 設計方針

- `preact-iso` を `dependencies` に追加する
- `src/main.tsx` で `LocationProvider` をトップレベルに配置し、`render` で `App` を描画する
- `src/App.tsx` で `Router` / `Route` を使い、`/` と `/sessions` を切り分ける
  - `Header` / `Footer` は `App.tsx` で共有配置し、どちらのページでも表示する
  - `DevTools.tsx` から `Header` / `Footer` を取り除き、`main` 部分のみをルーティング対象とする
- `/` は既存の `DevTools` コンポーネントを描画する
- `/sessions` は `lazy(() => import("./routes/Sessions"))` で遅延読み込みし、初期 bundle に含めない
- `src/components/Header/index.tsx` の `DownloadReportButton` の位置に `SessionsButton` を配置する（#0069 が先にマージされている場合は `DownloadReportButton` 削除後の空き位置に配置）
- `/sessions` ページには仮のコンポーネントを配置し、#0070 で中身を実装する
- 既存の `copyURL()` は `location.search` / `history.replaceState()` を直接使用するため、`preact-iso` の `useLocation()` への統合は行わない
  - ただし、`copyURL()` の `history.replaceState()` は `popstate` イベントを発火しないため、`LocationProvider` の内部 state と実際の URL がずれる可能性がある
  - このため、`CopyUrlButton.tsx` 側で `copyURL()` 実行後に `useLocation().route(globalThis.location.pathname + globalThis.location.search, true)` を呼び、`LocationProvider` と同期する

### `App.tsx` への初期化処理と `beforeunload` リスナーの移行

- **`setInitialParameter()` / `setMediaDevices()` / `unregisterServiceWorker()` と `beforeunload` リスナーは `DevTools.tsx` ではなく `App.tsx`（SPA ナビゲーションでアンマウントしない階層）に配置すること**。preact-iso のルーティングで `/sessions` に遷移すると `DevTools` がアンマウントされるため、`DevTools.tsx` にこれらを配置すると以下の問題が発生する:
  - `beforeunload` リスナーが `/sessions` 遷移で除去され、`/sessions` ページからブラウザを閉じた際に `disconnectSora()` が呼ばれなくなる
  - `DevTools` 再マウント時の `setInitialParameter()` → `resetState()` が生きた Sora 接続の signal 参照を破棄し、ゾンビ化させる
- `App.tsx` の `useEffect` で `setInitialParameter()` / `setMediaDevices()` / `unregisterServiceWorker()` を呼び、`beforeunload` リスナーで `void disconnectSora()` を呼ぶ
- `beforeunload` 内での非同期完了は保証できないため、ブラウザ終了時は切断完了を保証できない

### `Header` / `Footer` 共有配置の検討

- `Header` / `Footer` を `App.tsx` で共有配置すると、`/sessions` ページでも `CopyUrlButton` / `DebugButton` / `SignalingUrlModal` が表示される
- `CopyUrlButton` は `copyURL()` が `location.pathname` を使うため、`/sessions` ページでは `http://localhost:3333/sessions?...` という無意味な URL を生成する
- `DebugButton` は `debug` signal をトグルするが、`/sessions` ページには `DebugPane` が存在しないため表示上の変化がない
- 実装時に `Header` / `Footer` のコンポーネントをページ別に出し分けるか、`CopyUrlButton` / `DebugButton` / `SignalingUrlModal` を `/` ページのみに表示するかを検討すること
- `NavbarBrand` の `href="/"` は preact-iso の `LocationProvider` がインターセプトしてクライアントサイドルーティングするため、`/sessions` から `/` に戻る際のフルページリロードは発生しない

### `/devtools/` URL パスのフォールバック

- 既存 E2E テストは `http://localhost:3333/devtools/` に遷移する。`Router` で `/` を DevTools とするルーティングを導入する際、`/devtools/` は `Route` の `default` フォールバックで DevTools にルーティングされるようにすること。これにより既存 E2E テストの URL を変更せずに済む

## 完了条件

- `/` で既存の DevTools が動作すること
- `/devtools/` で既存の DevTools が動作すること（既存 E2E テストの互換性）
- `/sessions` で別ページが表示されること
- Header に `Sessions` ボタンが表示され、クリックで `/sessions` に遷移すること
- `CopyUrlButton` クリック時に URL が正しくコピーされ、`LocationProvider` の内部 state も同期すること
- 既存のクエリストリングパラメータ機能が壊れていないこと
- `/sessions` ページへの遷移中も、接続中の Sora セッションが切断されないこと
- `build` / `test` / `check` が成功すること
- `CHANGES.md` の `## develop` に `- [ADD] preact-iso を導入して /sessions ページへのルーティング基盤を追加する` を記載すること

## 解決方法

1. `package.json` の `dependencies` に `preact-iso` を追加する
   - `vp install preact-iso` で `node_modules` を同期し、その後 `package.json` のバージョン指定を `^x.y.z` から `x.y.z` 形式に揃える
   - `preact-iso@2.12.0` の peerDependencies に `preact-render-to-string: '>=6.4.0'` がある。プロジェクトに `preact-render-to-string` は未導入のため、`vp install` 時に pnpm が自動インストールするか確認し、必要に応じて `package.json` にピン留めすること。`minimumReleaseAge` 制約（7 日）に引っかかる場合は `pnpm-workspace.yaml` の `minimumReleaseAgeExclude` への追記を検討すること
   - 現状の最新版 (`2.12.0`) は十分にリリースから時間が経っており `minimumReleaseAge` の制約に引っかからない
2. `vite.config.ts` の `manualChunks` に `preact-iso` を追加する
   - `preact-iso` を独立した chunk に分離し、キャッシュ効率を向上させる
   - #0058 がマージ済みの場合は `moduleId.includes("/node_modules/${mod}/")` に厳格化されているため、判定順序の調整は不要。#0058 が未マージの場合は `preact-iso` を `preact` より先に配置する（現状の `moduleId.includes("node_modules/${mod}")` では `preact` が `node_modules/preact-iso` に誤一致するため）
   - `preact-render-to-string` がインストールされた場合も `preact` への誤マッチに注意すること
3. `src/main.tsx` を以下のように変更する
   - `import { LocationProvider } from "preact-iso"`
   - `render(<LocationProvider><App /></LocationProvider>, rootElement)`
4. `src/App.tsx` を以下のように変更する
   - `import { Router, Route, lazy } from "preact-iso"`
   - `Header` / `Footer` を `Router` の外に配置して両ページで共有する
   - `/` に `DevTools` を配置（`DevTools.tsx` から `Header` / `Footer` を取り除いた状態）
   - `/sessions` に `lazy(() => import("./routes/Sessions"))` を配置
   - マッチしないパスに対しては `<Route default component={DevTools} />` でフォールバックする（`/devtools/` を含む）
   - `useEffect` で `setInitialParameter()` / `setMediaDevices()` / `unregisterServiceWorker()` を呼ぶ
   - `useEffect` で `beforeunload` イベントリスナーを登録し、`handleBeforeUnload` 内で `void disconnectSora()` を呼ぶ
5. `src/routes/Sessions.tsx` に仮のページコンポーネントを作成する（default export）
6. `src/components/Header/SessionsButton.tsx` を作成し、`src/components/Header/index.tsx` に配置する
   - `SessionsButton` はコンポーネントトップレベルで `useLocation()` を呼び出し、クリックハンドラで `route("/sessions")` を呼ぶ
   - ボタンのスタイルは `CopyUrlButton` / `DebugButton` の `baseClasses` / `stateClasses` パターンに準拠すること
7. `src/components/Header/CopyUrlButton.tsx` を修正し、コンポーネントトップレベルで `useLocation()` を呼び出し、`copyURL()` 実行後に `route(globalThis.location.pathname + globalThis.location.search, true)` を呼び出す（第 2 引数 `true` は `replace` フラグで `history.replaceState()` と対応）
8. `src/DevTools.tsx` から `Header` / `Footer` を取り除き、`App.tsx` で共有配置する
   - `DevTools.tsx` の `useEffect` から `setInitialParameter()` / `setMediaDevices()` / `unregisterServiceWorker()` / `disconnectSora()` を削除する（`App.tsx` に移行するため）
   - 影響範囲: 既存のコンポーネントテスト・E2E テストのセレクタ・レイアウトに変更が出る可能性がある。テストで `Header` / `Footer` の存在を `DevTools.tsx` 単体で検証している場合は修正が必要
9. Playwright E2E テストで `/` と `/sessions` の遷移を検証する
   - `/sessions` への遷移中に接続が切断されないことの検証手順: 接続 → `Sessions` ボタンクリック → `/sessions` 遷移 → 接続状態確認 → `/` に戻る → 接続維持確認

## テスト方針

- Vitest コンポーネントテスト: `SessionsButton` / `CopyUrlButton` のクリックハンドラが `route()` を正しく呼ぶことを検証する。モックやスタブは使用しない（CODEBASE.md の規約）。`LocationProvider` + `Router` でラップして実際に URL / 表示が切り替わることを検証する
- Playwright E2E テストで以下を検証する
  - `/` にアクセスしたときに DevTools が表示されること
  - `/devtools/` にアクセスしたときに DevTools が表示されること（既存テストの互換性）
  - Header の `Sessions` ボタンをクリックすると `/sessions` に遷移すること
  - `/sessions` に直接アクセスしたときにページが表示されること
  - 既存の query-string パラメータ（channelId 等）が `/` で正しく復元されること
  - `CopyUrlButton` クリック後に `LocationProvider` の内部 state が URL と同期すること
  - `/sessions` への遷移中に接続が切断されないこと（Sora 接続テストが必要な場合は `requireSoraConnectionEnv()` を使用する）
- #0062（三項演算子禁止）がマージ済みの場合は新規追加コードで三項演算子を使用しないこと。未マージの場合は `no-ternary` が `off` のため影響ない
- #0063 / #0037 が未完了の場合、E2E テストで `requireSoraConnectionEnv()` が使えないため、`process.env` 直接読み取り等のフォールバックを検討すること

## リスクと対策

| リスク                                                                        | 対策                                                                                                                                        |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `preact-iso` の chunk が `preact` chunk に混在してキャッシュ効率が下がる      | `manualChunks` で `preact-iso` を独立した chunk に分離する                                                                                  |
| `/sessions` 遷移で Sora 接続が切断される                                      | `App.tsx` に `beforeunload` リスナーを配置し、`DevTools.tsx` の cleanup から `disconnectSora()` を削除する                                  |
| `beforeunload` 内で非同期切断が完了しない                                     | ブラウザ終了時は切断完了を保証できない。#0067 の「切断不確定」表示方針（`ended_at` が NULL のレコードは「切断不確定」として扱う）で対応する |
| `Header` / `Footer` 共有配置で `/sessions` に DevTools 専用ボタンが表示される | 実装時にページ別の出し分けを検討する                                                                                                        |

## 関連 issue

- #0065: DuckDB-Wasm + OPFS で過去セッションの記録を永続化する（親 issue）
- #0067: DuckDB-Wasm + OPFS でセッション・接続メタデータを永続化する
- #0068: WebRTC stats を DuckDB-Wasm + OPFS に永続化する
- #0069: DownloadReportButton と DownloadReport 関連機能を削除する
- #0070: /sessions ページに過去セッション一覧・詳細・フィルタ UI を実装する
- #0058: `vite.config.ts` の `manualChunks` で `moduleId.includes()` の誤マッチを防ぐ（`preact-iso` 追加と関連）
