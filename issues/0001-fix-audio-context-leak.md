# 0001 FakeMedia 生成時の AudioContext リソースリークを修正する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

`createFakeMediaStream` (`src/utils.ts:562-603`) が呼ばれるたびに新しい `AudioContext` と `OscillatorNode` が生成されるが、以下の理由でリークする:

1. `createFakeMediaStream` の戻り値が `{ offscreenCanvas, mediaStream, gainNode, frameRate }` であり、`audioContext` が戻り値に含まれていない。呼び出し元から `close()` する手段がない
2. `fakeContents` signal (`src/app/signals.ts:119-125`) は `{ worker, gainNode }` のみを保持し、`audioContext` を保持していない
3. `disposeMedia` (`src/app/actions.ts:1184-1225`) と disconnect コールバック (`src/app/actions.ts:974-1025`) はいずれも Worker に `stop` を送るが AudioContext を閉じていない

fakeMedia 利用時に以下の操作を行うたびに新しい `createFakeMediaStream` が呼ばれる:

- `requestMedia` (初回メディア取得)
- `connectSora` (初回接続時、`forceCreateMediaStream` が true の場合)
- `reconnectSora` (再接続時、毎回 MediaStream 再生成)
- `updateMediaStream` (デバイス変更時)
- `setMicDeviceAction` / `setCameraDeviceAction` (デバイス ON 時)
- `disposeMedia` → `requestMedia` (破棄後再取得)

これらのたびに AudioContext が蓄積し、Chrome で AudioContext の生成制限に達すると `NotAllowedError` が発生して fakeMedia の音声が機能しなくなる。

## 再現手順

1. mediaType を fakeMedia に設定して接続する
2. 解像度やフレームレートを 4〜5 回変更する
3. 6 回目以降の変更で `NotAllowedError: The number of hardware contexts provided is greater than or equal to the maximum bound` が発生し、音声が出力されなくなる

## 期待される動作

AudioContext を使い回すか、新規生成前に古いものを `close()` する。また `disposeMedia` や切断時にも AudioContext が確実に閉じられる。

## 実際の動作

`audioContext` 変数が `createFakeMediaStream` のローカル変数であり、外部から `close()` できない。また `fakeContents` signal にも格納されないため、`disposeMedia` や disconnect でも解放されず、GC 任せになる（`AudioContext` は GC で自動解放されない）。

## 影響範囲

| ファイル                       | 変更内容                                                                                                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types.ts:86-89`           | `fakeContents` 型に `audioContext: AudioContext \| null` を追加                                                                                                        |
| `src/app/signals.ts:119-125`   | `fakeContents` signal の初期値に `audioContext: null` を追加                                                                                                           |
| `src/app/signals.ts:805`       | `resetState` の `resetMediaSettingsState` で `fakeContents` リセット時に `audioContext.close()` を呼ぶ                                                                 |
| `src/app/signals.ts:326-328`   | `setFakeContentsGainNode` の既存実装（スプレッド更新）は `audioContext` 追加後も破壊しないため変更不要                                                                 |
| `src/utils.ts:562-603`         | `createFakeMediaStream` の戻り値に `audioContext` を追加。AudioContext 生成時の `const audioContext` を戻り値にも含める                                                |
| `src/app/actions.ts:702-751`   | `createFakeMediaStreamFromState` で `createFakeMediaStream` 呼び出し前に `fakeContents.value.audioContext?.close()` を呼ぶ。生成後 `audioContext` を signal に保存する |
| `src/app/actions.ts:1158-1182` | `requestMedia` で gainNode 保存前に旧 AudioContext を close する                                                                                                       |
| `src/app/actions.ts:1184-1225` | `disposeMedia` で `fakeContents.value.audioContext?.close()` を追加                                                                                                    |
| `src/app/actions.ts:1008-1010` | disconnect コールバック内の worker stop 送信箇所付近で `fakeContents.value.audioContext?.close()` を追加                                                               |

## エッジケース

| シナリオ                                       | 確認事項                                                                                                                   |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `disposeMedia` 呼び出し後に再度 `requestMedia` | 旧 AudioContext の close 後に新規生成。GainNode のみ保持していて AudioContext が閉じられた後も gainNode 参照が残らないこと |
| 切断 (disconnect) 時                           | disconnect コールバック内で worker に `"stop"` を送信している（行 1009）。ここに `audioContext?.close()` を追加            |
| `resetState` 呼び出し時                        | `fakeContents.value = { worker: null, gainNode: null, audioContext: null }` の前に `audioContext?.close()` が必要          |
| `createFakeMediaStream` で audio=false の場合  | AudioContext が生成されない。戻り値の `audioContext` は `null`。close 呼び出しは optional chaining で安全にする            |
| `createFakeMediaStream` で video=false の場合  | OffscreenCanvas は生成されないが AudioContext は生成される。この場合も問題なく close できること                            |
| 短時間での連続した設定変更                     | `audioContext.close()` は非同期。Chrome では即座に limit から解放される。前回の close 完了を待たずに次を生成しても問題ない |
| `reconnectSora`                                | `createMediaStream` で MediaStream を再生性するパスで close が呼ばれていること                                             |
| `updateMediaStream`                            | 同上                                                                                                                       |

## 修正方針

### 1. `fakeContents` signal に `audioContext` を追加する

```typescript
// src/types.ts:86-89
fakeContents: {
  worker: Worker | null;
  gainNode: GainNode | null;
  audioContext: AudioContext | null; // 追加
}

// src/app/signals.ts:119-125
export const fakeContents = signal<{
  worker: Worker | null;
  gainNode: GainNode | null;
  audioContext: AudioContext | null; // 追加
}>({
  worker: null,
  gainNode: null,
  audioContext: null, // 追加
});
```

`AudioContext.close()` は接続された全ノード（OscillatorNode, GainNode, MediaStreamDestination 等）を停止する。よって `oscillator.stop()` の個別呼び出しは不要。

### 2. `createFakeMediaStream` の戻り値に `audioContext` を追加する

戻り値の型定義を変更し、生成した `audioContext` を返す。

### 3. `createFakeMediaStreamFromState` で生成前に close する

`createFakeMediaStream` 呼び出し前に `fakeContents.value.audioContext?.close()` で前回の AudioContext を閉じる。生成後、戻り値の `audioContext` を signal に保存する:

```typescript
// 既存の worker stop（行 727）と同じタイミング
fakeContents.value.audioContext?.close();
const { offscreenCanvas, mediaStream, gainNode, audioContext, frameRate } =
  createFakeMediaStream(constraints);
// audioContext を signal に保存
fakeContents.value = { ...fakeContents.value, audioContext, gainNode };
```

### 4. `disposeMedia` と disconnect コールバックに close 処理を追加する

- `disposeMedia` (actions.ts:1184): worker stop 送信の直前または直後に `fakeContents.value.audioContext?.close()` を追加
- disconnect コールバック (actions.ts:1008-1010): 同様に追加
- `resetState` → `resetMediaSettingsState` (signals.ts:805): `fakeContents` リセット前に `audioContext?.close()` を追加

### 5. `requestMedia` の gainNode 保存前に close する

`requestMedia` (actions.ts:1178-1179) で `setFakeContentsGainNode` を呼ぶ前に旧 AudioContext を close する。

## テスト戦略

- `createFakeMediaStream` が戻り値に `audioContext` を含むことの assert
- `createFakeMediaStreamFromState` を 2 回連続で呼んだとき、1 回目の `audioContext` に対して `close()` が呼ばれていること
- `disposeMedia` 実行後に `fakeContents.value.audioContext` が null になっていること（close 後）
- 上記テストは `vitest-browser-preact` の browser mode で実行する（`AudioContext` はブラウザ API のため Node.js では利用不可）
- `fakeContents` の `audioContext` 型追加に伴う TypeScript コンパイルエラーがないこと
