# 0008 updateMediaStream の replaceTrack エラー処理を追加する

Created: 2026-05-09
Completed: 2026-05-09
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

## 影響範囲

| ファイル                       | 変更内容                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| `src/app/actions.ts:1567-1580` | `updateMediaStream` の `void sender.replaceTrack(track)` を `Promise.allSettled` に変更 |

## 修正方針

`src/app/actions.ts:1567-1580` の for ループを以下のように変更する:

```typescript
const replaceResults = await Promise.allSettled(
  mediaStream.getTracks().map(async (track) => {
    if (!soraValue?.pc) {
      return;
    }
    const sender = soraValue.pc.getSenders().find((s) => {
      if (!s.track) {
        return false;
      }
      return s.track.kind === track.kind;
    });
    if (sender) {
      await sender.replaceTrack(track);
    }
  }),
);

const failures = replaceResults.filter((r) => r.status === "rejected");
if (failures.length > 0) {
  signals.setSoraErrorAlertMessage(`failed to replace ${failures.length} track(s)`);
}
```

## テスト戦略

- 全 `replaceTrack` が成功した場合、アラートが表示されないこと
- 一部の `replaceTrack` が失敗した場合、アラートが表示されること
- `soraValue.pc` が null の場合、`replaceTrack` が呼ばれずエラーにならないこと

## 解決方法

`src/app/actions.ts` の `updateMediaStream` の `for` ループを `Promise.allSettled` に書き換え、全 track の `replaceTrack` を並列で待機するようにした。失敗件数を集計して `setSoraErrorAlertMessage` で通知する。
