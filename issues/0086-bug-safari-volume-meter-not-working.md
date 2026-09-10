# Safari で音量ゲージが動作しない問題を修正する

- Created: 2026-09-10
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-safari-volume-meter-not-working
- Polished: {YYYY-MM-DD}

## 目的

Safari で受信した音声の音量ゲージが動作しない問題を修正する。

Safari はサポート対象のブラウザだが、recvonly で受信している音声の音量ゲージが動作しないと、音声が届いているかを確認できない。

## 現状

以下の手順で問題が再現する。受信側が Safari の場合に発生する。

1. Safari で `recvonly` を選択して接続する
2. 別のクライアントが配信を開始し、新しいストリームが始まる
3. Safari では自動再生されないため、`video` 要素の再生ボタンを押す
4. 映像は再生されるが、映像の横の音量ゲージが動作しない

以下の手順でも再現する。

1. Safari で `recvonly` を選択して接続する
2. 配信側が配信を開始し、音量ゲージが動作することを確認する
3. 配信側が切断する
4. 配信側が再接続して配信を再開する
5. 音量ゲージが動作しない

`src/components/Video/VolumeVisualizer.tsx` の `Visualizer` は、`props.stream` を依存配列に持つ `useEffect` の中で `new AudioContextConstructor()` を実行し、`createMediaStreamSource` と `createAnalyser` を接続する。生成した `AudioContext` の `state` を確認したり `resume()` を呼び出したりする処理はない。

Safari ではユーザー操作を契機とせずに生成した `AudioContext` は `suspended` のままとなり、`running` に遷移しない。`resume()` もユーザー操作のタイミングで呼び出す必要がある。`suspended` の間は `AnalyserNode` に音声データが流れないため、`getByteTimeDomainData` の値が無音のままとなり、音量ゲージが動作しない。

`src/components/Video/Video.tsx` の `VideoElement` は `autoPlay` と `controls` を指定した `video` 要素を描画しているが、再生イベントを契機に `AudioContext` を生成または `resume()` する処理はない。手動で再生ボタンを押しても `AudioContext` は `suspended` のままとなる。

配信側の切断と再接続では、`src/components/Video/RemoteVideos.tsx` の `RemoteVideo` が新しい `MediaStream` で再描画され、`Visualizer` の `useEffect` が再実行されて新しい `AudioContext` が生成される。この生成もユーザー操作の外で行われるため `suspended` となる。

この再現は Safari 16.6 で確認したものなので、実装時には最新の Safari でも再現するかを確認する。

## 設計方針

Safari の `AudioContext` の制約に合わせ、ユーザー操作のタイミングで `AudioContext` を生成または `resume()` する。

- `video` 要素の `onPlay` など、ユーザー操作で発生するイベントを契機に `AudioContext` を生成または `resume()` する
- `AudioContext.state` が `suspended` の場合のみ `resume()` を呼び、不要な `resume()` を避ける
- `AudioContext` を生成済みの場合は `resume()` だけを行い、`createMediaStreamSource` と `createAnalyser` の接続状態を維持する
- 音量ゲージの背景と前景の描画処理は変更しない
- Chrome / Edge の動作は変更しない

recvonly の再接続後など、ユーザー操作が発生しない場合の扱い（既存のユーザー操作で `resume()` できるか、再生ボタンの再操作を促すかなど）は、実装時に Safari の実ブラウザで確認して決める。

## 完了条件

- Safari で、recvonly 接続中に新しい配信が始まったとき、手動で再生ボタンを押した後に音量ゲージが動作する
- Safari で、recvonly 接続のまま配信側が切断と再接続をしても音量ゲージが動作する
- Chrome / Edge で従来どおり音量ゲージが動作する
- 音量ゲージの背景と前景の描画が変わらない
- 既存の単体テスト、型チェック、lint、ビルドが成功する
- Safari の実ブラウザで手動確認を実施する（E2E テストは Chromium のみで実行するため、Safari の自動テストは対象外とする）

## 解決方法

- `src/components/Video/VolumeVisualizer.tsx` の `Visualizer` を修正し、`AudioContext` の生成または `resume()` をユーザー操作のタイミングで行う
- `src/components/Video/Video.tsx` の `video` 要素の再生イベントを `VolumeVisualizer` に伝える、または `AudioContext` を共有する仕組みを追加する
- Safari で再現手順を実行して修正を確認し、Chrome / Edge で退行がないことを確認する

## 関連

- [BaseAudioContext: state property - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state)
- [AudioContext: resume() method - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/resume)
