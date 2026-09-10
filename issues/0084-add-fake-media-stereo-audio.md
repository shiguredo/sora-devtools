# `fakeMedia` のフェイク音声でステレオを生成できるようにする

- Created: 2026-09-10
- Completed: {YYYY-MM-DD}
- Branch: feature/add-fake-media-stereo-audio
- Polished: {YYYY-MM-DD}
- Reporter: @voluntas

## 目的

`fakeMedia` のフェイク音声をステレオ化し、左右で異なる信号を Sora へ送信できるようにする。

これにより、Sora のステレオ音声（受信側の `forceStereoOutput` など）をブラウザだけで検証できるようにする。

## 現状

`src/utils.ts` の `createFakeMediaStream` は `AudioContext.createOscillator()` を 1 つだけ生成し、`GainNode` を経由して `MediaStreamAudioDestinationNode`（`AudioContext.createMediaStreamDestination()`）へ接続している。

単一のオシレータをステレオの destination へ接続するため、生成される音声トラックは左右が同一の信号になり、左右を区別した検証ができない。

`src/app/signals.ts` の `fakeContents` は `gainNode` と `audioContext` を保持し、`setFakeVolume` は `gainNode.gain` を更新する。`closeFakeContentsAudio` は `AudioContext` を close して `fakeContents` をクリアする。

`forceStereoOutput` は受信側のオプションであり、送信側のフェイク音声がステレオであることを保証しない。

## 設計方針

- WebAudio でステレオの `MediaStream` を生成できるか（`ChannelMergerNode` / `StereoPannerNode` の利用方法、`MediaStreamAudioDestinationNode` のチャンネル数の扱い）を調査する
- 左右で異なる周波数のオシレータを `ChannelMergerNode` で L / R に割り当て、ステレオのフェイク音声を生成する
- `fakeVolume` は従来どおり `GainNode` で全体の音量に適用し、`setFakeVolume` から変更できる状態を維持する
- ステレオ化を常時行うか、`forceStereoOutput` や専用の UI / URL パラメータで切り替えるかは調査結果を踏まえて決定する
- `closeFakeContentsAudio` による `AudioContext` の解放フローを維持し、`AudioContext` をリークさせない
- `getUserMedia` / `getDisplayMedia` / `mp4Media` の音声処理には影響させない

## 完了条件

- `fakeMedia` のフェイク音声トラックが左右で異なる信号を生成できる
- 生成した音声トラックの左右の分離をブラウザ上で確認できる
- `fakeVolume` の変更がフェイク音声の音量に引き続き反映される
- `fakeMedia` の再生成時に `AudioContext` が解放され、リークしない
- ステレオであることと `fakeVolume` の反映を確認する新規テストを追加する
- 既存の単体テスト、型チェック、lint、ビルド、E2E テストが成功する
