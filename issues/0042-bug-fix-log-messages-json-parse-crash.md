# 0042-bug-fix-log-messages-json-parse-crash

- Priority: High
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-log-messages-json-parse-crash
- Polished: 2026-06-09

## 目的

`src/components/DebugPane/LogMessages.tsx` の `Collapse` 関数が `message.description` を無条件に `JSON.parse` するため、JSON 文字列でない描画経路（特に `getErrorMessage(error)` の素文字列）が流れ込むと `SyntaxError` が render 中に throw する。Error Boundary が無いため DebugPane（Log タブを含む）が壊れリロード必須になる。受け側 `LogMessages.tsx` 単独で防御することで根本的にこの経路を止め、追加の呼び出し側変更は避ける（後述）。

## 優先度根拠

Sora 接続中のデバイス切替やトラック更新で `replaceAudioTrack` / `replaceVideoTrack` / `removeAudioTrack` / `removeVideoTrack` / `stopLocalVideoTrack` が失敗するパスに乗ると `getErrorMessage(error)` の素文字列が `description` に入り、Log タブを開いた瞬間に DebugPane が壊れる。デバイス切替は通常運用で踏みやすい経路で、Error Boundary が無いため画面復旧にはリロードが必要。実害の頻度・深刻度ともに High。

## 現状の問題

`LogMessage["message"].description` の型は `string`（`src/types.ts` の `LogMessage` 型）で、受け側 `LogMessages.tsx:9` は次のように parse する。

```tsx
const description = JSON.parse(message.description) as string | number | Record<string, unknown>;
```

`description` の生成箇所はリポジトリ全体で **12 経路** 存在し、内訳は以下のとおり（行番号は Polished 時点 (2026-06-09) のもの。実装時に行番号がずれた場合は識別子で特定すること）。

| 場所                 | 行   | `description` の中身                                                                                          | 状態                                                                                                                              |
| -------------------- | ---- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/actions.ts` | 697  | `JSON.stringify(mediaConstraints)`                                                                            | OK（JSON 文字列）                                                                                                                 |
| `src/app/actions.ts` | 732  | `JSON.stringify(constraints)`                                                                                 | OK                                                                                                                                |
| `src/app/actions.ts` | 862  | `JSON.stringify(mediaStreamConstraints)`                                                                      | OK                                                                                                                                |
| `src/app/actions.ts` | 1071 | `getErrorMessage(error)`                                                                                      | **NG（素文字列、`STOP_LOCAL_VIDEO_TRACK` 失敗時）**                                                                               |
| `src/app/actions.ts` | 1089 | `JSON.stringify(description)` (SDK の `log` callback、引数の型は `src/types.ts:217-225` のローカル `Json` 型) | OK（`Json` はトップレベル値に `undefined` を含まないため正常）                                                                    |
| `src/app/actions.ts` | 1329 | `JSON.stringify(error.message)`                                                                               | OK（文字列を `JSON.stringify` した引用符付き JSON 文字列。受け側 `JSON.parse` で引用符が剥がれ素文字列として `<pre>` 表示される） |
| `src/app/actions.ts` | 1414 | `JSON.stringify(signalingUrlCandidates)`                                                                      | OK                                                                                                                                |
| `src/app/actions.ts` | 1863 | `getErrorMessage(error)`                                                                                      | **NG（`REPLACE_AUDIO_TRACK` 失敗時）**                                                                                            |
| `src/app/actions.ts` | 1890 | `getErrorMessage(error)`                                                                                      | **NG（`REPLACE_VIDEO_TRACK` 失敗時）**                                                                                            |
| `src/app/actions.ts` | 1957 | `getErrorMessage(error)`                                                                                      | **NG（`REMOVE_AUDIO_TRACK` 失敗時）**                                                                                             |
| `src/app/actions.ts` | 1984 | `getErrorMessage(error)`                                                                                      | **NG（`REMOVE_VIDEO_TRACK` 失敗時）**                                                                                             |
| `src/app/signals.ts` | 207  | `setAlertMessagesAndLogMessages` 内 `JSON.stringify({ title, type, message })`                                | OK                                                                                                                                |

NG マークの 5 箇所が `getErrorMessage(error)` の戻り値（`error.message` か `String(error)`、`src/utils.ts:50-52`）を直接渡しており、Log タブの `JSON.parse` で `SyntaxError` を起こす。

`LogMessage` 型自体を `description: Json` に変える設計案もあるが、影響範囲が広いため本 issue ではスコープ外として別途扱う。

## 設計方針

### 1. 受け側防御 (`LogMessages.tsx` + 純関数化)

受け側 1 箇所で防御する。呼び出し側の 5 箇所（NG マーク）は触らない。理由:

- 受け側で try/catch すれば `parseLogDescription("not json")` のような任意の文字列も安全に扱える。
- 呼び出し側を `JSON.stringify(getErrorMessage(error))` に変えると、`Filter.tsx` のフィルタ (`LogMessages.tsx:25` の `JSON.stringify(message).includes(filterText)`) で対象文字列が二重エスケープされ、ユーザーがエラーメッセージ内のクォートや改行で検索しても引っかからない回帰が出る。
- 同じ理由で `actions.ts:1329` の `JSON.stringify(error.message)` も触らない。受け側 `JSON.parse` が成功して引用符が剥がれ、結果的に既存の挙動と等価になる（修正後は破綻しない）。

`LogMessages.tsx` の parse 処理を別ファイル `src/components/DebugPane/parseLogDescription.ts` に純関数として切り出して `export` する。同ファイル内に置くと `LogMessages.tsx` の signal 依存をテスト時に引きずるため、独立モジュール化する。

```ts
// src/components/DebugPane/parseLogDescription.ts
export type LogDescription = string | number | Record<string, unknown> | unknown[];

export function parseLogDescription(raw: string): LogDescription {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return raw;
  }
  // Message.tsx の Description 分岐は `typeof description !== "object"` で <pre>、
  // それ以外は JsonTree / JSON.stringify による pretty-print。string / number / 配列 /
  // プレーンオブジェクトは Message.tsx の既存挙動に乗るため許可。null / boolean は
  // 表示崩れを招くので raw に fallback する。
  if (typeof parsed === "string" || typeof parsed === "number") {
    return parsed;
  }
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed !== null && typeof parsed === "object") {
    return parsed as Record<string, unknown>;
  }
  return raw;
}
```

`Message.tsx` の `description` props 型は `string | number | Record<string, unknown> | undefined`。配列を許可するために `Message.tsx` の props 型を `string | number | Record<string, unknown> | unknown[] | undefined` に拡張する必要がある（`Message.tsx:49` の `JSON.stringify(description, null, 2)` は配列をそのまま整形表示するので挙動は変わらない）。

`LogMessages.tsx:9` を `const description = parseLogDescription(message.description);` に差し替える。

### 2. 呼び出し側は変更しない

`description: getErrorMessage(error)` の 5 箇所を `JSON.stringify(...)` で囲むと、`Filter.tsx` のフィルタテキスト二重エスケープ、`Message.tsx` 表示時の見た目変化（引用符削除のための parse 経路依存）が発生する。`LogMessage` 型自体を `description: Json` に変える別 issue が予定されているため、本 issue では呼び出し側の契約変更を行わず、受け側の防御のみで止める。

### 3. CHANGES.md エントリ

`CHANGES.md` の `## develop` の `[FIX]` セクション末尾に以下を追記する。担当者行を忘れないこと。

```
- [FIX] Log タブで `description` の `JSON.parse` 失敗で DebugPane が壊れる問題を修正する
  - `parseLogDescription` を切り出し、parse 失敗時と非 plain object のときは raw 文字列に fallback する
  - @voluntas
```

### 4. スコープ外

- `LogMessage` 型自体を `description: Json` 等に変える設計（別 issue）
- 呼び出し側の `JSON.stringify` 統一（別 issue で型変更と合わせて扱う）
- `actions.ts:1329` の `JSON.stringify(error.message)` の引用符付き表示問題（受け側 `JSON.parse` が成功して引用符が剥がれるため、本修正で実害は出ない）

## 検証手順

`src/components/DebugPane/parseLogDescription.test.ts`（新規）で純関数を `test` / `assert` でテストする（モック禁止規約）。テストメッセージは日本語。

1. `parseLogDescription` を `src/components/DebugPane/parseLogDescription.ts` にトップレベル export として配置する。
2. `LogMessages.tsx:9` を `parseLogDescription(message.description)` 呼び出しに差し替える。`Collapse` 関数の型注釈は `LogDescription` を import する形に整える。
3. テストケース:
   - 「`parseLogDescription` は JSON オブジェクト文字列を渡されたとき plain object を返す」
   - 「`parseLogDescription` は JSON 数値文字列を渡されたとき number を返す」
   - 「`parseLogDescription` は JSON 文字列リテラル (`'"foo"'`) を渡されたとき素文字列を返す」
   - 「`parseLogDescription` は素のエラー文字列 (`'failed to do X'`) を渡されたとき raw 文字列をそのまま返す」
   - 「`parseLogDescription` は空文字列を渡されたとき raw 文字列 (空文字列) を返す」
   - 「`parseLogDescription` は `'null'` を渡されたとき raw 文字列 `'null'` を返す（null fallback）」
   - 「`parseLogDescription` は `'true'` を渡されたとき raw 文字列 `'true'` を返す（boolean fallback）」
   - 「`parseLogDescription` は `'[1,2]'` を渡されたとき配列 `[1, 2]` を返す（`signalingUrlCandidates` 等の既存配列表示を維持するため）」
4. PBT を `src/components/DebugPane/parseLogDescription.prop.ts`（新規、`fast-check` の規約に従い `*.prop.ts` 命名）に追加。`fc.string()` で任意の文字列を流し、戻り値が常に `string | number | Record<string, unknown>` であり例外を投げないことを検証する。
5. 手動確認: `vp dev` で起動 → 接続 → DebugPane の Log タブを開く → デバイス切替や接続切断後の `replaceAudioTrack` を踏ませて `REPLACE_AUDIO_TRACK` などの失敗ログが入った状態で Log タブが落ちないことを確認する。

## 完了条件

- 上記 8 テスト + PBT が `vp test` で pass すること。
- 手動確認手順で Log タブが壊れないこと（リロード不要）。
- `description` の中身が `getErrorMessage` 由来の素文字列であっても `Message` コンポーネントが既存の `<pre>` 分岐で表示すること（視覚的回帰なし）。
- `Filter.tsx` のフィルタ機能が現状の挙動を維持していること（呼び出し側未変更で確保）。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 既存テスト (`vp test`) および既存 Playwright e2e が通ること。
