# 0008 updateMediaStream の replaceTrack エラー処理を追加する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

`updateMediaStream` (`src/app/actions.ts:1567-1580`) で `void sender.replaceTrack(track)` が for ループで同時発火され、いずれかの Promise が reject しても処理されない。一部のトラックだけが置き換えられた不整合状態が残る可能性がある。

```typescript
for (const track of mediaStream.getTracks()) {
  if (!soraValue?.pc) {
    continue;
  }
  const sender = soraValue.pc.getSenders().find((s) => {
    if (!s.track) {
      return false;
    }
    return s.track.kind === track.kind;
  });
  if (sender) {
    void sender.replaceTrack(track); // ← reject が捕捉されない
  }
}
```

## 再現手順

1. Sora 接続中にデバイスを変更する（`updateMediaStream` が呼ばれる）
2. negotiation 中などで `replaceTrack` が reject する
3. エラーが通知されず、一部のトラックだけ置き換わる

## 期待される動作

`replaceTrack` のエラーが捕捉され、ユーザーに通知される。または `Promise.allSettled` で全トラックの結果を収集する。

## 修正方針

`void` をやめ、`Promise.allSettled` で全トラックの置き換え結果を待ち、失敗した場合はアラートを表示する。
