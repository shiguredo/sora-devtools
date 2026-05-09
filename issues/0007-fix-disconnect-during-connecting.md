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

## 影響範囲

| ファイル                       | 変更内容                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| `src/app/actions.ts:1485-1493` | `disconnectSora` の条件を拡張。`soraValue` がある場合は切断、ない場合は状態のみリセット |

## 修正方針

`src/app/actions.ts:1488` の条件を以下のように変更する:

```typescript
if (
  soraValue &&
  (connectionStatusValue === "connected" ||
    connectionStatusValue === "connecting" ||
    connectionStatusValue === "preparing")
) {
  signals.setSoraConnectionStatus("disconnecting");
  await soraValue.disconnect();
}
// soraValue が存在しない/切断できない状態でもクリーンアップする
signals.setSoraConnectionStatus("disconnected");
signals.setSoraReconnecting(false);
```

`soraValue` が存在しない場合も `connectionStatus` を `"disconnected"` に戻し、`reconnecting` フラグも解除する。これにより `isFormDisabled` computed signal が false になり、UI のフォームが再有効化される。

## エッジケース

| シナリオ                                         | 確認事項                                                                                                                    |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `"preparing"` 状態での切断                       | `connectSora` がまだ MediaStream を生成中。`soraValue` が null の可能性があるため disconnect はスキップし、状態のみリセット |
| `"connecting"` 状態での切断                      | `soraValue` は設定済み。`soraValue.disconnect()` で接続試行を中断できるかは SDK 依存                                        |
| `"initializing"` / `"disconnected"` 状態での切断 | 既に切断済みのため何もしない                                                                                                |

## テスト戦略

- `disconnectSora` を `connectionStatus="preparing"`, `soraValue=null` で呼んだ場合、`connectionStatus` が `"disconnected"` になること
- `disconnectSora` を `connectionStatus="connecting"`, `soraValue` が存在する場合、`soraValue.disconnect()` が呼ばれること
- `disconnectSora` を `connectionStatus="disconnected"` で呼んだ場合、二重 disconnect が発生しないこと
