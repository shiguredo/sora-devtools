# 0004 reconnectSora のエラー伝播漏れを修正する

Created: 2026-05-09
Completed: 2026-05-09
Model: deepseek-v4-pro

## 概要

`reconnectSora` (`src/app/actions.ts:1421-1427`) で `createMediaStream` の `.catch()` がエラーを再 throw しているが、外側に try/catch が存在せず unhandled rejection になる。

```typescript
[mediaStream, gainNode] = await createMediaStream(state).catch((error) => {
  signals.setSoraErrorAlertMessage(error.toString());
  signals.setSoraConnectionStatus("disconnected");
  throw error; // ← 外側に try/catch がない
});
```

同様に、disconnect callback 内の `void (async () => { await stopLocalVideoTrack(...); })()` (`src/app/actions.ts:998-1001`) も throw 時に unhandled rejection になる。

## 再現手順

1. Sora に接続する
2. 異常切断を発生させて reconnect が走る
3. `createMediaStream` がエラーを返す（例: デバイスが使えない）
4. 外側に try/catch がないため unhandled promise rejection が発生する

## 期待される動作

エラーが適切に捕捉され、`setSoraConnectionStatus("disconnected")` が確実に呼ばれる。

## 影響範囲

| ファイル                       | 変更内容                                                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `src/app/actions.ts:1421-1427` | `reconnectSora` 内の `createMediaStream` 呼び出しを try/catch で囲む                                            |
| `src/app/actions.ts:998-1001`  | disconnect callback 内の `void (async () => { await stopLocalVideoTrack(...); })()` を try/catch 付きに変更する |
| `src/app/actions.ts:1704`      | `setCameraDeviceAction` 内の `void soraValue.replaceVideoTrack(...)` も同様にエラー捕捉を追加                   |
| `src/app/actions.ts:1648`      | `setMicDeviceAction` 内の `void soraValue.removeAudioTrack(...)` も同様                                         |

## 修正方針

1. `reconnectSora` の `createMediaStream(state).catch(...)` を try/catch で囲み、catch 節で `setSoraConnectionStatus("disconnected")` と `setSoraReconnecting(false)` を呼ぶ
2. disconnect callback の `void IIFE` パターンでは、内部に try/catch を追加し、例外を `signals.setLogMessages` で記録する
3. `setCameraDeviceAction` と `setMicDeviceAction` の `void` パターンも同様に try/catch を追加する

## テスト戦略

- `reconnectSora` で `createMediaStream` が reject した場合、`connectionStatus` が `"disconnected"` になり `reconnecting` が false になること
- disconnect callback 内の `stopLocalVideoTrack` が throw しても、後続のクリーンアップ処理が継続されること

## 解決方法

- `src/app/actions.ts` の `reconnectSora` で `createMediaStream` 呼び出しを `try/catch` で囲み、失敗時に `setSoraConnectionStatus("disconnected")` と `setSoraReconnecting(false)` を呼んで `return` するようにした。
- disconnect コールバックの `void IIFE` 内に `try/catch` を追加し、`stopLocalVideoTrack` の例外を `setLogMessages` で記録する。
- `setMicDeviceAction` の `removeAudioTrack`、`setCameraDeviceAction` の `replaceVideoTrack` / `removeVideoTrack` の `void` 呼び出しを `.catch(...)` 付きに変更し、unhandled rejection を防ぐ。
