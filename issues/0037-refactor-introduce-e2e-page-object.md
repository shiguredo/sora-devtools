# 0037 e2e テストに Page Object Model を導入する

- Priority: High
- Created: 2026-06-08
- Completed: {YYYY-MM-DD}
- Model: DeepSeek V4 Pro
- Branch: feature/refactor-introduce-e2e-page-object
- Polished: 2026-06-12

## 目的

Playwright e2e テストに Page Object Model (POM) と環境変数読み込みヘルパーを導入し、`sendrecv` / `sendonly` / `recvonly` の 3 テストに散在するセレクタ・URL 組み立てロジック・環境変数読み込みを共通化する。

## 優先度根拠

後続の e2e テスト追加 (#0038, #0039) は本 issue が定義する `DevtoolsPage` を拡張・利用する前提で書かれているため、先に基盤を整備する必要がある。

導入メリット:

1. セレクタ ( `button[name="connect"]` / `button[name="disconnect"]` / `#local-video-connection-id` ) を Page Object に集約することで、DOM 変更時の修正範囲をテストファイル横断ではなく 1 箇所に限定できる
2. `connect()` / `waitForConnection()` 等の操作粒度を上げることで、後続テスト追加時のボイラープレートを削減できる

## 現状

- `tests/sendrecv.test.ts` / `tests/sendonly.test.ts` / `tests/recvonly.test.ts` の 3 ファイルは、以下の 3 箇所のみが差分で、それ以外は完全に同一のコード
  - `test()` の第 1 引数のテスト名 ( `"sendrecv"` / `"sendonly"` / `"recvonly"` )
  - `channelId` の suffix ( `${channelIdPrefix}sendrecv` 等)
  - URLSearchParams の `role` 値
- 各テストファイルに以下 3 種類のセレクタがハードコードされている
  - `button[name="connect"]`
  - `button[name="disconnect"]`
  - `#local-video-connection-id`
- 既存 3 テストは URLSearchParams に `multistream: "true"` を渡しているが、`src/utils.ts` の `parseQueryString` は `multistream` キーを読まないため URL に乗せても無視される (Sora 側挙動には影響しない)
- `tests/` 配下の共通モジュールは `global-setup.ts` ( `dotenv` で `.env.local` を読み込むのみ) と `fixtures/` ( MP4 テスト用バイナリ) で、テスト本体で再利用できるヘルパーや Page Object は存在しない
- `E2E_TEST_SORA_SIGNALING_URL` のみが e2e テストの必須環境変数で、未設定時は接続待ちでタイムアウトして 3 テストすべてが失敗する (skip 機構は本 issue のスコープ外。#0063 で対応する)

## 設計方針

### スコープ

本 issue は以下のみを対象とする。

- `tests/pages/DevtoolsPage.ts` の新規作成 (Sora 接続フローの最小 API)
- `tests/helpers/env.ts` の新規作成 (環境変数読み込みヘルパー。skip 機構は含めない)
- 既存 3 テストファイルのリファクタリング

以下はスコープ外とする。

- 未設定時の skip 機構の追加 (これは「環境変数未設定なら失敗する」という既存挙動を変える新規機能のため、別 issue #0063 で扱う)
- `tests/noise-suppression-lazy-load.test.ts` / `tests/mp4-media-stream-lazy-load.test.ts` への Page Object 適用
- `tests/global-setup.ts` の変更 (現状の `dotenv.config({ path: ".env.local" })` 読み込みをそのまま使う)
- `playwright.config.ts` の変更 ( `webServer` / `globalSetup` / `use.baseURL` の変更も、コメントアウト状態の `fullyParallel` を有効化することもしない)
- 既存テストの `page.waitForTimeout(3000)` や `console.log("Connection ID:", connectionId)` の削減
- URL に乗せるパラメータの値・有無の変更 (ただし `parseQueryString` が読まない `multistream` URL パラメータは出力に含めないことを許容する。Sora 側挙動には影響しないため)
- Page Object のメソッド追加 (Copy URL ボタン操作・Collapse 開閉・ロール切替などの UI 操作は #0038 / #0039 で同 Page Object を拡張する形で追加する)
- `tests/` 配下から `@/` パスエイリアス ( `tsconfig.json` で `./src/*` に解決される) や相対パスでの `src/` 参照 (Page Object の独立性を保ち、上流の型変更による e2e への影響を局所化するため)

モックやスタブは一切利用しない (Page Object は実 DOM 操作のラッパーであり、モックではない)。

### `tests/pages/DevtoolsPage.ts` の API 仕様

```typescript
import type { Page } from "@playwright/test";

// e2e テストで扱う接続ロール
// 上流の型変更による e2e テストへの影響を局所化するため、sora-js-sdk や src/constants.ts の ROLES から借りず Page Object 内で独立定義する
export type Role = "sendrecv" | "sendonly" | "recvonly";

// e2e テストで指定可能な動画コーデック
// src/constants.ts の VIDEO_CODEC_TYPES と一致させる (空文字は除外)
export type VideoCodecType = "VP8" | "VP9" | "H264" | "H265" | "AV1";

// Devtools ページに渡す接続パラメータ
// signalingUrlCandidates / metadata の JSON 化は本 Page Object の navigate 内で行う
// parseQueryString が受け付けないキー (multistream 等) は意図的に含めない
export type ConnectionParams = {
  role: Role;
  channelId: string;
  signalingUrlCandidates: string[];
  accessToken: string;
  videoCodecType?: VideoCodecType;
};

// Devtools ページの操作をカプセル化する Page Object
export class DevtoolsPage {
  // 既存テストと同じくベース URL はクラス内に集約する
  // 別 issue (未起票) で playwright.config.ts の use.baseURL を導入する際に本定数は削除する
  // navigate 内では DevtoolsPage.DEVTOOLS_URL で参照する (static メンバのため this. では不可)
  private static readonly DEVTOOLS_URL = "http://localhost:3333/devtools/";

  constructor(private readonly page: Page) {}

  // 論理パラメータを URLSearchParams に組み立てて遷移する
  // signalingUrlCandidates が空配列なら Error を throw する (設計上の注意を参照)
  async navigate(params: ConnectionParams): Promise<void>;

  // 接続ボタンをクリックする (待機はしない)
  async connect(): Promise<void>;

  // 切断ボタンをクリックする (待機はしない)
  async disconnect(): Promise<void>;

  // 接続 ID が表示されるまで待機する
  // デフォルト timeout は CLAUDE.md の制約 (最大 10 秒) と既存テストに合わせ 5000 ms
  async waitForConnection(timeoutMs?: number): Promise<void>;

  // 接続 ID 文字列を取得する。waitForConnection 直後に呼ぶ前提のため通常は string が返る
  // 戻り値型 Promise<string | null> は既存テストの page.textContent をそのまま踏襲する
  async getConnectionId(): Promise<string | null>;
}
```

設計上の注意:

- `navigate` の URL 組み立て規約 (Sora 接続に影響する範囲で既存挙動を維持する):
  - `signalingUrlCandidates: string[]` は `JSON.stringify(params.signalingUrlCandidates)` で URL パラメータ化する。空配列を受け取った場合は `Error("signalingUrlCandidates must not be empty")` を throw する (空配列だと `src/app/actions.ts` の `enabledSignalingUrlCandidates` が false のままになり `VITE_SORA_SIGNALING_URL` 等にフォールバックしてしまうため)
  - `metadata` は常に `JSON.stringify({ access_token: params.accessToken })` で URL に乗せる ( `accessToken` が空文字の場合も `{"access_token":""}` を URL に含める)。既存テスト 3 ファイルが `JSON.stringify({ access_token: accessToken })` を常に URL に乗せていた挙動と一致させるため
  - `videoCodecType` が `undefined` の場合は URL に乗せない (未指定だとブラウザ環境依存で値が変動するため、既存挙動を維持するためテンプレートでは `"VP9"` を明示する)
- `getConnectionId()` は既存テストの振る舞いを踏襲するため `page.textContent("#local-video-connection-id")` を使う (Locator API への移行は本 issue のスコープ外)
- 各ファイルの import 方針:
  - `tests/pages/DevtoolsPage.ts`: `import type { Page } from "@playwright/test"` のみ ( `test` は使わない)
  - `tests/helpers/env.ts`: `import` 不要 ( `process.env` のみを参照)
  - 各テストファイル: `import { test } from "@playwright/test"` を実値で import
  - `tsconfig.json` の `types: ["vitest/globals"]` でグローバル `test` が暗黙に解決されるが、vitest 版は Playwright 版とシグネチャが異なるため、各テストファイルでは必ず明示 `import { test } from "@playwright/test"` を書く
- すべてのメソッドに日本語コメントを付ける (CLAUDE.md「テストはコメントを重視する」「コメントは全て日本語」)
- メソッドが投げるエラーメッセージは英語、末尾ピリオドなし、期待値と実際値を含める (CLAUDE.md エラーメッセージ規約)

### `tests/helpers/env.ts` の API 仕様

skip 機構を含まない、純粋な環境変数読み込みヘルパーを定義する (skip 機構の追加は #0063 で行う)。

```typescript
// Sora 接続テストに必要な環境変数を解決した結果
export type SoraConnectionEnv = {
  signalingUrl: string;
  channelIdPrefix: string;
  accessToken: string;
};

// 環境変数を読み込み、必須が未設定なら undefined を返す
// `E2E_TEST_SORA_SIGNALING_URL` のみ必須。undefined または空文字を「未設定」とみなす
// `E2E_TEST_SORA_CHANNEL_ID_PREFIX` 未設定時は空文字を既定値とする
// `E2E_TEST_ACCESS_TOKEN` 未設定時は空文字を既定値とする (.env.template の説明に従う)
export function getSoraConnectionEnv(): SoraConnectionEnv | undefined;
```

設計上の注意:

- `getSoraConnectionEnv()` は副作用なしの純粋関数。`process.env` を読むのみで `test.skip()` 等の Playwright runner 副作用は持たない (副作用を持つ skip ヘルパーは #0063 で `requireSoraConnectionEnv()` として追加する)
- `.env.local` が無い場合 `dotenv` は silently 失敗し `process.env` への書き込みが行われない ( `process.env.E2E_TEST_SORA_SIGNALING_URL` が `undefined` のまま) ため、未設定時は `getSoraConnectionEnv()` が `undefined` を返す
- `tests/helpers/env.ts` 内では再度 `dotenv.config` を呼ばず `process.env` をそのまま読む

### リファクタ後のテストファイルのテンプレート

各ファイル ( `sendrecv.test.ts` / `sendonly.test.ts` / `recvonly.test.ts` ) は以下の構成で揃え、差分は `role` 文字列 / `channelId` の suffix / テスト名のロール部のみとする。3 ファイル構成は維持する。本 issue では skip 機構を含めないため、環境変数未設定時はテンプレ内で空文字フォールバックを使い、既存挙動 (接続待ちでタイムアウト失敗) を維持する (skip 機構の追加は #0063)。

```typescript
import { test } from "@playwright/test";

import { DevtoolsPage } from "./pages/DevtoolsPage.ts";
import { getSoraConnectionEnv } from "./helpers/env.ts";

test("sendrecv: Sora に接続し connection ID が表示される", async ({ page }) => {
  // 環境変数を取得する。未設定時は空文字を含む既定値となり、既存挙動どおり接続が失敗する
  // skip 機構は #0063 で追加する
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

- `sendonly` / `recvonly` 用ファイルはテスト名のロール部 / `role` / `channelId` の suffix のみを差し替える
- テスト名の先頭にロール名 ( `sendrecv:` 等) を ASCII で残し、`pnpm exec playwright test --grep sendrecv` のようなロール別実行との互換性を維持する
- `channelId` の suffix を role 別 ( `sendrecv` / `sendonly` / `recvonly` ) にしているのは Playwright のファイル間並列実行で channel が衝突しないようにするため

## 影響範囲

- 新規追加: `tests/pages/DevtoolsPage.ts`
- 新規追加: `tests/helpers/env.ts`
- 修正: `tests/sendrecv.test.ts` / `tests/sendonly.test.ts` / `tests/recvonly.test.ts`
- `CHANGES.md` の `## develop` セクション内 `### misc` サブセクションに `[UPDATE] e2e テストに Page Object Model を導入して既存接続テストの重複を解消する` のエントリを追加する

## 完了条件

### 静的検証

- `tests/pages/DevtoolsPage.ts` が上記 API 仕様に従って実装され、各メソッドに日本語コメントが付与されている
- `tests/helpers/env.ts` が `getSoraConnectionEnv()` のみを export しており、`test` / `test.skip` 等 Playwright runner の副作用を一切持たない
- `tests/helpers/env.ts` / `tests/pages/DevtoolsPage.ts` の実装で non-null assertion ( `!` ) や `as` キャストを使わない
- `tests/` 配下から `src/` 配下への import を行っていない ( `grep -rE '@/|\.\./src/' tests/pages/ tests/helpers/ tests/sendrecv.test.ts tests/sendonly.test.ts tests/recvonly.test.ts` が 0 件)
- 既存 3 テストファイルが上記テンプレートに揃い、差分は `role` / `channelId` の suffix / テスト名のロール部のみとなる
- `pnpm check` が通過すること ( `vp check` は format 検証・lint・型チェックをまとめて実行する)
- `pnpm test` が通過すること (既存単体テストへの影響なし)

### 動的検証

- `.env.local` に `E2E_TEST_SORA_SIGNALING_URL` を設定した状態で `pnpm test:e2e` を実行したとき、Sora 依存テスト 3 件が通過すること
- 上記環境で、本 issue が触らない `noise-suppression-lazy-load.test.ts` と `mp4-media-stream-lazy-load.test.ts` の通過状態がリファクタ前後で変わらないこと (回帰確認)
- `.env.local` に `E2E_TEST_SORA_SIGNALING_URL` が未設定の状態では Sora 依存テスト 3 件が既存と同じくタイムアウト失敗すること (skip 機構の導入は #0063 で行うため、本 issue では失敗のまま維持される)

## エッジケース

- `E2E_TEST_SORA_SIGNALING_URL` が `undefined` または空文字: `getSoraConnectionEnv()` が `undefined` を返し、テンプレの `??` フォールバックで `signalingUrl: ""` となり、接続待ちでタイムアウト失敗 (既存挙動と同じ)
- `E2E_TEST_SORA_CHANNEL_ID_PREFIX` 未設定: 空文字を既定値とし、テストは継続する
- `E2E_TEST_ACCESS_TOKEN` 未設定または空文字: 空文字を `SoraConnectionEnv.accessToken` に格納する ( `navigate` 内の `metadata` 組み立ては設計上の注意を参照)

## 依存

- `@playwright/test` 1.60.0 ( `package.json` 参照)
- skip 機構の追加は本 issue 完了後の #0063 で行う。#0063 で `tests/helpers/env.ts` に `requireSoraConnectionEnv()` を追加し、各テストファイルの `getSoraConnectionEnv() ?? {...}` を `requireSoraConnectionEnv()` 呼び出しに置き換える
