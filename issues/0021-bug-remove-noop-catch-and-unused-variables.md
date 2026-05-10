# 0021-bug-remove-noop-catch-and-unused-variables

Created: 2026-05-10
Model: deepseek-v4-pro

## 背景

`feature/vite-plus-migrate` ブランチの review-diff-code で以下の問題が検出された。

## 内容

### 1. actions.ts:1200-1202 — 完全な no-op catch

```typescript
[mediaStream, gainNode, audioContext] = await createMediaStream(state).catch((error) => {
  throw error;
});
```

`.catch()` がエラーをそのまま再スローしており、実質的に何もしていない。直後の try/catch (L1203) が同じエラーを捕捉する。`.catch((error) => { throw error; })` を削除する。

### 2. actions.ts:1526-1527 — reconnectSora 内の未使用変数

```typescript
let gainNode: undefined | GainNode | null;
let audioContext: undefined | AudioContext | null;
```

`reconnectSora` 内で `createMediaStream` の戻り値から取得しているが、後続で `setFakeContentsAudio` が呼ばれず変数だけが残っている。

`connectSora` では同じ変数が `signals.setFakeContentsAudio(audioContext, gainNode)` で使用されているため、`reconnectSora` でも同様に呼ぶか、呼ばないなら変数宣言を削除する。

## 再現手順

lint では検出されない（未使用変数は `no-unused-vars` の対象外、no-op catch も構文エラーではない）。

## 期待される結果

- `.catch((error) => { throw error; })` が削除される
- `reconnectSora` の未使用変数が削除されるか、`setFakeContentsAudio` が適切に呼ばれる
