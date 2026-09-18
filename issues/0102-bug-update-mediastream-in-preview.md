# プレビュー状態で update-mediastream を押すとローカルメディアが消える問題を修正する

- Created: 2026-09-18
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-preview-update-mediastream
- Polished: 2026-09-18

## 目的

プレビュー状態 (request media 後・Sora 未接続) で update-mediastream を押すと、ローカルメディア (映像・音声) が消える問題を修正する。

プレビュー状態でもメディアの再生成が実効化され、ボタンと `audioInput` / `videoInput` のデバイス切替が期待どおり動作するようにする。

## 現状

### ボタンの状態

`UpdateMediaStreamButton` (`src/components/DevtoolsPane/UpdateMediaStreamButton.tsx`) の disabled 条件は `localMediaStream === null` と preparing / connecting / disconnecting のみ。プレビュー状態 (localMediaStream は取得済み・connectionStatus は disconnected) では押せる。

### updateMediaStream の処理と中断ガード

`updateMediaStream` (`src/app/actions.ts`) は以下を実行する。

1. 現行の `localMediaStream` の映像トラックを停止、音声トラックを停止・削除する
2. `createMediaStream` で新規メディアを生成する (fakeMedia なら新たな AudioContext も生成)
3. Sora 接続中は sender へ `replaceTrack`、未接続なら何もしない
4. 末尾の中断ガードで「Sora 接続状態の変化」「`localMediaStream === null`」「`connectionStatus` が disconnecting / disconnected」のいずれかなら、新規メディアの全トラックを stop し AudioContext を close して破棄し return する

### ガードの誤発動

`setInitialParameter` (`src/app/actions.ts`) はページ起動時に `connectionStatus` を `"disconnected"` に設定する。そのためプレビュー状態でも上記 3 の条件が常に真となり、新規メディアが破棄される。一方で手順 1 で旧メディアは停止・削除済みのため、映像トラックは ended のまま固定、音声トラックは消える。

実測 (Playwright + Chromium) では、プレビュー状態で update-mediastream を押すと直後に音声トラック数が 0、映像トラックの `readyState` が `ended` になった。

`AudioInputForm` / `VideoInputForm` (`src/components/DevtoolsPane/`) はデバイス切替時に `updateMediaStream` を直接呼ぶため、プレビュー状態で audioInput / videoInput を変更しても同じ現象が起きる。

### 過去 issue との関係

- この中断ガードは `issues/closed/0045-bug-fix-update-media-stream-after-disconnect.md` (closed 済み) で導入されたもので、Sora 接続中の切断競合で新規メディアを残さないための防御
- `issues/closed/0054-bug-fix-update-media-stream-button-disabled.md` (closed 済み) では「`localMediaStream` が取得済みならプレビュー中も更新可能」と設計されている
- つまり現状は 0045 の防御がプレビュー状態に誤発動し、0054 の設計意図と矛盾している

## 設計方針

- `updateMediaStreamImpl` の中断ガードのうち、「`connectionStatus` が disconnecting / disconnected」の条件を「処理開始時に Sora 接続 (`signals.sora.value`) が存在した場合のみ」発動させる
- プレビュー状態 (Sora 未接続) ではガードを発動させず、新規メディアで置き換える
- 接続中の切断競合 (0045 の本来的な防御対象) の挙動は維持される
- ボタンの disabled 条件は変更しない (プレビュー中も更新可能という 0054 の設計意図を維持する)

## 完了条件

- プレビュー状態で update-mediastream を押しても、ローカルメディアが消えない
- プレビュー状態で update-mediastream を押すと、新規メディア (トラック・AudioContext) に置き換わり音声・映像が継続する
- `audioInput` / `videoInput` のデバイス切替でも、プレビュー状態のメディアが消えずに再生成される
- 接続中に切断競合が起きた場合のガード発動 (0045) が維持される
- 新規の Playwright E2E テストで上記の動作を確認する
- 関連する E2E テストが成功する

## 解決方法

- `src/app/actions.ts` の `updateMediaStreamImpl` の中断ガード条件を修正し、処理開始時に Sora 接続が存在しない場合は発動しないようにする
- `tests/fake-media-camera-audio-toggle.test.ts` に追記するか新規の E2E テストで、プレビュー状態で update-mediastream を押してもメディアが消えずに再生成が実効化されることを確認する (音声信号の RMS とトラック ID の変化、映像トラックの `readyState` の live 維持)
