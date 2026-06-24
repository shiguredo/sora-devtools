# preact-iso を導入して /sessions ページへのルーティング基盤を追加する

- Priority: Medium
- Created: 2026-06-24
- Completed: YYYY-MM-DD
- Model: Kimi K2.7 Code
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
- `src/components/Header/index.tsx` には `DebugButton` / `DownloadReportButton` / `CopyUrlButton` / `SignalingUrlModal` が配置されている
- `src/DevTools.tsx` の `useEffect` の cleanup で `disconnectSora()` を呼んでいる

## 技術選定

- `preact-iso` は Preact 公式のルーティング・データ取得ライブラリであり、本プロジェクトの Preact 10 スタックと親和性が高い
- 純粋な SPA なので `hydrate` ではなく `render` + `LocationProvider` を使用する
- `lazy()` を使うことで `/sessions` ページを初期 bundle から切り離せる

## 設計方針

- `preact-iso` を `dependencies` に追加する
- `pnpm-workspace.yaml` の `minimumReleaseAgeExclude` に `preact-iso` を追加する
- `src/main.tsx` で `LocationProvider` をトップレベルに配置し、`render` で `App` を描画する
- `src/App.tsx` で `Router` / `Route` を使い、`/` と `/sessions` を切り分ける
  - `Header` / `Footer` は `App.tsx` で共有配置し、どちらのページでも表示する
  - `DevTools.tsx` から `Header` / `Footer` を取り除き、`main` 部分のみをルーティング対象とする
- `/` は既存の `DevTools` コンポーネントを描画する
- `/sessions` は `lazy(() => import('./routes/Sessions'))` で遅延読み込みし、初期 bundle に含めない
- `src/components/Header/index.tsx` の `DownloadReportButton` の位置に `SessionsButton` を配置する
- `/sessions` ページには仮のコンポーネントを配置し、後続 issue で中身を実装する
- 既存の `copyURL()` / `setInitialParameter()` は `location.search` / `history.replaceState()` を直接使用するため、`preact-iso` の `useLocation()` への統合は行わない
  - ただし、`copyURL()` の `history.replaceState()` は `popstate` イベントを発火しないため、`LocationProvider` の内部 state と実際の URL がずれる可能性がある
  - このため、`CopyUrlButton.tsx` 側で `copyURL()` 実行後に `useLocation().route(globalThis.location.pathname + globalThis.location.search, true)` を呼び、`LocationProvider` と同期する
- `/sessions` ページへの遷移中も Sora 接続が切断されないよう、`DevTools.tsx` の cleanup から `disconnectSora()` を削除し、代わりに `beforeunload` イベントリスナーで `disconnectSora()` を呼ぶ
  - `beforeunload` 内での非同期処理の保証は限られるため、実装時に `sora-js-sdk` の切断 API と整合性を確認する

## 完了条件

- `/` で既存の DevTools が動作すること
- `/sessions` で別ページが表示されること
- Header に `Sessions` ボタンが表示され、クリックで `/sessions` に遷移すること
- `CopyUrlButton` クリック時に URL が正しくコピーされ、`LocationProvider` の内部 state も同期すること
- 既存のクエリストリングパラメータ機能が壊れていないこと
- `/sessions` ページへの遷移中も、接続中の Sora セッションが切断されないこと
- `build` / `check` が成功すること
- `CHANGES.md` に `- [ADD] preact-iso を導入して /sessions ページへのルーティング基盤を追加する` を記載すること

## 解決方法

1. `package.json` の `dependencies` に `preact-iso` を追加する
2. `pnpm-workspace.yaml` の `minimumReleaseAgeExclude` に `preact-iso` を追加する
3. `vite.config.ts` の `manualChunks` に `preact-iso` を追加する
   - `preact-iso` を独立した chunk に分離し、ルーティングコードを初期 bundle から切り離す
   - 判定順序は `preact-iso` を `preact` より先に配置する。現状の `moduleId.includes(`node_modules/${mod}`)` では `preact` が `node_modules/preact-iso` に誤一致するため、先に判定されるようにする
4. `src/main.tsx` を以下のように変更する
   - `import { LocationProvider } from 'preact-iso'`
   - `render(<LocationProvider><App /></LocationProvider>, rootElement)`
5. `src/App.tsx` を以下のように変更する
   - `import { Router, Route, lazy } from 'preact-iso'`
   - `Header` / `Footer` を `Router` の外に配置して両ページで共有する
   - `/` に `DevTools` を配置（`DevTools.tsx` から `Header` / `Footer` を取り除いた状態）
   - `/sessions` に `lazy(() => import('./routes/Sessions'))` を配置
   - マッチしないパスに対しては既存の DevTools へフォールバックする
6. `src/routes/Sessions.tsx` に仮のページコンポーネントを作成する（default export）
7. `src/components/Header/SessionsButton.tsx` を作成し、`src/components/Header/index.tsx` に配置する
   - `SessionsButton` は `useLocation().route('/sessions')` を呼び出す
8. `src/components/Header/CopyUrlButton.tsx` を修正し、`copyURL()` 実行後に `useLocation().route(globalThis.location.pathname + globalThis.location.search, true)` を呼び出す
9. `src/DevTools.tsx` から `Header` / `Footer` を取り除き、`App.tsx` で共有配置する
   - 影響範囲: 既存のコンポーネントテスト・E2E テストのセレクタ・レイアウトに変更が出る可能性がある。テストで `Header` / `Footer` の存在を `DevTools.tsx` 単体で検証している場合は修正が必要
10. `src/DevTools.tsx` の cleanup から `disconnectSora()` を削除し、`beforeunload` イベントリスナーで `disconnectSora()` と `sessionDatabase.close()` を呼ぶように変更する
    - `DevTools` マウント時に `addEventListener('beforeunload', handleBeforeUnload)`、アンマウント時に `removeEventListener` する
    - `handleBeforeUnload` 内では `void disconnectSora()` と `void sessionDatabase.close()` を呼び出す
    - `beforeunload` 内での非同期完了は保証できないため、ブラウザ終了時は切断完了を保証できない。次回起動時に `ended_at` が NULL の古いレコードを「切断不確定」として表示する方針は #0065 / #0067 で対応する
11. Playwright E2E テストで `/` と `/sessions` の遷移を検証する

## テスト方針

- Vitest コンポーネントテスト: `SessionsButton` / `CopyUrlButton` のクリックハンドラが `route()` を正しく呼ぶことを検証する
- Playwright E2E テストで以下を検証する
  - `/` にアクセスしたときに DevTools が表示されること
  - Header の `Sessions` ボタンをクリックすると `/sessions` に遷移すること
  - `/sessions` に直接アクセスしたときにページが表示されること
  - 既存の query-string パラメータ（channelId 等）が `/` で正しく復元されること
  - `CopyUrlButton` クリック後に `LocationProvider` の内部 state が URL と同期すること
  - `/sessions` への遷移中に接続が切断されないこと（Sora 接続テストが必要な場合は `requireSoraConnectionEnv()` を使用する）

## リスクと対策

| リスク                                                                   | 対策                                                                                                  |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `preact-iso` が `minimumReleaseAge` の制約で即座にインストールできない   | `pnpm-workspace.yaml` の `minimumReleaseAgeExclude` に追加する                                        |
| `preact-iso` の chunk が `preact` chunk に混在してキャッシュ効率が下がる | `manualChunks` で `preact-iso` を独立した chunk に分離する                                            |
| `/sessions` 遷移で Sora 接続が切断される                                 | `DevTools.tsx` の cleanup から `disconnectSora()` を削除し、`beforeunload` イベントリスナーで切断する |
| `beforeunload` 内で非同期切断が完了しない                                | 実装時に `sora-js-sdk` の切断 API を確認し、可能な限り同期的なクローズを検討する                      |

## 未解決課題

- `beforeunload` イベント内での `disconnectSora()` の非同期完了は保証できないが、これは #0065 / #0067 の「切断不確定」表示方針で対応する

## 関連 issue

- #0065: DuckDB-Wasm + OPFS で過去セッションの記録を永続化する（親 issue）
- #0067: DuckDB-Wasm + OPFS でセッション・接続メタデータを永続化する
- #0068: WebRTC stats を DuckDB-Wasm + OPFS に永続化する
- #0069: DownloadReportButton と DownloadReport 関連機能を削除する
