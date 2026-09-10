# Captured Surface Control API を利用した仕組みを追加する

- Created: 2026-09-10
- Completed: {YYYY-MM-DD}
- Branch: feature/add-captured-surface-control
- Polished: {YYYY-MM-DD}
- Reporter: @voluntas

## 目的

getDisplayMedia でタブを共有しているときに、 Captured Surface Control API を使って共有先タブを devtools 側からスクロール・ズームできるようにする。

発表者がリモート参加者へ操作を依頼するようなケースを、配信側の画面から操作して検証できるようにする。

## 現状

- `src/app/actions.ts` の `createDisplayMediaStream` は `navigator.mediaDevices.getDisplayMedia(mediaConstraints)` を呼ぶ。 `CaptureController` は使っていない
- `src/utils.ts` の `createGetDisplayMediaAudioConstraints` / `createGetDisplayMediaVideoConstraints` が constraints を生成する
- Captured Surface Control API は Chrome 136 以降 (デスクトップのみ) で利用できる。起票元の時点では Origin Trial が必要だったが、現在は不要
- API は `CaptureController` 経由で提供される
  - `getDisplayMedia` のオプション `controller` に `CaptureController` を渡す
  - `forwardWheel(element)` でローカル要素へのホイールイベントを共有先サーフェスのビューポートへ転送する (スクロール)
  - `getSupportedZoomLevels()` / `zoomLevel` / `increaseZoomLevel()` / `decreaseZoomLevel()` / `resetZoomLevel()` / `zoomlevelchange` イベントでズームを操作する
  - write 系 API は transient activation と `captured-surface-control` Permissions Policy が必要
  - 機能検出は `window.CaptureController?.prototype.forwardWheel` などで行う
- zoom はタブ共有のときのみ有効で、 `zoomLevel` はタブ以外では null になる。 `displaySurface` は `track.getSettings()` から取得できる
- TypeScript 7 の `lib.dom.d.ts` には `CaptureController` の型定義がなく、 `DisplayMediaStreamOptions` にも `controller` が定義されていない。実装時に型定義の追加が必要
- `getDisplayMedia` のプレビューは `src/components/Video/LocalVideo.tsx` の `Video` コンポーネントで表示している。 `forwardWheel` の対象要素にできるが、現状は `VideoElement` 内の `video` 要素の参照が外に出ていない

## 設計方針

- mediaType が getDisplayMedia のときに `CaptureController` を生成し、 `getDisplayMedia` のオプション `controller` に渡す
- 対応ブラウザ (Chrome 136 以降のデスクトップ) のみ機能を有効にする。機能検出で非対応環境では操作 UI を表示しない
- 共有中に以下の操作 UI を追加する
  - スクロール: プレビューの `video` 要素を `forwardWheel` の対象にする
  - ズーム: `increaseZoomLevel` / `decreaseZoomLevel` / `resetZoomLevel` のボタンと現在の `zoomLevel` の表示
- `zoomLevel` は `zoomlevelchange` イベントで更新する
- `CaptureController` は signal または `soraContents` に保持し、共有終了・ストリーム入れ替えで解放する
- エラー (`InvalidStateError` / `NotAllowedError`) は既存の通知の仕組みでユーザーに表示する
- `displaySurface` が `browser` 以外のときの操作 UI の表示・無効化は実装時に決める
- `Video` コンポーネントから `video` 要素の参照を取得できるようにし、 `forwardWheel` に渡せるようにする
- URL パラメータや Sora 側のオプションには影響させない
- `CaptureController` / `DisplayMediaStreamOptions.controller` / `zoomlevelchange` の型定義を追加する
- Element Capture API (`restrictionTarget` など) は別の API のため本 issue の対象外とする

## 完了条件

- getDisplayMedia でタブを共有したとき、 devtools の UI から共有先タブをスクロールできる
- 共有先タブのズームを拡大・縮小・リセットできる。現在のズームレベルが表示される
- 非対応ブラウザ (Chrome 136 未満・他ブラウザ) では操作 UI が表示されず、従来の画面共有が動作する
- 共有終了・再接続で `CaptureController` が残らない
- zoom / スクロール操作のエラーがユーザーに通知される
- 新しいテストを追加する
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

- `src/app/actions.ts` の `createDisplayMediaStream` で `CaptureController` を生成し、 `getDisplayMedia` に渡す
- `src/app/signals.ts` に `CaptureController` と `zoomLevel` を保持する signal を追加する
- スクロールとズームの操作 UI を追加し、 `forwardWheel` と zoom 系メソッドを呼ぶ
- `CaptureController` 関連の型を `src/types.ts` などに追加する
- テストを追加する

## 関連

- [Scroll and zoom a captured tab - Chrome for Developers](https://developer.chrome.com/docs/web-platform/captured-surface-control)
- [Using the Captured Surface Control API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Captured_Surface_Control)
- [CaptureController - MDN](https://developer.mozilla.org/en-US/docs/Web/API/CaptureController)
- [w3c/mediacapture-surface-control](https://github.com/w3c/mediacapture-surface-control)
- Element Capture API: https://github.com/screen-share/element-capture (別 API のため本 issue の対象外)
