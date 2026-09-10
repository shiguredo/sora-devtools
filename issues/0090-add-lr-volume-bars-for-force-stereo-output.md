# forceStereoOutput 利用時に音量ゲージを L/R の 2 本で表示できるようにする

- Created: 2026-09-10
- Completed: {YYYY-MM-DD}
- Branch: feature/add-lr-volume-bars-for-force-stereo-output
- Polished: {YYYY-MM-DD}
- Reporter: @voluntas

## 目的

forceStereoOutput を有効にして受信したステレオ音声を、音量ゲージで L/R の 2 本に分けて表示できるようにする。

ステレオで受信できているか、左右が正しく分離されているかを devtools の画面だけで確認できるようにする。

## 現状

- `src/components/Video/VolumeVisualizer.tsx` の `Visualizer` は `AudioContext` を生成し、 `createMediaStreamSource(stream)` に `createAnalyser()` を接続して `getByteTimeDomainData` の最大値から 1 本のゲージを描画する。ステレオ音声でも 1 本しか表示されず L/R を区別できない
- `src/components/Video/RemoteVideos.tsx` の `RemoteVideo` は受信ストリームごとに `VolumeVisualizer` を描画する
- `src/components/DevtoolsPane/ForceStereoOutputForm.tsx` の `forceStereoOutput` チェックボックスは実装済みで、 `src/utils.ts` の `createConnectOptions` で接続オプションに反映される
- L/R を分けて解析するには `ChannelSplitterNode` でチャンネルを分離し、それぞれに `AnalyserNode` を接続する必要がある。現状は単一の `AnalyserNode` のため、ステレオかどうかや左右差をゲージから読み取れない
- ステレオかどうかの判定方法（受信トラックの `getSettings().channelCount` を使うか、 `forceStereoOutput` の state を使うか）は決まっていない

## 設計方針

- forceStereoOutput が ON のとき、受信ストリームの音量ゲージを L/R の 2 本で表示する
- ステレオ判定は実装時に実ブラウザで検証して決める。受信トラックの `getSettings().channelCount` と forceStereoOutput の state を候補とする
- `ChannelSplitterNode` でチャンネルを分離し、 L 用と R 用の `AnalyserNode` でそれぞれの振幅を解析して 2 本のゲージを描画する
- モノラル受信時と forceStereoOutput が OFF のときは従来どおり 1 本のゲージにする
- L/R のゲージの見た目（幅・ラベル・配置）は実装時に決める
- ローカル映像の音量ゲージ（mic 入力）の挙動は変更しない
- 既存の Safari の `AudioContext` 対策（`issues/0086-bug-safari-volume-meter-not-working.md`）と同様に、 `AudioContext` の生成・`resume()` の扱いを崩さない
- forceStereoOutput は Chrome / Edge での利用を想定した設定のため、 Safari / Firefox では従来どおり 1 本のゲージのままで問題ない

## 完了条件

- forceStereoOutput を ON にしてステレオ音声を受信したとき、 L/R の 2 本の音量ゲージが表示される
- L と R のゲージが独立して動き、左右の音量差が分かる
- forceStereoOutput が OFF またはモノラル受信のときは従来どおり 1 本のゲージが表示される
- ローカル映像の音量ゲージの挙動が変わらない
- 新しいテストを追加する
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

- `src/components/Video/VolumeVisualizer.tsx` の `Visualizer` を変更し、ステレオ時は `ChannelSplitterNode` と 2 つの `AnalyserNode` で L/R を解析する
- ステレオ判定の条件と 2 本のゲージの描画方法を実装時に確定する
- ステレオ時に L/R のゲージが描画されるテストを追加する

## 関連

- `issues/0084-add-fake-media-stereo-audio.md`: 送信側の fakeMedia 音声をステレオ化する issue。受信側の L/R 表示と組み合わせてステレオ検証に使える
- [ChannelSplitterNode - MDN](https://developer.mozilla.org/en-US/docs/Web/API/ChannelSplitterNode)
- [AnalyserNode - MDN](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
