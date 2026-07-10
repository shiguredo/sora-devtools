# 0063 e2e テストで環境変数未設定時に即座に失敗させる

- Priority: High
- Created: 2026-06-12
- Completed: 2026-07-10
- Model: Opus 4.7
- Branch: feature/add-e2e-skip-when-sora-env-missing
- Polished: 2026-07-10

## 目的

`E2E_TEST_SORA_SIGNALING_URL` が未設定 (または空文字) のとき、Sora 依存テスト 3 件 ( `sendrecv` / `sendonly` / `recvonly` ) を接続待ちタイムアウトではなく、テスト先頭で `Error` を throw して即座に失敗させる。未設定を skip で隠さず、ローカル / CI のどちらでも設定漏れに気付けるようにする。

本 issue が解決しないこと: 環境変数は設定済みだが Sora プロセスが落ちている / 到達不能なときの失敗。その場合は従来どおり接続待ちタイムアウトで fail する。

## 優先度根拠

- #0039 / #0065 / #0066 が Sora 接続 e2e の基盤として #0037 → #0063 を前提としている
- #0037 の `getSoraConnectionEnv()` の上に `requireSoraConnectionEnv()` を足すだけの差分で、未設定時の失敗理由を明確にできる
- skip だと Playwright が exit code 0 のまま終わり、設定漏れを見逃す。未設定はエラーであるべき

## 現状

- 本 issue は **#0037 マージ後** の状態を前提とする (直列実行 0037 → 0063)
- #0037 完了後、`tests/helpers/env.ts` に `getSoraConnectionEnv(): SoraConnectionEnv | undefined` (副作用なし) がある
- #0037 完了後、各テストは `const env = getSoraConnectionEnv() ?? { signalingUrl: "", channelIdPrefix: "", accessToken: "" }` を使う。未設定時は `signalingUrlCandidates: [""]` 経由でフォールバックせず `waitForConnection` がタイムアウト失敗する
- タイムアウト失敗だと「接続できない」ように見え、必須環境変数の未設定という原因が分かりにくい

## 設計方針

### スコープ

本 issue は以下のみを対象とする。

- `tests/helpers/env.ts` に `requireSoraConnectionEnv()` を追加する
- 既存 3 テストファイルの `const env = getSoraConnectionEnv() ?? {...}` を `const env = requireSoraConnectionEnv()` に置き換える
- #0037 がロックした export 面を拡張し、named export に `requireSoraConnectionEnv()` を追加する (`SoraConnectionEnv` / `getSoraConnectionEnv` は維持)
- `CHANGES.md` の `## develop` → `### misc` に `[ADD]` エントリを追加する

以下はスコープ外とする。

- #0037 で導入される Page Object ( `DevtoolsPage` ) の追加機能
- `tests/global-setup.ts` / `playwright.config.ts` の変更
- `getSoraConnectionEnv()` の API 変更 (#0037 で確定した API をそのまま使う)
- 環境変数設定済みだが Sora が到達不能な場合の特別扱い (死活監視)
- `test.skip()` による未設定時のスキップ (採用しない。未設定を見逃すため)

### なぜ skip ではなく fail か

- skip は Playwright レポート上「通った」ように見えやすく、exit code も 0 になり得る
- CI の secret 漏れやローカルの `.env.local` 未設定を、緑のまま通過させてしまう
- 未設定は設定ミスであり、接続失敗より前に明示的な Error で落とすべき

### `requireSoraConnectionEnv()` の API 仕様

`tests/helpers/env.ts` に追加する。同一ファイル内の `getSoraConnectionEnv` / `SoraConnectionEnv` を使う (別ファイルからの self-import はしない)。`@playwright/test` への依存は持たない。

```typescript
// Playwright の test コールバック (または beforeEach) の先頭で呼び出すと
// 必須環境変数未設定時は Error を throw してテストを即座に失敗させる
// 設定済みなら narrow 済みの SoraConnectionEnv を返す
export function requireSoraConnectionEnv(): SoraConnectionEnv;
```

「未設定」の判定: #0037 の `getSoraConnectionEnv()` が `undefined` を返すとき (= `E2E_TEST_SORA_SIGNALING_URL` が `undefined` または空文字)。`channelIdPrefix` / `accessToken` の未設定は空文字既定のため fail 条件に含めない。空白のみの URL は trim しないため「設定済み」扱いとなり、本関数では throw せず接続失敗する。

### 呼び出し位置規約 (本 issue で確立)

後続 issue (#0039 等) はこの規約を継承する。

- 必ず `test()` コールバック内 (または `test.beforeEach` 内) の先頭で呼ぶ。トップレベルで呼んではならない
  - Playwright の globalSetup でセットした `process.env` は `test()` 内でのみ利用可能とされており、本リポの `tests/global-setup.ts` も `.env.local` を globalSetup 経路で読む。トップレベルだと `.env.local` 由来の値が見えず誤 throw しうる
- non-null assertion (`!`) や `as` キャストは使わない。早期 throw で narrow する
- Error メッセージは英語のみにする (CODEBASE.md「エラーメッセージは英語にすること」)

```typescript
export function requireSoraConnectionEnv(): SoraConnectionEnv {
  const env = getSoraConnectionEnv();
  if (env === undefined) {
    throw new Error("E2E_TEST_SORA_SIGNALING_URL is not set");
  }
  return env;
}
```

### テストファイルの差し替え

3 テストファイルの import と env 取得行のみを置き換える。テスト名 (`"sendrecv"` / `"sendonly"` / `"recvonly"`) は変更しない。

```typescript
// 置き換え前 (#0037 の状態)
import { getSoraConnectionEnv } from "./helpers/env.ts";

test("sendrecv", async ({ page }) => {
  const env = getSoraConnectionEnv() ?? {
    signalingUrl: "",
    channelIdPrefix: "",
    accessToken: "",
  };
  // ...
});
```

```typescript
// 置き換え後 (本 issue 完了時)
// `test` / `DevtoolsPage` 等の既存 import は残し、env の import と取得行だけ差し替える
import { requireSoraConnectionEnv } from "./helpers/env.ts";

test("sendrecv", async ({ page }) => {
  // 必須環境変数を取得する。未設定なら Error を throw してテストを失敗させる
  const env = requireSoraConnectionEnv();
  // ...
});
```

## 影響範囲

- 修正: `tests/helpers/env.ts` (`requireSoraConnectionEnv()` の追加 export)
- 修正: `tests/sendrecv.test.ts` / `tests/sendonly.test.ts` / `tests/recvonly.test.ts` (import と env 取得行の置き換え)
- `CHANGES.md` の `## develop` → `### misc` に次を追記する。#0037 の `[ADD]` より後に置く (`## 2026.1.0` には触れない)
  - `[ADD] e2e テストで E2E_TEST_SORA_SIGNALING_URL 未設定時に即座に失敗させる requireSoraConnectionEnv を追加する`
  - 次行: `- @voluntas`
- issue 番号は CHANGES.md に書かない

## 完了条件

### 静的検証

- `tests/helpers/env.ts` に `requireSoraConnectionEnv()` が上記 API 仕様で追加されている
- named export は `SoraConnectionEnv` / `getSoraConnectionEnv` / `requireSoraConnectionEnv` である (#0037 の export 制約を本 issue で拡張)
- `requireSoraConnectionEnv()` の実装で non-null assertion (`!`) や `as` キャストを使わず、早期 throw パターンで narrow されている
- `test.skip` を使っていない
- 3 テストファイルが `import { requireSoraConnectionEnv } from "./helpers/env.ts"` と `const env = requireSoraConnectionEnv()` に書き換わっている
- `vp check` が通過すること
- `vp test run` が通過すること (既存単体テストへの影響なし)

### 動的検証

- 未設定フルスイート: `E2E_TEST_SORA_SIGNALING_URL` 未設定 (または空文字) で `pnpm test:e2e` を実行したとき、Sora 依存テスト 3 件が `E2E_TEST_SORA_SIGNALING_URL is not set` で即座に fail し、`noise-suppression-lazy-load.test.ts` と `mp4-media-stream-lazy-load.test.ts` は通過すること。コマンド全体の exit code は非 0 であること
- 「未設定」の再現は次のいずれかとする。`env -u E2E_TEST_SORA_SIGNALING_URL` だけでは不十分 (`global-setup.ts` の `loadEnvFile` がキー不在時に `.env.local` から再注入する)。一方 `E2E_TEST_SORA_SIGNALING_URL=` の空文字代入は、`process.loadEnvFile` が既存キー (空文字含む) を上書きしないため有効
  - フルスイート用: `E2E_TEST_SORA_SIGNALING_URL= pnpm test:e2e`
  - または一時的に `.env.local` から当該行を除去する
  - または `.env.local` が無く、シェルにも当該変数を渡していないローカル実行
- 設定あり経路: `.env.local` に有効な `E2E_TEST_SORA_SIGNALING_URL` を設定し、到達可能な Sora が起動している状態で `pnpm test:e2e` を実行したとき、Sora 依存テスト 3 件が通過すること

## 解決方法

1. `tests/helpers/env.ts` に `requireSoraConnectionEnv()` を追加した。`getSoraConnectionEnv()` が `undefined` のとき `Error("E2E_TEST_SORA_SIGNALING_URL is not set")` を throw する (skip は採用しない)
2. `tests/sendrecv.test.ts` / `tests/sendonly.test.ts` / `tests/recvonly.test.ts` の import と env 取得行を `requireSoraConnectionEnv()` に置き換えた
3. `CHANGES.md` の `## develop` → `### misc` に `[ADD]` エントリを追記した
4. `vp check` / `vp test run` / `pnpm test:e2e` (設定あり・ `E2E_TEST_SORA_SIGNALING_URL=` 未設定) で確認した。未設定時は Sora 依存 3 件が即座に fail、lazy-load 2 件は通過する

## エッジケース

- `E2E_TEST_SORA_SIGNALING_URL` が `undefined` または空文字: 即座に fail する
- `E2E_TEST_SORA_SIGNALING_URL` が空白のみ: 本関数では throw せず、接続失敗する (trim しない)
- `E2E_TEST_SORA_CHANNEL_ID_PREFIX` / `E2E_TEST_ACCESS_TOKEN` 未設定: fail せず、空文字既定でテスト継続する

## 依存

- #0037 (Page Object と `getSoraConnectionEnv` の導入) が先行マージされている必要がある (直列実行 0037 → 0063)
- `@playwright/test` のバージョンは `package.json` を正とする (執筆時点で `1.61.1`)
