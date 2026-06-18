# 0063 e2e テストに環境変数未設定時の skip 機構を追加する

- Priority: High
- Created: 2026-06-12
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/add-e2e-skip-when-sora-env-missing
- Polished: 2026-06-16

## 目的

Sora サーバーが利用できない環境で `pnpm test:e2e` を実行したとき、Sora 依存テスト 3 件 ( `sendrecv` / `sendonly` / `recvonly` ) が現状の「接続待ちタイムアウトで失敗」から「`test.skip()` で skip され Playwright レポートに skip 理由が表示される」状態に変える。これにより Sora 非依存の lazy-load テスト ( `noise-suppression-lazy-load.test.ts` / `mp4-media-stream-lazy-load.test.ts` ) の結果が見やすくなり、Sora 不在環境 (CI の一部、ローカルでの軽量チェック) での開発体験が改善する。

## 優先度根拠

- #0039 (Sora 依存 e2e の拡充) が完了条件として「環境変数未設定時は skip されること (#0063 の仕組みを利用)」を前提にしている
- #0037 で導入する `tests/helpers/env.ts` の `getSoraConnectionEnv()` を活用して `requireSoraConnectionEnv()` を追加するだけの差分なので、対応コストは低く、得られる開発体験改善は大きい

## 現状

- #0037 で `tests/helpers/env.ts` に `getSoraConnectionEnv(): SoraConnectionEnv | undefined` (副作用なし) が導入される
- #0037 で各テストファイル ( `sendrecv.test.ts` / `sendonly.test.ts` / `recvonly.test.ts` ) のテンプレに `const env = getSoraConnectionEnv() ?? { signalingUrl: "", channelIdPrefix: "", accessToken: "" }` というフォールバックが書かれる。これは「環境変数未設定時は空文字フォールバックで `signalingUrlCandidates: [""]` を渡し、接続待ちでタイムアウト失敗する」既存挙動を維持するための暫定対応
- 上記の暫定対応のままだと、Sora を立てていない環境で `pnpm test:e2e` を実行するたびに 3 テストが失敗扱いとなり、本来確認したい lazy-load 系テストの結果と混在して見えにくい

## 設計方針

### スコープ

本 issue は以下のみを対象とする。

- `tests/helpers/env.ts` に `requireSoraConnectionEnv()` を追加 ( `getSoraConnectionEnv()` を呼び、必須未設定なら `test.skip()` で当該テストを skip し、設定済みなら narrow 済み `SoraConnectionEnv` を返す)
- 既存 3 テストファイルの `const env = getSoraConnectionEnv() ?? {...}` を `const env = requireSoraConnectionEnv()` に置き換える
- `vite.config.ts` の lint override に `tests/helpers/env.ts` 用エントリ ( `vitest/no-disabled-tests: "off"` ) を追加する (動的 `test.skip()` で oxlint ルールが発火した場合のみ)
- `CHANGES.md` の `## develop` セクションに `[ADD]` エントリを追加

以下はスコープ外とする。

- #0037 で導入される Page Object ( `DevtoolsPage` ) の追加機能
- `tests/global-setup.ts` / `playwright.config.ts` の変更
- `getSoraConnectionEnv()` の API 変更 (#0037 で確定した API をそのまま使う)

### `requireSoraConnectionEnv()` の API 仕様

```typescript
import { test } from "@playwright/test";

import { getSoraConnectionEnv, type SoraConnectionEnv } from "./env.ts";

// test() コールバック (または test.beforeEach) の先頭で呼び出すと
// 必須環境変数未設定時は test.skip() で当該テストを skip し
// 設定済みなら narrow 済みの SoraConnectionEnv を返す
// skip 理由として未設定の環境変数名を含むメッセージを Playwright のレポートに残す
export function requireSoraConnectionEnv(): SoraConnectionEnv;
```

「未設定」の判定: 0037 が確立した `getSoraConnectionEnv()` の API ( `signalingUrl === undefined || signalingUrl === ""` のときに `undefined` を返す) をそのまま使う。本 issue で skip するのは「`getSoraConnectionEnv()` が `undefined` を返す = `E2E_TEST_SORA_SIGNALING_URL` が未設定」の場合のみ。 `channelIdPrefix` / `accessToken` の未設定は `getSoraConnectionEnv()` 側で空文字を既定値とするため skip 条件には含めない。

### 呼び出し位置規約 (本 issue で確立)

本 issue で `requireSoraConnectionEnv()` の呼び出し位置規約を以下のとおり確立する。後続 issue ( #0039 等) はこの規約を継承する。

- 必ず `test()` コールバック内 (または `test.beforeEach` 内) の先頭で呼ぶ。モジュールのトップレベルや test ファイルのトップレベル ( `test()` 外) で呼ぶと、Playwright runner 外で `test.skip()` を呼ぶことになり実行時エラーになる
- skip 判定は `test.skip(condition, reason)` を使う方式に統一する ( `test.describe.skip` は静的 skip にしか使えないため不採用)
- TypeScript の制御フロー解析では `test.skip(condition)` の戻り値が `void` のため自動 narrow されない。早期 throw による narrow パターンを採用する。non-null assertion ( `!` ) や `as` キャストは使わない

skip 理由 ( `reason` 引数) は CLAUDE.md / AGENTS.md 「テストのログメッセージは全て日本語にすること」に従い日本語で書く。 ただし環境変数名は ASCII 識別子のため英語のまま記載する ( 例: `"E2E_TEST_SORA_SIGNALING_URL が未設定です"` )。

```typescript
// 早期 throw による narrow パターン (採用案)
export function requireSoraConnectionEnv(): SoraConnectionEnv {
  const env = getSoraConnectionEnv();
  if (env === undefined) {
    const reason = "E2E_TEST_SORA_SIGNALING_URL が未設定です";
    // Playwright runner はこの行で abort するが TypeScript の型 narrow のため throw も書く
    test.skip(true, reason);
    throw new Error(`unreachable: test.skip should abort before this throw (reason: ${reason})`);
  }
  return env;
}
```

`throw new Error(...)` のエラーメッセージは英語のままにする ( CODEBASE.md「エラーメッセージは英語にすること」に従う)。 実行時には `test.skip` で必ず abort するため到達不能なエラーメッセージだが、 万一到達した場合の trace 用に技術的なメッセージを残す。

### テストファイルの差し替え

3 テストファイルの import 文と env 取得行を以下のように置き換える。 テスト名は 0037 で確立した「単一 ASCII 文字列」規約 ( `"sendrecv"` / `"sendonly"` / `"recvonly"` ) を維持し、 本 issue ではテスト名自体は変更しない。

```typescript
// 置き換え前 (#0037 の状態)
import { getSoraConnectionEnv } from "./helpers/env.ts";

test("sendrecv", async ({ page }) => {
  const env = getSoraConnectionEnv() ?? {
    signalingUrl: "",
    channelIdPrefix: "",
    accessToken: "",
  };
  ...
});
```

```typescript
// 置き換え後 (本 issue 完了時の状態)
import { requireSoraConnectionEnv } from "./helpers/env.ts";

test("sendrecv", async ({ page }) => {
  // 必須環境変数を取得する。未設定なら test.skip() でこのテストを skip する
  const env = requireSoraConnectionEnv();
  ...
});
```

### lint 対応

`tests/helpers/env.ts` 内で動的 `test.skip(condition, reason)` を呼ぶことになるが、現行 oxlint の `vitest/no-disabled-tests` ルールは静的 skip prefix ( `test.skip("title", () => {})` 形式) のみを検出し、 動的 skip ( `test.skip(true, "reason")` 形式) は検出しない。 また `vite.config.ts` の既存 lint override は `files: ["tests/**/*.test.ts"]` で `*.test.ts` のみを対象としており、 `tests/helpers/env.ts` のような非 `*.test.ts` ファイルは vitest プラグインのチェック対象外。

よって本 issue では vite.config.ts の lint override 追加は **不要** と判断し、 実装に含めない。 実装時に `pnpm check` を実行し、 万一 `vitest/no-disabled-tests` が `tests/helpers/env.ts` で発火した場合のみ、 以下の override を追加する ( 追加した場合は CHANGES.md エントリにも記載する):

```typescript
{
  files: ["tests/helpers/env.ts"],
  rules: {
    "vitest/no-disabled-tests": "off",
  },
},
```

ファイル先頭の `// oxlint-disable vitest/no-disabled-tests` ディレクティブ方式は採用しない ( `vite.config.ts` の overrides セクションに集約することで lint 設定全体の一貫性が保てるため)。

## 影響範囲

- 修正: `tests/helpers/env.ts` ( `requireSoraConnectionEnv()` の追加)
- 修正: `tests/sendrecv.test.ts` / `tests/sendonly.test.ts` / `tests/recvonly.test.ts` (import と env 取得行の置き換え)
- 修正: `vite.config.ts` ( `pnpm check` 実行時に lint 発火を確認した場合のみ override 追加。通常は不要)
- `CHANGES.md` の `## develop` 配下の `### misc` サブセクション内に、 #0037 が追加する `[ADD] e2e テストに Page Object Model と環境変数読み込みヘルパーを導入する` の直後に `[ADD] e2e テストで E2E_TEST_SORA_SIGNALING_URL 未設定時に Sora 依存テストを skip する仕組みを追加する` を追記する ( #0037 が先行マージされる前提。 種別順 CHANGE → ADD → UPDATE → FIX を守り、 `### misc` 内の `[ADD]` 群末尾に挿入する。 `shiguredo-changelog` スキル参照)

## 完了条件

### 静的検証

- `tests/helpers/env.ts` に `requireSoraConnectionEnv()` が上記 API 仕様で追加されている
- `requireSoraConnectionEnv()` の実装で non-null assertion ( `!` ) や `as` キャストを使わず、早期 throw パターンで narrow されている
- 3 テストファイル冒頭が `import { requireSoraConnectionEnv } from "./helpers/env.ts"` と `const env = requireSoraConnectionEnv()` に書き換わっている
- `pnpm check` が通過すること ( `vitest/no-disabled-tests` が発火した場合は `vite.config.ts` の override 追加で対応する)
- `pnpm test` が通過すること (既存単体テストへの影響なし)

### 動的検証

- `.env.local` が存在しない、または `E2E_TEST_SORA_SIGNALING_URL` が未設定の状態で `pnpm test:e2e` を実行したとき、Sora 依存テスト 3 件が skip され `noise-suppression-lazy-load.test.ts` と `mp4-media-stream-lazy-load.test.ts` は通過すること
- skip 理由として `E2E_TEST_SORA_SIGNALING_URL が未設定です` が CLI 出力と HTML レポート ( `pnpm exec playwright show-report` ) の双方に表示されること
- `.env.local` に `E2E_TEST_SORA_SIGNALING_URL` を設定した状態で `pnpm test:e2e` を実行したとき、Sora 依存テスト 3 件が通過すること

## エッジケース

- `E2E_TEST_SORA_SIGNALING_URL` が `undefined` または空文字: `getSoraConnectionEnv()` が `undefined` を返し、`requireSoraConnectionEnv()` が `test.skip()` で当該テストを skip する
- `E2E_TEST_SORA_CHANNEL_ID_PREFIX` 未設定: `getSoraConnectionEnv()` 側で空文字を既定値とし、テストは継続する (本 issue では skip しない)
- `E2E_TEST_ACCESS_TOKEN` 未設定または空文字: `getSoraConnectionEnv()` 側で空文字を既定値とし、テストは継続する

## 依存

- #0037 (Page Object と `getSoraConnectionEnv` の導入) が先行マージされている必要がある (直列実行 0037 → 0063)
- `@playwright/test` 1.60.0 ( `package.json` 参照)
