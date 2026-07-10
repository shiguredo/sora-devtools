# 0038 Sora サーバーに依存しない UI テストを追加する

- Priority: Medium
- Created: 2026-06-08
- Completed: {YYYY-MM-DD}
- Model: DeepSeek V4 Pro
- Branch: feature/add-sora-independent-ui-tests
- Polished: 2026-06-15

## 目的

Sora サーバーに依存せず Playwright だけで完結するブラウザ UI テストを追加し、URL パラメータ → フォーム値の反映、ロール切り替えによる UI の表示/非表示、Collapse セクションの開閉と太字状態、Copy URL ボタン、Media type ラジオ切り替えのリグレッションを防止する。

## 優先度根拠

現在 `tests/` にあるテストは Sora 接続が必要な e2e ( `sendrecv` / `sendonly` / `recvonly` ) と Sora 不要の lazy-load ( `noise-suppression-lazy-load` / `mp4-media-stream-lazy-load` ) のみで、UI レイヤーのリグレッションを検出する仕組みがない。本 issue で追加するテストは Sora サーバー無しで実行できるため CI / 開発者ローカルどちらでも常に実行され、UI 変更のリグレッション検出に有効。 #0037 が High なのに対して本 issue が Medium なのは、 #0037 が後続テスト全体の前提となる基盤整備でブロッカーであるのに対し、本 issue は UI のリグレッション検出という独立した価値を持つが他 issue のブロッカーではないため。

## 現状

- `tests/` 配下のテストは Sora 接続 e2e 3 件 ( `sendrecv` / `sendonly` / `recvonly` ) と lazy-load 2 件 ( `noise-suppression-lazy-load` / `mp4-media-stream-lazy-load` ) のみで、UI レイヤー (フォーム反映・表示制御・ボタン挙動) を Playwright で検証する仕組みがない
- URL パラメータがフォームに反映されるかは `src/utils.test.ts` / `src/app/app.test.ts` の Vitest 単体テストで `parseQueryString` の signal 値だけを検証している段階
- 関連コンポーネントの実配置 (issue 本文の引用元):
  - `src/components/Header/CopyUrlButton.tsx`
  - `src/components/ui/Collapse.tsx`
  - `src/components/DevtoolsPane/CollapseLink.tsx`
  - `src/components/DevtoolsPane/MediaTypeForm.tsx`
  - `src/components/DevtoolsPane/SelectForm.tsx`
  - `src/components/DevtoolsPane/AudioForm.tsx` / `VideoForm.tsx`
  - `src/components/DevtoolsPane/AudioBitRateForm.tsx` / `VideoBitRateForm.tsx` (これらは `<select>` ではなく `<FormInput type="text"> + <Dropdown>` 構成)
  - `src/components/DevtoolsPane/index.tsx` (620 行)

## 設計方針

### スコープ

本 issue は以下のみを対象とする。

- `tests/pages/DevtoolsPage.ts` への UI テスト用メソッドの追加 ( #0037 で導入される Page Object を拡張する)
- `tests/ui-url-params.test.ts` / `tests/ui-role-visibility.test.ts` / `tests/ui-collapse.test.ts` / `tests/ui-copy-url.test.ts` / `tests/ui-media-type.test.ts` の新規作成
- `src/components/Header/CopyUrlButton.tsx` の `<button>` に `data-testid="copy-url-button"` を追加 (Header 配下に複数の `<button>` (NavbarToggle / SignalingUrl ボタン / DebugButton / DownloadReportButton 等) が存在し一意特定が必要なため)
- `src/components/ui/Collapse.tsx` への `dataTestId?: string` props と `data-open` 属性の追加 (`<div data-testid={dataTestId} data-open={String(isOpen)}>` として透過する。`data-open` を追加することで Tailwind class (`opacity-100` / `opacity-0`) への直接依存をやめ、属性ベースで開閉判定する)
- `src/components/DevtoolsPane/CollapseLink.tsx` への `data-enabled` 属性の追加 (`<button data-enabled={String(enabled)}>` として透過する。`font-bold` クラス文字列への直接依存をやめ、属性ベースで太字判定する)
- `src/components/DevtoolsPane/index.tsx` の 3 箇所の `<Collapse>` 呼び出しに `dataTestId` を追加 ( `collapse-signaling-options` / `collapse-advanced-signaling-options` / `collapse-media-options` )

上記の `src/` 配下の変更とテストファイル新規追加はすべて同一ブランチ・同一コミットでまとめる ( `shiguredo-git` 規約参照)。 production コードへの変更はテスト容易化のための属性付与のみで、振る舞いを変更しない。

以下はスコープ外とする。

- Sora サーバー接続を伴うテスト ( #0039 で扱う)
- 既存 Sora 接続テスト 3 件 ( `sendrecv` / `sendonly` / `recvonly` ) の変更
- `tests/noise-suppression-lazy-load.test.ts` / `tests/mp4-media-stream-lazy-load.test.ts` の変更
- `playwright.config.ts` の変更
- `src/components/` 配下の本 issue で挙げた `data-testid` / `data-open` / `data-enabled` 関連以外の変更
- 環境変数 ( `E2E_TEST_SORA_SIGNALING_URL` 等) への依存 ( #0037 で導入される `getSoraConnectionEnv()` / #0063 で導入される `requireSoraConnectionEnv()` helper も使用しない)

### 禁止ルール

- `tests/` 配下から `@/` パスエイリアスや相対パスでの `src/` 参照を行わない ( #0037 と同じ規約)
- テスト名は #0037 と同じく単一 ASCII 文字列を採用する ( `"ui-url-params: role"` のような半角コロン区切り)。`pnpm exec playwright test --grep ui-url-params` でファイル別実行できるようにする
- 各テストファイルでは `import { test, expect } from "@playwright/test"` を実値 import する ( `tsconfig.json` の `types: ["vitest/globals"]` での衝突回避は #0037 と同じ)

### `tests/pages/DevtoolsPage.ts` への追加 API 仕様

本 issue で `Locator` 型を新規に使用するため、ファイル先頭の import 文を以下に拡張する。

```typescript
import type { Locator, Page } from "@playwright/test";
```

追加する型・メソッドは以下のとおり。

```typescript
// e2e テストで指定可能な音声コーデック
// `src/constants.ts` の `AUDIO_CODEC_TYPES` から空文字を除いた値を採用する ( #0037 の `VideoCodecType` と同じ方針)
// 空文字 (= 未指定扱い) を URL に乗せたい場合は `audioCodecType: undefined` を使う
export type AudioCodecType = "OPUS";

// Sora 接続を伴わない UI テスト用の URL パラメータ
// `signalingUrlCandidates` / `metadata` / `accessToken` は含めない (Sora 接続を要求しないため)
// `parseQueryString` が受け付けないキー ( `multistream` 等) は意図的に含めない
// boolean 系パラメータは URL 上の表現に合わせて `"true"` / `"false"` 文字列リテラル型を採用する (Page Object 内で URL を組み立てる時点での型)
export type UiNavigateParams = {
  role?: Role;
  videoCodecType?: VideoCodecType;
  audioCodecType?: AudioCodecType;
  simulcast?: "true" | "false";
  spotlight?: "true" | "false";
  audio?: "true" | "false";
  video?: "true" | "false";
  mediaType?: "getUserMedia" | "getDisplayMedia" | "fakeMedia" | "mp4Media";
  forceStereoOutput?: "true" | "false";
  bundleId?: string;
  reconnect?: "true" | "false";
};

// Collapse セクション名 ( `CollapseLink` button のテキストおよび `dataTestId` の suffix と対応)
export type CollapseSection = "Signaling options" | "Advanced signaling options" | "Media options";

// Media type ラジオの値 ( `MediaTypeForm.tsx` の `FormRadio.label` と一致)
export type MediaTypeValue = "getUserMedia" | "getDisplayMedia" | "fakeMedia" | "mp4Media";

export class DevtoolsPage {
  // 既存 (#0037): navigate / connect / disconnect / waitForConnection / getConnectionId

  // Sora 接続を伴わない navigate (URL パラメータのみ組み立てる)
  // `params` が undefined または空オブジェクトの場合はクエリ無しの URL に遷移する
  async navigateForUi(params?: UiNavigateParams): Promise<void>;

  // Collapse セクションを名前指定で開閉する
  // 内部で `page.getByRole("button", { name, exact: true }).click()` を呼ぶ
  // `exact: true` 必須 ( `"Signaling options"` と `"Advanced signaling options"` の部分一致衝突を避ける)
  // クリック後のアニメーション完了 (`Collapse.tsx` の `transition-all duration-300`) は呼び出し側の `expect.poll` または `expect(locator).toHaveAttribute` の自動 retry に任せる
  async toggleCollapse(section: CollapseSection): Promise<void>;

  // Collapse セクションが開いているか (`<div data-open="true|false">`) を即値で返す
  // section 名から dataTestId を組み立て (例: `"Signaling options"` → `"collapse-signaling-options"`)
  // 内部で `page.getByTestId(testId).getAttribute("data-open")` を読み `"true"` と等しいかを返す
  // 遷移中の中間状態を避けるため、テスト側は `await expect.poll(() => devtools.isCollapseOpen(section), { timeout: 1000 }).toBe(true)` のように polling して使う
  async isCollapseOpen(section: CollapseSection): Promise<boolean>;

  // Collapse セクションのリンクが太字 (`enabledOptions` が true) かを即値で返す
  // 内部で `page.getByRole("button", { name, exact: true }).getAttribute("data-enabled")` を読み `"true"` と等しいかを返す
  // テスト側は `expect.poll` または `expect(locator).toHaveAttribute("data-enabled", "true")` の auto-retry で使う
  async isCollapseEnabled(section: CollapseSection): Promise<boolean>;

  // Copy URL ボタンをクリックする (内部で `page.getByTestId("copy-url-button").click()` を呼ぶ)
  async clickCopyUrl(): Promise<void>;

  // Copy URL ボタンの現在のテキストを即値で取得する ( `"Copy URL"` / `"Copied"` のいずれか)
  // 内部で `page.getByTestId("copy-url-button").innerText()` を呼ぶ
  async getCopyUrlButtonText(): Promise<string>;

  // Copy URL ボタンの Locator を取得する (テスト側で `await expect(locator).toHaveText(...)` の自動 retry に使う)
  copyUrlButtonLocator(): Locator;

  // clipboard 内容を即値で取得する
  // 事前に `test.beforeEach` で `context.grantPermissions(["clipboard-read", "clipboard-write"])` が必要
  // 内部で `page.evaluate(() => navigator.clipboard.readText())` を呼ぶ。grant 失敗で reject した場合は例外を呼び出し側に伝播する
  async readClipboardText(): Promise<string>;

  // mediaType ラジオを切り替える
  // 内部で `page.locator(`#${value}`).check()` を呼ぶ ( `MediaTypeForm.tsx` の `FormRadio id={label}` から `<input id="getUserMedia">` 等が出力される実装に依存)
  // `mp4Media` は `mountClient && isMp4MediaStreamSupported()` で動的に表示制御される (詳細はテスト 5 を参照)
  async selectMediaType(value: MediaTypeValue): Promise<void>;

  // mediaType ラジオが表示されているかを即値で返す
  // 内部で `page.locator(`#${value}`).isVisible()` を呼ぶ
  // 主に `mp4Media` ラジオの表示制御判定に使う
  async isMediaTypeRadioVisible(value: MediaTypeValue): Promise<boolean>;
}
```

設計上の注意:

- `audio` / `video` の `<input>` には `id="audio"` / `id="video"` が出力される (`AudioForm.tsx` の `<TooltipFormCheck kind="audio">` 内の `<FormSwitch id={kind}>` (`TooltipFormCheck.tsx` L24/L34) → `id="audio"` / `VideoForm.tsx` も同様)。`FormGroup` の `controlId` props は `data-control-id` 属性として出力されるだけで `<input>` の `id` には伝播しないため、テストでは `controlId` ではなく `kind` 由来の `id` セレクタを使う。
- `<input id="getUserMedia">` 等の DOM `id` は `MediaTypeForm.tsx` の実装で固定されており、本 issue のセレクタ戦略はこれに依存する。将来 `MediaTypeForm` 内で `id` 命名規則を変更する場合は本テストの `selectMediaType` セレクタも同時更新する必要がある (本 issue では追加の `data-testid` を入れない判断)。
- `Collapse.tsx` の props 型は以下に拡張する (`dataTestId` を追加し、`<div data-testid={dataTestId} data-open={String(isOpen)} ...>` として透過する):
  ```typescript
  interface CollapseProps {
    in: boolean;
    className?: string;
    dataTestId?: string;
    children: ComponentChildren;
  }
  ```
- `CollapseLink.tsx` には `data-enabled={String(enabled)}` 属性を出力する (Tailwind の `font-bold` クラスを残しつつ属性で判定可能にする)。クラス自体は維持して見た目の太字を保つ。
- `setInitialParameter` (`src/app/actions.ts`) は URL パラメータを signal に反映する非同期処理を含むため、`navigateForUi` 直後の DOM 検証は Playwright の `expect(locator).toBeVisible()` などの auto-retry に任せる。Page Object 側で明示的な完了待ちは追加しない。
- 各メソッドに日本語コメントを付ける。エラーメッセージは英語・末尾ピリオドなし・期待値と実値を含める。

### 追加するテスト

1. `tests/ui-url-params.test.ts` (URL パラメータ → フォーム値の反映): **7 test**
   - 各 `test()` で `navigateForUi` 後に対応するセレクタの値を `await expect(locator).toHaveValue(...)` や `await expect(locator).toBeChecked()` で検証する (Locator ベース auto-retry を使う)
   - テスト名は単一 ASCII (例: `"ui-url-params: role=sendonly"` / `"ui-url-params: videoCodecType=AV1"` 等)
   - 検証ケース:
     - `role=sendonly` → `select[name="role"]` の値が `sendonly`
     - `videoCodecType=AV1` → `select[name="videoCodecType"]` の値が `AV1` ( `SelectForm.tsx` L36 の `<FormSelect name={kind}>` から `name="videoCodecType"` の `<select>` が出力される)
     - `simulcast=true` → `select[name="simulcast"]` の値が `true`
     - `spotlight=true` → `select[name="spotlight"]` の値が `true`
     - `audio=false` → `<input id="audio">` の `checked` が false
     - `video=false` → `<input id="video">` の `checked` が false
     - `mediaType=fakeMedia` → `<input id="fakeMedia">` の `checked` が true ( `fakeMedia` ラジオは `mountClient` に依存せず常時描画されるため安定したケースとして選択)
   - `parseSpecifiedStringParameter` が空文字を valid として扱うキー ( `audioCodecType=""` 等) は本 issue では検証しない (空文字は signal 初期値と同じため、URL パラメータが実際にセットされたか expect で判定できないため)
2. `tests/ui-role-visibility.test.ts` (ロール切り替えによる UI 表示/非表示): **10 test**
   - 各 UI 要素の表示条件を実装 (`src/components/DevtoolsPane/index.tsx`) に揃え、role を URL パラメータで指定して該当要素の有無を `await expect(locator).toBeVisible()` / `await expect(locator).toBeHidden()` で検証する (Locator auto-retry で `setInitialParameter` の非同期反映を待つ)
   - テスト名は単一 ASCII (例: `"ui-role-visibility: recvonly で codec forms が非表示"`)
   - 検証マトリクス (各行 1 test。最後の `RowSimulcastOptions` のみ 2 test に分割):

     | テスト対象 UI 要素                                                         | 表示条件 ( `index.tsx` 行数)                                 |
     | -------------------------------------------------------------------------- | ------------------------------------------------------------ |
     | `audioCodecType` / `videoCodecType` の `<select>` ( `SelectForm` 由来)     | `role !== "recvonly"` ( `showCodecForms` L171)               |
     | `<RowMediaType />` および `<RowMediaOptions />` ブロック                   | `role !== "recvonly"` (L601)                                 |
     | `RequestMediaButton` / `DisposeMediaButton`                                | `role !== "recvonly"` (L547)                                 |
     | `MicDeviceForm` / `CameraDeviceForm` / `AudioTrackForm` / `VideoTrackForm` | `role !== "recvonly"` (L569)                                 |
     | `AudioOutputForm`                                                          | `role !== "sendonly"` (L541)                                 |
     | `ForceStereoOutputForm`                                                    | `role !== "sendonly"` ( `showReceiverParams` L331 / L371)    |
     | `RemoteVideos`                                                             | `role === "recvonly" \|\| role === "sendrecv"` (L617)        |
     | `AudioInputForm` / `VideoInputForm`                                        | `role !== "recvonly" && mediaType === "getUserMedia"` (L529) |
     | `RowSimulcastOptions` (sendonly で非表示)                                  | `simulcast === "true" && role !== "sendonly"` (L222)         |
     | `RowSimulcastOptions` (sendrecv で表示)                                    | `simulcast === "true" && role !== "sendonly"` (L222)         |

   - `AudioBitRateForm` / `VideoBitRateForm` は `<select>` ではなく `<FormInput type="text"> + <Dropdown>` 構成 (`AudioBitRateForm.tsx` L26-50 確認済み) のため、本マトリクスでは `<select name="audioCodecType">` / `<select name="videoCodecType">` のみを対象とする
   - `AudioForm` / `VideoForm` 自体は role に関係なく常時表示される ( `RowGetUserMediaConstraints` 関数は `index.tsx` L597 で常時描画され、その内部の `<AudioForm />` (L176) / `<VideoForm />` (L197) は `showCodecForms` 判定の外側に配置されているため) ため非表示テストの対象外
   - `RowSpotlightOptions` は `spotlight === "true"` 単独条件で role に依存しないため本テスト対象外

3. `tests/ui-collapse.test.ts` (Collapse セクションの開閉と enabled 状態): **7 test**
   - 本テストは role をデフォルトの `sendrecv` で実行する ( `role === "recvonly"` のときは `<RowMediaOptions />` 自体が描画されない L601 のため)
   - テスト名は単一 ASCII (例: `"ui-collapse: Signaling options 初期 closed"`)
   - 3 セクション (Signaling options / Advanced signaling options / Media options) × 2 (初期折りたたみ + クリック開閉トグル) = **6 test**
     - 初期状態は折りたたまれている (各 `Row*Options` 内の `useSignal(true)` で `collapsed` が true 初期化 → `data-open="false"`)
     - リンクをクリックして展開され ( `data-open="true"` )、再クリックで折りたたまれる ( `data-open="false"` )
   - **1 test**: URL パラメータでオプションを有効化した状態で `isCollapseEnabled("Signaling options")` が true になることを検証する。例: `bundleId=foo` を渡すと Signaling options の太字フラグが true になる (内部実装としては `activateEnabledFlags()` が `signals.bundleId.value !== ""` を判定して `setEnabledBundleId(true)` を呼ぶ流れだが、本テストでは外部観測可能な `data-enabled="true"` 属性のみを検証する)
   - `enabledOptions` は CollapseLink の太字フラグのみを制御し、折りたたみ状態 (`collapsed`) には影響しない (`CollapseLink.tsx` L13-14 確認済み)
4. `tests/ui-copy-url.test.ts` (Copy URL ボタン): **5 test**
   - 本テストファイルのみ `test.beforeEach` で `{ context }` fixture を受け取り `await context.grantPermissions(["clipboard-read", "clipboard-write"])` を `navigateForUi` の前に呼ぶ (Playwright の fixture lifecycle により同じ `test()` 内の `{ page }` に grant が適用される)
   - `DevtoolsPage` インスタンスは `test()` 内で `const devtools = new DevtoolsPage(page)` で生成する ( `test.beforeEach` 内では生成しない。fixture と Page Object 生成を分離して各テストの初期化を明示する)。他 4 テストファイルも同方針
   - テスト名は単一 ASCII (例: `"ui-copy-url: 初期テキストが Copy URL"` / `"ui-copy-url: クリック後 Copied"` 等)
   - 5 test の内訳:
     - 初期状態でボタンのテキストが `"Copy URL"` ( `CopyUrlButton.tsx` L39 参照)
     - ボタンクリック後にテキストが `"Copied"` に切り替わる ( `CopyUrlButton.tsx` L31-37、チェックマーク SVG が併記)
     - 2000 ms 後にテキストが `"Copy URL"` に戻る ( `CopyUrlButton.tsx` L14 の `setTimeout`)。Playwright の anti-pattern である `waitForTimeout` の代わりに `await expect(devtools.copyUrlButtonLocator()).toHaveText("Copy URL", { timeout: 2500 })` で auto-retry に任せる
     - `readClipboardText()` でクリップボードに URL がコピーされていることを検証する
     - クリップボードの URL を `URLSearchParams` でパースし、 `navigateForUi({ role: "sendonly", mediaType: "fakeMedia" })` で開始した場合に `role=sendonly` と `mediaType=fakeMedia` の両方が含まれることを検証する ( `copyURL` の省略ルールは `actions.ts` L533-586 を参照。初期値と一致するパラメータは URL に含めない)
     - 本テストでは `navigateForUi` 直後に Copy URL ボタンを押すと `setInitialParameter` 内の `await getDevices()` 等の非同期処理が完了する前に signal が読まれて初期値の URL がクリップボードに乗る可能性があるため、`clickCopyUrl()` 前に `await expect(page.locator('select[name="role"]')).toHaveValue("sendonly")` で signal 反映の完了を明示的に待つ
5. `tests/ui-media-type.test.ts` (Media type 切り替え): **4 test**
   - 本テストは role をデフォルトの `sendrecv` で実行する ( `role === "recvonly"` のときは `<RowMediaType />` 自体が描画されないため Media type ラジオは存在しない)
   - テスト前提条件: `navigateForUi({})` 直後の `localMediaStream === null` / `isFormDisabled === false` 状態のみを対象にする ( `MediaTypeForm.tsx` の `disabled` 条件 (`localMediaStream.value !== null || isFormDisabled.value`) を回避するため)
   - テスト名は単一 ASCII (例: `"ui-media-type: getUserMedia"` / `"ui-media-type: fakeMedia"` 等)
   - 4 test の内訳: 4 種類のラジオボタン (`getUserMedia` / `getDisplayMedia` / `fakeMedia` / `mp4Media`) ごとに 1 test を立て、各 test で対象ラジオを `selectMediaType` で選択 → そのラジオの `checked` が true、他 3 ラジオの `checked` が false (排他切り替えの確認)
   - `mp4Media` ラジオは `MediaTypeForm.tsx` L54-56 の `useEffect` で `mountClient.value = true` になってから描画される。`playwright.config.ts` L18-22 の `projects: [{ name: "chromium" }]` で Chromium のみが対象であり、Chromium headless では `isMp4MediaStreamSupported()` が true を返す (既存の `tests/mp4-media-stream-lazy-load.test.ts` で `mp4Media` ラジオを `check()` できている実績で確認済み)
   - エッジケース: `isMp4MediaStreamSupported()` が将来 false を返す Chromium バージョンになった場合は `selectMediaType("mp4Media")` の test を `test.skip` で除外する想定 (現状は skip しない)

## 影響範囲

- 修正: `tests/pages/DevtoolsPage.ts` (UI テスト用メソッドの追加。 #0037 のクラスを拡張する。冒頭 import を `import type { Locator, Page } from "@playwright/test"` に拡張する)
- 修正: `src/components/Header/CopyUrlButton.tsx` ( `<button>` に `data-testid="copy-url-button"` を追加)
- 修正: `src/components/ui/Collapse.tsx` ( `CollapseProps` に `dataTestId?: string` を追加し、`<div data-testid={dataTestId} data-open={String(isOpen)} ...>` として透過する)
- 修正: `src/components/DevtoolsPane/CollapseLink.tsx` ( `<button data-enabled={String(enabled)}>` 属性を追加。`font-bold` クラスも維持して見た目を保つ)
- 修正: `src/components/DevtoolsPane/index.tsx` (3 箇所の `<Collapse>` に `dataTestId="collapse-signaling-options"` / `dataTestId="collapse-advanced-signaling-options"` / `dataTestId="collapse-media-options"` を追加)
- 新規追加: `tests/ui-url-params.test.ts` / `tests/ui-role-visibility.test.ts` / `tests/ui-collapse.test.ts` / `tests/ui-copy-url.test.ts` / `tests/ui-media-type.test.ts`
- `CHANGES.md` の `## develop` 配下の `### misc` サブセクション内で、種別順 (CHANGE → ADD → UPDATE → FIX) を守って #0037 の `[ADD] e2e テストに Page Object Model と環境変数読み込みヘルパーを導入する` の直後 (現状の `[UPDATE] vite-plus ...` の前) に `[ADD] Sora サーバーに依存しない Playwright UI テストを 5 系統追加する` を追記する ( #0037 が先行マージされる前提。`shiguredo-changelog` スキル参照)

## 完了条件

### 静的検証

- `tests/pages/DevtoolsPage.ts` の追加メソッドが上記 API 仕様に従って実装され、各メソッドに日本語コメントが付与されている
- `tests/pages/DevtoolsPage.ts` の冒頭 import が `import type { Locator, Page } from "@playwright/test"` に拡張されている
- `src/components/ui/Collapse.tsx` の `CollapseProps` に `dataTestId?: string` が追加され、`<div>` に `data-testid` と `data-open` 属性が出力される
- `src/components/DevtoolsPane/CollapseLink.tsx` の `<button>` に `data-enabled` 属性が出力される
- `src/components/Header/CopyUrlButton.tsx` の `<button>` に `data-testid="copy-url-button"` が出力される
- `src/components/DevtoolsPane/index.tsx` の 3 箇所の `<Collapse>` 呼び出しに `dataTestId` が指定されている
- 新規追加コードで non-null assertion ( `!` ) や `as` キャストを使わない
- `tests/` 配下から `src/` 配下への import を行っていない
  - `grep -rE "from ['\"](@/|(\\.\\./)+src/)" tests/pages/ tests/ui-*.test.ts` が 0 件
- `pnpm check` が通過すること
- `pnpm test` が通過すること (既存単体テストへの影響なし)

### 動的検証

- `pnpm exec playwright test tests/ui-*.test.ts` で本 issue で追加する 5 ファイルが全件通過すること (Sora 接続を要求しないため `.env.local` の有無に依存しない)
- `pnpm exec playwright test --list tests/ui-*.test.ts` で **33 件** のテストが列挙されること (内訳: ui-url-params 7 + ui-role-visibility 10 + ui-collapse 7 + ui-copy-url 5 + ui-media-type 4)
- 本 issue が触らない `tests/noise-suppression-lazy-load.test.ts` / `tests/mp4-media-stream-lazy-load.test.ts` の通過状態が追加前後で変わらないこと (回帰確認)
- `.env.local` に `E2E_TEST_SORA_SIGNALING_URL` を設定した状態で `pnpm test:e2e` を実行したとき、 #0037 の Sora 依存テスト 3 件と本 issue 追加 5 系統 + lazy-load 2 件が全件通過すること
- `.env.local` 未設定状態で `pnpm test:e2e` を実行すると Sora 依存テスト 3 件は失敗するが本 issue の `ui-*.test.ts` は green になる ( #0063 マージ前はタイムアウト失敗、#0063 マージ後は `requireSoraConnectionEnv()` の即座 fail。いずれも全体としては赤)。よって本 issue の動的検証は `tests/ui-*.test.ts` をファイル指定して実行する

## 依存

- #0037 (Page Object と env helper の導入) が先行マージされている必要がある (本 issue は `DevtoolsPage` を拡張するため)
- #0063 (未設定時の即座 fail / `requireSoraConnectionEnv`) と本 issue は並列実装可能。本 issue のテストは env 不要のため #0063 完了前でも動作する
- #0039 とは `DevtoolsPage` の別メソッドを追加するため衝突しないが、編集競合を避けるため 0038 → 0039 の順で進める
- `@playwright/test` 1.60.0 ( `package.json` 参照)
