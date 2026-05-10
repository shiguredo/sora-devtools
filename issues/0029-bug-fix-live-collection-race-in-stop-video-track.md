# 0029-bug-fix-live-collection-race-in-stop-video-track

Created: 2026-05-10
Model: deepseek-v4-pro

## 背景

`feature/vite-plus-migrate` ブランチの review-diff-code 2 周目で検出。

`stopLocalVideoTrack` で `getVideoTracks()` の live collection に対する反復中に競合が生じうる。

## 内容

```typescript
// src/app/actions.ts:1926-1938
for (const track of localMediaStreamValue.getVideoTracks()) {
  track.enabled = false;
}
await new Promise<void>((resolve) => {
  setTimeout(resolve, 100);
});
for (const track of localMediaStreamValue.getVideoTracks()) {
  track.stop();
  localMediaStreamValue.removeTrack(track);
}
```

`getVideoTracks()` は live な配列を返す。100ms の待機中に `updateMediaStream` などの別コードパスが新しいトラックを追加した場合、新規トラックも意図せず停止される。

## 再現手順

1. fakeMedia でカメラを on にする
2. 解像度変更などで `updateMediaStream` が走る
3. タイミングによって新規トラックが `stop()` ループに巻き込まれる

## 期待される結果

最初の反復で配列に固定する:

```typescript
const tracks = [...localMediaStreamValue.getVideoTracks()];
for (const track of tracks) {
  track.enabled = false;
}
await new Promise<void>((resolve) => {
  setTimeout(resolve, 100);
});
for (const track of tracks) {
  track.stop();
  localMediaStreamValue.removeTrack(track);
}
```
