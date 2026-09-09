# メディア操作の非同期競合を修正する

- Created: 2026-09-08
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-serialize-media-operations
- Polished: {YYYY-MM-DD}

## 目的

カメラ・マイクの切り替え、入力デバイス変更、メディア取得、接続・再接続などの非同期処理が同時に実行されると、最新の設定と実際の `MediaStream` / `MediaStreamTrack` / Sora の送信状態が不一致になる問題を修正する。

操作を直列化し、古い処理の完了結果が新しい処理の状態を上書きしないようにすることで、映像・音声の残留、意図しないデバイス取得、トラックや `AudioContext` のリークを防止する。

## 現状

### カメラ・マイク切り替え

`src/components/DevtoolsPane/CameraDeviceForm.tsx` と `src/components/DevtoolsPane/MicDeviceForm.tsx` は、`getUserMedia` / `fakeMedia` の場合に、それぞれ `setCameraDeviceAction` / `setMicDeviceAction` を非同期で呼び出す。

しかし、これらの処理にはカメラとマイクの切り替え処理同士、または `updateMediaStream` との共通の排他制御がない。

off 処理が既存トラックを固定して停止待ちしている間に on 処理が新しいトラックを追加すると、off 処理が新しいトラックを停止できず、最後に実行された signal の値と実際の `MediaStream` が不一致になる可能性がある。

### `updateMediaStream`

`src/app/actions.ts` の `updateMediaStream` には同じ関数の二重起動を抑止する in-flight 制御があるが、`setCameraDeviceAction` / `setMicDeviceAction`、`requestMedia`、`connectSora`、`reconnectSora`、`disposeMedia` との排他はない。

`updateMediaStream` は開始時に state と `localMediaStream` を取得し、非同期の MediaStream 生成後に signal を更新する。そのため、別の処理が先に新しい MediaStream を設定していても、古い state で生成した MediaStream が後から設定される可能性がある。

### メディア取得と接続処理

`requestMedia`、`connectSora`、`reconnectSora` も非同期処理の開始時点で state を取得し、`await createMediaStream(...)` の完了後に MediaStream や接続状態を更新する。

接続準備中にカメラ・マイクを切り替えた場合、接続処理が切り替え前の state を使い続ける可能性がある。また、メディア取得中の設定変更や破棄処理との競合により、古いトラックが保持される可能性がある。

### トラック状態変更

`src/app/signals.ts` の `setAudioTrack` / `setVideoTrack` は現在の `localMediaStream` のトラックを同期的に更新するが、同時に実行中の MediaStream 再生成処理が完了すると、変更前の state に基づくトラックへ置き換わる可能性がある。

## 再現手順

以下の操作を、処理が完了する前に連続して実行する。

1. `getUserMedia` または `fakeMedia` でメディアを取得する
2. カメラまたはマイクのデバイスを off にする
3. トラック停止処理の待機中に同じデバイスを on にする、または `update-mediastream` を実行する
4. カメラ・マイクの signal、`localMediaStream` のトラック、Sora の送信トラックが同じ設定になっているか確認する

同様に、次の操作とメディア取得・更新処理を連続して実行する。

- `request media` とカメラ・マイク切り替え
- `connect` / `reconnect` とカメラ・マイク切り替え
- `update-mediastream` と入力デバイス変更
- `dispose media` とメディア取得または更新
- `Enable audio track` / `Enable video track` と MediaStream 再生成

## 設計方針

- MediaStream の生成・停止・置換・破棄を伴う処理を、共通の直列化単位として扱う
- カメラ・マイク切り替え、入力デバイス変更、`requestMedia`、`updateMediaStream`、`connectSora`、`reconnectSora`、`disposeMedia`、切断時の cleanup が同じリソースを同時に操作しないようにする
- 先行処理の完了時に、後続処理が設定した signal や MediaStream を古い値で上書きしないようにする
- ユーザーの最新の設定を最終的な MediaStream と Sora の送信状態へ反映する。処理を破棄する場合は、生成済みのトラック、`AudioContext`、Worker などを確実に解放する
- `preparing` / `connecting` / `disconnecting` などの過渡状態では、UI の操作制限だけに依存せず、関数側でも競合を防止する
- `getDisplayMedia` や `mp4Media` など、カメラ・マイクの device flag を直接利用しない経路の既存動作を変更しない
- 既存の `updateMediaStream` / `reconnectSora` の in-flight 制御や切断時の cleanup と責務が重複しない構成にする

## 完了条件

- カメラとマイクを連続して on / off しても、最終的な signal と `localMediaStream` のトラック状態が一致する
- カメラとマイクの切り替えを同時に実行しても、音声・映像の処理が互いに破壊されない
- 入力デバイス変更と `updateMediaStream` が重なっても、最後に選択したデバイスが MediaStream に反映される
- `requestMedia` / `connectSora` / `reconnectSora` / `disposeMedia` / 切断時 cleanup とデバイス切り替えが重なっても、古い MediaStream が後から復活しない
- `Enable audio track` / `Enable video track` の変更が、MediaStream 再生成完了後も最終トラックへ反映される
- Sora 接続中のトラック置換・削除が直列化され、Sora の送信状態とローカル状態が一致する
- 競合で破棄された MediaStreamTrack、`AudioContext`、Fake Video Worker、Media Processor が残らない
- メディア生成や切り替えが失敗した場合、signal を誤って成功状態へ更新せず、ユーザーへ既存のエラー通知を行う
- `getDisplayMedia` / `mp4Media` の既存動作が変わらない
- 既存の単体テスト、型チェック、lint、ビルド、E2E テストが成功する
- 体系的なメディア切り替え E2E テストの拡充は本 issue の対象外とし、必要なケースは別 issue で扱う

## 解決方法

- `src/app/actions.ts` のメディア操作関数を確認し、共通の in-flight Promise、操作キュー、または世代管理を導入する
- `setCameraDeviceAction` と `setMicDeviceAction` が、`updateMediaStream` や接続・切断処理と同じ排他方針に従うようにする
- 非同期処理完了時に処理開始時の state を無条件で signal へ反映せず、処理が現在の状態に対して有効かを確認する
- 古い処理を破棄する場合は、処理中に生成した MediaStreamTrack、`AudioContext`、Fake Video Worker、Media Processor を解放する
- `src/components/DevtoolsPane/CameraDeviceForm.tsx`、`MicDeviceForm.tsx`、`UpdateMediaStreamButton.tsx`、`AudioInputForm.tsx`、`VideoInputForm.tsx` などの呼び出し側が、共通の排他処理を迂回しないことを確認する
- 実ブラウザ上で、カメラ・マイクの切り替え、入力デバイス変更、MediaStream 更新、接続・切断を組み合わせた操作を確認する
