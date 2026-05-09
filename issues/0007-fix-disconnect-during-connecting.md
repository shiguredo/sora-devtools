# 0007 接続中・準備中の切断が無視される問題を修正する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

`disconnectSora` (`src/app/actions.ts:1485-1493`) が `connectionStatusValue === "connected"` の場合のみ切断処理を実行する。`"connecting"` や `"preparing"` の状態では切断が無視される。

```typescript
if (soraValue && connectionStatusValue === "connected") {
  signals.setSoraConnectionStatus("disconnecting");
  await soraValue.disconnect();
  signals.setSoraConnectionStatus("disconnected");
}
// "connecting" / "preparing" の場合は何もせず終了
```

## 再現手順

1. Connect ボタンを押す
2. 接続処理中（`"connecting"` または `"preparing"` 状態）に Disconnect ボタンを押す
3. 切断が無視され、接続が完了してしまう

## 期待される動作

`"connecting"` や `"preparing"` 状態でも切断が可能で、接続処理が中断される。

## 修正方針

条件を `connectionStatusValue === "connected" || connectionStatusValue === "connecting" || connectionStatusValue === "preparing"` に拡張する。`soraValue` が存在しなくても、`isFormDisabled` を false に戻す等のクリーンアップを行う。
