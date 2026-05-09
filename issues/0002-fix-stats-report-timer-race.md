# 0002 StatsReport タイマーの並行呼び出し蓄積と停止不能を修正する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

`startStatsReportTimer` (`src/app/actions.ts:1315-1324`) が `setInterval` の async コールバックを使用しており、`getStats()` 呼び出しが 1 秒以上かかると複数の `getStats()` が並行して走り、PeerConnection の内部状態を壊す可能性がある。また、タイマー ID が保持されず、タブを閉じた際やコンポーネントのアンマウント時にも停止できない。

## 再現手順

1. Sora に接続する
2. ネットワークが遅延している環境で `getStats()` に 1 秒以上かかる
3. 複数の `getStats()` 呼び出しが並行して走る
4. タブを閉じた後もタイマーが走り続ける

## 期待される動作

- 前回の `getStats()` 完了後に次の `getStats()` をスケジュールする
- 切断時やタブクローズ時にタイマーが停止する
- `clearInterval` 用の ID が保持されている

## 実際の動作

`setInterval` が async コールバックの完了を待たず、並行呼び出しが蓄積する。タイマー ID が外部から参照不可。

## 修正方針

`setInterval` をやめ、`setTimeout` チェーンで前回の完了後に次をスケジュールする方式に変更する。`AbortController` またはフラグで停止制御を行う。
