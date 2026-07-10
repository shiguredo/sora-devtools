# 0037 e2e テストに Page Object Model を導入する

- Priority: High
- Created: 2026-06-08
- Completed: {YYYY-MM-DD}
- Model: DeepSeek V4 Pro
- Branch: feature/refactor-introduce-e2e-page-object
- Polished: 2026-07-10

## 目的

Playwright e2e テストに Page Object Model (POM) と環境変数読み込みヘルパーを導入し、`sendrecv` / `sendonly` / `recvonly` の 3 テストに散在するセレクタ・URL 組み立てロジック・環境変数読み込みを共通化する。

## 優先度根拠

本 issue は後続 e2e のブロッカーであるため High。依存関係は次のとおり。

- #0038: `DevtoolsPage` を拡張する (`getSoraConnectionEnv()` は使わない)
- #0039: `DevtoolsPage` を拡張し、#0063 の `requireSoraConnectionEnv()` を使う
- #0063: `getSoraConnectionEnv()` の上に `requireSoraConnectionEnv()` を追加する (`DevtoolsPage` は触らない)
- #0065 / #0066: 接続維持 E2E で #0037 → #0063 を前提とする

## 現状

- `tests/sendrecv.test.ts` / `tests/sendonly.test.ts` / `tests/recvonly.test.ts` の 3 ファイルは、以下の 3 箇所のみが差分で、それ以外はコメントまで含め完全に同一のコード
  - `test()` の第 1 引数のテスト名 ( `"sendrecv"` / `"sendonly"` / `"recvonly"` )
  - `channelId` の suffix ( `${channelIdPrefix}sendrecv` 等)
  - URLSearchParams の `role` 値
- 各テストファイルに以下 3 種類のセレクタがハードコードされている
  - `button[name="connect"]` ( `ConnectButton.tsx` )
  - `button[name="disconnect"]` ( `DisconnectButton.tsx` )
  - `#local-video-connection-id` ( `ConnectionStatusBar.tsx` が `localVideo` 時に付与)
- 既存 3 テストは URLSearchParams に `multistream: "true"` を渡しているが、`src/utils.ts` の `parseQueryString` はキーをホワイトリスト形式で個別に読み込んでおり `multistream` キーを参照しないため、URL に乗せても黙って無視される (Sora 側挙動には影響しないデッドパラメータ)
- 各テスト先頭に `// TODO: 複数に対応したい` がある
- `tests/` 配下の共通コードは `tests/global-setup.ts` ( Node.js 標準 API の `process.loadEnvFile(envPath)` で `.env.local` を読み込む。CI 環境では `.env.local` が無いため `fs.existsSync(envPath)` で存在確認してから呼び出しをスキップする) のみ。加えて `tests/fixtures/` に MP4 テスト用バイナリがある。テスト本体で再利用できる Page Object や環境変数ヘルパーは存在しない
- `E2E_TEST_SORA_SIGNALING_URL` のみが e2e テストの必須環境変数。未設定時の現行経路は次のとおりで、**必ずしもタイムアウト失敗するとは限らない**
  1. `JSON.stringify([undefined])` → URL 上 `'[null]'`
  2. `isStringArray([null])` が false のため `parseQueryString` は `signalingUrlCandidates` を落とす
  3. `applySignalingUrlCandidates` は query 無し扱いで OPFS を読む
  4. それでも空なら `enabledSignalingUrlCandidates === false` のまま、`createSignalingURL` は `import.meta.env.DEV && import.meta.env.VITE_SORA_SIGNALING_URL` が真なら `VITE_SORA_SIGNALING_URL`、それ以外 (DEV でも VITE 未設定を含む) は `ws://` / `wss://` + hostname + port + `/signaling` へ進む

## 設計方針

### スコープ

本 issue は以下のみを対象とする。

- `tests/pages/DevtoolsPage.ts` の新規作成 (Sora 接続フローの最小 API)
- `tests/helpers/env.ts` の新規作成 (環境変数読み込みヘルパー)
- 既存 3 テストファイル ( `sendrecv.test.ts` / `sendonly.test.ts` / `recvonly.test.ts` ) のリファクタリング
- 既存テストが渡している無効な `multistream: "true"` URL パラメータの削除 ( `parseQueryString` が読まないデッドパラメータの除去であり、リファクタの一環として扱う。Sora 側挙動には影響しない)
- 既存の `// TODO: 複数に対応したい` コメントの削除 (テンプレ置換に伴う整理)

以下はスコープ外とする。

- 未設定時の skip 機構の追加 (#0063 で扱う)
- `tests/noise-suppression-lazy-load.test.ts` / `tests/mp4-media-stream-lazy-load.test.ts` への Page Object 適用
- `tests/global-setup.ts` の変更 (現状の `process.loadEnvFile(envPath)` + `fs.existsSync` ガードをそのまま使う)
- `playwright.config.ts` の変更 ( `webServer` / `globalSetup` / `use.baseURL` / `fullyParallel` のいずれも本 issue では変更しない。現状 `use.baseURL` は未設定)
- 既存テストの `page.waitForTimeout(3000)` の削減 (sleep ではなく signal ベースの待機に置き換えるのが理想だが、現テンプレが Sora 側との通信状態を可視化する手段を持たないため別 issue で扱う)
- `console.log("Connection ID:", connectionId)` の日本語化 (AGENTS.md「テストのログメッセージは全て日本語にすること」との不整合は別 issue で扱う。本 issue では既存挙動を維持する)
- Page Object のメソッド追加 (Copy URL ボタン操作・Collapse 開閉・ロール切替などの UI 操作は #0038 / #0039 で同 Page Object に直接メソッドを追加する形で拡張する。サブクラス化はしない)

### 禁止ルール

- `tests/` 配下から `@/` パスエイリアスや相対パスでの `src/` 参照を行わない (Page Object の独立性を保ち、上流の型変更による e2e への影響を局所化するため)

### `tests/pages/DevtoolsPage.ts` の API 仕様

```typescript
import type { Page } from "@playwright/test";

// e2e テストで扱う接続ロール
// `src/` への依存を持たないため Page Object 内で独立定義する
// `src/constants.ts` の `ROLES` に新メンバが追加された場合は本型を追従させる (型レベルの自動検出はできない)
export type Role = "sendrecv" | "sendonly" | "recvonly";

// e2e テストで指定可能な動画コーデック
// `src/constants.ts` の `VIDEO_CODEC_TYPES` から空文字を除いた値を、配列順どおりに採用する
// 空文字 (= 未指定扱い) を URL に乗せたい場合は `videoCodecType: undefined` を使う
export type VideoCodecType = "VP8" | "VP9" | "AV1" | "H264" | "H265";

// Devtools ページに渡す接続パラメータ
// `signalingUrlCandidates` / `metadata` の JSON 化は本 Page Object の `navigate` 内で行う
// `parseQueryString` が受け付けないキー ( `multistream` 等) は意図的に含めない
export type ConnectionParams = {
  role: Role;
  channelId: string;
  signalingUrlCandidates: string[];
  accessToken: string;
  videoCodecType?: VideoCodecType;
};

// Devtools ページの操作をカプセル化する Page Object
// `DevtoolsPage` / `Role` / `VideoCodecType` / `ConnectionParams` はすべて named export とする (default export は使わない)
export class DevtoolsPage {
  // 既存テストと同じくベース URL はクラス内に集約する
  // `playwright.config.ts` に `use.baseURL` は無いため絶対 URL を使う
  private static readonly DEVTOOLS_URL = "http://localhost:3333/devtools/";

  constructor(private readonly page: Page) {}

  // 論理パラメータを URLSearchParams に組み立て、`page.goto(`${DEVTOOLS_URL}?${query}`)` で遷移する
  // query のキーは channelId / role / signalingUrlCandidates / metadata と、指定時のみ videoCodecType
  // `signalingUrlCandidates` が空配列なら Error を throw する (設計上の注意を参照)
  async navigate(params: ConnectionParams): Promise<void>;

  // 接続ボタンをクリックする
  // Playwright の `Page.click` の actionability 待機は維持する (接続完了の待機は `waitForConnection` の責務)
  // ConnectButton は `connectionStatus` が `initializing` / `preparing` / `connecting` / `disconnecting` のあいだ disabled。
  // actionability 待機は特に初期の `initializing` → `disconnected` (`setInitialParameter` 完了) までの同期手段でもある。
  // `force: true` や生 DOM click に置き換えない
  async connect(): Promise<void>;

  // 切断ボタンをクリックする (Playwright の `Page.click` の actionability 待機は維持する。切断完了の待機は本メソッドの責務外)
  async disconnect(): Promise<void>;

  // 接続 ID が表示されるまで待機する
  // デフォルト timeout は既存テストの `page.waitForSelector("#local-video-connection-id", { timeout: 5000 })` に合わせ 5000 ms (CODEBASE.md「デバッグについて」の最大 10 秒制約とも整合する)
  async waitForConnection(timeoutMs?: number): Promise<void>;

  // 接続 ID 文字列を取得する。`waitForConnection` 直後に呼ぶ前提
  // 戻り値型 `Promise<string | null>` は既存テストの `page.textContent` をそのまま踏襲する
  async getConnectionId(): Promise<string | null>;
}
```

設計上の注意:

- `page` フィールドは `private readonly` とする。後続 #0038 / #0039 で操作を追加する際は本 Page Object に直接メソッドを追加して拡張する。生の `page` を直接扱いたいテストでは `new DevtoolsPage(page)` と並行して `page` を直接利用する
- セレクタ文字列 (`button[name="connect"]` / `button[name="disconnect"]` / `#local-video-connection-id`) はクラス内の `private static readonly` に 1 箇所集約する
- `navigate` の URL 組み立て規約:
  - `URLSearchParams` に載せるキーは `channelId` / `role` / `signalingUrlCandidates` (`JSON.stringify`) / `metadata` (`JSON.stringify({ access_token: accessToken })`) と、`videoCodecType` が指定されたときのみそのキー。`multistream` は載せない
  - `signalingUrlCandidates` が空配列 (`length === 0`) なら `Error("expected non-empty signalingUrlCandidates, got []")` を throw する。空配列だと `activateEnabledFlags()` が `enabledSignalingUrlCandidates` を立てず、`createSignalingURL` が (`import.meta.env.DEV && import.meta.env.VITE_SORA_SIGNALING_URL` が真なら) `VITE_SORA_SIGNALING_URL`、それ以外は hostname フォールバックに進み、意図しない URL で接続を試みるため
  - 空文字 1 要素 (`[""]`) は throw しない。`parseQueryString` が受理し `activateEnabledFlags` が enabled=true にしたうえで、`createSignalingURL` の `.filter((c) => c !== "")` が `[]` に縮退し、フォールバックせず接続失敗する
  - `metadata` は常に `{ access_token: params.accessToken }` 固定。任意 metadata が必要なテストは後続 issue で型拡張する
  - `videoCodecType` が `undefined` なら URL に乗せない。テンプレでは既存どおり `"VP9"` を明示する
- `getConnectionId()` は既存どおり `page.textContent("#local-video-connection-id")` を使う (Locator API への移行はスコープ外)
- 各テストファイルでは明示 `import { test } from "@playwright/test"` を書く。`tsconfig.json` の `types: ["vite-plus/test/globals"]` によりグローバル `test` が解決されるため、省略すると Playwright の `{ page }` フィクスチャ型と衝突する
- `tests/pages/` / `tests/helpers/` 配下の `*.ts` は Playwright のテスト収集対象にしない (テストファイルは `*.test.ts` のみ)

### `tests/helpers/env.ts` の API 仕様

skip 機構を含まない、純粋な環境変数読み込みヘルパーを定義する。

```typescript
// Sora 接続テストに必要な環境変数を解決した結果
export type SoraConnectionEnv = {
  signalingUrl: string;
  channelIdPrefix: string;
  accessToken: string;
};

// 環境変数を読み込み、必須が未設定なら undefined を返す
// `E2E_TEST_SORA_SIGNALING_URL` のみ必須。`undefined` または空文字を「未設定」とみなす
// `E2E_TEST_SORA_CHANNEL_ID_PREFIX` 未設定時は空文字を既定値とする
// `E2E_TEST_ACCESS_TOKEN` 未設定時は空文字を既定値とする (任意値でよい変数のため、未設定は空文字に正規化する)
export function getSoraConnectionEnv(): SoraConnectionEnv | undefined;
```

設計上の注意:

- `getSoraConnectionEnv()` は副作用なしの純粋関数。`process.env` を読むのみで `test.skip()` 等の Playwright runner 副作用は持たない (副作用を持つ skip ヘルパーは #0063 で `requireSoraConnectionEnv()` として追加する)
- 「未設定」の判定式は `signalingUrl === undefined || signalingUrl === ""` とし、空白文字のみの trim はしない (空白のみの文字列は「設定済み」扱いとなり、接続失敗する)
- `tests/helpers/env.ts` 内では `process.loadEnvFile` を再度呼ばず `process.env` をそのまま読む (環境変数の読み込みは `tests/global-setup.ts` の責務)
- `.env.template` の e2e 用変数名 ( `E2E_TEST_SORA_SIGNALING_URL` / `E2E_TEST_SORA_CHANNEL_ID_PREFIX` / `E2E_TEST_ACCESS_TOKEN` ) と本ヘルパーが読む環境変数名を一致させる
- 本 issue では `env.ts` の単体テストは作成しない (`process.env` 書き換えの影響が大きいため)

### リファクタ後のテストファイルのテンプレート

各ファイル ( `sendrecv.test.ts` / `sendonly.test.ts` / `recvonly.test.ts` ) は以下の構成で揃え、差分はテスト名 / `role` 文字列 / `channelId` の suffix のみとする。3 ファイル構成は維持する。本 issue では skip 機構を含めない。

```typescript
import { test } from "@playwright/test";

import { DevtoolsPage } from "./pages/DevtoolsPage.ts";
import { getSoraConnectionEnv } from "./helpers/env.ts";

test("sendrecv", async ({ page }) => {
  // 環境変数を取得する。未設定時は空文字を含む既定値となり、[""] 経路で接続が失敗する
  const env = getSoraConnectionEnv() ?? {
    signalingUrl: "",
    channelIdPrefix: "",
    accessToken: "",
  };

  const devtools = new DevtoolsPage(page);
  await devtools.navigate({
    role: "sendrecv",
    channelId: `${env.channelIdPrefix}sendrecv`,
    signalingUrlCandidates: [env.signalingUrl],
    accessToken: env.accessToken,
    videoCodecType: "VP9",
  });

  await devtools.connect();
  await devtools.waitForConnection();

  const connectionId = await devtools.getConnectionId();
  console.log("Connection ID:", connectionId);

  await page.waitForTimeout(3000);
  await devtools.disconnect();
});
```

- `sendonly` / `recvonly` 用ファイルはテスト名 ( `"sendonly"` / `"recvonly"` ) / `role` / `channelId` の suffix のみを差し替える
- テスト名は既存の単一 ASCII 文字列を維持し、`pnpm exec playwright test --grep sendrecv` のようなロール別実行との互換性を保つ
- `channelId` の suffix を role 別にするのは、`playwright.config.ts` が `workers: 1` を指定しておらず、別ファイルのテストがワーカー並列で走り得るため (現状すでに必要。`fullyParallel` 有効化時にも有効)
- `new DevtoolsPage(page)` は各 `test()` 内で生成する ( `test.beforeEach` は使わない)

### リファクタに伴う意図した挙動差

Sora 接続成功パス ( `E2E_TEST_SORA_SIGNALING_URL` 設定済み) は既存と同等を維持する。未設定・空文字まわりだけ次の差がある。

| 条件                                         | 現行                                                                     | リファクタ後                                                                |
| -------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `E2E_TEST_SORA_SIGNALING_URL` が `undefined` | `'[null]'` → QS 無視 → OPFS / VITE / hostname フォールバックの可能性あり | `[""]` → enabled=true → filter で `[]` → フォールバックせずタイムアウト失敗 |
| `E2E_TEST_SORA_SIGNALING_URL` が空文字       | 既に `[""]` 経路 (リファクタ後と同じ)                                    | 同じ                                                                        |
| `E2E_TEST_ACCESS_TOKEN` 未設定               | `metadata={}`                                                            | `metadata={"access_token":""}`                                              |
| `E2E_TEST_SORA_CHANNEL_ID_PREFIX` 未設定     | channelId が `"undefinedsendrecv"` 等になる                              | 空文字既定で `"sendrecv"` 等になる                                          |

## 影響範囲

- 新規追加: `tests/pages/DevtoolsPage.ts`
- 新規追加: `tests/helpers/env.ts`
- 修正: `tests/sendrecv.test.ts` / `tests/sendonly.test.ts` / `tests/recvonly.test.ts`
- `CHANGES.md` の空の `## develop` 直下に `### misc` を新設し、その中に `[ADD] e2e テストに Page Object Model と環境変数読み込みヘルパーを導入する` を追記する。エントリの次行に `- @voluntas` を付ける。`## 2026.1.0` 配下には触れない。ブランチは `feature/refactor-` のまま、changelog 種別は導入として `### misc` の `[ADD]` とする

## 完了条件

### 静的検証

- `tests/pages/DevtoolsPage.ts` が上記 API 仕様に従って実装され、各メソッドに日本語コメントが付与されている
- `tests/helpers/env.ts` が named export するのは `SoraConnectionEnv` 型と `getSoraConnectionEnv()` のみとする。`requireSoraConnectionEnv` / `test` / `test.skip` 等 Playwright runner の副作用を持つ API は export しない
- `tests/helpers/env.ts` / `tests/pages/DevtoolsPage.ts` の実装で non-null assertion ( `!` ) や `as` キャストを使わない
- `tests/` 配下から `src/` 配下への import を行っていない
  - `grep -rE "from ['\"](@/|(\\.\\./)+src/)" tests/pages/ tests/helpers/ tests/sendrecv.test.ts tests/sendonly.test.ts tests/recvonly.test.ts` が 0 件
- 既存 3 テストファイルが上記テンプレートに揃い、差分はテスト名 / `role` / `channelId` の suffix のみとなる
- 3 テストファイルから `multistream: "true"` と `// TODO: 複数に対応したい` が削除されている
- `vp check` が通過すること
- `vp test run` が通過すること (既存単体テストへの影響なし)

### 動的検証

- `.env.local` に `E2E_TEST_SORA_SIGNALING_URL` を設定した状態で `pnpm test:e2e` を実行したとき、Sora 依存テスト 3 件が通過すること
- 上記環境で、本 issue が触らない `noise-suppression-lazy-load.test.ts` と `mp4-media-stream-lazy-load.test.ts` の通過状態がリファクタ前後で変わらないこと (回帰確認)
- `E2E_TEST_SORA_SIGNALING_URL` 未設定 (または空文字) では Sora 依存テスト 3 件が `waitForConnection` のタイムアウトで失敗すること。`.env.local` に有効な `VITE_SORA_SIGNALING_URL` があってもフォールバック接続で成功してはならない
- 「未設定」の再現は次のいずれかとする。`env -u E2E_TEST_SORA_SIGNALING_URL` だけでは不十分 (`global-setup.ts` の `loadEnvFile` が `.env.local` から再注入する)
  - シェルで空文字を先に渡す: `E2E_TEST_SORA_SIGNALING_URL= pnpm test:e2e -- --grep 'sendrecv|sendonly|recvonly'`
  - または一時的に `.env.local` から当該行を除去する

## 解決方法

1. `tests/helpers/env.ts` を新規作成し、上記 API 仕様どおり `getSoraConnectionEnv()` を実装する
2. `tests/pages/DevtoolsPage.ts` を新規作成し、上記 API 仕様どおり `navigate` / `connect` / `disconnect` / `waitForConnection` / `getConnectionId` を実装する。`navigate` は `page.goto` を使う
3. `tests/sendrecv.test.ts` / `tests/sendonly.test.ts` / `tests/recvonly.test.ts` を上記テンプレートに置き換える (差分はテスト名 / `role` / `channelId` suffix のみ)
4. `CHANGES.md` の `## develop` に `### misc` を新設し、`[ADD]` エントリと担当者行を追記する
5. `vp check` / `vp test run` / `pnpm test:e2e` (設定あり・なし) で完了条件を確認する

## エッジケース

- `E2E_TEST_SORA_SIGNALING_URL` が空白のみ: trim しないため「設定済み」扱い。無効 URL として接続失敗する
- 未設定・空文字・accessToken・channelIdPrefix の差分は「リファクタに伴う意図した挙動差」表を正とする

## 依存

- `@playwright/test` のバージョンは `package.json` を正とする (執筆時点で `1.61.1`)
- skip 機構の追加は本 issue 完了後の #0063 で行う。#0063 で `tests/helpers/env.ts` に `requireSoraConnectionEnv()` を追加し、各テストファイルの `getSoraConnectionEnv() ?? {...}` を `requireSoraConnectionEnv()` 呼び出しに置き換える
