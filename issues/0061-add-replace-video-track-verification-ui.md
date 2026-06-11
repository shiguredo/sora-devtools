# replaceVideoTrack 後の simulcast encodings 維持を検証する UI を追加する

- Priority: Medium
- Created: 2026-06-11
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/add-replace-video-track-verification-ui
- Polished: {YYYY-MM-DD}
- Reporter: @voluntas

## 目的

sora-js-sdk の pending issue `issues/pending/0013-bug-fix-replace-track-loses-simulcast-encodings.md` で議論されている「`replaceVideoTrack` 後に simulcast の encodings (rid / active 等) が保持されるか」という仮説を、実利用者が手元のブラウザで簡単に検証できる UI を sora-devtools に追加する。

仕様準拠ブラウザでは encodings は保持されるが、非準拠実装の有無は再現未確定で本番観測ログ・ユーザ報告も無い。sora-devtools は実利用者が広いブラウザ・OS マトリクスで手動検証できるため、本仮説の再現報告を上げられる導線を作る。

## 優先度根拠

Medium。

- sora-js-sdk 0013 が pending 化されているため、本 UI が無いと再現報告が上がらず該当 issue が永久 pending になる
- 一方で本番運用上の障害は未確認のため High ではない
- devtools の他機能と独立に追加できる検証ツールで、技術的リスクも低い

## 現状

sora-devtools の現状 UI には:

- simulcast 接続パラメータ (`simulcast` / `simulcastRid` / `simulcastRequestRid`) を設定する Form は揃っている (`src/components/DevtoolsPane/`、`src/app/signals.ts`、`src/utils.ts` の `setSimulcast` 等)
- 接続中の Stats / SignalingMessages 表示は DebugPane にある (`src/components/DebugPane/Stats.tsx` 等)
- ただし接続中の video track 入れ替え (`connection.replaceVideoTrack(stream, newTrack)`) を実行する UI は存在しない (`grep -rn "replaceVideoTrack" src/` で 0 件)
- replace 前後の `sender.getParameters().encodings` 比較表示も無い

## 設計方針

sendonly / sendrecv で simulcast 接続中の場合のみ操作可能な「Replace video track」検証セクションを追加する。

- DevtoolsPane 内に「Replace video track」ボタン
  - 押下時に新しい `getUserMedia({ video: true })` を取得し、現在の接続に対して `connection.replaceVideoTrack(stream, newTrack)` を呼ぶ
  - 既存の MediaStream は維持し video track のみ差し替える
- replace 前後の比較表示 (専用パネル、または DebugPane 拡張)
  - `sender.getParameters().encodings` の rid 配列、active、scaleResolutionDownBy、maxBitrate などを表で並べて表示する
  - 差分 (rid 配列の変化、active 落ち) を視覚的にハイライトする
- 接続中 stats の rid 別 outbound-rtp 表示
  - `bytesSent` / `packetsSent` / `framesEncoded` を rid 別に時系列表示する
- 連続 replace ループ (3 / 5 / 10 回) ボタン
  - 繰り返し replace を行ったときの rid 維持状況を確認できるようにする
- 検証結果のクリップボードコピー
  - ブラウザ名・バージョン・OS・観測値を含むテキスト形式で出力し、利用者が報告しやすい形にする
- 操作ガード
  - `simulcast === true` かつ video あり接続中のみ「Replace video track」ボタンを有効化する
  - 切断中・非 simulcast 接続では無効化する

## 完了条件

- sora-devtools の simulcast 接続で「Replace video track」ボタンを押すと video track が差し替わる
- replace 前後で sender params (rid / active / scaleResolutionDownBy / maxBitrate) を UI 上で並べて比較できる
- 連続 replace 操作を 3 / 5 / 10 回まとめて実行できる
- 検証結果を 1 ボタンでクリップボードにコピーできる
- 既存テストが通る (`pnpm test`、Playwright E2E)
- sora-js-sdk pending issue 0013 の再開条件で本 UI を参照する旨を記載する

## スコープ外

- sora-js-sdk 0013 の修正そのもの (本 UI は検証のみで、修正は sora-js-sdk 側 issue で扱う)
- `replaceAudioTrack` 系 (audio simulcast が不在のため対象外)
- 非 simulcast 接続での `replaceVideoTrack` (本 UI は simulcast 検証用に絞る。汎用 replaceTrack は別 issue が必要なら別途切る)
