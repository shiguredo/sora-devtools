# gUM の MediaTrackCapabilities の値を指定できるようにする

- Created: 2026-09-10
- Completed: {YYYY-MM-DD}
- Branch: feature/add-gum-track-capabilities
- Polished: {YYYY-MM-DD}
- Reporter: @voluntas

## 目的

getUserMedia の constraints として MediaTrackCapabilities の値を一通り指定できるようにする。

現状は一部の capability しか指定できず、デバイスが対応していても zoom / torch / 露出 / ホワイトバランス / フォーカス / channelCount / sampleRate / latency などを devtools から検証できない。デバイスがサポートする capability の値を UI から指定し、 getUserMedia や applyConstraints の挙動を確認できるようにする。

## 現状

- `src/utils.ts` の `createAudioConstraints` が生成する constraints は `deviceId` / `autoGainControl` / `noiseSuppression` / `echoCancellation` / `echoCancellationType` のみ
- `src/utils.ts` の `createVideoConstraints` が生成する constraints は `width` / `height` / `frameRate` / `deviceId` / `aspectRatio` / `resizeMode` / `facingMode` のみ
- `src/app/actions.ts` の `createUserMediaStream` はこれらの関数の戻り値を `MediaStreamConstraints` に組み立てて `getUserMedia` を呼ぶ
- `src/components/DevtoolsPane/index.tsx` の Media options では、上記に対応するフォームだけを表示する
- `src/types.ts` の `SoraDevtoolsState` / `QueryStringParameters` にも上記以外の capability は定義されていない
- `MediaStreamTrack.getCapabilities()` は `src/utils.ts` の `getMediaStreamTrackProperties` でタイムラインのログに出すだけで、 UI からは値の確認も指定もできない
- `applyConstraints` は `src/utils.ts` の `createFakeMediaStream` がフェイク映像トラックへ適用する箇所のみで、 gUM のトラックには使っていない
- Media options の `JSONInputField` など、複雑なオプションを JSON で指定する既存パターンがある

## 設計方針

- MediaTrackConstraints / MediaTrackCapabilities の値を一通り指定できる入力手段を追加する
- 全 capability 分の個別フォームを並べるのではなく、 audio / video の constraints を JSON で指定し、既存フォームの値とマージする方式を第一候補とする。入力には既存の `JSONInputField` を再利用する
  - boolean / 列挙 (string[]) / integer range (min / max / step) / double range (min / max / step) を JSON で表現できる
- 既存フォームの値と JSON の値が重複した場合の優先順位は実装時に決める
- URL パラメータで共有できるようにするかは実装時に決める (URL が長くなるため、複雑な constraints の扱いを含めて検討する)
- 現在のトラックの `getCapabilities()` / `getSettings()` / `getConstraints()` を UI から確認できるようにするかを実装時に決める
- 接続中のトラックへ `applyConstraints` で適用する操作を追加するかは実装時に決める。追加する場合は `updateMediaStream` の経路と整合させる
- 既存のフォームと URL パラメータの動作は維持する。 getDisplayMedia / fakeMedia / mp4Media の constraints の扱いは実装時に決める

## 完了条件

- MediaTrackCapabilities に含まれる型の値を constraints として指定して getUserMedia を実行できる
- 指定した値が `MediaStreamTrack.getSettings()` または `getConstraints()` に反映される
- デバイスが対応しない値は従来どおり無視され、 getUserMedia が失敗しない
- 既存のフォームと URL パラメータの動作が壊れない
- 新しいテストを追加する
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

- `src/types.ts` の `SoraDevtoolsState` と `QueryStringParameters` に constraints 用の JSON 文字列を追加する
- `src/app/actions.ts` の `createUserMediaStream` で JSON をパースし、 `createAudioConstraints` / `createVideoConstraints` の結果とマージする
- `src/components/DevtoolsPane/index.tsx` の Media options に JSON 入力フィールドを追加する
- capability ごとの個別フォームを追加するか JSON に寄せるかは実装時に決める
- テストを追加する

## 関連

- [Media Capture and Streams - W3C](https://www.w3.org/TR/mediacapture-streams/)
- [MediaTrackCapabilities - W3C](https://www.w3.org/TR/mediacapture-streams/#dom-mediatrackcapabilities)
- [MediaStreamTrack: getCapabilities() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getCapabilities)
