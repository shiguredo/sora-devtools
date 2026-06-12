# 0038 Sora サーバーに依存しない UI テストを追加する

- Priority: Medium
- Created: 2026-06-08
- Completed: {YYYY-MM-DD}
- Model: DeepSeek V4 Pro
- Branch: feature/add-sora-independent-ui-tests
- Polished: 2026-06-12

## 目的

Sora サーバーに依存せず Playwright だけで完結するブラウザ UI テストを追加し、URL パラメータ → フォーム値の反映、ロール切り替えによる UI の表示/非表示、Collapse セクションの開閉、Copy URL ボタン、Media type ラジオ切り替えのリグレッションを防止する。

## 優先度根拠

現在 `tests/` にあるテストは Sora 接続が必要な e2e ( `sendrecv` / `sendonly` / `recvonly` ) と Sora 不要の lazy-load ( `noise-suppression` / `mp4-media-stream` ) のみで、UI レイヤーのリグレッションを検出する仕組みがない。本 issue で追加するテストは Sora サーバー無しで実行できるため CI / 開発者ローカルどちらでも常に実行され、UI 変更のリグレッション検出に有効。 #0037 が High なのに対して本 issue が Medium なのは、 #0037 が後続テスト全体の前提となる基盤整備でブロッカーであるのに対し、本 issue は UI のリグレッション検出という独立した価値を持つが他 issue のブロッカーではないため。

## 現状

- `tests/` 配下のテストは Sora 接続 e2e 3 件 ( `sendrecv` / `sendonly` / `recvonly` ) と lazy-load 2 件 ( `noise-suppression-lazy-load` / `mp4-media-stream-lazy-load` ) のみで、UI レイヤー (フォーム反映・表示制御・ボタン挙動) を Playwright で検証する仕組みがない
- URL パラメータがフォームに反映されるかは `src/utils.test.ts` / `src/app/app.test.ts` の Vitest 単体テストで `parseQueryString` の signal 値だけを検証している段階

## 設計方針

### スコープ

本 issue は以下のみを対象とする。

- `tests/pages/DevtoolsPage.ts` への UI テスト用メソッドの追加 ( #0037 で導入される Page Object を拡張する)
- `tests/ui-url-params.test.ts` / `tests/ui-role-visibility.test.ts` / `tests/ui-collapse.test.ts` / `tests/ui-copy-url.test.ts` / `tests/ui-media-type.test.ts` の新規作成
- `src/components/Header/CopyUrlButton.tsx` への `data-testid="copy-url-button"` 追加 ( Header 配下の他 `<button>` (NavbarToggle / SignalingUrl ボタン / DebugButton / DownloadReportButton) との一意特定のため)
- `src/components/ui/Collapse.tsx` への `data-testid` props 追加 ( `<div data-testid={dataTestId} className={...}>` として透過するだけのオプション props )
- `src/components/DevtoolsPane/index.tsx` の 3 箇所の `<Collapse>` 呼び出しに `data-testid` を追加 ( `collapse-signaling-options` / `collapse-advanced-signaling-options` / `collapse-media-options` )

上記の `src/` 配下の変更とテストファイル新規追加はすべて同一ブランチ・同一コミットでまとめる ( CLAUDE.md「1 issue 1 コミット」原則)。

以下はスコープ外とする。

- Sora サーバー接続を伴うテスト ( #0039 で扱う)
- 既存 Sora 接続テスト 3 件 ( `sendrecv` / `sendonly` / `recvonly` ) の変更
- `tests/noise-suppression-lazy-load.test.ts` / `tests/mp4-media-stream-lazy-load.test.ts` の変更
- `playwright.config.ts` の変更
- `src/components/` 配下の上記 `data-testid` 関連以外の変更 (リグレッション検出が目的で、UI 実装の振る舞い変更は別 issue で扱う)
- 環境変数 ( `E2E_TEST_SORA_SIGNALING_URL` 等) への依存 ( #0037 で導入される `getSoraConnectionEnv()` / `requireSoraConnectionEnv()` helper も使用しない)

import 方針・テスト名・コメント・エラーメッセージなどは #0037 で確立した規約をそのまま継承する ( `tests/` 配下から `@/` / `src/` への import 禁止、 `@playwright/test` から `test` / `expect` を実値 import、テスト名は日本語 + 先頭 ASCII カテゴリ識別子、各メソッドに日本語コメント、エラーメッセージは英語)。

### `tests/pages/DevtoolsPage.ts` への追加 API 仕様

```typescript
// e2e テストで指定可能な音声コーデック (src/constants.ts の AUDIO_CODEC_TYPES に合わせる)
export type AudioCodecType = "" | "OPUS";

// Sora 接続を伴わない UI テスト用の URL パラメータ
// signalingUrlCandidates / metadata / accessToken は含めない
// parseQueryString が受け付けないキー (multistream 等) は意図的に含めない
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

// Collapse セクション名 (CollapseLink button のテキストおよび data-testid の suffix と一致)
export type CollapseSection = "Signaling options" | "Advanced signaling options" | "Media options";

// Media type ラジオの値 (MediaTypeForm.tsx の FormRadio.label と一致)
export type MediaTypeValue = "getUserMedia" | "getDisplayMedia" | "fakeMedia" | "mp4Media";

export class DevtoolsPage {
  // 既存 (#0037): navigate / connect / disconnect / waitForConnection / getConnectionId

  // Sora 接続を伴わない navigate (URL パラメータのみ組み立てる)
  // params が undefined または空オブジェクトの場合はクエリ無しの URL に遷移する
  async navigateForUi(params?: UiNavigateParams): Promise<void>;

  // Collapse セクションを名前指定で開閉する
  // 内部で page.getByRole("button", { name, exact: true }).click() を呼ぶ
  // exact: true 必須 ("Signaling options" と "Advanced signaling options" の部分一致衝突を避ける)
  // クリック後のアニメーション完了は呼び出し側 ( expect 系の自動 retry ) で待つ
  async toggleCollapse(section: CollapseSection): Promise<void>;

  // Collapse セクションが開いているかを判定する
  // section 名から data-testid を組み立て (例: "Signaling options" → "collapse-signaling-options")
  // page.evaluate で Collapse div の computed style の opacity を取得し "1" と等しいかを返す
  // (Collapse.tsx は isOpen で opacity-100 ↔ opacity-0 を切り替える L18-20)
  async isCollapseOpen(section: CollapseSection): Promise<boolean>;

  // Collapse セクションのリンクが太字 (enabledOptions が true) かを判定する
  // 内部で getByRole("button", { name, exact: true }) を取得し
  // page.evaluate で element.classList.contains("font-bold") を返す
  async isCollapseEnabled(section: CollapseSection): Promise<boolean>;

  // Copy URL ボタンをクリックする (内部で page.getByTestId("copy-url-button").click() を呼ぶ)
  async clickCopyUrl(): Promise<void>;

  // Copy URL ボタンの現在のテキストを取得する ("Copy URL" / "Copied" のいずれか)
  // 内部で page.getByTestId("copy-url-button").innerText() を呼ぶ
  async getCopyUrlButtonText(): Promise<string>;

  // Copy URL ボタンの Locator を取得する (テスト側で expect(...).toHaveText() の自動 retry に使う)
  copyUrlButtonLocator(): Locator;

  // clipboard 内容を取得する
  // 事前に test.beforeEach で context.grantPermissions(["clipboard-read", "clipboard-write"]) が必要
  // 内部で page.evaluate(() => navigator.clipboard.readText()) を呼ぶ。grant 失敗で reject した場合は例外を呼び出し側に伝播する
  async readClipboardText(): Promise<string>;

  // mediaType ラジオを切り替える
  // 内部で page.locator(`#${value}`).check() を呼ぶ (check() の actionability check で
  // mp4Media の mountClient useEffect 後の遅延描画も自動で待機される)
  async selectMediaType(value: MediaTypeValue): Promise<void>;

  // mediaType ラジオが表示されているかを判定する
  // 内部で page.locator(`#${value}`).isVisible() を呼ぶ
  // mp4Media は mountClient && isMp4MediaStreamSupported() で動的に表示制御される (主にこの判定に使う)
  async isMediaTypeRadioVisible(value: MediaTypeValue): Promise<boolean>;
}
```

### 追加するテスト

1. `tests/ui-url-params.test.ts` (URL パラメータ → フォーム値の反映): 最低 7 test
   - 各 `test()` で `navigateForUi` 後に対応するセレクタの値を `expect(locator).toHaveValue(...)` や `expect(locator).toBeChecked()` で検証する
   - 代表ケース (1 ケース 1 `test()`):
     - `role=sendonly` → `select[name="role"]` の値が `sendonly`
     - `videoCodecType=AV1` → `select[name="videoCodecType"]` の値が `AV1` (`SelectForm.tsx:36` の `<FormSelect name={kind}>` から `FormSelect.tsx` で DOM の `name` 属性に透過する)
     - `simulcast=true` → `select[name="simulcast"]` の値が `true`
     - `spotlight=true` → `select[name="spotlight"]` の値が `true`
     - `audio=false` → `<input id="audio">` の `checked` が false ( `AudioForm.tsx` の `controlId="audio"` から `TooltipFormCheck` / `FormSwitch` 経由で id="audio" が出力されることを実装で確認済み)
     - `video=false` → `<input id="video">` の `checked` が false (同様に `VideoForm.tsx` で id="video")
     - `mediaType=fakeMedia` → `<input id="fakeMedia">` の `checked` が true
   - `parseSpecifiedStringParameter` が空文字を valid として扱うキー ( `audioCodecType=` / `videoCodecType=` 等) は本 issue では検証しない (代表的な非初期値ケースを優先する)
2. `tests/ui-role-visibility.test.ts` (ロール切り替えによる UI 表示/非表示): 最低 8 test
   - 各 UI 要素の表示条件を実装 ( `src/components/DevtoolsPane/index.tsx` ) に揃え、 role を URL パラメータで指定して該当要素の有無を `expect(locator).toBeVisible()` / `expect(locator).toBeHidden()` で検証する
   - 検証マトリクス:

     | UI 要素                                                                             | 表示条件 ( `index.tsx` 行数)                                 |
     | ----------------------------------------------------------------------------------- | ------------------------------------------------------------ |
     | `audioCodecType` / `audioBitRate` / `videoCodecType` / `videoBitRate` の SelectForm | `role !== "recvonly"` ( `showCodecForms` L171)               |
     | `<RowMediaType />` および `<RowMediaOptions />` ブロック                            | `role !== "recvonly"` (L601)                                 |
     | `RequestMediaButton` / `DisposeMediaButton`                                         | `role !== "recvonly"` (L547)                                 |
     | `MicDeviceForm` / `CameraDeviceForm` / `AudioTrackForm` / `VideoTrackForm`          | `role !== "recvonly"` (L569)                                 |
     | `AudioOutputForm`                                                                   | `role !== "sendonly"` (L541)                                 |
     | `ForceStereoOutputForm`                                                             | `role !== "sendonly"` ( `showReceiverParams` L331 / L371)    |
     | `RemoteVideos`                                                                      | `role === "recvonly" \|\| role === "sendrecv"` (L617)        |
     | `AudioInputForm` / `VideoInputForm`                                                 | `role !== "recvonly" && mediaType === "getUserMedia"` (L529) |

   - `AudioForm` / `VideoForm` 自体は role に関係なく常時表示される ( `RowGetUserMediaConstraints` 内 L176 / L197) ため非表示テストの対象外
   - `RowSpotlightOptions` は `spotlight === "true"` 単独条件で role に依存しないため本テスト対象外
   - `RowSimulcastOptions` ( `simulcastRid` / `simulcastRequestRid` ) は `simulcast === "true" && role !== "sendonly"` (L222) のため、 `simulcast=true&role=sendonly` で `select[name="simulcastRid"]` 非表示・ `simulcast=true&role=sendrecv` で表示を検証する

3. `tests/ui-collapse.test.ts` (Collapse セクションの開閉): 最低 6 test
   - 本テストは role をデフォルトの `sendrecv` で実行する ( `role === "recvonly"` のときは `<RowMediaOptions />` 自体が描画されない L601 のため)
   - Signaling options / Advanced signaling options / Media options の 3 セクションについて以下を検証する
     - 初期状態は折りたたまれている ( 各 `Row*Options` 内の `useSignal(true)` で `collapsed` が true 初期化 → `isCollapseOpen` が false)
     - リンクをクリックして展開され ( `isCollapseOpen` が true)、再クリックで折りたたまれる ( `isCollapseOpen` が false)
   - URL パラメータでオプションを有効化した状態で `isCollapseEnabled` が true になることを検証する。例: `bundleId=foo` を渡すと `src/app/actions.ts` の `activateEnabledFlags()` で `signals.bundleId.value !== ""` 判定により `setEnabledBundleId(true)` が呼ばれ、Signaling options の `enabledOptions` が true になる
   - `enabledOptions` は CollapseLink の太字フラグのみを制御し、折りたたみ状態 ( `collapsed` ) には影響しない (実装 `CollapseLink.tsx:13-14` で確認済み)
4. `tests/ui-copy-url.test.ts` (Copy URL ボタン): 最低 4 test
   - 本テストファイルのみ `test.beforeEach` で `context` fixture を受け取り `await context.grantPermissions(["clipboard-read", "clipboard-write"])` を `navigateForUi` の前に呼ぶ (他 4 ファイルは clipboard を使わないため不要)
   - `DevtoolsPage` インスタンスは `test()` 内で `const devtools = new DevtoolsPage(page)` で生成する (`test.beforeEach` 内では生成しない。fixture と Page Object 生成を分離して各テストの初期化を明示する)。他 4 テストファイルも同方針
   - 初期状態でボタンのテキストが `"Copy URL"` であることを検証する ( `CopyUrlButton.tsx:39` 参照)
   - ボタンクリック後にテキストが `"Copied"` に切り替わる ( `CopyUrlButton.tsx:31-37` 、チェックマーク SVG が併記)
   - 2000 ms 後にテキストが `"Copy URL"` に戻る ( `CopyUrlButton.tsx:14` の `setTimeout` )。Playwright の anti-pattern である `waitForTimeout` の代わりに `await expect(devtools.copyUrlButtonLocator()).toHaveText("Copy URL", { timeout: 2500 })` で auto-retry に任せる
   - `readClipboardText()` でクリップボードに URL がコピーされていることを検証する
   - クリップボードの URL を `URLSearchParams` でパースし、 `navigateForUi({ role: "sendonly", mediaType: "fakeMedia" })` で開始した場合に `role=sendonly` と `mediaType=fakeMedia` の両方が含まれることを検証する ( `copyURL` の省略ルールは `actions.ts:533-575` を参照。初期値と一致するパラメータは URL に含めない)
5. `tests/ui-media-type.test.ts` (Media type 切り替え): 最低 4 test
   - 本テストは role をデフォルトの `sendrecv` で実行する ( `role === "recvonly"` のときは `<RowMediaType />` 自体が描画されないため Media type ラジオは存在しない)
   - 4 種類のラジオボタン ( `getUserMedia` / `getDisplayMedia` / `fakeMedia` / `mp4Media` ) を順に `selectMediaType` で切り替えて、各ラジオの `checked` 状態が排他的に切り替わることを検証する
   - `mp4Media` は `MediaTypeForm.tsx:54-56` の `useEffect` で `mountClient.value = true` になってから描画される。`playwright.config.ts` の `projects: [{ name: "chromium" }]` (L18-22) で Chromium のみが対象であり、Chromium の headless では `isMp4MediaStreamSupported()` が true を返す (既存の `tests/mp4-media-stream-lazy-load.test.ts` で `mp4Media` ラジオを `check()` できている実績で確認済み)

## 影響範囲

- 修正: `tests/pages/DevtoolsPage.ts` ( UI テスト用メソッドの追加。 #0037 のクラスを拡張する)
- 修正: `src/components/Header/CopyUrlButton.tsx` ( `<button>` に `data-testid="copy-url-button"` を追加)
- 修正: `src/components/ui/Collapse.tsx` ( `data-testid` props を追加し `<div data-testid={dataTestId}>` として透過する)
- 修正: `src/components/DevtoolsPane/index.tsx` ( 3 箇所の `<Collapse>` に `data-testid="collapse-signaling-options"` / `data-testid="collapse-advanced-signaling-options"` / `data-testid="collapse-media-options"` を追加)
- 新規追加: `tests/ui-url-params.test.ts` / `tests/ui-role-visibility.test.ts` / `tests/ui-collapse.test.ts` / `tests/ui-copy-url.test.ts` / `tests/ui-media-type.test.ts`
- `CHANGES.md` の `## develop` セクション内 `### misc` サブセクションに `[ADD] Sora サーバーに依存しない Playwright UI テストを 5 系統追加する` のエントリを追加する

## 完了条件

### 静的検証

- `tests/pages/DevtoolsPage.ts` の追加メソッドが上記 API 仕様に従って実装され、各メソッドに日本語コメントが付与されている
- 新規追加コードで non-null assertion ( `!` ) や `as` キャストを使わない
- `tests/` 配下から `src/` 配下への import を行っていない ( `grep -rE '@/|\.\./src/' tests/pages/ tests/ui-*.test.ts` が 0 件)
- `pnpm check` が通過すること ( `package.json` の `scripts.check` = `vp check` で format 検証・lint・型チェックをまとめて実行する)
- `pnpm test` が通過すること (既存単体テストへの影響なし)

### 動的検証

- `.env.local` が存在しない、または `E2E_TEST_SORA_SIGNALING_URL` 未設定の状態で `pnpm test:e2e` を実行したとき、本 issue で追加する `ui-*.test.ts` 5 ファイルが全件通過すること (Sora 不要を担保)
- `pnpm exec playwright test --list tests/ui-*.test.ts` で 29 件以上のテストが列挙されること (内訳: ui-url-params 7 + ui-role-visibility 8 + ui-collapse 6 + ui-copy-url 4 + ui-media-type 4)
- `pnpm exec playwright test --grep lazy-load` で `noise-suppression-lazy-load.test.ts` / `mp4-media-stream-lazy-load.test.ts` の通過状態が追加前後で変わらないこと (回帰確認)
- `.env.local` に `E2E_TEST_SORA_SIGNALING_URL` を設定した状態で `pnpm test:e2e` を実行したとき、 #0037 / #0063 で扱う Sora 依存テスト 3 件と本 issue 追加分 + lazy-load 2 件が全件通過すること

## 依存

- #0037 (Page Object と env helper の導入) が先行マージされている必要がある
- #0063 (skip 機構) と本 issue は並列で進められる ( 0037 先行マージ後、 0063 と本 issue を並列実装可能)。本 issue のテストは env 不要のため #0063 完了前でも動作する
- 0038 と 0039 は `DevtoolsPage` の別メソッドを追加するため衝突しないが、競合を避けるため 0038 → 0039 の順で進める
- `@playwright/test` 1.60.0 ( `package.json` 参照)
