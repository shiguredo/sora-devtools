# getUserMedia のエラーポップアップに OverconstrainedError の詳細を表示する

- Created: 2026-09-18
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-gum-error-message-details
- Polished: {YYYY-MM-DD}
- Reporter: @miosakuma

## 目的

`getUserMedia` が `OverconstrainedError` で失敗したとき、エラーポップアップに失敗理由が何も表示されず、原因を特定できない問題を修正する。

同じ Chrome 内の別タブや別アプリがカメラを掴んでいる状態では `deviceId` や解像度の `exact` 指定を満たせず `getUserMedia` が失敗する。このとき Chrome が返す `OverconstrainedError` は `message` が空文字列で、失敗した constraint 名は `constraint` プロパティにのみ入っている。devtools は `message` しか表示に使っていないため、ポップアップが実質空になり、どの constraint で落ちたのかが分からない。

## 現状

### 同じ Chrome 内でカメラが使用中の場合の流れ

- `createVideoConstraints` (`src/utils.ts`) は `videoInput` を `{ exact: deviceId }`、解像度を `{ exact: width }` / `{ exact: height }` で要求する
- `createUserMediaStream` (`src/app/actions.ts`) の `navigator.mediaDevices.getUserMedia(mediaStreamConstraints)` が constraint を満たせず reject する
- カメラ使用中で `video: true` (constraint 指定なし) の場合は `NotReadableError` ("Could not start video source") になるが、`exact` 指定があると `OverconstrainedError` になる

### Chrome が投げる OverconstrainedError の実体

Chrome で実際に発生させて確認した値は以下のとおり。

| プロパティ                          | 実際の値                                                     |
| ----------------------------------- | ------------------------------------------------------------ |
| `name`                              | `"OverconstrainedError"`                                     |
| `message`                           | `""` (空文字列)                                              |
| `constraint`                        | `"deviceId"` / `"width"` など (満たせなかった constraint 名) |
| `constraintValue`                   | `undefined` (Chrome は設定しない)                            |
| `JSON.stringify(error)`             | `"{}"`                                                       |
| `Object.getOwnPropertyNames(error)` | `[]` (`name` と `constraint` はプロトタイプ上のゲッター)     |

同じ `OverconstrainedError` でも `MediaStreamTrack.applyConstraints` は `message` に `"Cannot satisfy constraints"` を設定する。`getUserMedia` だけが `message` を空のまま投げる。Chrome 115 でも `getUserMedia` の `message` は空であることを確認済みで、Chrome の更新によって空になったわけではない。

### Safari が投げる OverconstrainedError の実体

WebKit 26.6 で同じ条件を実行して確認した値は以下のとおり。Chrome と異なり `message` が入る。

| プロパティ              | 実際の値                                                |
| ----------------------- | ------------------------------------------------------- |
| `name`                  | `"OverconstrainedError"`                                |
| `message`               | `"Invalid constraint"`                                  |
| `constraint`            | `"width"` / `"deviceId"` (満たせなかった constraint 名) |
| `constraintValue`       | `undefined` (WebKit も設定しない)                       |
| `JSON.stringify(error)` | `"{}"`                                                  |

同じ `OverconstrainedError` でもブラウザによって `message` の有無が異なるため、表示用の文字列生成は「`message` があればそれを主たる情報にし、無ければ `name` と `constraint` で補う」形にする必要がある。

### 詳細が失われている箇所

- `getErrorMessage` (`src/utils.ts`) は `error instanceof Error ? error.message : String(error)` を返す。`DOMException` は `Error` の派生なので `message` の空文字列が返り、`name` と `constraint` は捨てられる
- `connectSora` (`src/app/actions.ts`) の `createMediaStream` 呼び出しは `.catch` で `getErrorMessage` の結果をアラートにしてから reject する。外側の try / catch が `failed to connect Sora: ${error.message}` を再度アラートにする
- 結果として、ポップアップには「Sora error」と「failed to connect Sora: 」だけが表示される
- `setSoraErrorAlertMessage` → `setAlertMessagesAndLogMessages` (`src/app/signals.ts`) は `alertMessage.message` をそのままログ (`ALERT MESSAGE ...`) にするため、Debug ペインのログにも詳細が残らない

同じ経路は `updateMediaStream` / `setMicDeviceAction` / `setCameraDeviceAction` (`src/app/actions.ts`) にもあり、こちらは `getErrorMessage` の結果を本文そのままに使うため、ポップアップの本文が完全に空になる。

## 設計方針

- 表示用の文字列生成の責務を `getErrorMessage` に集約し、`message` に情報が無い場合でも `name` と `constraint` が残るようにする
- `message` がある場合は従来どおり `message` を主たる情報として表示し、`name` と `constraint` を補助情報として付ける
  - Chrome は `message` が空なので `name` と `constraint` が本文の情報源になる
  - Safari は `message` (`Invalid constraint`) があるため、それを残しつつ `constraint` を補う
- `getErrorMessage` の変更だけで完結させ、`AlertMessage` (`src/types.ts`) の型・ポップアップの描画 (`src/components/AlertMessages.tsx`)・Debug ペインのログ形式は変更しない
  - `setAlertMessagesAndLogMessages` (`src/app/signals.ts`) は `alertMessage.message` をそのまま表示とログに使うため、`getErrorMessage` の出力を変えれば両方に反映される
- エラーメッセージの表記は「英語・末尾ピリオドなし・`name=...` `message=...` のように期待値と実際の値を示す」という既存規約に合わせる (`issues/pending/0043-bug-fix-video-effect-audio-output-dep.md` の `setSinkId` 失敗通知と同じ形式)
- 失敗理由の表示形式は `getErrorMessage` に閉じるため、呼び出し側のアラート文言 (`failed to connect Sora` などの prefix) は変更しない
- 実機の `getUserMedia` を自動テストで再現する方法は無いため、検証は `getErrorMessage` の単体テストで行う
  - jsdom の `DOMException` は `name` のみ再現し `constraint` は `undefined` になることを確認済み。テストは「`name` と `constraint` を持つオブジェクト」を実際に構築して検証する
  - 既存の E2E は Chromium でも実際のカメラを使用しないため、専用の E2E は追加しない

## 完了条件

- Chrome でカメラが使用中の場合に、ポップアップに `OverconstrainedError` と満たせなかった constraint 名 (`deviceId` / `width` など) が表示される
- Safari では従来どおり `Invalid constraint` が表示され、あわせて constraint 名が表示される
- `message` に情報があるエラーは、従来どおり `message` の内容が表示される
- Debug ペインのログ (`ALERT MESSAGE ...`) にも同じ情報が残る
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

- `src/utils.ts` の `getErrorMessage` を拡張する
  - `Error` の場合は `message` を主たる情報とし、`name` が `Error` 以外なら `name=...` を付ける
  - `message` が空の場合は `name` のみを返す
  - `DOMException` の `constraint` (`OverconstrainedError` の場合のみ設定される) が `undefined` でなければ `constraint=...` を付ける
  - Chrome の例: `OverconstrainedError: name=OverconstrainedError constraint=deviceId`
  - Safari の例: `OverconstrainedError: Invalid constraint, name=OverconstrainedError constraint=width`
- 既存の呼び出し側 (`src/app/actions.ts` の `connectSora` / `updateMediaStream` / `setMicDeviceAction` / `setCameraDeviceAction` など) は `getErrorMessage` を通しているため変更しない
- `src/utils.test.ts` に `getErrorMessage` のテストを追加する
  - 通常の `Error` では `message` のみを返すこと
  - `message` が空で `name` があるエラーでは `name` を返すこと
  - `name=OverconstrainedError` と `constraint` を持つオブジェクトでは `constraint` 名を含む文字列を返すこと
  - `message="Invalid constraint"` と `constraint="width"` を持つ Safari 相当のオブジェクトでは、`message` と `constraint` の両方を含む文字列を返すこと
- `CHANGES.md` の `## develop` の `[FIX]` セクションにエントリを追加する (issue 番号は書かない)

## 関連

- 本 issue の対象外: 同じ失敗で `connectSora` が 2 件のアラート (内側の `.catch` と外側の try / catch) を積む重複は、既知の挙動として現状維持とする
