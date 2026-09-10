# fakeMedia の音量スライダーを自由に設定できるようにする

- Created: 2026-09-10
- Completed: {YYYY-MM-DD}
- Branch: feature/change-fake-media-volume-slider
- Polished: {YYYY-MM-DD}
- Reporter: @torikizi

## 目的

fakeMedia の音量をスライダーで自由に設定できるようにする。

現状は 0.25 刻みで粗く、検証時に任意の音量を指定できない。音量を細かく変えながら確認できるようにする。

## 現状

- `src/components/DevtoolsPane/FakeVolumeForm.tsx` は `<input type="range" min="0" max="1" step="0.25">` を使っており、 0 / 0.25 / 0.5 / 0.75 / 1 の 5 通りしか選べない
- `src/app/signals.ts` の `setFakeVolume` は `Number(value)` を 0〜1 にクランプして `fakeVolume` と `fakeContents.gainNode.gain` に反映する
- `src/utils.ts` の `createFakeMediaConstraints` は `volume: Number(volume)` をそのまま使い、 `createFakeMediaStream` で `gainNode.gain.setValueAtTime(parameters.volume, 0)` へ渡す
- URL パラメータ `fakeVolume` は `parseStringParameter` でそのまま読み取り、 `setFakeVolume` でクランプされる。 URL パラメータ経由では 0.25 刻み以外の値も指定できる
- 起票元では、現在のバーを活かしつつポイントに `|` を表示して刻みを分かりやすくする案が出ている

## 設計方針

- スライダーの `step` を小さくし、 0〜1 の間を細かく設定できるようにする（例: 0.01 刻み）
- 現在のバー UI を活かすか、目盛り (`|`) や数値入力を併用するかは実装時に決める
- min / max による 0〜1 の範囲制限は維持する
- `fakeVolume` の signal、 URL パラメータ、 `gainNode.gain` への反映という既存の流れは変更しない
- 接続中に変更したときに `gainNode.gain` へ反映される既存の動作を維持する
- getUserMedia / getDisplayMedia / mp4Media の音量には影響させない

## 完了条件

- スライダーで 0〜1 の間を 0.25 刻みより細かく設定できる
- 設定した値が `fakeVolume` と URL パラメータ `fakeVolume` に反映される
- 接続前に設定した値が `createFakeMediaStream` の `gainNode.gain` に反映される
- 接続中に変更した値が `gainNode.gain` に反映される
- 既存の 0 / 0.25 / 0.5 / 0.75 / 1 の値が引き続き設定できる
- 新しいテストを追加する
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

- `src/components/DevtoolsPane/FakeVolumeForm.tsx` の `step` を小さくし、細かい値を選べるようにする
- 必要に応じて目盛りの表示や数値入力を追加する
- スライダーの値が `fakeVolume` とゲインに反映されるテストを追加・修正する

## 関連

- [input type="range" - MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range)
