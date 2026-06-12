# 0039 Sora サーバーを必要とする e2e テストを拡充する

- Priority: Low
- Created: 2026-06-08
- Completed: {YYYY-MM-DD}
- Model: DeepSeek V4 Pro
- Branch: feature/add-sora-dependent-e2e
- Polished: 2026-06-12

## 目的

Sora サーバーを必要とする e2e テストのシナリオを拡充し、 (1) 接続失敗時のエラー UI 復帰、 (2) 手動切断 → 再接続サイクル、 (3) `debug=true` 表示時のデバッグペイン (Timeline / Signaling / Notify タブ) のエントリ表示の 3 系統のリグレッションを検出する。

## 優先度根拠

本 issue が追加するテストは `E2E_TEST_SORA_SIGNALING_URL` が設定された環境でのみ実行可能で、 CI / 開発者ローカルどちらでも常時実行できる #0038 と比べてリグレッション検出機会が限定される。一方で WebRTC 接続自体を壊す変更や AlertMessages の挙動・DebugPane の表示制御の検出は #0038 (Sora 不要 UI テスト) では不可能なため補完的価値はあるが、 #0038 ほど高頻度の検出は望めないため Low とする。

## 現状

- 既存の Sora 接続 e2e は #0037 のリファクタ対象である `tests/sendrecv.test.ts` / `tests/sendonly.test.ts` / `tests/recvonly.test.ts` の 3 件で、いずれも「接続成功 → connection ID 表示 → 切断」の正常系のみを検証する
- #0037 で導入される `tests/pages/DevtoolsPage.ts` は `navigate` / `connect` / `disconnect` / `waitForConnection` / `getConnectionId` の最小 API のみを提供しており、エラー UI・再接続・デバッグペイン読み取りを扱うメソッドは存在しない
- `src/components/AlertMessages.tsx` の Toast には `data-testid` / `role="alert"` が無く、 Toast は `autohide delay={5000}` で 5 秒後に自動消滅する。Playwright からエラーメッセージを取得する手段が無い
- `src/components/DebugPane/index.tsx` の Tabs は `role="tab"` ( `src/components/ui/Tabs.tsx:81` ) と `role="tabpanel"` ( `Tabs.tsx:104-112` ) を持つが、両者に `aria-labelledby` / `aria-controls` / `id` の相互参照が無い。 `Tabs.tsx` の実装上、非アクティブタブパネルも `class="hidden"` で DOM 上は常に存在する。 `src/components/DebugPane/Message.tsx` のメッセージエントリにも `data-testid` は無い

## 設計方針

### スコープ

本 issue は以下のみを対象とする。

- `tests/pages/DevtoolsPage.ts` への Sora 依存 e2e 用メソッドの追加 ( #0037 / #0038 で導入される Page Object をさらに拡張する)
- `tests/e2e-error-handling.test.ts` / `tests/e2e-reconnect.test.ts` / `tests/e2e-debug-pane.test.ts` の新規作成 ( #0038 の `ui-*` prefix と命名スタイルを揃えて `e2e-` prefix を採用する。既存 `sendrecv.test.ts` 等の旧スタイルのリネームはスコープ外)
- `src/components/AlertMessages.tsx` の Alert 関数の戻り値を `<div data-testid={`alert-message-${props.type}`}><Toast>...</Toast></div>` の wrapper で包む ( `type` は `"info"` または `"error"` )。同関数の ToastHeader 内 `<strong>` に `data-testid="alert-message-title"` を追加 ( `<strong>` セレクタでは他の `<strong>` を巻き込む可能性があるため)
- `src/components/DebugPane/Message.tsx` のルート要素 ( `<div className="border ..." data-title={title}>` ) に `data-testid="debug-message"` を追加 ( 既存の `data-title` 属性は維持する。エントリは全タブ共通の `Message.tsx` を使うため 1 箇所修正で全タブに適用される)
- `src/components/ui/Tabs.tsx` の `<div role="tabpanel">` に `data-testid={`tabpanel-${eventKey}`}` を追加 ( `getByRole("tabpanel", { name })` が `aria-labelledby` 無しで機能しないため `getByTestId` で取得する)

上記の `src/` 配下の変更とテストファイル新規追加はすべて同一ブランチ・同一コミットでまとめる。

以下はスコープ外とする。

- Sora 不要 UI テスト ( #0038 で扱う)
- 既存 Sora 接続テスト 3 件 ( `sendrecv` / `sendonly` / `recvonly` ) の変更 ( #0037 で行う)
- 既存テストファイル名のリネーム
- `tests/noise-suppression-lazy-load.test.ts` / `tests/mp4-media-stream-lazy-load.test.ts` の変更
- `playwright.config.ts` の変更
- `src/components/` 配下の上記 `data-testid` 関連以外の変更
- 自動再接続 ( `reconnect=true` URL パラメータ + Sora 側 abend) のテスト ( `src/app/actions.ts:1173` の `event.type === "abend"` 条件は Sora プロセスを e2e 内で制御しない方針のため対象外)
- 手動再接続のうち「1 回目失敗 → 2 回目成功」シナリオ ( 本 issue は接続成功サイクルの繰り返しのみ検証する)
- エラーハンドリングテストにおける「失敗 → 復帰 → 再試行成功」シナリオ ( 本 issue はエラー UI 表示と Connect ボタン enabled 復帰のみ検証する)
- 「無効なトークン」シナリオ ( Sora 側で Auth Webhook 設定が必要で再現不能)
- simulcast / spotlight の数値的検証 ( 別 issue で扱う)
- 他者参加 notify の検証 ( 単独接続では再現不能)
- DataChannelMessaging / RPC / Stats / Push / Log / Messaging / Codec タブの内容検証
- Sora 側ステート (channel 列挙等) を変更する API 呼び出しを含むテスト

import 方針・テスト名・コメント・エラーメッセージなどは #0037 / #0038 で確立した規約をそのまま継承する。各テストファイルの `test()` 冒頭で `requireSoraConnectionEnv()` ( #0063 で導入) を呼ぶ。 `describe` ブロックは使わず `test()` 単独で書く ( 1 ファイル 1 test 原則のため)。 1 test 内で複数の検証ステップを持つ場合は `test.step()` でラップして HTML レポート上の失敗箇所を判別可能にする。

### channelId 衝突回避

各 test() で渡す `channelId` はファイル間並列実行の衝突回避と複数開発者の同時実行回避の両方を考慮する。 `env.channelIdPrefix` が複数開発者間の衝突を防ぎ、 ASCII 固定のテストファイル別 suffix がファイル間衝突を防ぐ。

```typescript
const channelId = `${env.channelIdPrefix}e2e-error-handling`;
```

### `tests/pages/DevtoolsPage.ts` への追加 API 仕様

```typescript
// #0037 の ConnectionParams に debug プロパティを追加する (本 issue で型を拡張)
// 未指定時は URL に乗せない。既存テストへの影響を避けるため optional とする
// URL パラメータの正規形 ("true" / "false") に揃えるため文字列リテラル型を採用 (parseQueryString が boolean に変換する)
export type ConnectionParams = {
  role: Role;
  channelId: string;
  signalingUrlCandidates: string[];
  accessToken: string;
  videoCodecType?: VideoCodecType;
  debug?: "true" | "false";
  debugType?:
    | "log"
    | "notify"
    | "push"
    | "stats"
    | "timeline"
    | "signaling"
    | "messaging"
    | "rpc"
    | "codec";
};

// DebugPane のタブ key (本 issue では timeline / signaling / notify のみを扱う)
export type DebugTabKey = "timeline" | "signaling" | "notify";

// DebugTabKey から Tabs.tsx の title 文字列へのマップ (汎用 capitalize だと "rpc" → "Rpc" 等の irregular で破綻するため)
// Page Object モジュール内に閉じた const として宣言 (export しない)
const DEBUG_TAB_TITLE: Record<DebugTabKey, string> = {
  timeline: "Timeline",
  signaling: "Signaling",
  notify: "Notify",
};

export class DevtoolsPage {
  // 既存 (#0037 / #0038): navigate / connect / disconnect / waitForConnection / getConnectionId / navigateForUi / toggleCollapse / clickCopyUrl / selectMediaType / 他

  // エラー Toast が出現するまで待つ
  // 内部で page.getByTestId("alert-message-error").first().waitFor({ state: "visible", timeout }) を呼ぶ
  // デフォルト timeout は 3000 ms (connection refused は数 100 ms で完了するため)
  async waitForErrorAlert(timeoutMs?: number): Promise<void>;

  // type="error" の AlertMessages の title を DOM 出現順で取得する
  // 内部で page.getByTestId("alert-message-error").getByTestId("alert-message-title").allTextContents() を呼ぶ
  // 本 issue では type="error" のみ扱う
  async getErrorAlertTitles(): Promise<string[]>;

  // Connect ボタンが押下可能かを判定する
  // 内部で page.getByRole("button", { name: "connect" }).isEnabled() を呼ぶ
  async isConnectButtonEnabled(): Promise<boolean>;

  // DebugPane の指定タブを選択する
  // 内部で page.getByRole("tab", { name: DEBUG_TAB_TITLE[tab], exact: true }).click() を呼んだ後
  // page.getByRole("tab", { name: DEBUG_TAB_TITLE[tab], exact: true, selected: true }).waitFor({ state: "visible" }) で
  // aria-selected="true" への切替完了を待つ (Tabs.tsx の transition duration-150 と signal 更新の完了を保証する)
  // Page Object 内で expect は呼ばず locator.waitFor で完結させる
  async selectDebugTab(tab: DebugTabKey): Promise<void>;

  // 指定 DebugPane タブ内のエントリ数を取得する
  // selectDebugTab → 本メソッドの順で呼ぶ規約 (タブ切替の UI 動作も併せて検証する目的)
  // 内部で page.getByTestId(`tabpanel-${tab}`).getByTestId("debug-message").count() を呼ぶ
  // (Tabs.tsx は非アクティブ tabpanel も DOM に hidden で残すため、 tabpanel 指定でアクティブタブのエントリのみを数える)
  async getDebugTabEntryCount(tab: DebugTabKey): Promise<number>;
}
```

### 追加するテスト

1. `tests/e2e-error-handling.test.ts` (接続失敗時のエラー UI 復帰): 1 test
   - `requireSoraConnectionEnv()` を呼んだ後、 `navigate` で意図的に接続失敗を発生させて以下を順に検証する
     - `waitForErrorAlert` でエラー Toast 待機 ( Toast は autohide delay=5000 ms で消滅するため、直後に `getErrorAlertTitles` を呼ぶ)
     - `getErrorAlertTitles()` の戻り値に `"Sora error"` が含まれる ( `src/app/signals.ts:540` の title 固定値、 `src/app/actions.ts:1538` で `setSoraErrorAlertMessage("failed to connect Sora: ...")` が呼ばれる)
     - `isConnectButtonEnabled()` が true に戻る
   - 失敗の再現は `signalingUrlCandidates: ["wss://127.0.0.1:65535/signaling"]` を使う。Chromium の `ERR_UNSAFE_PORT` 判定を避けつつ DNS 解決も不要なため失敗判定が数 100 ms で完了する
   - エラー本文 ( body) は OS/ブラウザ依存で変動するため検証しない
2. `tests/e2e-reconnect.test.ts` (手動 connect → disconnect → connect サイクル): 1 test
   - `requireSoraConnectionEnv()` を呼んだ後、 `role=sendrecv` の正常な signaling URL で以下を実行する
     - `navigate` → `connect` → `waitForConnection` → 1 回目の `getConnectionId` ( 非 null かつ空文字でない)
     - `disconnect`
     - `connect` ( 2 回目) → `waitForConnection` → 2 回目の `getConnectionId` ( 非 null かつ空文字でない)
     - 1 回目と 2 回目の connection ID が異なる
3. `tests/e2e-debug-pane.test.ts` (デバッグペイン表示検証): 1 test
   - `requireSoraConnectionEnv()` を呼んだ後、 `navigate({ debug: "true", debugType: "timeline" })` で DebugPane を有効化した状態で接続する
   - `connect` → `waitForConnection` で接続成功後、 1 test 内で 3 タブを `test.step()` でラップして順次検証する
     - `test.step("Timeline タブ")`: `selectDebugTab("timeline")` → `getDebugTabEntryCount("timeline") >= 1` ( 接続成功時に `connect-websocket-start` 等が表示される)
     - `test.step("Signaling タブ")`: `selectDebugTab("signaling")` → `getDebugTabEntryCount("signaling") >= 1` ( `connect` / `offer` / `answer` 等)
     - `test.step("Notify タブ")`: `selectDebugTab("notify")` → `getDebugTabEntryCount("notify") >= 1` ( 自身の `connection.created` event)

## 影響範囲

- 修正: `tests/pages/DevtoolsPage.ts` ( 本 issue 用メソッド追加。 #0037 / #0038 のクラスをさらに拡張)
- 修正: `src/components/AlertMessages.tsx` ( Alert 関数の戻り値を `<div data-testid="alert-message-${type}">` で包み、 ToastHeader 内 `<strong>` に `data-testid="alert-message-title"` を追加)
- 修正: `src/components/DebugPane/Message.tsx` ( ルート要素に `data-testid="debug-message"` を追加)
- 修正: `src/components/ui/Tabs.tsx` ( `<div role="tabpanel">` に `data-testid={`tabpanel-${eventKey}`}` を追加)
- 新規追加: `tests/e2e-error-handling.test.ts` / `tests/e2e-reconnect.test.ts` / `tests/e2e-debug-pane.test.ts`
- `CHANGES.md` の `## develop` セクション内 `### misc` サブセクションに `[ADD] Sora サーバーを必要とする e2e テスト (エラーハンドリング / 再接続 / デバッグペイン表示) を 3 系統追加する` のエントリを追加する

## 完了条件

### 静的検証

- `tests/pages/DevtoolsPage.ts` の追加メソッドが上記 API 仕様に従って実装され、各メソッドに日本語コメントが付与されている
- 新規追加コードで non-null assertion ( `!` ) や `as` キャストを使わない
- `tests/` 配下から `src/` 配下への import を行っていない ( `grep -rE '@/|\.\./src/' tests/pages/ tests/e2e-*.test.ts` が 0 件)
- `pnpm check` が通過すること ( `package.json` の `scripts.check` = `vp check`)
- `pnpm test` が通過すること (既存単体テストへの影響なし)

### 動的検証

- `.env.local` に `E2E_TEST_SORA_SIGNALING_URL` を設定した状態で `pnpm test:e2e` を実行したとき、本 issue で追加する 3 ファイルが全件通過すること
- `pnpm exec playwright test --list tests/e2e-*.test.ts` で `e2e-error-handling` / `e2e-reconnect` / `e2e-debug-pane` の 3 件が列挙されること
- `.env.local` に `E2E_TEST_SORA_SIGNALING_URL` が未設定の状態で `pnpm test:e2e` を実行したとき、 #0063 の `requireSoraConnectionEnv()` により本 issue 追加分 3 ファイルが skip されること
- `pnpm exec playwright test --grep lazy-load` で `noise-suppression-lazy-load.test.ts` / `mp4-media-stream-lazy-load.test.ts` の通過状態が追加前後で変わらないこと (回帰確認)

## エッジケース

- 再接続テストの multistream 前提: 同一 channelId に 2 回連続で接続する場合、 Sora 側の role 制約 ( `sendrecv` で同一 channel に複数接続) を考慮し、 `E2E_TEST_SORA_SIGNALING_URL` が指す Sora が multistream を許可している前提とする

## 依存

- #0037 (Page Object と env helper の導入) が先行マージされている必要がある
- #0063 (skip 機構 / `requireSoraConnectionEnv` ) が先行マージされている必要がある ( `requireSoraConnectionEnv` の呼び方は #0063 で確立された規約を継承する)
- #0038 (Page Object 拡張 / UI テスト) と本 issue は Page Object 拡張範囲が異なるため衝突しないが、競合を避けるため 0038 → 0039 の順で進める
- `@playwright/test` 1.60.0 ( `package.json` 参照)
