# `fakeMedia` のカメラ off で Fake Video Worker を停止する

- Created: 2026-09-08
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-stop-fake-video-worker-on-camera-off
- Polished: 2026-09-09

## 目的

`fakeMedia` で `Enable camera device` を off にしたとき、映像トラックだけでなく Fake Video Worker の描画ループと `OffscreenCanvas` も停止する。

不要な描画処理を残さないことで、カメラ映像を無効にした後の CPU 使用量と Worker リソースの残留を防止する。

## 現状

`src/app/actions.ts` の `createFakeMediaStreamFromState` は、Fake Video 用の `OffscreenCanvas` を Worker へ転送し、Worker に `init` を送って描画を開始する。Worker の `animate` は `setTimeout` で次の描画を繰り返す。

`src/workers/fakeVideo.worker.ts` には `stop` メッセージを受け取ってタイマーを解除し、`canvas` / `ctx` を破棄する処理が実装されている。

一方、`setCameraDeviceAction` のカメラ off 経路は `stopLocalVideoTrack` で MediaStream の映像トラックを停止・削除するだけで、Fake Video Worker に `stop` を送っていない。

そのため、`fakeMedia` のカメラを off にした後も Worker の描画ループが継続し、映像トラックが存在しない `OffscreenCanvas` に対して不要な描画処理が続く。

Worker を停止する処理は `disposeMedia`、切断時の cleanup、Fake Media の再生成時には存在するが、カメラだけを off にする経路には存在しない。

## 再現手順

1. `mediaType` を `fakeMedia` にする
2. 映像を有効にして `request media` を実行する
3. Fake Video Worker が描画している状態で `Enable camera device` を off にする
4. Chrome Task Manager（`Shift` + `Esc`）または DevTools の Performance で、カメラ off 前後の CPU 使用量を比較する
5. DevTools の Performance の記録を見て、カメラ off 後も `fakeVideo.worker.ts` の `animate` / `drawFrame` が呼ばれ続けることを確認する
6. `src/app/actions.ts` の `setCameraDeviceAction` のカメラ off 経路に Worker への `stop` 送信が無いことをソースコードで確認する。そのため `src/workers/fakeVideo.worker.ts` の `stop` ハンドラーは呼ばれず、タイマーは解除されない

期待結果は、カメラ off の完了後に Fake Video Worker の描画処理が停止し、CPU 使用量が通常の待機状態まで低下することだが、現状は Worker のタイマーが残り続ける。

なお、Worker オブジェクト自体はカメラ再 on 時に再利用するため、`terminate()` によって消滅することは求めない。`OffscreenCanvas` の保持状態はページ側から直接観測できないため、Worker の `stop` ハンドラーによる内部状態の解放をコードで確認する。

## 設計方針

- `fakeMedia` のカメラ off 時に、既存 Worker へ `stop` メッセージを送る
- Worker 停止後はタイマー、`canvas`、`ctx` が保持されない状態にする
- カメラ再 on 時は、既存の Fake Media 生成経路による `stop` → `init` の順序を維持して描画を再開する
- Fake Media の音声トラック、`AudioContext`、音声出力は変更しない
- `getUserMedia`、`getDisplayMedia`、`mp4Media` のカメラ off 動作に影響させない
- `disposeMedia` や切断時 cleanup と重複して Worker を停止しても安全な冪等処理にする

## 完了条件

- `fakeMedia` のカメラを off にすると、映像トラックの停止・削除と同時に Fake Video Worker の描画ループが停止する
- カメラ off 後に Worker のタイマーが解除され、`canvas` / `ctx` が `null` に設定される
- Fake Media のカメラを再 on にすると、Worker が再初期化されて映像描画が再開する
- カメラの off / on を複数回繰り返しても Worker やタイマーが増殖しない
- カメラ off 後も Fake Media の音声トラックと音声出力が本 issue の修正によって変更されない
- `disposeMedia`、切断、状態リセット時の既存 Worker 停止処理が維持される
- `getUserMedia`、`getDisplayMedia`、`mp4Media` の既存動作が変わらない
- 既存の単体テスト、型チェック、lint、ビルド、E2E テストが成功する
- Chrome Task Manager または DevTools の Performance で、カメラ off 後に Worker の描画処理と CPU 使用量が低下することを確認する
- `src/workers/fakeVideo.worker.ts` の `stop` ハンドラーで、タイマー・`canvas`・`ctx` が解放されることをコードで確認する
- 実ブラウザ上でカメラ再 on 後に Worker が再初期化され、描画が再開することを確認する

## 解決方法

- `src/app/actions.ts` の `setCameraDeviceAction` にある Fake Media のカメラ off 経路を修正し、Fake Video Worker の停止処理を呼び出す
- Worker への `stop` メッセージ送信を、既存の `disposeMedia` や切断時 cleanup と同じ Worker のライフサイクル方針に揃える
- `src/workers/fakeVideo.worker.ts` の `stop` ハンドラーが、カメラ off 後の再 on と複数回の停止で安全に動作することを確認する
- Fake Media のカメラ off / on を実ブラウザで確認し、映像停止中に不要な描画処理が継続しないことを確認する
