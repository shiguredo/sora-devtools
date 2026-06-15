# 0042-bug-fix-log-messages-json-parse-crash

- Priority: High
- Created: 2026-06-09
- Completed: 2026-06-15
- Model: Opus 4.7
- Branch: feature/fix-log-messages-json-parse-crash
- Polished: 2026-06-15

## 目的

`src/components/DebugPane/LogMessages.tsx` の `Collapse` 関数が `message.description` を無条件に `JSON.parse` するため、JSON 文字列でない描画経路（特に `getErrorMessage(error)` の素文字列）が流れ込むと `SyntaxError` が render 中に throw する。Error Boundary が無いため DebugPane（Log タブを含む）が壊れリロード必須になる。受け側 `LogMessages.tsx` 単独で防御することで根本的にこの経路を止め、追加の呼び出し側変更は避ける。

## 優先度根拠

Sora 接続中・接続切断中のデバイス切替やトラック更新で `stopLocalVideoTrack` / `stopLocalAudioTrack` / `cleanupSoraMediaState` / `replaceAudioTrack` / `replaceVideoTrack` / `removeAudioTrack` / `removeVideoTrack` が失敗するパスに乗ると `getErrorMessage(error)` の素文字列が `description` に入り、Log タブを開いた瞬間に DebugPane が壊れる。デバイス切替・切断は通常運用で踏みやすい経路で、Error Boundary が無いため画面復旧にはリロードが必要。実害の頻度・深刻度ともに High。

## 現状の問題

`LogMessage["message"].description` の型は `string`（`src/types.ts` の `LogMessage` インターフェース）。受け側 `LogMessages.tsx` の `Collapse` 関数は次のように parse する。

```tsx
const description = JSON.parse(message.description) as string | number | Record<string, unknown>;
```

`description` の生成経路は actions.ts と signals.ts に分散しており、次の 3 系統に分類できる（行番号は陳腐化するため記載しない。識別子と用途で特定する）。

- **正常系（JSON 文字列を渡す）: 6 経路**
  - `actions.ts` の `mediaConstraints` / `constraints` / `mediaStreamConstraints` / `signalingUrlCandidates` を `JSON.stringify` した経路
  - `actions.ts` 内 `setSoraCallbacks` の `soraConnection.on("log", ...)` callback で SDK が渡す `Json` 型値を `JSON.stringify` する経路
  - `signals.ts` の `setAlertMessagesAndLogMessages` 内 `JSON.stringify({ title, type, message })` 経路
- **異常系（`getErrorMessage(error)` の素文字列が渡る）: 7 経路 — 本 issue の修正対象**
  - `STOP_LOCAL_VIDEO_TRACK` / `STOP_LOCAL_AUDIO_TRACK` (`cleanupSoraMediaState` 内の `Promise.allSettled` rejection ハンドラ)
  - `CLEANUP_SORA_MEDIA_STATE` (`setSoraCallbacks` の `"disconnect"` ハンドラ内 `try / catch`)
  - `REPLACE_AUDIO_TRACK` / `REPLACE_VIDEO_TRACK` / `REMOVE_AUDIO_TRACK` / `REMOVE_VIDEO_TRACK` (各 `replace*Track` / `remove*Track` の catch 句)
- **特殊（`JSON.stringify(error.message)` で引用符付き）: 1 経路**
  - `requestMedia` の catch 句（`error` が `Error` のとき `JSON.stringify(error.message)`）

異常系 7 経路はいずれも `getErrorMessage`（`src/utils.ts`、`error instanceof Error ? error.message : String(error)`）の戻り値を直接渡しており、`description` に JSON として無効な素文字列が入る。`Collapse` 関数の `JSON.parse` で `SyntaxError` を起こし、Log タブの render 全体が落ちる。

## 設計方針

### 1. 受け側防御 (`LogMessages.tsx` + 純関数化)

受け側 1 箇所で防御する。異常系 7 経路は触らない（理由は設計方針 2）。

`LogMessages.tsx` の parse 処理を別ファイル `src/components/DebugPane/parseLogDescription.ts` に純関数として切り出して `export` する。`LogMessages.tsx` 同ファイル内に置くと `signals` モジュールの import を引きずってテスト時に副作用を呼ぶため、独立モジュール化する。配置は呼び出し元 `LogMessages.tsx` と同じ `src/components/DebugPane/` 配下にする（DebugPane Log 表示専用のヘルパーで汎用 utility ではないため `src/utils.ts` には置かない）。

```ts
// src/components/DebugPane/parseLogDescription.ts
export type LogDescription = string | number | Record<string, unknown> | unknown[];

// description 表示用に raw 文字列を安全にパースする。
// JSON として有効でも、Message.tsx で表示できない型（null / boolean）は raw に fallback する。
export function parseLogDescription(raw: string): LogDescription {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return raw;
  }
  if (typeof parsed === "string" || typeof parsed === "number") {
    return parsed;
  }
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed !== null && typeof parsed === "object") {
    return parsed as Record<string, unknown>;
  }
  // null / boolean は Message.tsx の <pre> 表示で意味のある描画ができないため raw 文字列に落とす。
  return raw;
}
```

`Message.tsx` の型を `string | number | Record<string, unknown> | undefined` から `string | number | Record<string, unknown> | unknown[] | undefined` に拡張する。対象は **2 箇所**: `DescriptionProps.description` と `Props.description`（両方更新しないと TypeScript エラーになる）。

`JsonTree` の `data` props は元から `unknown` 型のため配列受け入れに修正不要。なお本 issue で追加される `parseLogDescription` 経由の配列は `Message.tsx` の `prevDescription` 未渡し分岐（末尾 `JSON.stringify(description, null, 2)`）に流れるため、`JsonTree` 経路（`prevDescription !== undefined` 分岐）には到達しない。`JsonTree` 経路の型整合は将来 `prevDescription` 経路から本 Component を再利用するケースに備えた予防的な型拡張になる。

`LogMessages.tsx` の `Collapse` 関数内 `JSON.parse(message.description)` を `parseLogDescription(message.description)` 呼び出しに差し替え、`LogDescription` 型を import する。

### 2. 呼び出し側は変更しない

`description: getErrorMessage(error)` の 7 箇所を `JSON.stringify(...)` で囲むと、`LogMessages.tsx` の filter コールバック内 `JSON.stringify(message).includes(filterText)` で対象文字列が二重エスケープされ、ユーザーがエラーメッセージ内のクォートや改行で検索しても引っかからない回帰が出る。`requestMedia` 内 `JSON.stringify(error.message)` 経路も同じ理由で触らない（受け側 `JSON.parse` 成功で引用符が剥がれ既存挙動と等価）。

`LogMessage["message"].description` 型自体を `Json` 等に変える根本対応は影響範囲が広いため、本 issue 完了後に別途 follow-up issue として起票する想定とし、本 issue では呼び出し側の契約変更は行わない。

### 3. SDK log callback プリミティブの表示は変わらない

SDK の `"log"` callback で `description: Json` が `null` / `true` / `false` / 数値として渡された場合、本修正の前後で表示は変わらない。

- 修正前: `JSON.stringify(null)` → `"null"` → `JSON.parse("null")` → `null` → `Message.tsx` の `prevDescription` 未渡し経路で `JSON.stringify(null, null, 2)` → `<pre>null</pre>` 表示
- 修正後: `JSON.stringify(null)` → `"null"` → `parseLogDescription("null")` は `null` fallback で raw 文字列 `"null"` を返す → `Message.tsx` の `typeof description !== "object"` 分岐 → `<pre>null</pre>` 表示

`true` / `false` / 数値も同様に視覚的な表示は変わらない。本修正は異常系 7 経路のクラッシュ防止を主目的としつつ、SDK callback プリミティブ経路の表示にも回帰を起こさない。

### 4. CHANGES.md エントリ

`CHANGES.md` の `## develop` 内 `[FIX]` セクション末尾（`### misc` セクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] Log タブの `description` の `JSON.parse` 失敗で DebugPane が壊れる問題を修正する
  - デバイス切替・接続切断時にエラーメッセージ素文字列が `description` に入り render が落ちていた経路を `parseLogDescription` の try / catch で防御する
  - @voluntas
```

## 検証手順

`src/components/DebugPane/parseLogDescription.test.ts`（新規）で純関数を `test` / `assert` でテストする。テストメッセージは日本語。配置は対象ファイルと同ディレクトリ（`src/utils.test.ts` / `src/utils.prop.ts` などの既存慣習に合わせる）。

- 通常テスト import: `import { assert, test } from "vite-plus/test";`（既存テストファイル `src/utils.test.ts` / `src/app/actions.test.ts` と同じ）
- PBT import: `import { fc, test } from "@fast-check/vitest";` と `import { assert } from "vite-plus/test";`（既存 PBT ファイル `src/utils.prop.ts` と同じ）

### 1. ユニットテスト 9 件（`parseLogDescription.test.ts`）

各テストは「入力（raw 引数の文字列値）」と「期待値（戻り値）」を明示する。`'null'` / `'true'` / `'false'` などは **raw 引数の長さで内容を取り違えやすい** ため、`assert.equal` で文字列リテラルそのものを比較すること。

- 入力 `'{"a":1}'` → 期待 plain object `{ a: 1 }`（JSON オブジェクト文字列）
- 入力 `'42'` → 期待 number `42`（JSON 数値文字列）
- 入力 `'"foo"'` → 期待 string `'foo'`（JSON 文字列リテラル、引用符が剥がれる）
- 入力 `'failed to do X'` → 期待 string `'failed to do X'`（素のエラー文字列 raw fallback）
- 入力 `''` → 期待 string `''`（空文字列 raw fallback）
- 入力 `'null'` → 期待 string `'null'`（4 文字。raw 引数そのもの。`String(null)` ではない。null fallback）
- 入力 `'true'` → 期待 string `'true'`（boolean fallback）
- 入力 `'false'` → 期待 string `'false'`（boolean fallback）
- 入力 `'[1,2]'` → 期待 array `[1, 2]`（`signalingUrlCandidates` 等の既存配列表示を維持するため）

### 2. PBT（`parseLogDescription.prop.ts`）

不変条件ごとに `test` を 2 件に分ける（`src/utils.prop.ts` の慣習に倣う）。

- 「`parseLogDescription` は任意の文字列入力で例外を投げない」: `fc.string()` で任意の文字列を生成し、戻り値の存在のみ確認
- 「`parseLogDescription` の戻り値は `string | number | Record<string, unknown> | unknown[]` のいずれかになる」: `fc.string()` で生成した入力に対し、戻り値の `typeof` または `Array.isArray` で判定

null / boolean fallback の検証は固定入力で 1. のユニットテストにカバー済みのため、PBT には含めない（`fc.string()` で `'null'` / `'true'` / `'false'` のみを当てるのは確率上ほぼ起こらず PBT の本質と合わないため）。

### 3. 手動確認

`vp dev` で起動 → 接続 → DebugPane の Log タブを開く → デバイス切替や接続切断後の `replaceAudioTrack` を踏ませて `REPLACE_AUDIO_TRACK` などの失敗ログが入った状態で Log タブが落ちないことを確認する。あわせて `CopyLogButton` でコピーした内容が `<pre>` 表示と一致することも確認する。

## 完了条件

- 上記 9 ユニットテスト + 2 PBT が `pnpm test` で pass すること。
- 手動確認手順で Log タブが壊れないこと（リロード不要）。
- `description` の中身が `getErrorMessage` 由来の素文字列であっても `Message` コンポーネントが既存の `<pre>` 分岐で表示すること。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 既存テスト（`pnpm test`）および既存 Playwright e2e（`pnpm test:e2e`）が通ること。

## 解決方法

- `src/components/DebugPane/parseLogDescription.ts` を新規追加し、`JSON.parse` の `SyntaxError` を `try` / `catch` で受けて raw 文字列に fallback する純関数 `parseLogDescription` と戻り値型 `LogDescription` (`string | number | Record<string, unknown> | unknown[]`) を export する。`JSON.parse` 成功時も `null` / `boolean` は raw 文字列に落として `Message` 側の `<pre>` 表示の崩れを防ぐ。
- `src/components/DebugPane/LogMessages.tsx` の `Collapse` 関数で `JSON.parse(message.description)` を `parseLogDescription(message.description)` に差し替え、Log タブ受け側 1 箇所で防御する。`description` 経路の呼び出し側 (`actions.ts` / `signals.ts`) は変更しない。
- `src/components/DebugPane/Message.tsx` の `DescriptionProps.description` と `Props.description` の型 union に `unknown[]` を追加し、`parseLogDescription` が返す配列を受けられるようにする。
- `src/components/DebugPane/parseLogDescription.test.ts` (新規) で issue 設計方針 1 の 9 ケース (`{"a":1}` / `42` / `"foo"` / `failed to do X` / `''` / `null` / `true` / `false` / `[1,2]`) のユニットテストを追加する。
- `src/components/DebugPane/parseLogDescription.prop.ts` (新規) で「例外を投げず必ず値を返す」「戻り値型が `string | number | object | array` に限定される」の 2 つの不変条件を PBT で検証する。
- `CHANGES.md` の `## develop` の `[FIX]` セクション末尾 (`### misc` の直前) に [FIX] エントリを追記する。
- `/review-diff-code` のレビューを 1 周回し、PBT 1 件目に戻り値の存在確認 `assert.notEqual(result, undefined)` を追加、PBT 2 件目の `assert.ok` 失敗メッセージを日本語化する修正を反映した。
