# 0004 reconnectSora のエラー伝播漏れを修正する

Created: 2026-05-09
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

## 修正方針

`createMediaStream(state).catch(...)` の外側を try/catch で囲む。`void IIFE` パターンも try/catch で内部エラーを捕捉する。
