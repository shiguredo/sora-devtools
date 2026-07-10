# /sessions では DevTools 専用 Header 操作を出さないようにする

- Priority: Medium
- Created: 2026-07-10
- Completed: YYYY-MM-DD
- Model: Cursor Grok 4.5
- Branch: feature/change-sessions-header-visibility
- Polished: YYYY-MM-DD

## 目的

#0066 で `Header` / `Footer` を `App.tsx` 共有配置にした結果、`/sessions` でも DevTools 専用の操作（Copy URL / debug / Signaling URL 設定など）が表示される。`/sessions` ではこれらの操作が無意味または誤解を招くため、ページに応じて表示を出し分ける。

## 優先度根拠

Medium。接続・ルーティングの動作自体は壊さないが、`/sessions` で Copy URL すると `location.pathname` が `/sessions` の無意味な URL になり、Debug トグルも対応する `DebugPane` が無い。#0066 完了後に対応する UX 改善である。

## 現状

- #0066 の設計では `Header` / `Footer` を `Router` 外に共有配置する
- `src/components/Header/index.tsx` には Signaling URL ボタン / `SignalingUrlModal` / TURN URL 表示 / `DebugButton` / `DownloadReportButton` / `CopyUrlButton`（および #0066 後は `SessionsButton`）がある
- `src/components/Footer/index.tsx` にもモバイル向け `DebugButton` がある
- `copyURL()`（`src/app/actions.ts`）は `location.pathname` をそのまま使うため、`/sessions` では `http://localhost:3333/sessions?...` のような URL を生成する
- `DebugButton` は `debug` signal をトグルするが、`/sessions` には `DebugPane` が無い
- `SignalingUrlModal` は OPFS 上の signaling URL 候補を変更できるため、`/sessions` からでも永続設定を書き換えられる

## 設計方針

- `Header` / `Footer` の共有配置自体は維持する（#0066 のルーティング基盤を崩さない）
- `useLocation()` で pathname を見て、`/sessions` では DevTools 専用コントロールを非表示にする
- `/sessions` で残すもの: `NavbarBrand`、`SessionsButton`（または `/` へ戻る導線として十分な Brand）
- `/sessions` で隠すもの: Signaling URL ボタン / `SignalingUrlModal` / TURN URL 表示 / `DebugButton`（Header・Footer 両方）/ `CopyUrlButton` / `DownloadReportButton`（#0069 未実施時）
- `SessionsButton` は `/sessions` 滞在中は非表示、または現在ページを示す見た目にする（実装時に一方に固定する）
- #0062 がマージ済みなら三項演算子を使わない

## 完了条件

- `/sessions` で Copy URL / debug（Header・Footer）/ Signaling URL 設定 / TURN URL 表示 / Download report（残存時）が出ないこと
- `/` および `/devtools/` では従来どおりこれらのコントロールが出ること
- `NavbarBrand` で `/sessions` から `/` に戻れること
- `vp build` / `vp test run` / `pnpm test:ct` / `vp check` が成功すること
- `CHANGES.md` の `## develop` に `- [CHANGE] /sessions では DevTools 専用 Header 操作を出さないようにする` を記載すること（`shiguredo-changelog` に従い `- @username` を付ける）

## 解決方法

1. 失敗するテストを先に追加する（`CODEBASE.md`）
   - ct または E2E で `/sessions` に `Copy URL` / `debug` テキストが無いこと、`/` ではあることを検証する
2. `src/components/Header/index.tsx` で `useLocation()` を先頭で呼び、pathname が `/sessions` のときに DevTools 専用ブロックを描画しない
3. `src/components/Footer/index.tsx` でも同様に `/sessions` では `DebugButton` を描画しない
4. `CHANGES.md` に CHANGE エントリを追記する

## 関連 issue

- #0066: preact-iso を導入して /sessions ページへのルーティング基盤を追加する（本 issue の前提。共有 Header の既知制限として切り出し）
- #0069: DownloadReportButton と DownloadReport 関連機能を削除する（未実施時は本 issue で `/sessions` から隠す）
- #0070: /sessions ページに過去セッション一覧・詳細・フィルタ UI を実装する
