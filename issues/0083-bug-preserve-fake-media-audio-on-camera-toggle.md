# Fake Media のカメラ切り替えで音声出力が停止する問題を修正する

- Created: 2026-09-03
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-preserve-fake-media-audio-on-camera-toggle
- Polished: {YYYY-MM-DD}

## 目的

`fakeMedia` で `Enable camera device` を切り替えたとき、既存の音声出力が停止する問題を修正する。

## 現状

以下の手順で問題が再現する。

1. `mediaType` を `fakeMedia` にする
2. 音声と映像を有効にして Fake Media を開始する
3. `Enable camera device` を `off` にする
4. `Enable camera device` を `on` にする
5. カメラ映像は復元されるが、Fake Media の音声出力が停止する

`src/app/actions.ts` の `setCameraDeviceAction` は、カメラだけを再生成するために `audio: false` の状態で `createMediaStream` を呼び出している。

`fakeMedia` の生成処理である `createFakeMediaStreamFromState` は、新しいメディア生成前に `closeFakeContentsAudio` を呼び出して既存の音声 `AudioContext` を閉じる。その後、音声トラックを含まない新しい Fake Media の状態で `setFakeContentsAudio` が呼ばれるため、既存の音声状態も失われる。

カメラの切り替えでは映像トラックだけを更新するため、既存の音声トラックと音声出力を維持する必要がある。

## 設計方針

カメラ切り替えのために映像だけを再生成する `fakeMedia` 経路では、既存の音声トラックと音声出力を閉じたり上書きしたりしない。

一方、音声を含む通常の Fake Media 再生成では、既存の `AudioContext` を解放してから新しい音声状態を設定する既存の動作を維持する。

## 完了条件

- `fakeMedia` で `Enable camera device` を `off` にしても、既存の音声出力が維持される
- `fakeMedia` で `Enable camera device` を `on` にしても、既存の音声トラックと音声出力が維持される
- `fakeVolume` を有効にした状態で、カメラ切り替え前後の音声信号を取得できる
- 通常の Fake Media 再生成時に、不要な古い `AudioContext` が残らない
- Playwright の E2E テストで上記の動作を確認する
- 関連する E2E テストが成功する

## 解決方法

- `src/app/actions.ts` の `setCameraDeviceAction` と Fake Media 生成処理を修正し、カメラだけを更新する場合は既存の音声状態を維持する
- 音声を含む通常の Fake Media 再生成時の `AudioContext` 解放は維持する
- `tests/fake-media-camera-audio-toggle.test.ts` の Playwright E2E テストで、`fakeVolume` を有効にしたカメラ切り替え前後の音声信号を確認する
