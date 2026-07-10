# 0063 e2e テストに環境変数未設定時の skip 機構を追加する

- Priority: High
- Created: 2026-06-12
- Completed: 2026-07-10
- Model: Opus 4.7
- Branch: feature/add-e2e-skip-when-sora-env-missing
- Polished: 2026-07-10

## 目的

`E2E_TEST_SORA_SIGNALING_URL` が未設定 (または空文字) のとき、Sora 依存テスト 3 件 ( `sendrecv` / `sendonly` / `recvonly` ) を接続待ちタイムアウト失敗ではなく `test.skip()` で skip し、Playwright レポートに skip 理由を残す。これにより Sora 非依存の lazy-load テスト ( `noise-suppression-lazy-load.test.ts` / `mp4-media-stream-lazy-load.test.ts` ) の結果が見やすくなり、E2E 用 Signaling URL を渡していない CI / 軽量ローカル実行での開発体験が改善する。

本 issue が解決しないこと: 環境変数は設定済みだが Sora プロセスが落ちている / 到達不能なときの失敗。その場合は従来どおり接続待ちタイムアウトで fail する。

## 優先度根拠

- #0039 が完了条件として「環境変数未設定時は skip されること (#0063 の仕組みを利用)」を前提にしている
- #0066 が接続維持 E2E で #0037 → #0063 をハード前提としている
- #0065 が Sora 接続が必要な E2E の基盤として #0037 → #0063 をハード依存にしている (接続維持 E2E 自体の所有者は #0066)
- #0037 が導入する `getSoraConnectionEnv()` の上に `requireSoraConnectionEnv()` を足すだけの差分で、得られる開発体験改善は大きい

## 現状

- 本 issue は **#0037 マージ後** の状態を前提とする (直列実行 0037 → 0063)
- #0037 完了後、`tests/helpers/env.ts` に `getSoraConnectionEnv(): SoraConnectionEnv | undefined` (副作用なし) がある
- #0037 完了後、各テストは `const env = getSoraConnectionEnv() ?? { signalingUrl: "", channelIdPrefix: "", accessToken: "" }` を使う。未設定時は `signalingUrlCandidates: [""]` 経由でフォールバックせず `waitForConnection` がタイムアウト失敗する (0037 の意図した挙動差。pre-0037 の既存挙動の維持ではない)
- この暫定のままだと、E2E 用 URL を渡していない環境で `pnpm test:e2e` を実行するたびに 3 テストが失敗扱いとなり、lazy-load 系の結果と混在して見えにくい

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
- 環境変数設定済みだが Sora が到達不能な場合の skip (死活監視)
- `vite.config.ts` の lint override 追加 (通常は不要。後述の lint 対応を参照)

### `requireSoraConnectionEnv()` の API 仕様

`tests/helpers/env.ts` に追加する。同一ファイル内の `getSoraConnectionEnv` / `SoraConnectionEnv` を使う (別ファイルからの self-import はしない)。

```typescript
import { test } from "@playwright/test";

// test() コールバック (または test.beforeEach) の先頭で呼び出すと
// 必須環境変数未設定時は test.skip() で当該テストを skip し
// 設定済みなら narrow 済みの SoraConnectionEnv を返す
// skip 理由として未設定の環境変数名を含むメッセージを Playwright のレポートに残す
export function requireSoraConnectionEnv(): SoraConnectionEnv;
```

「未設定」の判定: #0037 の `getSoraConnectionEnv()` が `undefined` を返すとき (= `E2E_TEST_SORA_SIGNALING_URL` が `undefined` または空文字)。`channelIdPrefix` / `accessToken` の未設定は空文字既定のため skip 条件に含めない。空白のみの URL は trim しないため「設定済み」扱いとなり、skip せず接続失敗する。

### 呼び出し位置規約 (本 issue で確立)

後続 issue (#0039 等) はこの規約を継承する。

- 必ず `test()` コールバック内 (または `test.beforeEach` 内) の先頭で呼ぶ。トップレベルで呼んではならない。理由は次のとおり
  1. Playwright の globalSetup でセットした `process.env` は `test()` 内でのみ利用可能とされており、本リポの `tests/global-setup.ts` も `.env.local` を globalSetup 経路で読む。トップレベルだと `.env.local` 由来の値が見えず誤 skip / 誤 throw しうる
  2. 本関数は `test.skip` の直後に型 narrow 用の `throw` がある。ファイル評価 (collection) 時は `test.skip` が abort しないため、未設定時にトップレベルで呼ぶと `throw` がモジュール評価で走りファイルロードが落ちる
- skip 判定は `test.skip(condition, reason)` に統一する (`test.describe.skip` は静的 skip 向けのため不採用)
- TypeScript の制御フロー解析では `test.skip(condition)` の戻り値が `void` のため自動 narrow されない。早期 throw による narrow パターンを採用する。non-null assertion (`!`) や `as` キャストは使わない

skip 理由 (`reason`) は AGENTS.md「テストのログメッセージは全て日本語にすること」に従い日本語で書く。環境変数名は ASCII のまま残す (例: `"E2E_TEST_SORA_SIGNALING_URL が未設定です"`)。

```typescript
export function requireSoraConnectionEnv(): SoraConnectionEnv {
  const env = getSoraConnectionEnv();
  if (env === undefined) {
    const reason = "E2E_TEST_SORA_SIGNALING_URL が未設定です";
    // Playwright runner はこの行で abort するが TypeScript の型 narrow のため throw も書く
    test.skip(true, reason);
    // CODEBASE.md「エラーメッセージは英語」。日本語の reason は埋め込まない
    throw new Error("unreachable: test.skip should abort before this throw");
  }
  return env;
}
```

`throw new Error(...)` のメッセージは英語のみにする (CODEBASE.md「エラーメッセージは英語にすること」)。日本語の skip 理由は `test.skip` の第 2 引数にだけ置き、`throw` には埋め込まない。実行時には `test.skip` で abort するため到達不能だが、万一到達した場合の trace 用に残す。

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
  // 必須環境変数を取得する。未設定なら test.skip() でこのテストを skip する
  const env = requireSoraConnectionEnv();
  // ...
});
```

### lint 対応

`vitest/no-disabled-tests` は `vite.config.ts` のグローバル `rules` で `error` である。`tests/**/*.test.ts` override が切るのは `vitest/no-conditional-in-test` のみで、`tests/helpers/env.ts` を vitest プラグイン全体から外してはいない。

一方 oxlint の Jest/Vitest 検出は import 元を `@jest/globals` / `vitest` / `vite-plus/test` 等に限定しており、`import { test } from "@playwright/test"` は対象外になる。そのため `tests/helpers/env.ts` の動的 `test.skip(true, reason)` は通常発火しない。

本 issue では `vite.config.ts` の override 追加は **実装に含めない**。実装時に `vp check` を実行し、万一発火した場合のみ次を追加する (追加した場合は CHANGES.md にも記載する):

```typescript
{
  files: ["tests/helpers/env.ts"],
  rules: {
    "vitest/no-disabled-tests": "off",
  },
},
```

ファイル先頭の `// oxlint-disable vitest/no-disabled-tests` ディレクティブ方式は採用しない。

## 影響範囲

- 修正: `tests/helpers/env.ts` (`requireSoraConnectionEnv()` の追加 export)
- 修正: `tests/sendrecv.test.ts` / `tests/sendonly.test.ts` / `tests/recvonly.test.ts` (import と env 取得行の置き換え)
- `CHANGES.md` の `## develop` → `### misc` に次を追記する。#0037 の `[ADD]` より後、`### misc` 内の `[ADD]` 群の適切な位置に置く (`## 2026.1.0` には触れない)
  - `[ADD] e2e テストで E2E_TEST_SORA_SIGNALING_URL 未設定時に Sora 依存テストを skip する仕組みを追加する`
  - 次行: `- @voluntas`
- issue 番号は CHANGES.md に書かない

## 完了条件

### 静的検証

- `tests/helpers/env.ts` に `requireSoraConnectionEnv()` が上記 API 仕様で追加されている
- named export は `SoraConnectionEnv` / `getSoraConnectionEnv` / `requireSoraConnectionEnv` である (#0037 の export 制約を本 issue で拡張)
- `requireSoraConnectionEnv()` の実装で non-null assertion (`!`) や `as` キャストを使わず、早期 throw パターンで narrow されている
- 3 テストファイルが `import { requireSoraConnectionEnv } from "./helpers/env.ts"` と `const env = requireSoraConnectionEnv()` に書き換わっている
- `vp check` が通過すること
- `vp test run` が通過すること (既存単体テストへの影響なし)

### 動的検証

- 未設定フルスイート: `E2E_TEST_SORA_SIGNALING_URL` 未設定 (または空文字) で `pnpm test:e2e` を実行したとき、Sora 依存テスト 3 件が skip され、`noise-suppression-lazy-load.test.ts` と `mp4-media-stream-lazy-load.test.ts` は通過すること
- skip 理由の確認: `E2E_TEST_SORA_SIGNALING_URL が未設定です` が HTML レポート (`pnpm exec playwright show-report`) に表示されること。CLI でも見る場合は `playwright.config.ts` が `reporter: "html"` のみのため、検証時だけ `--reporter=list` (または `list,html`) を付ける
- 「未設定」の再現は次のいずれかとする。`env -u E2E_TEST_SORA_SIGNALING_URL` だけでは不十分 (`global-setup.ts` の `loadEnvFile` がキー不在時に `.env.local` から再注入する)。一方 `E2E_TEST_SORA_SIGNALING_URL=` の空文字代入は、`process.loadEnvFile` が既存キー (空文字含む) を上書きしないため有効
  - フルスイート用 (lazy-load 通過も見る): `E2E_TEST_SORA_SIGNALING_URL= pnpm test:e2e`
  - skip 理由の目視用 (Sora 3 件のみ): `E2E_TEST_SORA_SIGNALING_URL= pnpm test:e2e -- --grep 'sendrecv|sendonly|recvonly' --reporter=list`
  - または一時的に `.env.local` から当該行を除去する
  - または `.env.local` が無く、シェルにも当該変数を渡していないローカル実行
- 設定あり経路: `.env.local` に有効な `E2E_TEST_SORA_SIGNALING_URL` を設定し、到達可能な Sora が起動している状態で `pnpm test:e2e` を実行したとき、Sora 依存テスト 3 件が通過すること

## 解決方法

1. `tests/helpers/env.ts` に `requireSoraConnectionEnv()` を追加した。`getSoraConnectionEnv()` が `undefined` のとき `test.skip(true, reason)` で skip し、TypeScript narrow 用に到達不能な `throw` を続ける
2. `tests/sendrecv.test.ts` / `tests/sendonly.test.ts` / `tests/recvonly.test.ts` の import と env 取得行を `requireSoraConnectionEnv()` に置き換えた
3. `CHANGES.md` の `## develop` → `### misc` に `[ADD]` エントリを追記した
4. `vp check` / `vp test run` / `pnpm test:e2e` (設定あり・ `E2E_TEST_SORA_SIGNALING_URL=` 未設定) で完了条件を確認した。未設定時は Sora 依存 3 件が skip、lazy-load 2 件が通過する

## エッジケース

- `E2E_TEST_SORA_SIGNALING_URL` が `undefined` または空文字: skip する
- `E2E_TEST_SORA_SIGNALING_URL` が空白のみ: skip せず接続失敗する (trim しない)
- `E2E_TEST_SORA_CHANNEL_ID_PREFIX` / `E2E_TEST_ACCESS_TOKEN` 未設定: skip せず、空文字既定でテスト継続する

## 依存

- #0037 (Page Object と `getSoraConnectionEnv` の導入) が先行マージされている必要がある (直列実行 0037 → 0063)
- `@playwright/test` のバージョンは `package.json` を正とする (執筆時点で `1.61.1`)
