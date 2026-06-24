# DownloadReportButton と DownloadReport 関連機能を削除する

- Priority: Medium
- Created: 2026-06-24
- Completed: YYYY-MM-DD
- Model: Kimi K2.7 Code
- Branch: feature/change-remove-download-report-button
- Polished: 2026-06-24

## 目的

過去セッションを DuckDB-Wasm + OPFS で永続化し、`/sessions` ページで閲覧・分析できるようになるため、現在のセッションのみを JSON ダウンロードする DownloadReportButton の役割が薄れる。DownloadReportButton は長時間セッションで数 MB 〜 数十 MB の JSON Blob を生成し、メンテナンスコスト・UI スペース・セキュリティ上の観点から継続的に運用する価値が低い。Sessions ページへの導線と機能が重複するため、DownloadReportButton とそれに関連する機能を削除する。

## 優先度根拠

Medium。機能削除であり、既存の接続・デバッグ機能には影響しないが、Header の Sessions ボタン配置に必要なため、#0066 と同時期に対応する。

## 現状

- `src/components/Header/DownloadReportButton.tsx` に DownloadReportButton コンポーネントが存在する
- `src/components/Header/index.tsx` に DownloadReportButton が配置されている
- `src/types.ts` に `DownloadReport` / `DownloadReportParameters` 型が定義されている
- ダウンロードレポートは現在の `timelineMessages` / `notifyMessages` / `statsReport` を JSON 化したもの
- `CHANGES.md` の `2026.1.0` に `- [FIX] DownloadReportButton の Blob URL がリークする問題を修正する` の記載がある

## 設計方針

- `src/components/Header/DownloadReportButton.tsx` を削除する
- `src/components/Header/index.tsx` から DownloadReportButton の import と配置を削除する
- `src/types.ts` から `DownloadReport` / `DownloadReportParameters` 型を削除する
- `DownloadReportParameters` を使用している箇所は `src/components/Header/DownloadReportButton.tsx` のみであるため、ファイル削除と同時に整理する
- Header の `DownloadReportButton` の位置に `SessionsButton` を配置する（#0066 と連携）
- CHANGES.md の次期リリース欄に `- [CHANGE] DownloadReportButton と DownloadReport 関連機能を削除する` を追加する
- 2026.1.0 の FIX エントリは過去の修正履歴として残す

## 完了条件

- Header に DownloadReportButton が表示されないこと
- `src/components/Header/DownloadReportButton.tsx` が削除されていること
- `DownloadReport` / `DownloadReportParameters` 型が削除されていること
- `build` / `test` / `check` が成功すること
- CHANGES.md に `- [CHANGE] DownloadReportButton と DownloadReport 関連機能を削除する` の変更履歴が記載されていること

## 解決方法

1. `src/components/Header/DownloadReportButton.tsx` を削除する
2. `src/components/Header/index.tsx` から DownloadReportButton の import と配置を削除する
3. `src/types.ts` から `DownloadReport` / `DownloadReportParameters` を削除する
4. CHANGES.md を更新する
5. `check` で削除し忘れた型や import がないか確認する

## テスト方針

- Playwright E2E テストで Header に DownloadReportButton が表示されないことを検証する
- Vitest コンポーネントテストで `Header` コンポーネントに DownloadReportButton が含まれないことを検証する（`SessionsButton` の配置は #0066 で実施する）

## リスクと対策

| リスク                                                                                   | 対策                                                                         |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `DownloadReport` / `DownloadReportParameters` 型を他で使用していて削除時に型エラーになる | 削除前に `grep` / `check` で全参照を確認する                                 |
| 過去 issue やドキュメントで DownloadReportButton が参照され続ける                        | closed issue は履歴として残す。open issue への影響は未解決課題として管理する |

## 未解決課題

- `issues/pending/0019-enhance-split-utils-and-types.md` で `DownloadReport` / `DownloadReportParameters` が `src/types` 分割対象として挙げられている。本 issue 実施後は以下を削除または修正する必要がある
  - `src/types/report.ts`（`DownloadReport` 型格納予定）を削除する
  - `src/types/state.ts` から `DownloadReportParameters` を削除する

## 関連 issue

- #0065: DuckDB-Wasm + OPFS で過去セッションの記録を永続化する（親 issue）
- #0066: preact-iso を導入して `/sessions` ページへのルーティング基盤を追加する
