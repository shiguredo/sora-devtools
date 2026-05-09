# 0018 actions.ts の重複コードを共通化する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

`src/app/actions.ts` (1901行) に大規模なコード重複が 2 箇所存在する。

## 重複 1: `connectSora` と `reconnectSora`

- `connectSora` (`src/app/actions.ts:1326-1402`)
- `reconnectSora` (`src/app/actions.ts:1404-1482`)

両関数で以下が重複:

- `prepareSignalingConnection()` の呼び出し
- `createMediaStream` の呼び出し
- `createSoraConnectionByRole` の呼び出し
- `setStatsReportInternal` + `startStatsReportTimer`
- `setLocalMediaStream` + `setFakeContentsGainNode` + `setSoraConnectionStatus("connected")`

`reconnectSora` は接続リトライループ（最大 10 回）を追加した以外は `connectSora` と同一。

## 重複 2: `setMicDeviceAction` と `setCameraDeviceAction`

- `setMicDeviceAction` (`src/app/actions.ts:1585-1655`, 70 行)
- `setCameraDeviceAction` (`src/app/actions.ts:1657-1729`, 72 行)

同一の構造:

- 同一ガード条件（ただし実装が異なる: `||` vs `&&`）
- device ON 時の `pickedState` 構築（20+ フィールドを手動指定）
- `createMediaStream` → track 差し替え → MediaStream 更新
- device OFF 時の track 停止処理

`"audio"` / `"video"` の違いのみ。

## 修正方針

1. `connectSora` と `reconnectSora` の共通接続ロジックを `connectWithRetry` 等の共通関数に抽出する
2. `setMicDeviceAction` と `setCameraDeviceAction` を、`kind`（`"audio"` / `"video"`）をパラメータとする共通関数に統一する
3. ガード条件の不一致（`||` vs `&&`）を意図に合わせて統一する
4. `pickConnectionOptionsState` や `getStateForMediaStream` のような手動フィールド列挙も、よりメンテナンス性の高い方式に改善する
