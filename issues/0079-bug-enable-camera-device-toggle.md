# Enable camera device のトグルでカメラを停止できない問題を修正する

- Created: 2026-09-03
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-enable-camera-device-toggle
- Polished: 2026-09-03

## 目的

`getUserMedia` または `fakeMedia` の映像入力を使用しているとき、`Enable camera device` を `off` にしても接続中の映像トラックが送信され続ける問題を修正する。

## 現状

`src/components/DevtoolsPane/CameraDeviceForm.tsx` の `CameraDeviceForm` は、トグル変更時に `src/app/signals.ts` の `setCameraDevice` を呼び出している。

`setCameraDevice` は `cameraDevice` の状態値を更新するだけで、既存の映像 `MediaStreamTrack` を停止・削除しない。

一方、`src/app/actions.ts` の `setCameraDeviceAction` には、`getUserMedia` または `fakeMedia` の映像トラックについて、以下の処理が実装されている。

- カメラを有効にしたときの映像トラック生成と置換
- カメラを無効にしたときのローカル映像トラック停止・削除
- 映像処理を行っている `MediaProcessor` の停止
- 接続中の Sora からの映像トラック削除

ただし、`fakeMedia` でカメラを再度有効にすると、映像生成前に `closeFakeContentsAudio` が呼ばれるため、既存の音声トラックと音声出力まで停止する。カメラの切り替えで音声まで停止させないようにする必要がある。

しかし、`setCameraDeviceAction` は `src/` 内から呼び出されていない。

`setCameraDeviceAction` は映像トラックの生成に失敗した場合、アラートを設定した後に Promise を reject する。呼び出し側でこの Promise を処理しなければ、トグル操作時に未処理 rejection が発生する。

`getDisplayMedia` と `mp4Media` では `cameraDevice` が映像トラックの生成条件に使われないため、今回の issue の対象外とする。

この状態は、React から Preact へ移行した際に、旧来 `src/app/actions.ts` の `setCameraDevice` を呼んでいた `CameraDeviceForm` が、`src/app/signals.ts` の単純な setter を呼ぶ実装へ変更されたことで発生したと考えられる。

## 設計方針

`getUserMedia` または `fakeMedia` のとき、`Enable camera device` のトグル変更時に単純な signal setter ではなく `setCameraDeviceAction` を呼び出す。

`getDisplayMedia` と `mp4Media` では、`setCameraDeviceAction` による映像トラックの切り替えを行わず、今回の issue では既存の状態変更だけを維持する。

`fakeMedia` でカメラを切り替えるときは、映像トラックだけを再生成・置換し、既存の音声トラックと音声出力を維持する。

接続前や MediaStream 未取得時の状態変更は、既存の `setCameraDeviceAction` が持つ早期 return の処理に任せる。

トグル操作から呼び出す非同期処理の Promise はイベントハンドラ側で処理し、`setCameraDeviceAction` が設定するアラートやログを維持したまま、未処理 rejection を発生させない。

## 完了条件

- `getUserMedia` または `fakeMedia` の接続中に `Enable camera device` を `off` にすると、現在の映像 `MediaStreamTrack` が停止・削除される
- 接続中の Sora から映像トラックが削除され、映像が送信されなくなる
- `getUserMedia` で `Enable camera device` を `on` にすると、カメラの映像トラックが再取得・再設定される
- `fakeMedia` で `Enable camera device` を `on` にすると、Fake Media の映像トラックが再生成・再設定される
- `fakeMedia` でカメラを切り替えても、既存の音声トラックと音声出力が維持される
- 接続前に `off` にした場合、`getUserMedia` と `fakeMedia` で映像トラックを作成しない既存の動作が維持される
- 映像トラックの生成に失敗した場合、既存のアラートを表示し、`cameraDevice` の状態を変更せず、未処理 rejection を発生させない
- `tests/camera-device-toggle.test.ts` の Playwright E2E テストで、`getUserMedia` / `fakeMedia` の `#local-video.srcObject` に含まれる映像トラックが、`off` で `ended` かつ MediaStream から削除され、`on` で新しい `live` トラックに置き換わることを確認する
- 同じ E2E テストで、`fakeMedia` の `fakeVolume` を有効にした状態でカメラ切り替え前後の音声トラックが維持され、`AnalyserNode` で音声信号を取得できること、Sora 接続中の映像トラック停止・再設定が完了することを確認する
- 同じ E2E テストで、映像トラック生成失敗時にページの `unhandledrejection` イベントが発生しないことを確認する
- 関連する E2E テストが成功する

## 解決方法

- `src/components/DevtoolsPane/CameraDeviceForm.tsx` が `getUserMedia` または `fakeMedia` のときに `setCameraDeviceAction` を呼び出すように修正する
- `setCameraDeviceAction` の成功時に状態を更新し、映像トラックの生成に失敗した場合は既存の状態を維持することを確認する
- `fakeMedia` のカメラ切り替え時に既存の音声トラックと音声出力を破棄しないように修正する
- `Enable camera device` の切り替えによって、ローカル MediaStream と Sora の映像トラックが期待どおりに更新されることを確認する
- 非同期処理の失敗時に、トグル操作から Promise が未処理のまま残らないことを E2E テストで確認する
