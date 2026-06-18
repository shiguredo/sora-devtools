# 0049-bug-fix-fake-contents-audio-close

- Priority: High
- Created: 2026-06-09
- Completed: 2026-06-09
- Model: Opus 4.7
- Branch: feature/fix-fake-contents-audio-close
- Polished: 2026-06-09

## 目的（当初）

`setFakeContentsAudio` setter は新しい `audioContext` で signal をスプレッド上書きするだけで、既に signal にセットされていた **旧** `audioContext` を `close()` しない。`mediaType` を `fakeMedia` から `getUserMedia` / `getDisplayMedia` / `mp4Media` に切り替えた後の経路では setter が `setFakeContentsAudio(null, null)` で呼ばれ、**旧 AudioContext が誰からも参照されないまま稼働を続けて Chrome の AudioContext 同時上限を消費する** と当初想定していた。setter 内で「旧と新が異なる参照のとき旧を `void close()` する」自動 close を defense-in-depth として追加する案だった。

## 解決方法

実装せずに close する。理由は以下の通り。

### 1. 想定していた本丸経路が UI 操作で踏めない

当初想定した「`mediaType=fakeMedia` で接続 → MediaType を `getUserMedia` 等に切替 → 再接続で setter に `(null, null)` が渡る」シナリオは現状のコードでは成立しない:

- `MediaTypeForm` (`src/components/DevtoolsPane/MediaTypeForm.tsx:46`) は `localMediaStream.value !== null || isFormDisabled.value` のとき disabled。Request Media または Connect 後は MediaType を切り替えられない。
- MediaType を切り替えるには、先に `Disconnect` または `Dispose Media` で `localMediaStream.value` を `null` にする必要がある。`disconnectSora` (`src/app/actions.ts:1684-1709`) は内部で `cleanupSoraMediaState` (`src/app/actions.ts:1056`) を呼び、その 1080 行で `signals.closeFakeContentsAudio()` が走る。`disposeMedia` (`src/app/actions.ts:1340-1369`) も同様に 1367 行で `closeFakeContentsAudio()` を呼ぶ。
- つまり MediaType 切替時点では旧 AudioContext は既に明示的に close 済みで、signal の `audioContext` は `null`。再接続後に setter が呼ばれても、`previousAudioContext === null` のため自動 close ロジックは何もしない。

### 2. 「呼び出し元 6 箇所」のうち 2 箇所は死コード

当初 issue は `setMicDeviceAction` (`src/app/actions.ts:1806`) と `setCameraDeviceAction` (`src/app/actions.ts:1902`) を `setFakeContentsAudio` の呼び出し元として数えていたが、これらは UI から呼ばれていない:

- `MicDeviceForm` (`src/components/DevtoolsPane/MicDeviceForm.tsx`) の `onChange` は signals の単純 setter `setMicDevice` (`src/app/signals.ts:633`) を呼ぶ。
- `CameraDeviceForm` (`src/components/DevtoolsPane/CameraDeviceForm.tsx`) も同様に `setCameraDevice` (`src/app/signals.ts:630`) を呼ぶ。
- `setMicDeviceAction` / `setCameraDeviceAction` の export 定義はあるが、`grep` で全 src/ を検索しても呼び出し箇所が見つからない。

死コード自体は別 issue で扱う案件で、本 issue のリーク経路解析の根拠にはならない。

### 3. closed/0001 で確立した責務分離を巻き戻すコスト

[[closed/0001-fix-audio-context-leak]] は意図的に `setFakeContentsAudio` (積む) と `closeFakeContentsAudio` (close + null 化) を別関数に分離し、呼び出し元が close 責任を持つ設計にした。本 issue の「setter に自動 close を追加」は、この責務分離を曖昧にする方向の設計変更。defense-in-depth として価値はあるが、上記 1 / 2 で実観測可能な経路が存在しないため、コストに見合うリターンが得られない。

### 4. 結論

実装せずに close する。`mediaType` 切替時の AudioContext leak が将来発見された場合は、本 issue を reopen するのではなく、その具体的経路に応じた個別 issue で対応する（呼び出し元側で `closeFakeContentsAudio` を明示的に呼ぶ修正など）。

## 関連

- [[closed/0001-fix-audio-context-leak]]: AudioContext leak の根本対応。本 issue が想定したリーク経路は本 issue の対象範囲外で、`closeFakeContentsAudio` / `cleanupSoraMediaState` / `disposeMedia` 経由で既に守られている。
- [[0045-bug-fix-update-media-stream-after-disconnect]]: `updateMediaStream` の `await` 中の切断時に新規生成リソースを **ローカル変数として** 解放する設計。本 issue が想定した「signal を経由するリーク」とは別経路で、本 issue の close は影響しない。
- [[0046-bug-fix-reconnect-failure-media-leak]]: `reconnectSora` 失敗パスでの同種ローカル変数解放。同上。
