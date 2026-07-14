# /sessions に行単位削除と履歴削除（OPFS 再作成）を追加する

- Priority: Medium
- Created: 2026-07-14
- Completed: YYYY-MM-DD
- Model: Composer 2.5
- Branch: feature/add-sessions-delete-ui
- Polished: 2026-07-14

## 目的

DuckDB-Wasm + OPFS に溜まった過去セッションを、ユーザーが UI から削除できるようにする。調査用途で不要になった個別行を消す操作と、端末内履歴をまとめて消して DB を作り直す操作の両方を提供する。

## 優先度根拠

Medium。#0065 が第 1 段階の必須機能から意図的に外した「全履歴削除」であり、一覧・詳細の閲覧（#0070）が揃ったあとに必要になる UX。接続機能自体を阻害しないが、検証データ整理とプライバシー（端末内に残る接続記録）の観点で単独の価値がある。行単位削除は親エピックが名指ししていない追加 UX だが、全消去と同じ削除導線に載せると実装・レビュー単位が壊れないため本 issue に同梱する。

## 現状

- `/sessions` の一覧は `src/components/Sessions/SessionList.tsx` が描画する。カラムは channelId / session_id / started_at / ended_at / 状態のみで、削除 UI は無い
- `src/routes/Sessions.tsx` は `listSessions` で一覧を読み、行クリックで詳細を開くだけである。一覧再取得の `useEffect` 依存はフィルタ QS のみで、削除後に再 fetch する経路は無い
- `src/sessionDatabase.ts` に行削除 API は無い。OPFS ファイル削除は次の用途に限られる
  - 初期化時の破損フォールバック（非 export の `deleteOpfsDatabaseFile`）
  - E2E 用 `deleteSessionDatabaseFiles()`（内部で上記を呼ぶ。close 後にファイル削除するだけで、空 DB の再 open まではアプリ UI 向けにまとめていない）
- テーブルは `sessions` / `connections` / `webrtc_stats`。`FOREIGN KEY` は無く、`connections.session_db_id` / `webrtc_stats.session_db_id` で論理的に紐づく
- 既存の `close()` は flush → ハンドル解放 → `currentSessionDbId` / `currentConnectionId` を null → `initStarted = false` まで行い、同一ドキュメントでの再初期化を可能にしている
- `createSessionDatabase()` は初期化失敗を `console.warn` するだけで **再 throw しない**（App の fire-and-forget 初期化契約）。再 open 成否は呼び出し後の `isSessionDatabaseAvailable()` で判定する必要がある
- `flushOneStatsBuffer` はバッファから行を **キュー外で抜き出したあと** `enqueueWrite` で INSERT する。`statsBuffers.has` ガードは `duckdbConnection === null` 時のみ。そのため `clearStatsBuffers` を DELETE 直前に呼んでも、既に抜き済みの flush が後続 INSERT して孤児 `webrtc_stats` を残しうる
- 既存書き込み API（`insertSession` 等）は成功後に `runCheckpointUnlocked()` する
- `src/sessionDatabase.test.ts` は純粋関数（`maskSensitiveMetadata` 等）のみ。DuckDB/OPFS の検証は Playwright E2E（`tests/session-database.test.ts` / `tests/helpers/sessionDatabase.ts`）に置くのが #0065 / #0067 / #0070 の方針
- `vite.config.ts` の lint で `"no-alert": "error"` のため、`window.confirm` / `alert` / `prompt` は使えない
- `connectSora` は `preparing` を立てたあとで `insertSession` するため、`getCurrentSessionDbId() === null` でも接続試行中の区間がある

## 設計方針

### スコープ

本 issue が担うもの:

1. **行単位削除**: 一覧の各行に削除ボタンを置き、対象 `sessions.id` と紐づく `connections` / `webrtc_stats` を削除する
2. **履歴削除（全消去）**: 一覧セクション見出し付近に「履歴を削除」ボタンを置き、DuckDB を `close()` したうえで OPFS 上の `sora-devtools-sessions.db`（および `.wal` / `.tmp` 候補）を削除し、空の DB で再初期化する

本 issue のスコープ外:

- DB エクスポート（#0065 が全履歴削除と並んで別 issue 扱いとしているもの。本 issue では扱わない）
- 一覧の「接続中」表示をライブ更新する仕組み（一覧 fetch 時スナップショットのまま。クリック時の API 拒否で安全は担保する）

### API（`src/sessionDatabase.ts`）

| API                                                 | 責務                                    |
| --------------------------------------------------- | --------------------------------------- |
| `deleteSession(sessionDbId: number): Promise<void>` | 当該 `session_db_id` のデータを削除する |
| `resetSessionDatabase(): Promise<void>`             | 履歴を全消去し、空 DB を開き直す        |

`sessionDatabaseLoader.ts` へのラッパー追加は不要（Sessions UI は `@/sessionDatabase` を直接 import する現状を維持。無効ビルドから新 API を呼ばない）。

両 API は失敗時に `Error` を throw し、`notifyPersistenceError` / `setSoraErrorAlertMessage` は呼ばない（ページ内 `sessions-page-error` のみ）。

#### `deleteSession`（固定）

1. 先頭で `await whenReady()` する（他書き込み API と同様）
2. `sessionDbId === getCurrentSessionDbId()` のときは拒否し、`Error` を throw する。メッセージ例: `Cannot delete session: sessionDbId <id> is the current session`（英語・末尾ピリオドなし・実際の id を含める）
3. 必ず `enqueueWrite` 内で実行する。キュー内で `duckdbConnection === null` なら `Error` を throw する（キュー外の事前検査だけに頼らない。`close()` との競合で外側通過後に null になりうる）
4. 同一キュー内の順序は次に固定する
   1. 当該 `sessionDbId` の stats バッファを破棄する（`clearStatsBuffers`。未 flush 分は捨ててよい）
   2. `DELETE FROM webrtc_stats WHERE session_db_id = ?`
   3. `DELETE FROM connections WHERE session_db_id = ?`
   4. `DELETE FROM sessions WHERE id = ?`
   5. `runCheckpointUnlocked()`（既存書き込み API と同様）
5. **孤児 INSERT 防止（本 issue で必須）**: `flushOneStatsBuffer` の `enqueueWrite` 内で、`duckdbConnection !== null` のときも `!statsBuffers.has(targetId)` なら `insertStatsRowsUnlocked` を行わず return する（抽出済みバッチを破棄）。`clearStatsBuffers` だけでは不十分であり、この変更を `deleteSession` 契約の一部とする
6. トランザクション（`BEGIN`/`COMMIT`）は使わない。途中失敗時はそれまでに消えた行が残る可能性を受容し、エラーは throw して UI に出す。再試行で残件を消せる
7. 対象 `sessions` 行が 0 件（存在しない id）でも成功とする（no-op）。カスケード DELETE と CHECKPOINT は実行してよい
8. **切断済み**（`ended_at` あり）と **切断不確定**（`ended_at` なしかつ current 以外）は削除可。拒否するのは current 一致のみ

#### `resetSessionDatabase`（固定）

1. `getCurrentSessionDbId() !== null` のときは拒否し、`Error` を throw する。メッセージ例: `Cannot reset session database: a session is in progress`
2. 拒否判定は **`close()` より前**に行う（`close()` は `currentSessionDbId` を無条件で null にするため）
3. 実行中フラグ `resetInProgress`（モジュール内。名前は実装時に付けてよい）を `true` にし、`finally` で必ず `false` に戻す。`insertSession` は `enqueueWrite` 内で `duckdbConnection === null` 検査と並び、`resetInProgress` 中は既存の unavailable と同様に `null` を返し DB へ書かない（Header の Connect が reset 完了前に押されても、破棄直前の DB へ INSERT しない）
4. 手順: `await close()` → 既存の OPFS 削除ロジック（非 export の `deleteOpfsDatabaseFile` を内部利用。公開の `deleteSessionDatabaseFiles` と同じ実体）→ `await createSessionDatabase()` → `await whenReady()` → `isSessionDatabaseAvailable() === false` なら `Error` を throw する
5. `createSessionDatabase()` 自体の no-throw 契約は変更しない。成功判定は手順 4 の `isSessionDatabaseAvailable()` 検査に固定する
6. E2E ヘルパの `cleanupSessionDatabase`（close → ファイル削除のみで再 open しない）と混同しない。本 API は再 open まで含む

### UI

#### 共通

- 確認 UI は `window.confirm` を使わない（`no-alert`）。インラインの 2 段確認とする（1 回目クリックで確認帯を出し、確定/キャンセル）
- `data-testid`（固定）:
  - 行削除ボタン: `session-delete-${id}`
  - 行削除・確定: `session-delete-confirm-${id}`
  - 行削除・キャンセル: `session-delete-cancel-${id}`
  - 履歴削除ボタン: `sessions-reset-database`
  - 履歴削除・確定: `sessions-reset-confirm`
  - 履歴削除・キャンセル: `sessions-reset-cancel`
- 処理中は対象ボタンを disabled にし、二重送信を防ぐ。文言は変えず幅固定の問題を避ける
- エラー表示は既存の `sessions-page-error` を使う。`errorKind: "list" | "delete" | "reset"` と英語の `errorMessage` を分け、表示側でプレフィックスを切り替える（現行の「一覧読み取り」固定文言を置き換える）
  - `list`: `セッション一覧の読み取りに失敗しました: `
  - `delete`: `セッションの削除に失敗しました: `
  - `reset`: `履歴の削除に失敗しました: `
- DevTools の `alertMessages` には載せない
- `!loading && databaseAvailable` のときだけ削除ボタン・履歴削除ボタンを出す（初回 `whenReady` 前に押せないようにする）
- クリック時の API 拒否判定はモジュールの `getCurrentSessionDbId()` を再取得して行う
- 行削除の確認帯と履歴削除の確認帯は同時に開かない。片方を開いたら他方はキャンセルする。`deletingSessionDbId !== null` または `resetting` の間は、他方の削除操作開始も disabled にする
- 一覧再取得は `loadSessions` 関数を切り出し、マウント時・フィルタ変更時・削除/reset 成功後・reset 失敗後（後述）のすべてから呼ぶ。並行呼び出しでは request 世代（または共有 `cancelled`）で古い応答の `setSessions` / `setDatabaseAvailable` / `setLoading` を捨てる（現行 `useEffect` の `active.cancelled` と同趣旨を関数全体に広げる）
- #0062 が open の間は新規コードで三項演算子を使わない

#### 行単位削除

- `SessionList` に操作カラムを追加する。行削除の確認帯は **操作セル内** に描画する。親から次を渡す（型は同期コールバックに固定。API 呼び出しは親が `void` で起動する）:
  - `onRequestDelete: (sessionDbId: number) => void`（1 回目クリック。確認帯を開く）
  - `onConfirmDelete: (sessionDbId: number) => void`（確定）
  - `onCancelDelete: () => void`
  - `confirmingSessionDbId: number | null`
  - `deletingSessionDbId: number | null`
- `deriveSessionStatus` が `"connected"` の行は削除ボタンを出さない（`"ended"` / `"uncertain"` は出す）
- ボタンクリックは行選択と衝突しない（`stopPropagation`）
- 削除成功後: 選択中なら先に `sessionDbId` を QS から外し、そのあと `loadSessions` で一覧を再取得する。他のフィルタ QS（`channelId` 等）は残す

#### 履歴削除

- 一覧セクション見出し付近に「履歴を削除」ボタン。空一覧時も表示する（0 件でも押せる）
- 履歴削除の確認帯は **見出し付近（`Sessions.tsx`）** に描画する。`SessionList` は 0 件で早期 return するため操作セルには置けない
- 親 state: `confirmingReset: boolean` / `resetting: boolean`
- disabled 条件（UI）: 次のいずれか
  - `getCurrentSessionDbId() !== null`
  - `connectionStatus.value !== "disconnected"`（`@/app/signals` の `connectionStatus`。`preparing` / `connecting` / `connected` / `disconnecting` / `initializing` 等。`insertSession` 前の区間を含む）
- API 側の拒否は引き続き `getCurrentSessionDbId() !== null` のみ（UI が広いガード、API が狭いガード）
- 確認 UI で「保存されたセッション履歴がすべて削除される」旨を日本語で明示する
- 成功後: `sessionDbId` を QS から外し、`loadSessions` で再取得する（ローカルで空配列を直接セットしない）。他フィルタは残す。`databaseAvailable` を `isSessionDatabaseAvailable()` で再評価する
- 失敗後（`close` 後に reopen 失敗しうる）: `databaseAvailable` を再評価し、`sessionDbId` を QS から外す。`databaseAvailable === false` なら一覧を空にし、`true` なら `loadSessions` を呼ぶ。古い一覧のまま削除ボタンが出た状態を残さない

### テスト

`CODEBASE.md` に従い、失敗するテストを先に追加する。モック・スタブは使わない。

#### Vitest

- DuckDB/OPFS を Vitest で初期化してカスケード削除を検証しない
- 本 issue で純粋関数を切り出した場合のみ Vitest を追加する。切り出さなければ Vitest 追加なしでよい

#### Playwright E2E

- **DB 層**（`tests/session-database.test.ts` 系、serial、`cleanupSessionDatabase`）:
  - `deleteSession` 後に `listConnectionRows` / `listWebrtcStatsRows` で当該 `session_db_id` が 0 件
  - `currentSessionDbId` 一致時は throw
  - `resetSessionDatabase` 後に sessions / connections / webrtc_stats がすべて空
  - reset 後の新規接続で再び記録できること。新規行の `id` はリセット前と連続しない／1 に戻り得るため、断言は新規取得した id を使う
- **UI 層**（`tests/sessions-page.test.ts` 系、serial）:
  - 接続切断で 2 行ある状態から 1 行削除 → 一覧残り 1
  - カスケード確認で helpers（`listConnectionRows` 等）を使う場合は #0070 どおり、close を伴う query のあとに DOM 断言を続けるなら reload または `reopenAppSessionDatabase` 後の再取得を必須とする。helpers 断言はシナリオ末尾に置くのが安全
  - 履歴削除 → 空一覧 → その後の新規接続で再記録
  - 接続中（DevTools で接続維持したまま `/sessions`）は履歴削除が disabled、当該行の削除ボタンが無い
  - 確認 UI のキャンセル（`session-delete-cancel-*` / `sessions-reset-cancel`）では削除されないこと
- 孤児 INSERT ガード（`flushOneStatsBuffer`）は専用 E2E を追加しない。実装差分レビューで確認する
- 既存スイートの `beforeEach` / `afterEach` の `cleanupSessionDatabase` と衝突しないこと。UI 経由の `resetSessionDatabase` は再 open 済みなので、シナリオ終了後の cleanup はそのまま使える

### CHANGES.md

`## develop` の `[ADD]` 群に次を追記する（`shiguredo-changelog` に従う。issue 番号は書かない）:

```
- [ADD] /sessions にセッション行の削除と履歴削除（OPFS 再作成）を追加する
  - @voluntas
```

## 完了条件

- 過去セッション（切断済み・切断不確定）を行単位で削除でき、紐づく `connections` / `webrtc_stats` も残らないこと（E2E の helpers で確認）
- 履歴削除後は `/sessions` 一覧が空になり、その後の接続で再びセッションが記録されること
- 進行中セッション（`getCurrentSessionDbId()` と一致）は行削除できないこと（ボタン非表示、API は throw）
- UI 上、`getCurrentSessionDbId() !== null` または `connectionStatus !== "disconnected"` のときは履歴削除が disabled であること。API は `getCurrentSessionDbId() !== null` のとき throw すること
- `flushOneStatsBuffer` が削除済み id へ孤児 INSERT しないこと（上記ガード。専用 E2E は追加せず実装差分で確認）
- `resetInProgress` 中は `insertSession` が DB へ書かないこと
- `window.confirm` / `alert` を使っていないこと（`no-alert`）
- `vp build` / `vp test run` / 関連 E2E / `vp check` が成功すること
- `CHANGES.md` の `## develop` に上記 `[ADD]` と `- @voluntas` が記載されていること

## 解決方法

1. 失敗する Playwright E2E（DB 層・UI 層）を先に追加する
2. `src/sessionDatabase.ts` に `deleteSession` / `resetSessionDatabase`（`resetInProgress` 含む）を実装し、`flushOneStatsBuffer` の孤児 INSERT ガードを入れる
3. `SessionList.tsx` に操作カラムと行確認帯、`Sessions.tsx` に履歴削除確認帯・`loadSessions`・`errorKind` 付きエラー表示を配線する
4. `CHANGES.md` を更新する
5. `vp check` / テストを通し、動作を確認する

## 関連 issue

- #0065: 親エピック。第 1 段階の必須から「全履歴削除」を外し別 issue とした。本 issue がその全履歴削除側。DB エクスポートは別途
- #0070: `/sessions` 一覧・詳細 UI（closed）。本 issue の UI はここに載せる
- #0067 / #0068: スキーマと永続化（closed）。削除対象テーブルの所有者
- #0072: Sessions 機能のビルド時無効化（closed）。本機能の E2E・手動確認は Sessions 有効ビルド前提
- #0062: 三項演算子禁止（open）。新規 UI 分岐では三項を使わない
