# DownloadReportButton と DownloadReport 関連機能を削除する

- Priority: Medium
- Created: 2026-06-24
- Completed: YYYY-MM-DD
- Model: GLM-5.2
- Branch: feature/change-remove-download-report-button
- Polished: 2026-06-24

## 目的

過去セッションを DuckDB-Wasm + OPFS で永続化し、`/sessions` ページで閲覧・分析できるようになるため、現在のセッションのみを JSON ダウンロードする DownloadReportButton の役割が薄れる。DownloadReportButton は長時間セッションで数 MB の JSON Blob を生成し、メンテナンスコスト・UI スペースの観点から継続的に運用する価値が低い。#0070 完了後には Sessions ページへの導線と機能が重複するため、DownloadReportButton とそれに関連する機能を削除する。また、DownloadReport は `metadata` / `signalingNotifyMetadata` などの機密情報をマスクせずに JSON ダウンロードするため、セキュリティ上の観点（ファイルが保存・共有されうる）からも削除が望ましい。

## 優先度根拠

Medium。機能削除であり、既存の接続・デバッグ機能には影響しない。メンテナンスコスト削減とセキュリティリスク回避の単独の価値がある。#0066 と同時期に対応することで Header の `SessionsButton` 配置と連携できるが、#0066 への依存は必須ではない。

## 現状

- `src/components/Header/DownloadReportButton.tsx` に DownloadReportButton コンポーネントが存在する
- `src/components/Header/index.tsx` に DownloadReportButton が `<NavbarText>` でラップされて配置されている
- `src/types.ts` に `DownloadReport` / `DownloadReportParameters` 型が定義されている（394 行 / 421 行）
- ダウンロードレポートは `userAgent` / `sora-devtools` バージョン / `sora-js-sdk` バージョン / `parameters`（フォーム状態全体）/ `timeline` / `notify` / `stats` を JSON 化したもの
- `CHANGES.md` の `2026.1.0` に `- [FIX] DownloadReportButton の Blob URL がリークする問題を修正する` の記載がある

## 設計方針

- `src/components/Header/DownloadReportButton.tsx` を削除する
- `src/components/Header/index.tsx` から DownloadReportButton の import と `<NavbarText>` ブロックごと削除する。削除後のレイアウト調整（マージンクラス）は必要に応じて行う
- `src/types.ts` から `DownloadReport` / `DownloadReportParameters` 型を削除する
- `DownloadReportParameters` を使用している箇所は `src/components/Header/DownloadReportButton.tsx` のみであるため、ファイル削除と同時に整理する
- `SessionsButton` の配置は #0066 で実施する。本 issue では DownloadReportButton の削除のみを行う
- CHANGES.md の `## develop` に `- [CHANGE] DownloadReportButton と DownloadReport 関連機能を削除する` を追加する。`shiguredo-changelog` スキルの規約に従うこと
- 2026.1.0 の FIX エントリは過去の修正履歴として残す

## 完了条件

- Header に DownloadReportButton が表示されないこと
- `src/components/Header/DownloadReportButton.tsx` が削除されていること
- `DownloadReport` / `DownloadReportParameters` 型が削除されていること
- `vp build` / `vp test run` / `vp check` が成功すること
- CHANGES.md の `## develop` に `- [CHANGE] DownloadReportButton と DownloadReport 関連機能を削除する` の変更履歴が記載されていること

## 解決方法

1. Playwright E2E テストと Vitest コンポーネントテストを先に追加・修正する（CODEBASE.md の「何か変更をする場合はテストを先に修正すること」に従う）
   - Playwright E2E テストで Header に "Download report" テキストが存在しないことを assert する。このテストは Sora 接続を必要としないため #0063 の `requireSoraConnectionEnv()` に依存しない
   - Header コンポーネントテストは `connectionStatus` / `signalingUrlCandidates` / `sora` / `turnUrl` signal と子コンポーネントへの依存が大きく、CODEBASE.md でモック・スタブ禁止のため実体描画が必要。実装時に Header の `.ct.tsx` テストが実現可能か判断し、困難な場合は E2E テストのみで検証する
2. `src/components/Header/DownloadReportButton.tsx` を削除する
3. `src/components/Header/index.tsx` から DownloadReportButton の import と `<NavbarText>` ブロックごと削除する
4. `src/types.ts` から `DownloadReport` / `DownloadReportParameters` を削除する
5. CHANGES.md を更新する（`shiguredo-changelog` スキル参照）
6. `vp check` で削除し忘れた型や import がないか確認する

## テスト方針

- Playwright E2E テストで Header に DownloadReportButton が表示されないことを検証する。テキスト "Download report" が DOM に存在しないことを assert する。Sora 接続を必要としないため #0063 に依存しない
- Header コンポーネントテストは実装時に実現可能性を判断し、困難な場合は E2E テストのみで検証する（`SessionsButton` の配置は #0066 で実施する）

## リスクと対策

| リスク                                                                                   | 対策                                                                         |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `DownloadReport` / `DownloadReportParameters` 型を他で使用していて削除時に型エラーになる | 削除前に `grep` / `vp check` で全参照を確認する                              |
| 過去 issue やドキュメントで DownloadReportButton が参照され続ける                        | closed issue は履歴として残す。open issue への影響は未解決課題として管理する |
| Header のレイアウト崩れ                                                                  | DownloadReportButton 削除後にマージンクラスを調整する                        |

## 未解決課題

- open issue #0038 が Header 配下のボタン一覧に `DownloadReportButton` を含めている（`issues/0038-test-add-sora-independent-ui-tests.md` 40 行）。本 issue 完了後に #0038 のボタン一覧から `DownloadReportButton` を除外する必要がある
- `issues/pending/0019-enhance-split-utils-and-types.md` で `DownloadReport` / `DownloadReportParameters` が `src/types` 分割対象として挙げられている。本 issue 完了後に #0019 の分割計画から `DownloadReport` / `DownloadReportParameters` を除外する必要がある。#0019 が先に実施された場合は `src/types/report.ts`（`DownloadReport` 型格納予定）の作成を不要とし、`src/types/state.ts`（`DownloadReportParameters` 格納予定）への分割も不要とする

## 関連 issue

- #0065: DuckDB-Wasm + OPFS で過去セッションの stats / メタデータを永続化し /sessions ページで確認できるようにする（親 issue）
- #0066: preact-iso を導入して `/sessions` ページへのルーティング基盤を追加する
- #0067: DuckDB-Wasm + OPFS でセッション・接続メタデータを永続化する
- #0068: WebRTC stats を DuckDB-Wasm + OPFS に永続化する
- #0070: /sessions ページに過去セッション一覧・詳細・フィルタ UI を実装する
