# 0059-bug-fix-load-url-entries-element-validation

- Priority: Medium
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-load-url-entries-element-validation
- Polished: 2026-06-16

## 目的

`loadUrlEntries` (`src/opfs.ts`) は `JSON.parse` 後に `Array.isArray(settings.urlEntries)` で配列性のみ確認し、要素 `{ url: string; enabled: boolean }` の構造を検証していない。ユーザーが DevTools の Application タブで OPFS の `signaling-url-candidates.json` を直接書き換えた場合や、将来のスキーマ変更で互換性が崩れた場合に、不正な要素（`{ url: 42, enabled: "yes" }` 等）が `setSignalingUrlCandidates` に届く経路がある。要素の型検証を追加し、不正な要素を含む場合は空配列を返すことで境界で防御する。

## 優先度根拠

- 即時のクラッシュではないため High ではない。
- ユーザーが直接 OPFS ファイルを編集する経路は限定的だが、`SignalingUrlModal` の保存形式が将来変わったり、別ブラウザ / 別バージョンで保存したファイルを読み込む際にスキーマ崩れが起きる可能性がある。Low ではない。
- 本 issue は [[0052-bug-fix-signaling-url-candidates-validation]] の「OPFS 経路」スコープ外として明示的に切り出されたもの。同種の境界バリデーションを OPFS 経路にも追加する。
- 修正は数行で完結し、影響範囲は `src/opfs.ts` の `loadUrlEntries` 関数のみ。

## 現状の問題

行番号は陳腐化するため記載しない。`src/opfs.ts` の `loadUrlEntries` 関数を関数名で特定する。

### 該当コード

```ts
const settings = JSON.parse(text) as SignalingUrlCandidatesSettings;

if (Array.isArray(settings.urlEntries)) {
  return settings.urlEntries;
}

return [];
```

`Array.isArray` で配列性のみ検証。要素 `{ url: string; enabled: boolean }` の構造は未検証。

### 影響経路

`loadUrlEntries` の戻り値は次の経路で消費される:

- `SignalingUrlModal` の初期表示（編集 UI）
- `applySignalingUrlCandidates` の else 分岐（URL クエリ未指定時のフォールバック）→ `signals.setSignalingUrlCandidates`

`setSignalingUrlCandidates` は型 `string[]` を期待するが、本 issue の対象は `loadUrlEntries` の戻り値 `UrlEntry[]`（`{ url: string; enabled: boolean }[]`）の構造検証。下流での `urlEntries.filter(e => e.enabled).map(e => e.url)` 相当の変換で `string[]` に落とすため、要素が `{ url: 42, enabled: "yes" }` だと URL に number が紛れて [[0052]] と同じ SDK SyntaxError 経路に到達する。

### `UrlEntry` 型定義

`src/opfs.ts` で次のように定義:

```ts
export interface UrlEntry {
  url: string;
  enabled: boolean;
}

export interface SignalingUrlCandidatesSettings {
  urlEntries: UrlEntry[];
}
```

`as SignalingUrlCandidatesSettings` キャストは TypeScript 上の偽装で、JSON.parse の戻り値は実行時には任意の形状を取り得る。

## 設計方針

### `loadUrlEntries` の要素検証追加

`src/opfs.ts` の `loadUrlEntries` 関数:

**before**:

```ts
const settings = JSON.parse(text) as SignalingUrlCandidatesSettings;

if (Array.isArray(settings.urlEntries)) {
  return settings.urlEntries;
}

return [];
```

**after**:

```ts
// JSON.parse の戻り値は実行時には任意の形状を取り得るため、
// SignalingUrlCandidatesSettings キャストは型上の偽装に過ぎない。
// 要素の url / enabled 構造を実行時に検証し、不正な要素を含む場合は空配列を返す。
// 検証失敗時の挙動は既存の catch 経路（return []）と同じ。
const settings = JSON.parse(text) as unknown;

if (
  typeof settings === "object" &&
  settings !== null &&
  "urlEntries" in settings &&
  Array.isArray(settings.urlEntries) &&
  settings.urlEntries.every(
    (entry: unknown): entry is UrlEntry =>
      typeof entry === "object" &&
      entry !== null &&
      "url" in entry &&
      typeof entry.url === "string" &&
      "enabled" in entry &&
      typeof entry.enabled === "boolean",
  )
) {
  return settings.urlEntries;
}

return [];
```

`as SignalingUrlCandidatesSettings` から `as unknown` に変えて、コンパイル時にプロパティアクセスを禁じる。`typeof === "object" && !== null && "key" in x && typeof x.key === "type"` の標準パターンで narrow する。`every` の述語に type predicate (`entry is UrlEntry`) を付けて narrow 後の型を `UrlEntry[]` にする。

### 設計上の判断

- **空配列 `[]` は受理する**: `every` は空配列で true を返すため `{ urlEntries: [] }` は受理される。これは「ユーザーが URL を一つも登録していない初期状態」と等価で、既存の `Array.isArray` のみガード時と同じ挙動。
- **部分的に有効な要素を救済しない**: 配列内に 1 つでも不正要素があれば全体を空配列に落とす（途中要素を `filter` で救済しない）。OPFS ファイルが壊れている状態で部分的に救済すると、ユーザーは「自分の登録した URL が消えた」状態に気づきにくい。空配列に落とせば SignalingUrlModal で「未登録状態」として明確に観測できる。
- **検証失敗時のエラー通知は本 issue では行わない**: 既存の catch 経路と同じく silent に空配列を返す。「OPFS ファイルが壊れている」事象を AlertMessages で通知する UI 改善は別 issue で扱う。

### エッジケース一覧

| OPFS ファイルの中身                                          | `JSON.parse` 結果                  | 修正前                             | 修正後              | 備考                               |
| ------------------------------------------------------------ | ---------------------------------- | ---------------------------------- | ------------------- | ---------------------------------- |
| ファイル無し                                                 | -                                  | `[]` (`catch` 経路)                | `[]` (同上)         | 変化なし                           |
| `{invalid}`                                                  | `JSON.parse` 例外                  | `[]` (`catch` 経路)                | `[]` (同上)         | 変化なし                           |
| `{}`                                                         | `{}`                               | `[]` (`urlEntries` 未定義で false) | `[]`                | 変化なし                           |
| `{ "urlEntries": [] }`                                       | `{urlEntries:[]}`                  | `[]` (受理、空配列)                | `[]` (受理、空配列) | 変化なし                           |
| `{ "urlEntries": null }`                                     | `{urlEntries:null}`                | `[]` (`Array.isArray` false)       | `[]`                | 変化なし                           |
| `{ "urlEntries": [{ "url": "wss://x", "enabled": true }] }`  | 正常                               | 正常 (受理)                        | 正常 (受理)         | 変化なし                           |
| `{ "urlEntries": [{ "url": 42, "enabled": true }] }`         | `[{url:42, enabled:true}]`         | **受理（不正要素を下流に流す）**   | `[]`                | **本丸**: number を URL として扱う |
| `{ "urlEntries": [{ "url": "wss://x", "enabled": "yes" }] }` | `[{url:"wss://x", enabled:"yes"}]` | **受理（enabled が string）**      | `[]`                | 本丸: enabled が string            |
| `{ "urlEntries": [{ "url": "wss://x" }] }`                   | `[{url:"wss://x"}]`                | **受理（enabled 欠落）**           | `[]`                | 本丸: 必須フィールド欠落           |
| `{ "urlEntries": [null] }`                                   | `[null]`                           | **受理（null 要素）**              | `[]`                | 本丸: null 要素                    |
| `{ "urlEntries": [valid, invalid] }` 混在                    | `[{...}, {url:42,...}]`            | **受理（混在）**                   | `[]`                | 本丸: 1 件でも不正なら全体破棄     |

## テスト戦略

### 新規ユニットテスト追加

`src/opfs.test.ts`（新規）で `loadUrlEntries` をテストする。テストメッセージは日本語、`test` / `assert` API を使用、モック禁止。

OPFS API は jsdom 環境にも限定的に存在するが、本リポジトリの既存テスト基盤では OPFS 直接アクセスは行っていない。`loadUrlEntries` は OPFS への副作用と JSON パース＋型検証の 2 層からなるが、本 issue の修正対象は **後半の型検証ロジック** であり、OPFS を経由しない純粋関数として切り出すと jsdom 環境でも単体テストできる。

具体的には次の小リファクタを行う:

- `loadUrlEntries` 内の「JSON.parse + 型検証」部分を `parseUrlEntriesFromText(text: string): UrlEntry[]` という export 関数に切り出す。
- `loadUrlEntries` は OPFS 経由でファイルを読んで `parseUrlEntriesFromText(text)` を呼ぶ薄いラッパーになる。
- 既存の `catch` 経路（パースエラーで空配列を返す）も `parseUrlEntriesFromText` 内に閉じ込める（`JSON.parse` を try/catch で囲む）。

`src/opfs.ts`:

```ts
// OPFS から読んだテキストを UrlEntry[] にパース・検証する純粋関数
export function parseUrlEntriesFromText(text: string): UrlEntry[] {
  let settings: unknown;
  try {
    settings = JSON.parse(text);
  } catch {
    return [];
  }
  if (
    typeof settings === "object" &&
    settings !== null &&
    "urlEntries" in settings &&
    Array.isArray(settings.urlEntries) &&
    settings.urlEntries.every(
      (entry: unknown): entry is UrlEntry =>
        typeof entry === "object" &&
        entry !== null &&
        "url" in entry &&
        typeof entry.url === "string" &&
        "enabled" in entry &&
        typeof entry.enabled === "boolean",
    )
  ) {
    return settings.urlEntries;
  }
  return [];
}

export async function loadUrlEntries(): Promise<UrlEntry[]> {
  try {
    if (!navigator.storage?.getDirectory) {
      return [];
    }
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(SETTINGS_FILE_NAME, { create: false });
    const file = await fileHandle.getFile();
    const text = await file.text();
    return parseUrlEntriesFromText(text);
  } catch {
    return [];
  }
}
```

ユニットテスト 8 件（異常系 6 件 + 回帰防止 2 件）:

```ts
import { assert, test } from "vite-plus/test";

import { parseUrlEntriesFromText } from "./opfs.ts";

test("parseUrlEntriesFromText は invalid JSON 文字列を渡されたとき空配列を返す", () => {
  assert.deepEqual(parseUrlEntriesFromText("{invalid}"), []);
});

test("parseUrlEntriesFromText は urlEntries が無い JSON を渡されたとき空配列を返す", () => {
  assert.deepEqual(parseUrlEntriesFromText("{}"), []);
});

test("parseUrlEntriesFromText は urlEntries が空配列の JSON を渡されたとき空配列を返す", () => {
  assert.deepEqual(parseUrlEntriesFromText('{"urlEntries":[]}'), []);
});

test("parseUrlEntriesFromText は urlEntries が null の JSON を渡されたとき空配列を返す", () => {
  assert.deepEqual(parseUrlEntriesFromText('{"urlEntries":null}'), []);
});

test("parseUrlEntriesFromText は url が number の要素を含む JSON を渡されたとき空配列を返す", () => {
  assert.deepEqual(parseUrlEntriesFromText('{"urlEntries":[{"url":42,"enabled":true}]}'), []);
});

test("parseUrlEntriesFromText は enabled が string の要素を含む JSON を渡されたとき空配列を返す", () => {
  assert.deepEqual(
    parseUrlEntriesFromText('{"urlEntries":[{"url":"wss://x","enabled":"yes"}]}'),
    [],
  );
});

test("parseUrlEntriesFromText は enabled が欠落した要素を含む JSON を渡されたとき空配列を返す", () => {
  assert.deepEqual(parseUrlEntriesFromText('{"urlEntries":[{"url":"wss://x"}]}'), []);
});

test("parseUrlEntriesFromText は正常な要素のみの JSON を渡されたとき要素配列を返す（既存挙動の回帰防止）", () => {
  assert.deepEqual(
    parseUrlEntriesFromText(
      '{"urlEntries":[{"url":"wss://a","enabled":true},{"url":"wss://b","enabled":false}]}',
    ),
    [
      { url: "wss://a", enabled: true },
      { url: "wss://b", enabled: false },
    ],
  );
});
```

### PBT 追加

`src/opfs.prop.ts` (新規) で property test を追加する。 PBT は `utils.prop.ts` 既存パターンに揃えて `test.prop([...])` API ( `@fast-check/vitest` 由来) で書く ( `fc.assert` + 裸の `test` 形式は使わない)。

```ts
import { fc, test } from "@fast-check/vitest";
import { assert } from "vite-plus/test";

import { parseUrlEntriesFromText } from "./opfs.ts";

test.prop([fc.string()])("parseUrlEntriesFromText は任意の文字列入力で例外を投げない", (text) => {
  parseUrlEntriesFromText(text);
});

test.prop([fc.string()])(
  "parseUrlEntriesFromText の戻り値は常に UrlEntry[] の形状を持つ",
  (text) => {
    // 戻り値型 UrlEntry[] を unknown 経由で受けて narrow を解除し、 実行時形状を再検査する。
    // 戻り値型のまま `entry.url` / `entry.enabled` を `typeof` で検査すると型情報そのままのトートロジーになり、
    // 「実装が `as UrlEntry[]` 等で型を偽装したまま実行時形状が崩れた場合」を捕捉できない。
    const result: unknown = parseUrlEntriesFromText(text);
    assert.isTrue(Array.isArray(result));
    if (!Array.isArray(result)) {
      return;
    }
    for (const entry of result) {
      assert.isTrue(typeof entry === "object" && entry !== null);
      assert.isTrue(typeof (entry as { url?: unknown }).url === "string");
      assert.isTrue(typeof (entry as { enabled?: unknown }).enabled === "boolean");
    }
  },
);
```

### e2e

既存 e2e は `SignalingUrlModal` を踏むシナリオを持たない。本 issue のために新規シナリオを追加するコストは過大。OPFS 経由の検証は手動検証で行う。

## CHANGES.md エントリ

`CHANGES.md` の `## develop` 内 `[FIX]` セクション末尾 ( `### misc` セクションの直前) に以下を追記する。担当者行を忘れないこと。 0052 (URL クエリ経路の同種検証) とセットでマージする想定 (マージ順は不問) で、 両者は `[FIX]` 末尾の隣接位置に並ぶ。先にマージされた方が上、後の方が下になる ( `shiguredo-changelog` 規約「種別順 + 末尾追記」に従う)。

```
- [FIX] `loadUrlEntries` の OPFS 読み込みで要素の型検証が漏れていた問題を修正する
  - `{ url: string; enabled: boolean }` の構造を `every` で検証し、不正な要素を含む場合は空配列を返す
  - JSON.parse + 型検証を `parseUrlEntriesFromText` に切り出してユニットテスト可能にする
  - @voluntas
```

## スコープ外

下記は本 issue では扱わない:

- **OPFS ファイル壊れ時のエラー通知**: 不正な OPFS ファイルが silent に空配列扱いされる際に「設定が壊れています」アラートを出す UI 改善は別 issue。
- **OPFS スキーマバージョン管理**: 将来 `UrlEntry` に新フィールド (`label` 等) が追加された場合の互換性管理は別 issue。
- **`SignalingUrlModal` の入力バリデーション拡張**: `isValidUrl` の WebSocket スキーム検証など UI 側の改善は別 issue。
- **`saveUrlEntriesToOPFS` 側の検証**: 保存時は TypeScript 型で `UrlEntry[]` を保証しているため、本 issue の読み込み側検証で十分。

## 関連 issue

- [[0052-bug-fix-signaling-url-candidates-validation]]: URL クエリ経路の要素型検証。本 issue は OPFS 経路を扱う。両者をセットでマージする想定（マージ順は不問）。

## 検証手順

### A. テスト

1. `pnpm test src/opfs.test.ts src/opfs.prop.ts` が pass すること（追加した単体 8 件 + PBT 2 件含む）。

### B. 手動再現と修正後確認

2. `pnpm dev` で起動。
3. `SignalingUrlModal` を開き、有効な URL を 2 件追加して保存する。OPFS に `signaling-url-candidates.json` が書き込まれる。
4. Chrome DevTools の Application タブ → Storage → IndexedDB / Origin private file system で `signaling-url-candidates.json` を直接編集し、次のような不正な内容にする:
   ```json
   {
     "urlEntries": [
       { "url": 42, "enabled": true },
       { "url": "wss://valid", "enabled": "yes" }
     ]
   }
   ```
5. ページをリロード。修正前: `setSignalingUrlCandidates` に不正値が届き、Connect 時に SDK 内で `Failed to construct 'WebSocket'` 系の SyntaxError が出る。修正後: 空配列が返り、`SignalingUrlModal` の URL 一覧が空表示になることを確認する。
6. 同じ内容で `{ "urlEntries": [] }` を書き込みリロードして空配列扱いを確認する（既存挙動の回帰防止）。

### C. 正常系の回帰

7. `SignalingUrlModal` で正常な URL を追加 → リロード → 復元できることを確認する。

### D. テスト

8. `pnpm test` が pass すること。
9. 既存 Playwright e2e（`pnpm test:e2e`）が pass すること。

## 完了条件

- 検証手順 A-D すべてが通過すること。
- `loadUrlEntries` の戻り値が `{ url: string; enabled: boolean }[]` であることを実行時保証すること。
- 不正な要素を含む場合は空配列を返すこと（混在ケース含めて全体破棄）。
- `parseUrlEntriesFromText` が export されてユニットテスト可能であること。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 追加したユニットテスト 8 件 + PBT 2 件が pass すること。
- 既存テスト（`pnpm test`）および既存 Playwright e2e が pass すること。
