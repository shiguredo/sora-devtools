# Virtual Background の processed track を preview の off で確実に停止・削除する

- Created: 2026-09-08
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-cleanup-virtual-background-track
- Polished: {YYYY-MM-DD}

## 目的

Virtual Background を有効にした `getUserMedia` の preview で `Enable camera device` を off にしたとき、`localMediaStream` に残る processed video track を確実に停止・削除する。

不要な映像トラックを残さないことで、preview の状態と実際の MediaStream を一致させ、停止済みトラックや映像処理リソースの残留を防止する。

## 現状

`src/app/actions.ts` の `processVideoTrack` は、Virtual Background の `startProcessing` が返す processed track を `createUserMediaStream` の内部 MediaStream に追加する。

一方、`setCameraDeviceAction` の Sora 未接続時の off 経路では、以下の処理を行っている。

1. `stopVideoProcessors` で Virtual Background の original track を取得する
2. `stopProcessing` で映像処理を停止する
3. `stopLocalVideoTrack` に original track を渡す

`stopLocalVideoTrack` は original track が渡された場合、その track だけを停止・削除して処理を終了する。Virtual Background の processed track は `localMediaStream` に入っているが、original track は `localMediaStream` に入っていないため、processed track が停止・削除されない。

その結果、Virtual Background を使用した preview でカメラを off にしても、`localMediaStream.getVideoTracks()` に processed track が残る可能性がある。

### マイクとの違い

Noise Suppression の音声処理では、`stopLocalAudioTrack` が processor の original track を処理した後に `localMediaStream.getAudioTracks()` の全音声トラックを走査して停止・削除する。そのため、今回確認した processed track の残留問題は、現状のマイク経路では同じ形では発生しない。

## 再現手順

1. `getUserMedia` を選択する
2. Virtual Background が有効になるように blur を設定する
3. `request media` を実行して preview を開始する
4. `localMediaStream` に processed video track が含まれていることを確認する
5. `Enable camera device` を off にする
6. `localMediaStream.getVideoTracks()` を確認する

期待結果は映像トラックが 0 件になることだが、現状は processed track が残る可能性がある。

## 設計方針

- Virtual Background の停止時に original track と processed track の両方を停止・削除する
- `stopProcessing` 後は processor の `getProcessedTrack()` が利用できなくなるため、必要なトラックを停止前に取得する
- processed track が `localMediaStream` に存在しない場合も安全に処理できるようにする
- Virtual Background を使用しない通常のカメラ停止経路の挙動を変更しない
- Sora 接続中のトラック削除や `disconnectSora` の cleanup と処理が重複しても、二重停止が問題にならない構成にする
- 音声の Noise Suppression 経路は今回の対象に含めず、現行の全音声トラック cleanup を維持する

## 完了条件

- Virtual Background 有効時に preview のカメラを off にすると、original track と processed track が停止する
- 同じ操作後に `localMediaStream.getVideoTracks()` が空になる
- Virtual Background 無効時の通常のカメラ off 動作が変わらない
- カメラを off にした後、Virtual Background の映像処理が継続しない
- `setCameraDeviceAction` を複数回実行しても、停止・削除処理が例外を投げず冪等に完了する
- Sora 接続中のカメラ off と切断時 cleanup の既存動作が変わらない
- マイクの Noise Suppression processed track が引き続き停止・削除される
- 既存の単体テスト、型チェック、lint、ビルド、E2E テストが成功する
- Virtual Background の preview off を確認する専用テストを追加または既存テストへ反映する。体系的なメディア切り替え E2E テストの拡充は別 issue で扱う

## 解決方法

- `src/app/actions.ts` の `stopVideoProcessors` と `stopLocalVideoTrack` の責務を確認し、Virtual Background の original / processed track を停止・削除できるように修正する
- processed track を `localMediaStream` から削除してから、必要な待機と `stop()` を行う
- stop 対象の track をタイムラインへ記録する既存方針を維持する
- Virtual Background を有効にした preview で camera off 後の MediaStream と track 状態を実ブラウザで確認する
