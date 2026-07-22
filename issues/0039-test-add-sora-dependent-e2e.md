# 0039 Sora サーバーを必要とする e2e テストを拡充する

- Priority: Low
- Created: 2026-06-08
- Completed: {YYYY-MM-DD}
- Model: DeepSeek V4 Pro
- Branch: feature/add-sora-dependent-e2e
- Polished: 2026-06-16

## 目的

Sora サーバーを必要とする e2e テストのシナリオを拡充し、 (1) 接続失敗時のエラー UI 復帰、 (2) 手動切断 → 再接続サイクル、 (3) `debug=true` 表示時のデバッグペイン (Timeline / Signaling / Notify タブ) のエントリ表示の 3 系統のリグレッションを検出する。

## 優先度根拠

本 issue が追加するテストは `E2E_TEST_SORA_SIGNALING_URL` が設定された環境でのみ実行可能で、 CI / 開発者ローカルどちらでも常時実行できる #0038 と比べてリグレッション検出機会が限定される。一方で WebRTC 接続自体を壊す変更や `AlertMessages` の挙動・`DebugPane` の表示制御の検出は #0038 (Sora 不要 UI テスト) では不可能なため補完的価値はあるが、 #0038 ほど高頻度の検出は望めないため Low とする。

## 現状

- 既存の Sora 接続 e2e は #0037 のリファクタ対象である `tests/sendrecv.test.ts` / `tests/sendonly.test.ts` / `tests/recvonly.test.ts` の 3 件で、いずれも「接続成功 → connection ID 表示 → 切断」の正常系のみを検証する
- #0037 / #0038 で導入される `tests/pages/DevtoolsPage.ts` には本 issue が必要とするエラー UI・再接続・デバッグペイン読み取り用のメソッドは存在しない
- `src/components/AlertMessages.tsx` の Alert Toast (L26-42) には `data-testid` / `role="alert"` が無く、 Toast は `autohide delay={5000}` で 5 秒後に自動消滅する
- `src/components/ui/Tabs.tsx` の `<button role="tab">` (L81) は `aria-selected={isActive}` (L82) を出力するが、`<div role="tabpanel">` (L107) との間に `aria-labelledby` / `aria-controls` / `id` の相互参照が無いため `getByRole("tabpanel", { name })` ではタブパネルを特定できない。非アクティブタブパネルは `class="hidden"` (L108) で DOM 上は常に存在する
- `src/components/DebugPane/Message.tsx` のメッセージエントリには `data-testid` は無く、 `data-title={title}` のみ保持する
- `src/components/DebugPane/index.tsx` (L48-86) は `debug=true` 時に 9 タブ (timeline / signaling / notify / push / stats / log / messaging / rpc / codec) を常時描画する

## 設計方針

### スコープ

本 issue は以下のみを対象とする。 `src/` 配下の変更はテスト容易化のための属性付与のみで挙動を変更しない (#0038 と同じ方針)。

- `tests/pages/DevtoolsPage.ts` への Sora 依存 e2e 用メソッドの追加 ( #0037 / #0038 で導入される Page Object をさらに拡張する)
- `tests/e2e-error-handling.test.ts` / `tests/e2e-reconnect.test.ts` / `tests/e2e-debug-pane.test.ts` の新規作成 ( #0038 の `ui-*` prefix とは別系統で Sora 依存テストを `e2e-*` prefix で揃える。既存 `sendrecv.test.ts` 等の旧スタイルのリネームは本 issue のスコープ外で別 issue で扱う)
- `src/components/ui/Toast.tsx` への `dataTestId?: string` optional props 追加 ( Toast 本体の `<div>` に `data-testid={dataTestId}` を出力する。`Toast` は `src/components/AlertMessages.tsx` でしか使われていない (`grep -rn 'import.*Toast' src/` で確認済み) ため import 経路への影響なし。wrapper `<div>` を追加すると Toast 全体クリックで onClose する UX の挙動範囲が変わるため、wrap ではなく Toast 本体に属性を出力する案を採用する)
- `src/components/AlertMessages.tsx` の Alert 関数で `<Toast dataTestId={\`alert-message-${props.type}\`}>...</Toast>`を渡す (`props.type`は`"info"`または`"error"`)。同関数の`ToastHeader`内`<strong>`に`data-testid="alert-message-title"` を追加する
- `src/components/DebugPane/Message.tsx` のルート要素 ( `<div className="border ..." data-title={title}>` ) に `data-testid="debug-pane-message"` を追加する ( 既存の `data-title` 属性は維持する。エントリは全タブ共通の `Message.tsx` を使うため 1 箇所修正で全タブに適用される。他テストで `getByTestId("debug-pane-message")` を直接使う場合は必ず `getByTestId("debug-pane-tabpanel-...")` 配下で scoping する規約とする)
- `src/components/ui/Tabs.tsx` の `<div role="tabpanel">` に `data-testid={\`debug-pane-tabpanel-${eventKey}\`}`を追加する (`Tabs`は現状 DebugPane のみで使われているため`debug-pane-` prefix を付ける。他コンポーネントで Tabs を使う場合に testid を出さないため、`dataTestIdPrefix?: string`optional props を追加し、未指定時は`data-testid` を出力しない設計とする)

上記の `src/` 配下の変更とテストファイル新規追加はすべて同一ブランチ・同一コミットでまとめる。

以下はスコープ外とする。

- Sora 不要 UI テスト ( #0038 で扱う)
- 既存 Sora 接続テスト 3 件 ( `sendrecv` / `sendonly` / `recvonly` ) の変更 ( #0037 で行う)
- 既存テストファイル名のリネーム ( `sendrecv.test.ts` / `sendonly.test.ts` / `recvonly.test.ts` を `e2e-*` prefix に、 `noise-suppression-lazy-load.test.ts` / `mp4-media-stream-lazy-load.test.ts` を `lazy-load-*` 等の prefix に揃える整理は別 issue で扱う。本 issue は `e2e-*` prefix の導入のみ行う)
- `tests/noise-suppression-lazy-load.test.ts` / `tests/mp4-media-stream-lazy-load.test.ts` の変更
- `playwright.config.ts` の変更
- `src/components/` 配下の上記 `data-testid` / `dataTestId` props 関連以外の変更
- `Reconnect` Toast (`AlertMessages.tsx` L10-24) への `data-testid` 追加 (本 issue では再接続 Toast の検証を行わないため不要)
- 自動再接続 ( `reconnect=true` URL パラメータ + Sora 側 abend) のテスト ( `src/app/actions.ts:1211` の `event.type === "abend" && reconnectValue` 条件は Sora プロセスを e2e 内で制御しない方針のため対象外)
- 手動再接続のうち「1 回目失敗 → 2 回目成功」シナリオ ( 本 issue は接続成功サイクルの繰り返しのみ検証する)
- エラーハンドリングテストにおける「失敗 → 復帰 → 再試行成功」シナリオ ( 本 issue はエラー UI 表示と Connect ボタン enabled 復帰のみ検証する)
- 「無効なトークン」シナリオ ( Sora 側で Auth Webhook 設定が必要で再現不能)
- simulcast / spotlight の数値的検証 ( 別 issue で扱う)
- 他者参加 notify の検証 ( 単独接続では再現不能)
- DataChannelMessaging / RPC / Stats / Push / Log / Messaging / Codec タブの内容検証
- Sora 側ステート (channel 列挙等) を変更する API 呼び出しを含むテスト

### 禁止ルール

- `tests/` 配下から `@/` パスエイリアスや相対パスでの `src/` 参照を行わない ( #0037 / #0038 と同じ規約)
- import 方針・コメント (日本語)・エラーメッセージ (英語・末尾ピリオドなし・期待値と実値を含める) は #0037 / #0038 で確立した規約を継承する
- テスト名は #0038 で確立した「半角コロン区切り (例: `"e2e-error-handling: ..."`) で前半は ASCII カテゴリ識別子、後半は日本語可」規約を採用する。 `pnpm exec playwright test --grep e2e-error-handling` のような prefix grep を可能にするため前半 ASCII を維持する ( #0037 が既存テスト名 ( `"sendrecv"` 等) を維持するという指針は、新規追加テストへの規約ではなく既存テストへの限定的な指針として読む)
- 新規追加するテストの `console.log` および `test.step` のラベルは日本語にする (AGENTS.md「テストのログメッセージは全て日本語にすること」)。既存テストの英語 `console.log` は #0037 が別 issue で扱うとしているため本 issue でも触らない
- 各テストファイルの `test()` コールバック先頭で `requireSoraConnectionEnv()` ( #0063 で導入) を呼ぶ。 1 ファイル 1 test 原則のため `describe` ブロックや `test.beforeEach` は使わない。 1 test 内で複数の検証ステップを持つ場合は `test.step()` でラップして HTML レポート上の失敗箇所を判別可能にする

### channelId 衝突回避

各テストで渡す `channelId` はファイル間並列実行の衝突回避と複数開発者の同時実行回避の両方を考慮する。 `env.channelIdPrefix` (複数開発者間の衝突を防ぐ) と ASCII 固定のテストファイル別 suffix (ファイル間衝突を防ぐ) を組み合わせる。

```typescript
const channelId = `${env.channelIdPrefix}e2e-error-handling`;
```

### `tests/pages/DevtoolsPage.ts` への追加 API 仕様

本 issue では、 #0037 マージ後の `tests/pages/DevtoolsPage.ts` 内の `ConnectionParams` 型定義に `debug?` / `debugType?` プロパティを追加する ( production code を変更する。 #0037 の issue ファイル自体は変更しない)。 0037 で確定した `navigate` メソッドのシグネチャ自体は変更せず、 URL 組み立て規約だけ追加する。 既存テスト ( `sendrecv.test.ts` 等) は `debug?` / `debugType?` を渡さないため optional フィールドの追加は後方互換に影響しない。

```typescript
// #0037 で確定した ConnectionParams に debug プロパティを追加する (本 issue で型を拡張)
// 未指定時は URL に乗せない。既存テスト ( sendrecv.test.ts 等) への影響を避けるため optional とする
// URL パラメータの正規形 ("true" / "false") に揃えるため文字列リテラル型を採用 (parseQueryString が boolean に変換する)
// debugType は src/constants.ts の DEBUG_TYPES と一致させる (9 値、 src/components/DebugPane/index.tsx L48-86 のタブ eventKey と一致)
// src/constants.ts の DEBUG_TYPES に新値が追加された場合は本型も追従させる (型レベルの自動検出はできない)
export type ConnectionParams = {
  role: Role;
  channelId: string;
  signalingUrlCandidates: string[];
  accessToken: string;
  videoCodecType?: VideoCodecType;
  debug?: "true" | "false";
  debugType?:
    "log" | "notify" | "push" | "stats" | "timeline" | "signaling" | "messaging" | "rpc" | "codec";
};

// DebugPane のタブ key (本 issue では timeline / signaling / notify のみを扱う)
export type DebugTabKey = "timeline" | "signaling" | "notify";

// DebugTabKey から Tabs.tsx の title 文字列へのマップ
// 汎用 capitalize だと "rpc" → "Rpc" などの irregular で破綻するため明示マップを使う
// Page Object モジュール内に閉じた const として宣言 (export しない)
// DebugTabKey に新値を追加する場合は本マップも同時に更新する
const DEBUG_TAB_TITLE: Record<DebugTabKey, string> = {
  timeline: "Timeline",
  signaling: "Signaling",
  notify: "Notify",
};

export class DevtoolsPage {
  // 既存 (#0037 / #0038): navigate / connect / disconnect / waitForConnection / getConnectionId / navigateForUi / toggleCollapse / clickCopyUrl / selectMediaType / 他

  // エラー Toast が出現するまで待つ
  // 内部で page.getByTestId("alert-message-error").first().waitFor({ state: "visible", timeout }) を呼ぶ
  // デフォルト timeout は 3000 ms (Chromium kRestrictedPorts に含まれない 65535 ポート (https://chromium.googlesource.com/chromium/src/+/refs/heads/main/net/base/port_util.cc 参照) への WSS 接続失敗は通常 1 秒以内に判定される。CI 環境を考慮して余裕を見て 3000 ms)
  async waitForErrorAlert(timeoutMs?: number): Promise<void>;

  // type="error" の AlertMessages の title を DOM 出現順で取得する
  // 内部で page.getByTestId("alert-message-error").getByTestId("alert-message-title").allTextContents() を呼ぶ
  // signals.ts の setAlertMessagesAndLogMessages (L194-217) は unshift で先頭挿入するため、戻り値は新しいエラーが先頭
  // 本 issue では type="error" のみ扱う。 type="info" は対象外
  // allTextContents は textContent ベースで前後空白を含む可能性があるため、検証側で trim する規約とする (例: titles.some(t => t.trim() === "Sora error"))
  async getErrorAlertTitles(): Promise<string[]>;

  // Connect ボタンが押下可能かを判定する
  // 内部で page.locator('button[name="connect"]').isEnabled() を呼ぶ
  // (`getByRole("button", { name: "connect" })` は部分一致で `disconnect` / `Reconnect` Toast にも match して strict mode violation になるため、既存テスト ( `tests/sendrecv.test.ts` 等) と同じ `button[name="connect"]` セレクタを使う)
  async isConnectButtonEnabled(): Promise<boolean>;

  // DebugPane の指定タブを選択する
  // 内部で page.getByRole("tab", { name: DEBUG_TAB_TITLE[tab], exact: true }).click() を呼んだ後
  // page.getByRole("tab", { name: DEBUG_TAB_TITLE[tab], exact: true, selected: true }).waitFor({ state: "visible" }) で
  // aria-selected="true" 属性への切替完了 (= signal 更新と DOM 再描画完了) を待つ
  // (transition-colors duration-150 は見栄え遷移のみで aria-selected の値変化とは同期しないため待機対象外)
  // Page Object 内で expect は呼ばず locator.waitFor で完結させる
  async selectDebugTab(tab: DebugTabKey): Promise<void>;

  // 指定 DebugPane タブ内のエントリ数を即値で返す
  // selectDebugTab → 本メソッドの順で呼ぶ規約 (タブ切替の UI 動作も併せて検証する目的)
  // 内部で page.getByTestId(`debug-pane-tabpanel-${tab}`).getByTestId("debug-pane-message").count() を呼ぶ
  // Tabs.tsx は非アクティブ tabpanel も DOM に hidden で残すため、 tabpanel 指定でアクティブタブのエントリのみを数える
  // count() は即値返却のため、テスト側は expect.poll(() => devtools.getDebugTabEntryCount(tab), { timeout: 3000 }).toBeGreaterThanOrEqual(1) で polling する規約とする
  async getDebugTabEntryCount(tab: DebugTabKey): Promise<number>;
}
```

設計上の注意 (URL 組み立て):

- `debug` が undefined の場合は URL に乗せない (既存テストへの影響を避けるため optional)
- `debugType` が undefined の場合は URL に乗せない
- `debug: "true"` の指定なしで `debugType` のみ指定する組み合わせは禁止 (`debug=false` 時は DebugPane が `null` 返却 (`src/components/DebugPane/index.tsx` L23-25) で `debugType` 指定が無効になるため)
- `parseQueryString` (`src/utils.ts:146`) が `debugType` を `DEBUG_TYPES` (`src/constants.ts:81-91`) でホワイトリスト検証する。9 値 (log / notify / push / stats / timeline / signaling / messaging / rpc / codec) のいずれかでなければ無視される

### 追加するテスト

1. `tests/e2e-error-handling.test.ts` (接続失敗時のエラー UI 復帰): **1 test**
   - テスト名: `"e2e-error-handling: 接続失敗時にエラー Toast が表示され Connect ボタンが復帰する"` (単一 ASCII 規約に沿った半角コロン区切り、後半は日本語可)
   - `requireSoraConnectionEnv()` を `test()` コールバック先頭で呼ぶ
   - `signalingUrlCandidates: ["wss://127.0.0.1:65535/signaling"]` で意図的に接続失敗を発生させる ( 65535 は Chromium の kRestrictedPorts に含まれないため `ERR_UNSAFE_PORT` を回避でき、 localhost なので DNS 解決も不要で失敗判定が短時間で完了する)
   - 検証順序:
     - `waitForErrorAlert(3000)` でエラー Toast 待機 ( Toast は autohide delay=5000 ms で消滅するため、直後に `getErrorAlertTitles` を呼ぶ)
     - `getErrorAlertTitles()` の戻り値の各要素を `.trim()` した結果に `"Sora error"` が含まれる ( `src/app/signals.ts:542` の title 固定値、 `src/app/actions.ts:1611` で `signals.setSoraErrorAlertMessage(\`failed to connect Sora: ${error.message}\`)` が呼ばれる)
     - `isConnectButtonEnabled()` が true に戻る
   - エラー本文 (Toast の body) は OS / ブラウザ / SDK 内部メッセージで変動するため検証しない
2. `tests/e2e-reconnect.test.ts` (手動 connect → disconnect → connect サイクル): **1 test**
   - テスト名: `"e2e-reconnect: 手動切断後に再接続して新しい connection ID を取得する"`
   - `requireSoraConnectionEnv()` を `test()` コールバック先頭で呼ぶ
   - `role=sendrecv` の正常な signaling URL で以下を実行する
     - `navigate` → `connect` → `waitForConnection` → 1 回目の `getConnectionId` ( 非 null かつ空文字でない)
     - `disconnect`
     - クライアント側の disconnect 反映 (= `#local-video-connection-id` 要素の消滅) を `await page.waitForFunction(() => !document.querySelector("#local-video-connection-id"), null, { timeout: 3000 })` で待つ (`signals.setSoraConnectionId(null)` が `actions.ts` の disconnect ハンドラ内で呼ばれる挙動を待つ)
     - Sora サーバ側のセッション破棄完了はクライアント側からは観測できないため、本テストでは保証しない。同一 channelId で連続テスト実行する CI 環境で「同名 channel に重複コネクション」エラーが頻発する場合は別 issue で対応 (channelId に test 実行時刻 suffix を付ける等)
     - `connect` ( 2 回目) → `waitForConnection` → 2 回目の `getConnectionId` ( 非 null かつ空文字でない)
     - 1 回目と 2 回目の connection ID が異なる (Sora は接続ごとに新規 connection ID を発行する仕様)
   - 本テストの multistream 前提: Sora 2024.1.0 以降は multistream がデフォルト有効 ( `CHANGES.md` 参照) のため URL パラメータ指定なしで multistream で動作する
3. `tests/e2e-debug-pane.test.ts` (デバッグペイン表示検証): **1 test (3 test.step を含む)**
   - テスト名: `"e2e-debug-pane: debug=true で Timeline / Signaling / Notify タブにエントリが表示される"`
   - `requireSoraConnectionEnv()` を `test()` コールバック先頭で呼ぶ
   - `navigate({ ..., debug: "true", debugType: "timeline" })` で DebugPane を有効化した状態で接続する
   - `connect` → `waitForConnection` で接続成功後、 1 test 内で 3 タブを `test.step()` でラップして順次検証する (3 タブ検証は同一 Sora 接続を共有してテスト全体の実行時間を短縮するため 1 test にまとめる)
     - `test.step("Timeline タブ")`: `selectDebugTab("timeline")` → `await expect.poll(() => devtools.getDebugTabEntryCount("timeline"), { timeout: 3000 }).toBeGreaterThanOrEqual(1)` (接続成功時に複数のタイムラインエントリが表示される。具体的な event 名は sora-js-sdk バージョン依存のため検証しない)
     - `test.step("Signaling タブ")`: `selectDebugTab("signaling")` → `expect.poll` で `getDebugTabEntryCount("signaling") >= 1` (シグナリングメッセージが少なくとも 1 件)
     - `test.step("Notify タブ")`: `selectDebugTab("notify")` → `expect.poll` で `getDebugTabEntryCount("notify") >= 1` (Sora が自身の `connection.created` 等の notify を返すが、具体的な event 名は SDK / Sora バージョン依存のため検証しない)

## 影響範囲

- 修正: `tests/pages/DevtoolsPage.ts` (本 issue 用メソッド追加。 #0037 / #0038 のクラスをさらに拡張。 #0037 で定義した `ConnectionParams` に `debug?` / `debugType?` を追加)
- 修正: `src/components/ui/Toast.tsx` (`ToastProps` に `dataTestId?: string` を追加し、 Toast 本体の `<div>` に `data-testid={dataTestId}` を出力する。 `dataTestId` 未指定時は属性を出力しない)
- 修正: `src/components/AlertMessages.tsx` (Alert 関数の `<Toast>` に `dataTestId={\`alert-message-${props.type}\`}`を渡し、 ToastHeader 内`<strong>`に`data-testid="alert-message-title"` を追加)
- 修正: `src/components/DebugPane/Message.tsx` (ルート要素に `data-testid="debug-pane-message"` を追加)
- 修正: `src/components/ui/Tabs.tsx` (`TabsProps` に `dataTestIdPrefix?: string` を追加し、 `<div role="tabpanel">` に `data-testid={\`${dataTestIdPrefix}-tabpanel-${eventKey}\`}`を出力する。`dataTestIdPrefix` 未指定時は属性を出力しない)
- 修正: `src/components/DebugPane/index.tsx` (`<Tabs activeKey={...}>` に `dataTestIdPrefix="debug-pane"` を渡す)
- 新規追加: `tests/e2e-error-handling.test.ts` / `tests/e2e-reconnect.test.ts` / `tests/e2e-debug-pane.test.ts`
- `CHANGES.md` の `## develop` 配下の `### misc` サブセクション内で、種別順 (CHANGE → ADD → UPDATE → FIX) を守って #0037 / #0038 が追加する `[ADD]` 群の末尾 (#0038 の `[ADD] Sora サーバーに依存しない Playwright UI テストを 5 系統追加する` の直後、現状の `[UPDATE] vite-plus ...` の前) に `[ADD] Sora サーバーを必要とする e2e テスト (エラーハンドリング / 再接続 / デバッグペイン表示) を 3 系統追加する` を追記する ( #0037 / #0038 が先行マージされる前提。`shiguredo-changelog` スキル参照)

## 完了条件

### 静的検証

- `tests/pages/DevtoolsPage.ts` の追加メソッドが上記 API 仕様に従って実装され、各メソッドに日本語コメントが付与されている
- `ConnectionParams` に `debug?: "true" | "false"` と `debugType?: ...` 9 値の文字列リテラル型が追加されている
- `src/components/ui/Toast.tsx` の `ToastProps` に `dataTestId?: string` が追加され、 `<div data-testid={dataTestId}>` が出力される (未指定時は属性を出力しない)
- `src/components/AlertMessages.tsx` の Alert 関数で `<Toast dataTestId="alert-message-${props.type}">` が指定され、 ToastHeader 内 `<strong>` に `data-testid="alert-message-title"` が出力される
- `src/components/DebugPane/Message.tsx` のルート要素に `data-testid="debug-pane-message"` が出力される
- `src/components/ui/Tabs.tsx` の `TabsProps` に `dataTestIdPrefix?: string` が追加され、 `<div role="tabpanel" data-testid={\`${dataTestIdPrefix}-tabpanel-${eventKey}\`}>` が出力される (未指定時は属性を出力しない)
- `src/components/DebugPane/index.tsx` の `<Tabs>` に `dataTestIdPrefix="debug-pane"` が指定されている
- 新規追加コードで non-null assertion ( `!` ) や `as` キャストを使わない
- `tests/` 配下から `src/` 配下への import を行っていない
  - `grep -rE "from ['\"](@/|(\\.\\./)+src/)" tests/pages/ tests/e2e-*.test.ts` が 0 件
- `pnpm check` が通過すること
- `pnpm test` が通過すること (既存単体テストへの影響なし)

### 動的検証

- `.env.local` に `E2E_TEST_SORA_SIGNALING_URL` を設定した状態で `pnpm test:e2e` を実行したとき、本 issue で追加する 3 ファイルが全件通過すること
- `pnpm exec playwright test --list tests/e2e-*.test.ts` で 3 件 (3 ファイル × 各 1 test) のテストが列挙されること
- `.env.local` に `E2E_TEST_SORA_SIGNALING_URL` が未設定の状態で `pnpm test:e2e` を実行したとき、 #0063 の `requireSoraConnectionEnv()` により本 issue 追加分 3 ファイルが `E2E_TEST_SORA_SIGNALING_URL is not set` で即座に fail すること
- `pnpm exec playwright test --grep lazy-load` で `noise-suppression-lazy-load.test.ts` / `mp4-media-stream-lazy-load.test.ts` の通過状態が追加前後で変わらないこと (回帰確認)

## エッジケース

- 接続失敗テストで Toast が autohide で消滅した後に検証する場合: `waitForErrorAlert` の `state: "visible"` 待機後すぐに `getErrorAlertTitles` を呼ぶことで autohide 完了前にスナップショットを取る。3000 ms の待機後さらに `allTextContents` が空配列を返した場合は autohide で消えた可能性があるため、テスト側で「Toast が表示されてから autohide まで」のウィンドウ内に検証を完了させる必要がある
- 再接続テストで Sora 側のセッション破棄が遅延する環境: `disconnect` 後の `#local-video-connection-id` 消滅待ち (timeout 3000 ms) で吸収する。3000 ms で消滅しない環境は別の問題があるためテストとして失敗扱いとする
- DebugPane の Notify タブで自身の `connection.created` notify が遅延する場合: `expect.poll` の timeout 3000 ms で吸収する。3000 ms で 1 件も notify が来ない場合は SDK / Sora の仕様変更を疑う

## 依存

- #0037 (Page Object と env helper の導入) が先行マージされている必要がある (本 issue は `DevtoolsPage` を拡張し、 0037 の `ConnectionParams` 型を `debug?` / `debugType?` で拡張するため)
- #0063 (未設定時の即座 fail / `requireSoraConnectionEnv` ) が先行マージされている必要がある ( `requireSoraConnectionEnv` の呼び方は #0063 で確立された規約 = `test()` コールバック先頭または `test.beforeEach` 先頭での呼び出しを継承する。未設定時は skip せず Error を throw する)
- #0038 (Page Object 拡張 / UI テスト) と本 issue は Page Object 拡張範囲が異なるため API 衝突しないが、編集競合を避けるため 0038 → 0039 の順で進める
- `@playwright/test` 1.60.0 ( `package.json` 参照)
