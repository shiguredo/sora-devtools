# Region Capture を再実装する

- Created: 2026-09-10
- Completed: {YYYY-MM-DD}
- Branch: feature/add-region-capture
- Polished: {YYYY-MM-DD}
- Reporter: @voluntas

## pending 理由 (2026-09-10)

- 用途（どの DOM 要素を共有するか）の良い例が未定。起票元でも「何か良い例を考えて Sora DevTools に実装したい」とされている
- 前回の実装は `mediacaptureRegion` という mediaType と、 react-draggable でドラッグできる `#cropArea` 要素を組み合わせたもので、用途が分かりにくく、 2025.1.0 で削除された。 CHANGES には「将来的に別の形で復活させる可能性はあり」と記録されている
- 現在は Preact へ移行済みで `react-draggable` も依存から削除されているため、旧実装をそのまま戻すことはできない。 crop target の選択 UI を Preact で新しく設計する必要がある
- Region Capture は Chrome / Edge 104 以降のタブキャプチャ専用で、 Firefox / Safari は非対応。対応範囲とフォールバックの設計が必要
- 以上の設計判断が固まるまで実装に着手しないため `issues/pending/` に置く

## 目的

Region Capture を再実装し、タブ共有時に画面全体ではなく指定した DOM 要素の領域だけを Sora へ送信できるようにする。

用途が分かりやすい例を devtools 上で試せるようにする。

## 現状

- 現在の `MEDIA_TYPES` は `getUserMedia` / `getDisplayMedia` / `fakeMedia` / `mp4Media` で、 `mediacaptureRegion` は存在しない
- `src/app/actions.ts` の `createDisplayMediaStream` は `getDisplayMedia` を呼ぶが、 `preferCurrentTab` や `CropTarget` / `cropTo` は使っていない
- 旧実装は `feature/region-capture` ブランチで追加され、 2025.1.0 で削除された (`9a1ca277`)
  - `mediacaptureRegion` 選択時に `getDisplayMedia({ preferCurrentTab: true })` を呼び、 `document.querySelector("#cropArea")` から `CropTarget.fromElement` で `CropTarget` を作り、映像トラックに `track.cropTo(cropTarget)` を適用していた
  - `#cropArea` は `src/components/MediacaptureRegionTarget.tsx` が react-draggable で描画していた
  - 削除時に `react-draggable` の依存も削除された
- `src/components/DevtoolsPane/MediaTypeForm.tsx` に `window.CropTarget` に関する NOTE が残っている
- `instructions.json` の mediaType の説明に `mediacaptureRegion` の記述が残っている
- Region Capture は `CropTarget.fromElement(element)` と `BrowserCaptureMediaStreamTrack.cropTo(target)` で構成され、 Chrome / Edge 104 以降のタブキャプチャ専用 (デスクトップのみ)
- `cropTo()` はトラックに clone があると reject する。 `CropTarget` は同一タブ内の要素から作る必要がある
- TypeScript 7 の `lib.dom.d.ts` には `CropTarget` / `BrowserCaptureMediaStreamTrack` の型がないため、実装時に型定義の追加が必要

## 設計方針

- 用途が分かりやすい例を決めてから UI を設計する。例の候補は実装時に検討する
- mediaType として独立させるか、 getDisplayMedia のオプションとして統合するかを実装時に決める
- crop target の選択方法 (ドラッグ可能な領域、要素を指定する UI など) を Preact で実装する。旧実装の react-draggable は使わない
- タブキャプチャ (self-capture) 以外が選ばれた場合は cropping しない、または無効化する。 `preferCurrentTab` の利用は実装時に決める
- `cropTo` の reject (clone がある、要素が消えた、他タブの `CropTarget` など) は既存の通知の仕組みでユーザーに表示する
- Region Capture 非対応ブラウザでは UI を表示しない、または無効化する
- `CropTarget` / `BrowserCaptureMediaStreamTrack` の型を `src/types.ts` などに追加する
- URL パラメータの追加は実装時に決める

## 完了条件

- 対応ブラウザ (Chrome / Edge 104 以降) で、タブ共有時に指定した DOM 要素の領域だけが Sora へ送信される
- 用途が分かる例を devtools 上で操作できる
- タブ以外を共有した場合や非対応ブラウザでは既存の getDisplayMedia の動作が維持される
- `cropTo` のエラーがユーザーに通知される
- `instructions.json` の `mediacaptureRegion` の記述を再利用するか削除するかを整理する
- 新しいテストを追加する
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

- 再実装の設計が固まったら、 mediaType または getDisplayMedia のオプションとして `CropTarget` の生成と `cropTo` の適用を実装する
- crop target の選択 UI は Preact で新しく実装する
- 旧実装は `feature/region-capture` ブランチと `9a1ca277` の親コミットを参考にする

## 関連

- `issues/0097-add-captured-surface-control.md`: 同じくタブ共有を操作する API。両方実装する場合は getDisplayMedia 周りの UI を整合させる
- [Better tab sharing with Region Capture - Chrome for Developers](https://developer.chrome.com/docs/web-platform/region-capture)
- [CropTarget - MDN](https://developer.mozilla.org/en-US/docs/Web/API/CropTarget)
- [BrowserCaptureMediaStreamTrack: cropTo() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/BrowserCaptureMediaStreamTrack/cropTo)
- [Region Capture - W3C](https://www.w3.org/TR/mediacapture-region)
