# Jitter 表示に nackCount を追加し、jitterBuffer のツールチップを追加する

- Created: 2026-09-10
- Completed: {YYYY-MM-DD}
- Branch: feature/add-jitter-nack-count-tooltip
- Polished: {YYYY-MM-DD}
- Reporter: @voluntas

## 目的

受信中のストリームの Jitter 表示に nackCount を追加し、パケットロスが発生しているかを確認できるようにする。

あわせて、 jitterBuffer と nackCount の値の意味をツールチップで確認できるようにする。

## 現状

- `src/components/Video/JitterBuffer.tsx` の `JitterButter` は `inbound-rtp` の `jitterBufferDelay` / `jitterBufferEmittedCount` から平均遅延 (ms) を算出し、 `{type}: {値}` の小さな枠で表示する (audio / video)
- 遅延だけを表示しており、 `nackCount` は表示していない。 `src/types.ts` の `RTCInboundRtpStreamStats` には `nackCount?: number` が定義済み
- 枠の色は遅延 (100 / 300 / 500 ms) に応じて変わっている
- jitterBuffer と nackCount の値の説明はなく、何を表す値なのかを UI から確認できない
- ツールチップの仕組みは `src/components/DevtoolsPane/TooltipFormLabel.tsx` が `instructions.json` (定数 `INSTRUCTIONS`) の説明を hover で表示する形で存在するが、フォームラベル専用

## 設計方針

- `inbound-rtp` の `nackCount` を jitterBuffer の値の横に表示する。表示形式は実装時に決める (例: `video: 120 nack: 3`)
- `nackCount` は累計値か、 `prevStatsReport` との差分 (ポーリング間隔あたりの増加数) か、実装時に決める。パケットロスの発生を検知しやすい方を優先する
- nackCount の値に応じた色分けやしきい値を入れるかは実装時に決める
- jitterBuffer と nackCount の意味をツールチップで表示する。説明文は `instructions.json` に追加する
- 既存の jitterBuffer の平均遅延の算出と色分け (100 / 300 / 500 ms) は変更しない
- audio / video の両方で同じ表示にする

## 完了条件

- audio / video の枠に jitterBuffer の値と nackCount が表示される
- nackCount が累計値か差分かが UI またはドキュメントから分かる
- jitterBuffer と nackCount の値を hover すると説明が表示される
- 既存の jitterBuffer の遅延の色分けが維持される
- 新しいテストを追加する
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

- `src/components/Video/JitterBuffer.tsx` の `JitterButter` に `nackCount` の表示を追加する
- `instructions.json` に jitterBuffer と nackCount の説明を追加し、ツールチップを表示する
- ツールチップは既存の `TooltipFormLabel` の仕組みを流用するか、説明表示を共通化して使う
- nackCount の表示形式を決め、テストを追加する

## 関連

- [RTCInboundRtpStreamStats - MDN](https://developer.mozilla.org/en-US/docs/Web/API/RTCInboundRtpStreamStats)
