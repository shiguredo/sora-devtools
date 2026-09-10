# Chrome の `<usermedia>` 要素 (PEPC) に対応する

- Created: 2026-09-10
- Completed: {YYYY-MM-DD}
- Branch: feature/add-usermedia-element
- Polished: {YYYY-MM-DD}
- Reporter: @voluntas

## 目的

Chrome の `<usermedia>` 要素 (PEPC / Capability Elements) に対応し、 `request media` / `connect` のカメラ・マイク権限リクエストをブラウザ制御の宣言的な UI で行えるようにする。

ユーザー操作起点の権限リクエストにより、権限拒否後の回復やシステムレベルのブロッカーへの導線が改善される。旧 `<permission>` 要素の Origin Trial は不要で、 Chrome 151 以降の安定版で利用できる。

## 現状

- 起票元は `<permission type="camera microphone">` (Origin Trial, Chrome 126 以降) への対応と、 Origin Trial を有効にする仕組みの追加を想定していた
- 2026-06-29 の Chrome の発表で、旧 `<permission>` 要素は Chrome 151 から `<usermedia>` 要素に置き換わった。 Origin Trial への登録なしで利用できる
- `<usermedia>` はカメラ・マイクの権限フロー全体を扱い、 `setConstraints()` で constraints を指定し、 `stream` イベントで `MediaStream` を提供する。 `error` / `cancel` イベントと `error` プロパティも持つ
- `src/components/DevtoolsPane/RequestMediaButton.tsx` は `<button>` のクリックで `requestMedia` を呼び、 `getUserMedia` を実行する
- `src/components/DevtoolsPane/ConnectButton.tsx` も `<button>` のクリックで `connectSora` を呼ぶ
- `src/utils.ts` の `createAudioConstraints` / `createVideoConstraints` で constraints を組み立て、 `src/app/actions.ts` の `createUserMediaStream` で `getUserMedia` を呼ぶ。取得後は `applyTrackSettings` やデバイス選択の処理を通る
- `<usermedia>` はカメラ・マイク専用で、 `getDisplayMedia` / `fakeMedia` / `mp4Media` は置き換えられない
- サポートされないブラウザでは `<usermedia>` は `HTMLUnknownElement` として子要素を描画するため、子にボタンを置けばフォールバックできる
- 起票元では旧 `<permission>` 要素の表示が「下手な日本語」になりおかしくなるという指摘があった。 `<usermedia>` の UI はブラウザ制御で、コントラスト・サイズ・ `opacity: 1` などのスタイル制約があるため、日本語環境での表示を実機で確認する必要がある

## 設計方針

- `'HTMLUserMediaElement' in window` でサポートを判定し、対応ブラウザでは `<usermedia>` を使う。非対応ブラウザでは要素内のフォールバックボタン (従来の `<button>` + `getUserMedia`) を使う
- `<usermedia>` の `setConstraints()` に現在の constraints を渡し、 `stream` イベントで得た `MediaStream` をローカルの MediaStream として使用する
- `error` / `cancel` イベントは既存の通知の仕組みに載せる。 `error` の `DOMException` の内容を確認できるようにする
- 取得した `MediaStream` は既存の `getUserMedia` 経路と同じく `applyTrackSettings` やプレビュー・接続に使う
- `connect` は `getUserMedia` だけでなく Sora への接続も行うため、 `<usermedia>` をどう組み合わせるか (メディア取得のユーザー操作を `<usermedia>` に任せてから接続するか、 `request media` のみ対応するか) を実装時に決める
- `<usermedia>` のスタイル制約と既存の Button の見た目の整合を実機で確認する
- TypeScript の JSX 型 (`usermedia` 要素) と `HTMLUserMediaElement` の型定義を追加する。 TypeScript 7 の `lib.dom.d.ts` に存在するか実装時に確認する
- `getDisplayMedia` / `fakeMedia` / `mp4Media` の経路は変更しない

## 完了条件

- Chrome 151 以降で `request media` が `<usermedia>` 経由でカメラ・マイクの権限を取得できる
- 取得した `MediaStream` が既存の `getUserMedia` 経路と同じように扱われる (プレビュー・トラック設定・接続への利用)
- 権限を拒否した後の回復フローが `<usermedia>` の UI で動作する
- Chrome 151 未満と他ブラウザでは従来のボタンで動作する
- 日本語環境で `<usermedia>` の表示がおかしくないことを実機で確認する
- `getDisplayMedia` / `fakeMedia` / `mp4Media` の動作が変わらない
- 新しいテストを追加する
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

- `src/components/DevtoolsPane/RequestMediaButton.tsx` を `<usermedia>` 対応に変更する
- `src/app/actions.ts` の `requestMedia` などに `MediaStream` を渡す経路を追加する (現状は内部で `getUserMedia` を呼ぶ)
- `ConnectButton.tsx` の扱いは設計方針に従って実装時に決める
- `usermedia` 要素と `HTMLUserMediaElement` の型を追加する
- サポート判定とフォールバックのテストを追加する

## 関連

- [Introducing the `<usermedia>` HTML element - Chrome for Developers](https://developer.chrome.com/blog/usermedia-html-element)
- [An origin trial for a new HTML `<permission>` element - Chrome for Developers](https://developer.chrome.com/blog/permission-element-origin-trial)
- [Capability Elements explainer - w3c/mediacapture-extensions](https://github.com/w3c/mediacapture-extensions/blob/main/media-capture-elements-explainer.md)
- [The `<usermedia>` HTML element - W3C](https://w3c.github.io/mediacapture-extensions/#the-usermedia-html-element)
- `src/components/DevtoolsPane/RequestMediaButton.tsx` / `src/components/DevtoolsPane/ConnectButton.tsx`
