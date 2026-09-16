# Fake Media のカメラ切り替えで音声が停止する問題を修正する

- Created: 2026-09-03
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-preserve-fake-media-audio-on-camera-toggle
- Polished: 2026-09-09

## 目的

`fakeMedia` で `Enable camera device` を切り替えたとき、既存の音声が停止する問題を修正する。

## 現状

以下の手順で問題が再現する。

1. `mediaType` を `fakeMedia` にする
2. `Enable audio` と `Enable mic device` を有効にし、`fakeVolume` を 0 より大きい値にして、音声と映像を含む Fake Media を開始する
3. `Enable camera device` を `off` にする
4. `Enable camera device` を `on` にする
5. カメラ映像は復元されるが、Fake Media の音声が停止する

`fakeVolume` の既定値は `0` のため、音声信号の有無を観測できる値（例: `0.5`）に変更してから再現する。

`src/app/actions.ts` の `setCameraDeviceAction` は、カメラだけを再生成するために `audio: false` の状態で `createMediaStream` を呼び出している。

`fakeMedia` の生成処理である `createFakeMediaStreamFromState` は、新しいメディア生成前に `closeFakeContentsAudio` を呼び出して既存の音声 `AudioContext` を閉じる。その後、音声トラックを含まない新しい Fake Media の状態で `setFakeContentsAudio` が呼ばれるため、既存の音声状態も失われる。

カメラの切り替えでは映像トラックだけを更新するため、既存の音声トラックとフェイク音声の `AudioContext` / `GainNode` を維持する必要がある。

## 設計方針

カメラ切り替えのために映像だけを再生成する `fakeMedia` 経路では、既存の `AudioContext` を閉じず、`fakeContents` signal の音声状態も上書きしない。

一方、音声を含む通常の Fake Media 再生成では、既存の `AudioContext` を閉じてから新しい音声状態を設定する既存の動作を維持する。

`getUserMedia` のカメラ on は音声トラックを再取得しない既存の挙動（`audio: false`）を維持し、この issue では変更しない。

## 完了条件

- `fakeMedia` で `Enable camera device` を `off` にしても、音声トラックとフェイク音声の `AudioContext` / `GainNode` が維持される
- `fakeMedia` で `Enable camera device` を `on` にしても、既存の音声トラックとフェイク音声の `AudioContext` / `GainNode` が維持される
- `fakeVolume` を 0 より大きい値にした状態で、カメラ切り替え前後に Fake Media の音声トラックから音声信号が継続して観測できる
- 通常の Fake Media 再生成時に、不要な古い `AudioContext` が残らない
- 新規の Playwright E2E テストで上記の動作を確認する
- 関連する E2E テストが成功する

## 解決方法

- `src/app/actions.ts` の `setCameraDeviceAction` と Fake Media 生成処理を修正し、カメラだけを更新する場合は既存の音声状態を維持する
  - `createMediaStream` / `createFakeMediaStreamFromState` に `preserveAudio` オプションを追加し、カメラだけを再生成する経路では `closeFakeContentsAudio` を呼ばず、`setFakeContentsAudio` による上書きもしない
  - 音声を含む通常の Fake Media 再生成時に `AudioContext` を閉じる既存の動作は維持する
- 新規に `tests/fake-media-camera-audio-toggle.test.ts` を追加する
  - `fakeVolume` を 0 より大きい値にしたカメラ切り替え前後の音声信号を AnalyserNode の RMS で確認する
  - カメラ切り替え前後で音声トラックが同一トラックとして維持される (トラック ID と信号レベルの両方) ことを確認する
  - dispose 後の再取得による通常の再生成でも新たな `AudioContext` で音声トラックが動くことを確認する
- 手動確認: `fakeMedia` で `fakeVolume` を 0.5 にして音声と映像を開始し、`Enable camera device` の off / on を実施しても音声信号が継続することを確認する
