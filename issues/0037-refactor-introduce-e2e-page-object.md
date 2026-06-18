# 0037 e2e テストに Page Object Model を導入する

- Priority: High
- Created: 2026-06-08
- Completed: {YYYY-MM-DD}
- Model: DeepSeek V4 Pro
- Branch: feature/refactor-introduce-e2e-page-object
- Polished: 2026-06-15

## 目的

Playwright e2e テストに Page Object Model (POM) と環境変数読み込みヘルパーを導入し、`sendrecv` / `sendonly` / `recvonly` の 3 テストに散在するセレクタ・URL 組み立てロジック・環境変数読み込みを共通化する。

## 優先度根拠

本 issue は後続 e2e テスト追加 (#0038, #0039) のブロッカーであるため High。両 issue は本 issue が定義する `DevtoolsPage` を拡張・利用する前提で書かれており、先に基盤を整備する必要がある。

導入メリット:

1. セレクタ ( `button[name="connect"]` / `button[name="disconnect"]` / `#local-video-connection-id` ) を Page Object に集約することで、DOM 変更時の修正範囲をテストファイル横断ではなく 1 箇所に限定できる
2. `connect()` / `waitForConnection()` 等の操作粒度を上げることで、後続テスト追加時のボイラープレートを削減できる

## 現状

- `tests/sendrecv.test.ts` / `tests/sendonly.test.ts` / `tests/recvonly.test.ts` の 3 ファイルは、以下の 3 箇所のみが差分で、それ以外はコメントまで含め完全に同一のコード
  - `test()` の第 1 引数のテスト名 ( `"sendrecv"` / `"sendonly"` / `"recvonly"` )
  - `channelId` の suffix ( `${channelIdPrefix}sendrecv` 等)
  - URLSearchParams の `role` 値
- 各テストファイルに以下 3 種類のセレクタがハードコードされている
  - `button[name="connect"]`
  - `button[name="disconnect"]`
  - `#local-video-connection-id`
- 既存 3 テストは URLSearchParams に `multistream: "true"` を渡しているが、`src/utils.ts` の `parseQueryString` (L90-260) はキーをホワイトリスト形式で個別に読み込んでおり `multistream` キーを参照しないため、URL に乗せても黙って無視される (Sora 側挙動には影響しないデッドパラメータ)
- `tests/` 配下の共通モジュールは `tests/global-setup.ts` ( Node.js 標準 API の `process.loadEnvFile(envPath)` で `.env.local` を読み込む。CI 環境では `.env.local` が無いため `fs.existsSync(envPath)` で存在確認してから呼び出しをスキップする) と `tests/fixtures/` ( MP4 テスト用バイナリ) のみで、テスト本体で再利用できる Page Object や環境変数ヘルパーは存在しない
- `E2E_TEST_SORA_SIGNALING_URL` のみが e2e テストの必須環境変数で、未設定時は接続待ちでタイムアウトして 3 テストすべてが失敗する (skip 機構の追加は本 issue のスコープ外。#0063 で扱う)

## 設計方針

### スコープ

本 issue は以下のみを対象とする。

- `tests/pages/DevtoolsPage.ts` の新規作成 (Sora 接続フローの最小 API)
- `tests/helpers/env.ts` の新規作成 (環境変数読み込みヘルパー)
- 既存 3 テストファイル ( `sendrecv.test.ts` / `sendonly.test.ts` / `recvonly.test.ts` ) のリファクタリング
- 既存テストが渡している無効な `multistream: "true"` URL パラメータの削除 ( `parseQueryString` が読まないデッドパラメータの除去であり、リファクタの一環として扱う。Sora 側挙動には影響しない)

以下はスコープ外とする。

- 未設定時の skip 機構の追加 (#0063 で扱う)
- `tests/noise-suppression-lazy-load.test.ts` / `tests/mp4-media-stream-lazy-load.test.ts` への Page Object 適用
- `tests/global-setup.ts` の変更 (現状の `process.loadEnvFile(envPath)` + `fs.existsSync` ガードをそのまま使う)
- `playwright.config.ts` の変更 ( `webServer` / `globalSetup` / `use.baseURL` / `fullyParallel` のいずれも本 issue では変更しない)
- 既存テストの `page.waitForTimeout(3000)` の削減 (sleep ではなく signal ベースの待機に置き換えるのが理想だが、現テンプレが Sora 側との通信状態を可視化する手段を持たないため別 issue で扱う)
- `console.log("Connection ID:", connectionId)` の日本語化 (CLAUDE.md「テストのログメッセージは全て日本語にすること」との不整合は別 issue で扱う。本 issue では既存挙動を維持する)
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
// `src/constants.ts` の `VIDEO_CODEC_TYPES` から空文字を除いた値を採用する
// 空文字 (= 未指定扱い) を URL に乗せたい場合は `videoCodecType: undefined` を使う
export type VideoCodecType = "VP8" | "VP9" | "H264" | "H265" | "AV1";

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
  private static readonly DEVTOOLS_URL = "http://localhost:3333/devtools/";

  constructor(private readonly page: Page) {}

  // 論理パラメータを URLSearchParams に組み立てて遷移する
  // `signalingUrlCandidates` が空配列なら Error を throw する (設計上の注意を参照)
  async navigate(params: ConnectionParams): Promise<void>;

  // 接続ボタンをクリックする (Playwright の `Page.click` の actionability 待機は維持する。接続完了の待機は `waitForConnection` の責務)
  async connect(): Promise<void>;

  // 切断ボタンをクリックする (Playwright の `Page.click` の actionability 待機は維持する。切断完了の待機は本メソッドの責務外)
  async disconnect(): Promise<void>;

  // 接続 ID が表示されるまで待機する
  // デフォルト timeout は既存テストの `page.waitForSelector("#local-video-connection-id", { timeout: 5000 })` に合わせ 5000 ms (CODEBASE.md「デバッグについて」の最大 10 秒制約とも整合する)
  async waitForConnection(timeoutMs?: number): Promise<void>;

  // 接続 ID 文字列を取得する。`waitForConnection` 直後に呼ぶ前提のため通常は string が返る
  // 戻り値型 `Promise<string | null>` は既存テストの `page.textContent` をそのまま踏襲する
  // `null` が返るのは要素は存在するが `textContent` が `null` のケースのみ
  async getConnectionId(): Promise<string | null>;
}
```

設計上の注意:

- `page` フィールドは `private readonly` とする。後続 #0038 / #0039 で操作を追加する際は本 Page Object に直接メソッドを追加して拡張する (サブクラス化はしない。`page` を `protected` 化する必要はない)。生の `page` を直接扱いたいテスト ( ネットワークイベント購読等 ) では `new DevtoolsPage(page)` と並行して `page` を直接利用する。
- `navigate` の URL 組み立て規約 (Sora 接続に影響する範囲で既存挙動を維持する):
  - `signalingUrlCandidates: string[]` は `JSON.stringify(params.signalingUrlCandidates)` で URL パラメータ化する。空配列 (`length === 0`) を受け取った場合は `Error("signalingUrlCandidates must not be empty, got an empty array")` を throw する。空配列だと `src/app/actions.ts` の `activateEnabledFlags()` (L303-305) が `enabledSignalingUrlCandidates` を `true` に切り替えず、`src/utils.ts` の `createSignalingURL` (L263-277) が dev 環境 ( `import.meta.env.DEV && import.meta.env.VITE_SORA_SIGNALING_URL` が真) では `.env.local` の `VITE_SORA_SIGNALING_URL` に、本番では `${location.protocol}//${location.hostname}:${port}/signaling` にフォールバックしてしまい、テストが意図しないシグナリング URL で接続を試みるため。
  - 空配列ではなく空文字を 1 要素持つ配列 (`[""]`) は `navigate` 側では throw しない。`parseQueryString` が `[""]` を受け取り、`createSignalingURL` 内の `.filter((c) => c !== "")` で空配列に縮退するため、結果として Sora 接続が空配列の `signalingUrlCandidates` で失敗し `waitForConnection` のセレクタ待ちがタイムアウトする (詳細はエッジケースを参照)。
  - `metadata` は常に `JSON.stringify({ access_token: params.accessToken })` で URL に乗せる。`accessToken` が空文字なら `{"access_token":""}` を出力する。既存テスト 3 ファイルは `process.env.E2E_TEST_ACCESS_TOKEN` が `undefined` の場合 `JSON.stringify({ access_token: undefined })` で `{}` を生成していたため、`E2E_TEST_ACCESS_TOKEN` が未設定の場合の挙動はリファクタ後 ( `{"access_token":""}` ) と厳密には異なる。`.env.local` または `.env.template` の `E2E_TEST_ACCESS_TOKEN` が設定されている前提では同じ挙動となるが、未設定環境では Sora 側に届く `metadata` 形が変わる点を承知のうえで採用する。
  - `videoCodecType` が `undefined` の場合は URL に乗せない。既存テスト 3 ファイルが常に `videoCodecType: "VP9"` を渡していたため、テンプレでは既存挙動を踏襲して `"VP9"` を明示する。
- `getConnectionId()` は既存テストの振る舞いを踏襲するため `page.textContent("#local-video-connection-id")` を使う (Locator API への移行は本 issue のスコープ外)。
- 各テストファイル ( `*.test.ts` ) では必ず明示 `import { test } from "@playwright/test"` を書く。`tsconfig.json` の `types: ["vitest/globals"]` でグローバル `test` が型レベルで解決されてしまい、明示 import を省略すると `{ page }` フィクスチャ注入が vitest 版の型でマッチして型エラーとなるため、Playwright 版で型を上書きする必要がある (`tests/pages/DevtoolsPage.ts` は `test` を import しないため衝突しない)。

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
// `E2E_TEST_ACCESS_TOKEN` 未設定時は空文字を既定値とする (`.env.template` の説明に従う)
export function getSoraConnectionEnv(): SoraConnectionEnv | undefined;
```

設計上の注意:

- `getSoraConnectionEnv()` は副作用なしの純粋関数。`process.env` を読むのみで `test.skip()` 等の Playwright runner 副作用は持たない (副作用を持つ skip ヘルパーは #0063 で `requireSoraConnectionEnv()` として追加する)
- 「未設定」の判定式は `signalingUrl === undefined || signalingUrl === ""` とし、空白文字のみの trim はしない
- `tests/helpers/env.ts` 内では `process.loadEnvFile` を再度呼ばず `process.env` をそのまま読む (環境変数の読み込みは `tests/global-setup.ts` の責務)
- `.env.template` の e2e 用変数名 ( `E2E_TEST_SORA_SIGNALING_URL` / `E2E_TEST_SORA_CHANNEL_ID_PREFIX` / `E2E_TEST_ACCESS_TOKEN` ) と本ヘルパーが読む環境変数名を一致させる
- 本ヘルパー自体は DOM や Playwright API に依存しないため Vitest による単体テスト ( `tests/helpers/env.test.ts` ) を書くこともできるが、`process.env` をテスト中に書き換える形になり影響範囲が大きいため、本 issue では単体テストは作成せず e2e テスト実行時の動作確認のみとする

### リファクタ後のテストファイルのテンプレート

各ファイル ( `sendrecv.test.ts` / `sendonly.test.ts` / `recvonly.test.ts` ) は以下の構成で揃え、差分はテスト名 / `role` 文字列 / `channelId` の suffix のみとする。3 ファイル構成は維持する。本 issue では skip 機構を含めないため、環境変数未設定時はテンプレ内で空文字フォールバックを使い、既存挙動 (接続待ちでタイムアウト失敗) を維持する。

```typescript
import { test } from "@playwright/test";

import { DevtoolsPage } from "./pages/DevtoolsPage.ts";
import { getSoraConnectionEnv } from "./helpers/env.ts";

test("sendrecv", async ({ page }) => {
  // 環境変数を取得する。未設定時は空文字を含む既定値となり、既存挙動どおり接続が失敗する
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
- テスト名は既存の単一 ASCII 文字列 ( `"sendrecv"` / `"sendonly"` / `"recvonly"` ) をそのまま維持し、`pnpm exec playwright test --grep sendrecv` のようなロール別実行との互換性を保つ
- `channelId` の suffix を role 別 ( `sendrecv` / `sendonly` / `recvonly` ) にしているのは、将来 `fullyParallel` を有効化した際の channel 衝突を防ぐため
- `new DevtoolsPage(page)` は各 `test()` 内で生成する ( `test.beforeEach` は使わない)

## 影響範囲

- 新規追加: `tests/pages/DevtoolsPage.ts`
- 新規追加: `tests/helpers/env.ts`
- 修正: `tests/sendrecv.test.ts` / `tests/sendonly.test.ts` / `tests/recvonly.test.ts` ( 3 ファイルから `multistream: "true"` パラメータも削除する)
- `CHANGES.md` の `## develop` 配下の `### misc` サブセクション内で、種別順 (CHANGE → ADD → UPDATE → FIX) を守って既存の `[ADD] prek ...` の直後 (現状の `[UPDATE] vite-plus ...` の前) に `[ADD] e2e テストに Page Object Model と環境変数読み込みヘルパーを導入する` を追記する ( `### misc` は `## develop` 配下に既に存在する。`shiguredo-changelog` スキル参照)

## 完了条件

### 静的検証

- `tests/pages/DevtoolsPage.ts` が上記 API 仕様に従って実装され、各メソッドに日本語コメントが付与されている
- `tests/helpers/env.ts` が `getSoraConnectionEnv()` のみを export しており、`test` / `test.skip` 等 Playwright runner の副作用を一切持たない
- `tests/helpers/env.ts` / `tests/pages/DevtoolsPage.ts` の実装で non-null assertion ( `!` ) や `as` キャストを使わない
- `tests/` 配下から `src/` 配下への import を行っていない
  - `grep -rE "from ['\"](@/|(\\.\\./)+src/)" tests/pages/ tests/helpers/ tests/sendrecv.test.ts tests/sendonly.test.ts tests/recvonly.test.ts` が 0 件
- 既存 3 テストファイルが上記テンプレートに揃い、差分はテスト名 / `role` / `channelId` の suffix のみとなる
- 3 テストファイルから `multistream: "true"` パラメータが削除されている (`grep -n 'multistream' tests/sendrecv.test.ts tests/sendonly.test.ts tests/recvonly.test.ts` が 0 件)
- `pnpm check` が通過すること
- `pnpm test` が通過すること (既存単体テストへの影響なし)

### 動的検証

- `.env.local` に `E2E_TEST_SORA_SIGNALING_URL` を設定した状態で `pnpm test:e2e` を実行したとき、Sora 依存テスト 3 件が通過すること
- 上記環境で、本 issue が触らない `noise-suppression-lazy-load.test.ts` と `mp4-media-stream-lazy-load.test.ts` の通過状態がリファクタ前後で変わらないこと (回帰確認)
- `.env.local` に `E2E_TEST_SORA_SIGNALING_URL` が未設定の状態では Sora 依存テスト 3 件が既存と同じく接続待ちでタイムアウト失敗すること (skip 機構の導入は #0063 で行うため、本 issue では失敗のまま維持される)

## エッジケース

- `E2E_TEST_SORA_SIGNALING_URL` が `undefined` または空文字: `getSoraConnectionEnv()` が `undefined` を返し、テンプレの `??` フォールバックで `signalingUrl: ""` となる。`navigate` には `signalingUrlCandidates: [""]` が渡され、空配列ではないため `navigate` は throw しない。URL 上の `signalingUrlCandidates` は `JSON.stringify([""])` で `'[""]'` 文字列となり、`parseQueryString` (`src/utils.ts` L90-260) が `[""]` 配列を `signalingUrlCandidates` 信号にセット、`activateEnabledFlags()` が `signalingUrlCandidates.value.length > 0` を満たし `enabledSignalingUrlCandidates` を `true` に切り替えるが、`createSignalingURL` (`src/utils.ts` L263-277) 内の `.filter((c) => c !== "")` で空配列に縮退、Sora 接続要求が空配列の `signalingUrlCandidates` で失敗し `waitForConnection` のセレクタ待ちがタイムアウトする (既存テストの `signalingUrl=undefined` 時の `JSON.stringify([undefined])` → `'[null]'` URL とは入口の経路が異なるが、最終的に Sora 接続が成立せず `waitForConnection` がタイムアウトする点は同じ)
- `E2E_TEST_SORA_CHANNEL_ID_PREFIX` 未設定: 空文字を既定値とし、テストは継続する
- `E2E_TEST_ACCESS_TOKEN` 未設定または空文字: 空文字を `SoraConnectionEnv.accessToken` に格納する ( `navigate` 内の `metadata` 組み立ては設計上の注意を参照。リファクタ前は `metadata={}`、リファクタ後は `metadata={"access_token":""}` となり Sora 側に届く形が変わる)

## 依存

- `@playwright/test` 1.60.0 ( `package.json` 参照)
- skip 機構の追加は本 issue 完了後の #0063 で行う。#0063 で `tests/helpers/env.ts` に `requireSoraConnectionEnv()` を追加し、各テストファイルの `getSoraConnectionEnv() ?? {...}` を `requireSoraConnectionEnv()` 呼び出しに置き換える
