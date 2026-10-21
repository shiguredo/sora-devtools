# getUserMedia のエラーポップアップに OverconstrainedError の詳細を表示する

- Created: 2026-09-18
- Completed: 2026-10-15
- Branch: feature/fix-gum-error-message-details
- Polished: 2026-09-29
- Reporter: @miosakuma

## 目的

`getUserMedia` が `OverconstrainedError` で失敗したとき、エラーポップアップに失敗理由が何も表示されず、原因を特定できない問題を修正する。

同じ Chrome 内の別タブや別アプリがカメラを掴んでいる状態では `deviceId` や解像度の `exact` 指定を満たせず `getUserMedia` が失敗する。このとき Chrome が返す `OverconstrainedError` は `message` が空文字列で、devtools は `message` しか表示に使っていないため、ポップアップが実質空になる。`name` を表示し、少なくともどの種類の失敗かが分かる状態にする。

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

Playwright の WebKit 26.6 で同じ条件を実行して確認した値は以下のとおり。Chrome と異なり `message` が入る。

| プロパティ              | 実際の値                                                |
| ----------------------- | ------------------------------------------------------- |
| `name`                  | `"OverconstrainedError"`                                |
| `message`               | `"Invalid constraint"`                                  |
| `constraint`            | `"width"` / `"deviceId"` (満たせなかった constraint 名) |
| `constraintValue`       | `undefined` (WebKit も設定しない)                       |
| `JSON.stringify(error)` | `"{}"`                                                  |

`constraint` の値は条件に依存する。Playwright WebKit 26.6 では `deviceId` / `frameRate` を満たせない条件では constraint 名が入るが、解像度の `exact` 指定を満たせない条件では空文字列 `""` になった。実機の Safari でも `constraint` が空文字列になる出力を確認している。

`constraint` は `OverconstrainedError` だけが持つ拡張属性で、どの constraint を満たせなかったかを UA が特定できない場合は空文字列になる。ブラウザごとに有無や内容が異なるうえ、空文字列をそのまま表示すると値の無い `constraint=` が混入するため、表示には使わない。

### 詳細が失われている箇所

- `getErrorMessage` (`src/utils.ts`) は `error instanceof Error ? error.message : String(error)` を返す。`DOMException` は `Error` の派生なので `message` の空文字列が返り、`name` は捨てられる
- `connectSora` (`src/app/actions.ts`) の `createMediaStream` 呼び出しは `.catch` で `getErrorMessage` の結果をアラートにしてから reject する。外側の try / catch が `failed to connect Sora: ${error.message}` を再度アラートにする
- 結果として、ポップアップには「Sora error」と「failed to connect Sora: 」だけが表示される
- `setSoraErrorAlertMessage` → `setAlertMessagesAndLogMessages` (`src/app/signals.ts`) は `alertMessage.message` をそのままログ (`ALERT MESSAGE ...`) にするため、Debug ペインのログにも詳細が残らない

同じ経路は `updateMediaStream` / `setMicDeviceAction` / `setCameraDeviceAction` (`src/app/actions.ts`) にもあり、こちらは `getErrorMessage` の結果を本文そのままに使うため、ポップアップの本文が完全に空になる。

`reconnectSoraImpl` の `createMediaStream` 失敗時と `requestMedia` (`src/app/actions.ts`) は `error.message` を直接使うため、`getErrorMessage` を拡張するだけではこの 2 経路も空のままになる (`requestMedia` は `failed to get user devices: ` の後に空文字列が続き、`REQUEST_MEDIA` ログにも詳細が残らない)

### 2025.2.0 から詳細が表示されなくなった経緯

2025.2.0 では `setSoraErrorAlertMessage(error.toString())` を使う経路が 6 箇所あり、`OverconstrainedError` では `toString()` がエラー名 (`OverconstrainedError`) を返すため、ポップアップにエラー名が表示されていた (Chrome 実機でも `String(error)` は `"OverconstrainedError"`、`message` は空文字列であることを確認済み)。

`b75072f4` (`#661`) で lint / 型エラーを解消する際にこれらが `error.message` を使う形へ置き換えられ、現在は `error.toString()` の呼び出しが 1 つも残っていない。この置き換えでエラー名が表示されなくなった。

2025.2.0 のリリースコミットをビルドして、`frameRate` の `exact` 指定で `getUserMedia` を失敗させたときの実機の表示は以下のとおり。

| 操作          | 2025.2.0                                            | develop                                 |
| ------------- | --------------------------------------------------- | --------------------------------------- |
| Connect       | `Failed to connect Sora. ` / `OverconstrainedError` | `failed to connect Sora: ` / (本文が空) |
| Request media | `Failed to get user devices. `                      | `failed to get user devices: `          |

Connect の外側 catch (`failed to connect Sora`) と `requestMedia` は 2025.2.0 でも `error.message` を使っており、1 件目のアラートは当時から空である。カメラ / マイク切替 (`setCameraDeviceAction` / `setMicDeviceAction`)、`updateMediaStream`、再接続のアラートが `toString()` から `getErrorMessage` に変わったことで空になった。

## 設計方針

- 表示用の文字列生成の責務を `getErrorMessage` に集約し、`message` に情報が無い場合でも `name` が残るようにする
- 表示には `Error` / `DOMException` が持つ `name` と `message` だけを使い、`OverconstrainedError` の `constraint` のようなエラー種別ごとの拡張属性には依存しない
  - `constraint` は Media Capture and Streams が `OverconstrainedError` にだけ定義する属性で、どの constraint を満たせなかったか UA が特定できない場合は空文字列になる
  - Playwright WebKit 26.6 と実機 Safari で空文字列になることを確認済みで、空文字列を表示すると値の無い `constraint=` が混入する
- 出力形式は、`name` が `"Error"` の場合は `message` のみ、それ以外は `message` があれば `"${name}: ${message}"`、無ければ `name` とする
  - Chrome の例: `OverconstrainedError`
  - Safari の例: `OverconstrainedError: Invalid constraint`
- `getErrorMessage` の拡張と、`error.message` を直接参照している 2 箇所 (`reconnectSoraImpl` の `createMediaStream` 失敗時、`requestMedia`) の `getErrorMessage` への置き換えだけで完結させ、`AlertMessage` (`src/types.ts`) の型・ポップアップの描画 (`src/components/AlertMessages.tsx`)・Debug ペインのログ形式は変更しない
  - `setAlertMessagesAndLogMessages` (`src/app/signals.ts`) は `alertMessage.message` をそのまま表示とログに使うため、`getErrorMessage` の出力を変えれば両方に反映される
- 失敗理由の表示形式は `getErrorMessage` に閉じるため、呼び出し側のアラート文言 (`failed to connect Sora` などの prefix) は変更しない
- 実機のカメラ使用中や機材の抜去は自動テストで再現できないため、検証は `getErrorMessage` の単体テストと Playwright での手動確認で行う
  - jsdom の `DOMException` はテストのレルムとは別のレルムの `Error` を継承するため `instanceof Error` が偽になる。単体テストでは実 `Error` に `name` を設定して Chrome / Safari の値を再現する
  - 専用の E2E は追加しない。`request media` の失敗経路は Chrome 内蔵の fake device で再現できるが、本 issue の変更範囲は `getErrorMessage` の出力に閉じており、単体テストと手動確認で足りるため

## 完了条件

- Chrome でカメラが使用中のときなど `message` が空文字列の `OverconstrainedError` でも、ポップアップに `OverconstrainedError` が表示される
- 再接続時 (`reconnectSoraImpl` の `createMediaStream` 失敗) と `request media` プレビュー時の失敗でも、同様に `OverconstrainedError` が表示される
- Safari では `OverconstrainedError: Invalid constraint` が表示される
- `message` に情報があるエラーは、従来どおり `message` の内容が表示される
- Debug ペインのログ (`ALERT MESSAGE ...`) にも同じ情報が残る
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

- `src/utils.ts` の `getErrorMessage` を拡張し、`Error` の出力形式を次のとおりにする
  - `name` が `"Error"` (通常の `Error`) の場合は従来どおり `message` のみを返す (`message` が空なら空文字列)
  - それ以外は `message` があれば `"${name}: ${message}"`、`message` が空文字列なら `name` を返す
  - Chrome の例: `OverconstrainedError`
  - Safari の例: `OverconstrainedError: Invalid constraint`
  - `constraint` は表示に使わない (`OverconstrainedError` 固有の拡張属性のため)
- `src/app/actions.ts` の `reconnectSoraImpl` の `createMediaStream` 失敗時 (`error.message` をそのままアラートにしている箇所) と `requestMedia` (`failed to get user devices: ${error.message}` のアラートと `REQUEST_MEDIA` ログ) は `getErrorMessage(error)` に置き換える
- その他の呼び出し側 (`connectSora` の内側 `.catch` / `updateMediaStream` / `setMicDeviceAction` / `setCameraDeviceAction`) は既に `getErrorMessage` を通しているため変更しない。アラート文言の prefix も変更しない
- `src/utils.test.ts` に `getErrorMessage` のテストを追加する
  - 通常の `Error` では `message` のみを返すこと (`new Error("boom")` が `"boom"`)
  - `name` が `Error` 以外で `message` が空の `Error` では `name` を返すこと (Chrome 相当)
  - `name` が `Error` 以外で `message` がある `Error` では `name: message` を返すこと (Safari 相当)
  - 空文字列の `message` は lint の制約で直接生成できないため、生成後に `message` を書き換えて再現する
- `Error` 相当の判定は `instanceof Error` で行う。ブラウザでは `DOMException` が `Error` を継承し、実入力は必ず `Error` の派生になるため、`name` と `message` を持つかという構造判定は不要
- `CHANGES.md` の `## develop` の `[FIX]` セクションにエントリを追加する (issue 番号は書かない)

### 実装結果

- `src/utils.ts` の `getErrorMessage` を上記の出力形式に変更した
  - `Error` 相当の判定は `instanceof Error` で行う
    - ブラウザでは `DOMException` が `Error` を継承するため、これで実入力の失敗理由を取りこぼさない
    - jsdom の `DOMException` はテストのレルムの都合で `instanceof Error` が偽になるため、単体テストは実 `Error` に `name` を設定して検証する
  - `constraint` の参照は実装から削除した
    - 実機 Safari で `constraint` が空文字列になり、値の無い `constraint=` がアラートとログに表示されることを確認したため
- `src/app/actions.ts` の `reconnectSoraImpl` の `createMediaStream` 失敗時と `requestMedia` を `getErrorMessage(error)` に置き換えた
  - あわせてこの 2 箇所の `if (error instanceof Error)` ガードを外し、`Error` 以外の値でも失敗理由をアラートとログに残すようにした
- `src/utils.test.ts` の `getErrorMessage` のテストを上記 3 ケースに合わせて更新した (あわせて `null` の `String` 変換経路も維持)
  - 追加した 2 件は実 `Error` の `name` を `OverconstrainedError` に上書きし、`message` を空文字列 / `Invalid constraint` にして実ブラウザと同じ形で検証する
  - `message` のみを返す旧実装に差し替えると、この 2 件が `""` / `Invalid constraint` になって失敗することを確認済み
- `CHANGES.md` の `## develop` の `[FIX]` セクションにエントリを追加した
- 検証:
  - `vp check` / `vp test run` / `vp build` が成功した
  - Playwright の Chromium (Chrome 内蔵 fake device) と WebKit 26.6 で `request media` の失敗を実行し、アラートと Debug ペインのログに `OverconstrainedError` / `OverconstrainedError: Invalid constraint` が表示されることを確認した
  - 実機の Safari では `OverconstrainedError: Invalid constraint, name=OverconstrainedError constraint=` と表示され、`constraint` が空文字列になることを確認した。これが `constraint` を表示しない判断の根拠になった
  - 実カメラ使用中と再接続時の失敗はこの環境では再現できないため、`getUserMedia` の失敗経路としては `request media` で確認した

## 関連

- 本 issue の対象外: 同じ失敗で `connectSora` が 2 件のアラート (内側の `.catch` と外側の try / catch) を積む重複は、既知の挙動として現状維持とする
