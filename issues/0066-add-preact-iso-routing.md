# preact-iso を導入して /sessions ページへのルーティング基盤を追加する

- Priority: Medium
- Created: 2026-06-24
- Completed: YYYY-MM-DD
- Model: GLM-5.2
- Branch: feature/add-preact-iso-routing
- Polished: 2026-07-10

## 目的

過去セッション一覧ページ `/sessions` を別ページとして実現するため、preact-iso によるルーティング基盤を導入する。あわせて、SPA 遷移で Sora 接続が切れないよう初期化と切断ライフサイクルを `App.tsx` に集約する。

## 優先度根拠

Medium。後続の DuckDB-Wasm 永続化機能の UI 実装（#0065 エピック）に必要な前提基盤であるが、現状の DevTools 機能には影響しない。

## 現状

- `src/main.tsx` は `render(<App />, rootElement)` だけの純粋な SPA 構成。クライアントルーティングは無い
- `src/App.tsx` は `<DevTools />` を直接描画している
- `src/DevTools.tsx` の `useEffect` で `setInitialParameter()` / `setMediaDevices()` / `unregisterServiceWorker()` を呼び、cleanup で `void disconnectSora()` を呼んでいる。`beforeunload` リスナーはリポジトリ全体に存在しない
- 既存の URL パラメータは `location.search` を直接読み書きしている
  - `src/app/actions.ts` の `copyURL()` は `location.origin` / `location.pathname` / `location.search` を参照し、`history.replaceState()` で URL を更新する
  - `src/app/actions.ts` の `setInitialParameter()` は先頭で `signals.resetState()` を呼び、続けて `new URLSearchParams(location.search)` を参照する
  - `src/components/DebugPane/index.tsx` の debug タブ切替も `history.replaceState()` で `debugType` を更新する。`debug === false` のとき早期 `return null` する
- `src/components/Header/index.tsx` には `DebugButton` / `DownloadReportButton` / `CopyUrlButton` / `SignalingUrlModal` が配置されている。`NavbarBrand` は素の `<a href="/">`（`src/components/ui/Navbar.tsx`）
- `src/components/Footer/index.tsx` にもモバイル向け `DebugButton` がある
- `vite.config.ts` に `base` は未設定。既存 E2E テスト 5 件はすべて `http://localhost:3333/devtools/` に遷移する。現状 `/devtools/` が動くのは Router が無く、Vite の SPA フォールバックで常に `DevTools` が描画されるためである（vite `base` ではない）
- `package.json` に `preact-iso` は未導入。`vite.config.ts` の `manualChunks` は `moduleId.includes(\`node_modules/${mod}\`)`（末尾 `/` なし）のため、`preact`が`preact-iso` に誤一致しうる（#0058 未マージ）
- コンポーネントテスト（`*.ct.tsx`）の先例は `src/components/ui/FormLabel.ct.tsx` のみ。`LocationProvider` ラップの先例は無い

## 設計方針

### スコープ

- ルーティングライブラリは Preact 公式の `preact-iso` を採用する（`preact-router` や自前 History ラッパは採用しない）

本 issue が担うもの:

- `preact-iso` の導入と `/` / `/sessions` / `/devtools/`（default）のルーティング
- `SessionsButton` と `/sessions` 仮ページ
- `App.tsx` への初期化集約と切断ライフサイクル変更（後述）
- `history.replaceState` と `LocationProvider` の同期（`CopyUrlButton` / `DebugPane`）
- ルーティング用の ct / E2E

本 issue のスコープ外:

- `/sessions` の実 UI（#0070）
- DuckDB-Wasm 永続化（#0067 / #0068）
- `DownloadReportButton` の削除（#0069）
- Header / Footer のページ別出し分け（#0071）
- 本番静的ホスト（R2）での `/sessions` 直打ち SPA fallback（完了範囲は `vp dev` / `vp preview` / Playwright E2E）
- PBT（`*.prop.ts`）

### ルーティング構成

コンポーネントツリー:

```text
LocationProvider          ← main.tsx（useLocation が有効になる境界）
  └─ App                  ← 初期化 / beforeunload
       ├─ Header          ← Router 外だが LocationProvider 内（SessionsButton / CopyUrlButton の useLocation 可）
       ├─ ErrorBoundary   ← import { ErrorBoundary, Router, Route, lazy } from "preact-iso"
       │    └─ Router
       │         ├─ Route path="/" → DevTools
       │         ├─ Route path="/sessions" → lazy(Sessions)
       │         └─ Route default → DevTools
       └─ Footer
```

- `Header` / `Footer` は `Router` の外・`LocationProvider` の内に置く。`DevTools.tsx` から `Header` / `Footer` を取り除く
- `/sessions` は `lazy(() => import("./routes/Sessions"))` で遅延読み込みする
- マッチしないパス（`/devtools/` / `/devtools` / 未知パス）は `<Route default component={DevTools} />` で DevTools に落とす。既存 E2E・ブックマーク便宜であり、製品の後方互換保証ではない（親 #0065）
- `ErrorBoundary` は preact-iso の named export。lazy の suspend / ロード失敗を捕捉するための推奨ラッパであり、既定のエラー UI は描画しない（`onError` コールバックのみ）。第 1 段階では失敗専用 UI は作らない

### `SessionsButton` と仮ページ

- `DownloadReportButton` と併存する
- DOM 順は `DebugButton` → `DownloadReportButton` → `SessionsButton` → `CopyUrlButton`。既存と同様に各ボタンを `NavbarText` で包む
- 表示テキストは `Sessions`。スタイルは `CopyUrlButton` / `DebugButton` の `baseClasses` / `stateClasses` パターンに準拠。#0062 がマージ済みなら三項演算子を使わず `if` / 早期 return で書く
- コンポーネント先頭で `const { route } = useLocation()` を取り、クリックで `route("/sessions")` を呼ぶ。クエリストリングは引き継がない（接続状態は signal 側に残る）
- `src/routes/Sessions.tsx` は default export の仮ページ。`<h1>Sessions</h1>` を表示する（#0070 で置き換え）

### `history.replaceState` と `LocationProvider` の同期

- `LocationProvider` は同一オリジンの `<a>` クリックと `popstate` を追従するが、`history.replaceState()` は追従しない
- 同期対象:
  1. `CopyUrlButton.tsx`: `copyURL()` が `true` を返した直後
  2. `DebugPane/index.tsx`: `debugType` 更新の `replaceState` 直後
- **hooks 配置（必須）**: `const { route } = useLocation()` はコンポーネント先頭（`DebugPane` では `if (!debugValue) return null` **より前**）で呼ぶ。コールバック / `await` の後では `useLocation()` を呼ばない。`route(pathname + search, true)` だけをハンドラ内で実行する
- `copyURL()` 本体の `replaceState` は残す。`route(..., true)` は LocationProvider 内部 state 更新のための追加呼び出しである
- address bar だけ見ても同期の有無は判別できない（`replaceState` だけで address bar は更新される）。検証は ct 内の `useLocation().url` プローブで行う（E2E フォールバックは置かない）
- `NavbarBrand` の `<a href="/">` は `LocationProvider` の click 委譲でクライアントサイド遷移する（`Link` への置換は不要）

### 初期化と切断ライフサイクル

現状の切断トリガは `DevTools` の `useEffect` cleanup（`void disconnectSora()`）のみである。Router 導入後にこの cleanup を残すと、`/sessions` 遷移で `DevTools` がアンマウントされた瞬間に切断される。

目標状態:

| イベント                             | 動作                                                 |
| ------------------------------------ | ---------------------------------------------------- |
| SPA 内遷移（`/` ↔ `/sessions`）      | 切断しない                                           |
| タブ閉鎖・リロード等のフルアンロード | `beforeunload` で `void disconnectSora()` を試行する |
| `DevTools` のアンマウント            | `disconnectSora` を呼ばない                          |

実装:

- `setInitialParameter()` / `setMediaDevices()` / `unregisterServiceWorker()` と `beforeunload` は `App.tsx` に置く
- `DevTools.tsx` の `useEffect` から上記初期化と cleanup の `disconnectSora()` を削除する
- `App.tsx` の `useEffect` で初期化 3 関数を `void` 呼び出しし、`addEventListener("beforeunload", handleBeforeUnload)` を登録する。`handleBeforeUnload` 内で `void disconnectSora()` を呼ぶ。cleanup で `removeEventListener("beforeunload", handleBeforeUnload)` する（HMR / テスト再マウントでの二重登録防止。#0067 が同じハンドラに `close()` を足せる形）
- `beforeunload` 内の非同期完了は保証できない。`pagehide` は第 1 段階では採用しない（親 #0065）
- `/sessions` 直アクセスでも App マウント時に初期化 3 関数が走る。全ルート共通の起動処理として受容する。`/sessions?...` の query が DevTools 用 signal に流し込まれる副作用も第 1 段階では受容する（#0070 側で整理）

### Header / Footer 共有時の既知制限

- 共有配置のため `/sessions` でも `CopyUrlButton` / `DebugButton`（Header・Footer）/ `SignalingUrlModal` / TURN URL 表示 / `DownloadReportButton` が出る
- `/sessions` で Copy URL すると `location.pathname` が `/sessions` の無意味な URL になる
- ページ別出し分けは #0071 で扱う

## 完了条件

- `/` で既存の DevTools が動作すること
- `/devtools/` および `/devtools` で既存の DevTools が動作すること（既存 E2E の URL を変更しない）
- `/sessions` で仮ページ（`<h1>Sessions</h1>`）が表示されること
- Header に `Sessions` ボタンが表示され、クリックで `/sessions` にクライアントサイド遷移すること
- `/sessions` から `NavbarBrand`（`href="/"`）クリックで pathname `/` にクライアントサイド遷移し、接続中であれば接続が維持されること
- `CopyUrlButton` 成功後および DebugPane タブ切替後に、`useLocation().url` が address bar の URL と一致すること
- 既存のクエリストリングパラメータ機能が `/` で壊れていないこと
- `/sessions` への SPA 遷移中も、接続中の Sora セッションが切断されないこと（接続維持 E2E は `#0037` → `#0063` を本 issue 完了のハード前提とする。親 #0065 のテスト方針「Sora 接続が必要な E2E は #0037 → #0063 を前提」の帰結であり、推奨マージ順の機能チェーン図とは別軸）
- `#0058` 未マージの場合は `manualChunks` で `preact-iso` が `preact` chunk に飲み込まれないこと
- `vp build` / `vp test run` / `pnpm test:ct` / `pnpm test:e2e` / `vp check` が成功すること
- `CHANGES.md` の `## develop` に `- [ADD] preact-iso を導入して /sessions ページへのルーティング基盤を追加する` を記載すること

## 解決方法

1. 失敗するテストを先に追加する（`CODEBASE.md` の「テストを先に修正すること」）
   - `vitest.ct.config.ts` を次のように更新する
     - `vite.config.ts` と同じ `resolve.alias["@"]` を追加する
     - `provider: playwright({ contextOptions: { permissions: ["clipboard-read", "clipboard-write"] } })` を設定する（ct はブラウザ内実行のため E2E の `context.grantPermissions` は使えない。#0038 の E2E 先例を ct に流用しない）
   - ct 共通: 各ファイルの `afterEach`（または同等）で `setDebug(false)` / `setDebugType("timeline")`（`@/app/actions` または `@/app/signals`）と、必要なら `@/app/signals` の `resetState()`、および `history.replaceState(null, "", "/")` による pathname 復元を行い、同一 page 上の後続テスト汚染を防ぐ
   - `src/components/Header/SessionsButton.ct.tsx`: 本番と同じ境界（`LocationProvider` 配下・ボタンは `Router` 外、`Sessions` は `Router` 内）でラップし、クリック後に `window.location.pathname === "/sessions"` かつ `getByRole("heading", { name: "Sessions" })` が出ることを検証する。history のモックは使わない
   - LocationProvider 同期用プローブ: 各 `*.ct.tsx` 内のローカルコンポーネントとし、本番コードには残さない。`data-testid="location-probe"` で `useLocation().url` をテキスト表示する
   - `src/components/Header/CopyUrlButton.ct.tsx`: 上記 clipboard 権限のもと Copy 成功後にプローブ URL が `pathname + search` と一致することを検証する
   - `src/components/DebugPane/DebugPane.ct.tsx`: 描画前に本番 API の `setDebug(true)` を呼ぶ（モック禁止。`DebugButton` クリックでも可）。タブを `timeline` から `signaling` へ切り替え、プローブ URL に `debugType=signaling` が反映されることを検証する
   - `tests/routing.test.ts`（Playwright。ルーティング遷移と接続維持の両方をこのファイルに置く）:
     - `/` / `/devtools/` / `/devtools` で `button[name="connect"]` が見えること
     - `getByRole("button", { name: "Sessions" })` クリックで `/sessions` に遷移し、`getByRole("heading", { name: "Sessions" })` が見えること
     - `/sessions` 直アクセスで仮ページが表示されること
     - 既存 query（`channelId` 等）が `/` で復元されること
     - 接続維持（`#0037` → `#0063` ハード前提。`requireSoraConnectionEnv()` + `#0037` の `DevtoolsPage` で接続・connectionId 取得。`process.env` フォールバック禁止。Sessions 遷移は POM に未実装なら `page` の locator を併用し、必要なら `DevtoolsPage` にメソッドを足す）:
       1. `DevtoolsPage` の起点 URL（`/devtools/`）で接続し、`#local-video-connection-id` のテキストをキャプチャする
       2. Header の TURN URL（`page.locator("header p")`。現状 Header 内の `<p>` は TURN のみ）が `"TURN URL"` 以外になるまで待つ（`connectionStatus === "connected"` 到達。connection-id 出現時点ではまだ `"connecting"` のことがある）
       3. `getByRole("button", { name: "Sessions" })` で `/sessions` へ遷移する（`#local-video-connection-id` は DevTools アンマウントにより消える。消えること自体は切断を意味しない）
       4. `/sessions` 滞在中も `header p` が `"TURN URL"` ではないことを確認する（接続中は `turnUrl` または `"不明"`。Signaling URL は未接続でも candidates 表示のため使わない）
       5. `getByRole("link", { name: "Sora DevTools" })`（NavbarBrand）で戻り、address bar の pathname が `/` であること（`/devtools/` 起点でも Brand は `href="/"` 固定。`href` を `/devtools/` に変更しない）、かつ `#local-video-connection-id` がキャプチャと一致することを確認する
2. `package.json` の `dependencies` に `preact-iso` を追加する（`vp install` → `x.y.z` ピン留め。peer の `preact-render-to-string` が自動導入されたら同様にピン留め）
3. `vite.config.ts` の `manualChunks` に `preact-iso` を追加する（`#0058` 未マージ時は `preact-iso` を `preact` より先に配置）
4. `src/main.tsx` を `render(<LocationProvider><App /></LocationProvider>, rootElement)` に変更する
5. `src/App.tsx` を上記ツリーどおりに変更する（`import { ErrorBoundary, Router, Route, lazy } from "preact-iso"`。`beforeunload` の登録と `removeEventListener` 対称）
6. `src/routes/Sessions.tsx` に仮ページ（`<h1>Sessions</h1>`）を作成する
7. `SessionsButton.tsx` を作成し `Header/index.tsx` に `NavbarText` 付きで配置する
8. `CopyUrlButton.tsx` / `DebugPane/index.tsx` で先頭 `useLocation` + ハンドラ内 `route(..., true)` を入れる
9. `DevTools.tsx` から `Header` / `Footer` と初期化 / cleanup の `disconnectSora` を削除する
10. `CHANGES.md` の `## develop` に ADD エントリを追記する（`shiguredo-changelog` に従い、エントリ直後に `- @username` を付ける）

## 関連 issue

- #0065: DuckDB-Wasm + OPFS で過去セッションの stats / メタデータを永続化し /sessions ページで確認できるようにする（親 issue。接続維持 E2E の `#0037` → `#0063` ハード前提は親テスト方針の帰結）
- #0067: DuckDB-Wasm + OPFS でセッション・接続メタデータを永続化する（同じ `App.tsx` の `beforeunload` に `close()` を追加する）
- #0069: DownloadReportButton と DownloadReport 関連機能を削除する（本 issue では併存。#0070 後推奨）
- #0070: /sessions ページに過去セッション一覧・詳細・フィルタ UI を実装する
- #0058: `vite.config.ts` の `manualChunks` で `moduleId.includes()` の誤マッチを防ぐ（未完了なら本 issue 内で配置順ワークアラウンド）
- #0062: 三項演算子を全面禁止する（マージ済みなら新規コードで遵守）
- #0037: e2e テストに Page Object Model を導入する（接続維持 E2E のハード前提）
- #0063: Sora 接続が必要な E2E テストで環境変数未設定時に skip する仕組みを追加する（接続維持 E2E のハード前提）
- #0071: /sessions では DevTools 専用 Header 操作を出さないようにする（本 issue の共有 Header 既知制限の切り出し）
