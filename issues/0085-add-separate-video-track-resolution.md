# カメラから取得した解像度とは別に映像トラックの解像度を変更できるようにする

- Created: 2026-09-10
- Completed: {YYYY-MM-DD}
- Branch: feature/add-separate-video-track-resolution
- Polished: {YYYY-MM-DD}
- Reporter: @voluntas

## 目的

カメラから取得する解像度と、Sora へ送信する映像トラックの解像度を別々に指定できるようにする。

カメラからは 1080p で取得しつつ、配信は 540p に落とす、といった使い方を可能にする。回線や CPU の都合で送信解像度だけを下げたい場合でも、カメラの取得解像度を維持できるようにする。

## 現状

- `src/components/DevtoolsPane/ResolutionForm.tsx` の `resolution` は、`src/utils.ts` の `createVideoConstraints` で `getUserMedia` の width / height constraints に変換している。解像度を変更するには `getUserMedia` から取得し直す必要がある
- 取得済みのトラックへ `applyConstraints` する処理は、`createFakeMediaStream` がフェイク映像トラックへ `videoTrackConstraints` を適用する箇所だけにある。カメラから取得したトラックには適用していない
- sora-js-sdk 2026.1.0 には `Sora.helpers.applyMediaStreamConstraints(mediaStream, constraints)` がある。音声・映像トラックへまとめて `applyConstraints` できるが、`src/` からは未使用
- `src/app/actions.ts` の `updateMediaStream` は接続を維持したまま `MediaStream` を作り直す。デバイス変更や `UpdateMediaStreamButton` から呼ばれる
- `MediaStreamTrack.applyConstraints` で width / height を変更すると、ブラウザがカメラ自体の設定変更を要求する場合がある。カメラの取得解像度を維持したままトラックだけを縮小するには `resizeMode: "crop-and-scale"` の併用が必要になる（実装時に検証する）

## 設計方針

- `getUserMedia` に渡す取得用 constraints と、取得後のトラックへ適用する constraints を分けて扱う
- トラックへの適用は `MediaStreamTrack.applyConstraints` を使い、sora-js-sdk の `Sora.helpers.applyMediaStreamConstraints` を利用する
- カメラの取得解像度は既存の `resolution` のまま指定し、トラック用の解像度は新しい state / signal で指定する
- トラックを縮小するときは `resizeMode: "crop-and-scale"` を併用し、カメラの再構成ではなくクロップ・スケールで縮小する
- UI は取得用の `resolution` とは別に、映像トラック用の解像度を指定できる入力を追加する。配置と操作方法は実装時に決める
- 接続中に変更した場合は `updateMediaStream` の経路で反映する
- `OverconstrainedError` などで適用できなかった場合は、既存のエラー表示の仕組みでユーザーへ通知する
- 既存の `resolution`（取得解像度）と、フェイクメディアの `videoTrackConstraints` の挙動は変更しない

## 完了条件

- カメラの取得解像度とは別に、映像トラックの解像度を指定できる
- 指定した解像度が送信トラックの `getSettings()` に反映される
- カメラの取得解像度（1080p など）を維持したまま、送信トラックだけを 540p などへ縮小できる
- 接続中の変更が `updateMediaStream` で反映され、Sora へ送信される映像の解像度が変わる
- 解像度の適用に失敗した場合、ユーザーへエラーが表示され、状態が壊れない
- 新しいテストを追加する
- 既存の単体テスト、型チェック、lint、ビルド、E2E テストが成功する

## 解決方法

- `src/app/signals.ts` に映像トラック用の解像度の signal を追加する
- `src/app/actions.ts` の `createUserMediaStream` または `updateMediaStream` で、取得後に `Sora.helpers.applyMediaStreamConstraints` を使ってトラックへ適用する
- `src/components/DevtoolsPane/` に映像トラック用の解像度入力を追加し、`updateMediaStream` から反映する
- `resizeMode: "crop-and-scale"` を併用したときの縮小挙動を実ブラウザで確認する
- 適用結果を `track.getSettings()` で確認するテストを追加する

## 関連

- [MediaStreamTrack: applyConstraints() method - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/applyConstraints)
- sora-js-sdk の `Sora.helpers.applyMediaStreamConstraints`
- 取得解像度の既存実装: `ResolutionForm` / `createVideoConstraints`
