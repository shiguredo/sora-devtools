# MP4 送信開始時に audioTrack の無効状態が反映されない問題を修正する

- Created: 2026-09-02
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-apply-audio-track-to-mp4-media
- Polished: 2026-09-02

## 目的

`Enable audio track` をあらかじめ `off` にして MP4 の送信を開始したとき、MP4 の音声が送信される問題を修正する。

## 現状

以下の手順で問題が再現する。

1. ページをリロードする
2. `mediaType` を `mp4Media` にする
3. MP4 ファイルを選択する
4. `Enable audio track` を `off` にする
5. MP4 の送信を開始する
6. MP4 の音声が送信される

`src/app/actions.ts` の `createMediaStream` は、`mp4Media` の場合に `Mp4MediaStream.play()` が返す `MediaStream` をそのまま返している。

一方、`getUserMedia` と Fake Media の経路では、`applyTrackSettings` を呼び出して `audioTrack` の状態を音声トラックへ適用している。MP4 の経路では `applyTrackSettings` が呼ばれないため、`audioTrack` が `false` でも MP4 の音声トラックが有効なままになる。

送信開始後に `Enable audio track` を `off` にした場合は、`src/app/signals.ts` の `setAudioTrack` によって既存の音声トラックへ `enabled = false` が設定され、無音相当になる。

## 設計方針

MP4 の `MediaStream` を生成した直後に `applyTrackSettings` を呼び出し、`audioTrack` と `audioContentHint` の状態を MP4 の音声トラックへ適用する。

送信開始後の `Enable audio track` 切り替えと、MP4 以外のメディア生成経路の動作は変更しない。

## 完了条件

- `audioTrack` が `false` の状態で MP4 の送信を開始しても、音声が無音相当になる
- `audioTrack` が `true` の状態では、MP4 の音声がこれまでどおり送信される
- MP4 の送信開始後に `Enable audio track` を切り替える既存の動作が維持される
- `getUserMedia`、`getDisplayMedia`、Fake Media の動作が変わらない
- `tests/fixtures/test.mp4` を使うブラウザー E2E テストで、送信開始前に `audioTrack` を `false` にした MP4 の音声トラックが `enabled === false` になることを確認する
- 同じブラウザー E2E テストで、`audioTrack` が `true` のときの `enabled === true` と、送信開始後の `Enable audio track` 切り替えが維持されることを確認する
- 関連するテストが成功する

## 解決方法

- `src/app/actions.ts` の `createMediaStream` にある `mp4Media` 経路で、`Mp4MediaStream.play()` の戻り値へ `applyTrackSettings` を適用する
- `tests/fixtures/test.mp4` を使う Playwright テストを追加または修正し、MP4 の `MediaStream` の音声トラックに生成時の `audioTrack` 状態が反映されることを確認する
- 同じテストで、MP4 の送信開始後に `Enable audio track` を切り替えたときの既存動作が維持されることを確認する
