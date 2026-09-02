# Enable mic device のトグルでマイクを停止できない問題を修正する

- Created: 2026-09-02
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-enable-mic-device-toggle
- Polished: 2026-09-02

## 目的

`getUserMedia` または `fakeMedia` の音声入力を使用しているとき、`Enable mic device` を `off` にしても接続中の音声トラックが送信され続ける問題を修正する。

## 現状

`src/components/DevtoolsPane/MicDeviceForm.tsx` の `MicDeviceForm` は、トグル変更時に `src/app/signals.ts` の `setMicDevice` を呼び出している。

`setMicDevice` は `micDevice` の状態値を更新するだけで、既存の `MediaStreamTrack` を停止・削除しない。

一方、`src/app/actions.ts` の `setMicDeviceAction` には、`getUserMedia` または `fakeMedia` の音声トラックについて、以下の処理が実装されている。

- マイクを有効にしたときの音声トラック生成と置換
- マイクを無効にしたときのローカル音声トラック停止・削除
- 接続中の Sora からの音声トラック削除
- Fake Media 使用時の `AudioContext` 解放

しかし、`setMicDeviceAction` は `src/` 内から呼び出されていない。

`setMicDeviceAction` は音声トラックの生成に失敗した場合、アラートを設定した後に Promise を reject する。呼び出し側でこの Promise を処理しなければ、トグル操作時に未処理 rejection が発生する。

`getDisplayMedia` と `mp4Media` では `micDevice` が音声トラックの生成条件に使われないため、今回の issue の対象外とする。

この状態は、React から Preact へ移行した際に、旧来 `src/app/actions.ts` の `setMicDevice` を呼んでいた `MicDeviceForm` が、`src/app/signals.ts` の単純な setter を呼ぶ実装へ変更されたことで発生したと考えられる。

## 設計方針

`getUserMedia` または `fakeMedia` のとき、`Enable mic device` のトグル変更時に単純な signal setter ではなく `setMicDeviceAction` を呼び出す。

`getDisplayMedia` と `mp4Media` では、`setMicDeviceAction` による音声トラックの切り替えを行わず、今回の issue では既存の状態変更だけを維持する。

接続前や MediaStream 未取得時の状態変更は、既存の `setMicDeviceAction` が持つ早期 return の処理に任せる。

トグル操作から呼び出す非同期処理の Promise はイベントハンドラ側で処理し、`setMicDeviceAction` が設定するアラートやログを維持したまま、未処理 rejection を発生させない。

## 完了条件

- `getUserMedia` または `fakeMedia` の接続中に `Enable mic device` を `off` にすると、現在の音声 `MediaStreamTrack` が停止・削除される
- 接続中の Sora から音声トラックが削除され、音声が送信されなくなる
- `getUserMedia` で `Enable mic device` を `on` にすると、マイクの音声トラックが再取得・再設定される
- `fakeMedia` で `Enable mic device` を `on` にすると、Fake Media の音声トラックが再生成・再設定される
- 接続前に `off` にした場合、`getUserMedia` と `fakeMedia` で音声トラックを作成しない既存の動作が維持される
- 音声トラックの生成に失敗した場合、既存のアラートを表示し、`micDevice` の状態を変更せず、未処理 rejection を発生させない
- 関連するテストが追加または修正され、テストが成功する

## 解決方法

- `src/components/DevtoolsPane/MicDeviceForm.tsx` が `getUserMedia` または `fakeMedia` のときに `setMicDeviceAction` を呼び出すように修正する
- `setMicDeviceAction` の成功時に状態を更新し、音声トラックの生成に失敗した場合は既存の状態を維持することを確認するテストを追加または修正する
- `Enable mic device` の切り替えによって、ローカル MediaStream と Sora の音声トラックが期待どおりに更新されることを確認する
- 非同期処理の失敗時に、トグル操作から Promise が未処理のまま残らないことを確認する

## 関連

- `issues/closed/0049-bug-fix-fake-contents-audio-close.md`
- `src/components/DevtoolsPane/MicDeviceForm.tsx`
- `src/app/actions.ts` の `setMicDeviceAction`
- `src/app/signals.ts` の `setMicDevice`
