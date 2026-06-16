# 0052-bug-fix-signaling-url-candidates-validation

- Priority: Medium
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-signaling-url-candidates-validation
- Polished: 2026-06-16

## 目的

`parseQueryString` で `signalingUrlCandidates` を JSON.parse した後、`Array.isArray` で配列性だけ確認して `string[]` 型として下流に流している。要素の型は一切検証しないため、`?signalingUrlCandidates=[1,2,3]` のような入力が素通りし、SDK 内部の `new WebSocket(_)` で「URL invalid」`SyntaxError` (`DOMException`) を引き起こす。境界で要素の `typeof === "string"` も検証して `undefined` に落とす。

OPFS 経路 (`loadUrlEntries` の同種ガード抜け) は [[0059-bug-fix-load-url-entries-element-validation]] で別途扱う。UI モーダル経路 (`SignalingUrlModal` の `setSignalingUrlCandidates` 呼び出し) と setter のランタイム検証は本 issue では扱わない（後述「スコープ外」）。

## 優先度根拠

- 即時クラッシュではないが、SDK 内部の `new WebSocket(1)` で `Failed to construct 'WebSocket': The URL '1' is invalid` 系の `SyntaxError` が投げられ、UI には `Failed to connect Sora` のような不明瞭エラーで返るためデバッグが困難。
- ユーザーが踏める経路は URL クエリ（`?signalingUrlCandidates=[1,2,3]`）。URL 共有・ブックマーク経由で意図せず混入する可能性があるため Low ではない。
- 即時クラッシュではないため High ではない。
- 修正は `parseQueryString` の `Array.isArray` ガードに `every((item) => typeof item === "string")` 追加 + 単体テスト 6 件（異常系 5 件 + 回帰防止 1 件）+ PBT 1 件で完結する。影響範囲は `src/utils.ts` の `parseQueryString` 内 1 箇所のみ。Medium とする。

## 現状の問題

行番号は陳腐化するため記載しない。各箇所は関数名（`parseQueryString` の `signalingUrlCandidates` パース部分 / `createSignalingURL`）と呼び出し側（`applySignalingUrlCandidates` 等）で特定する。

### 現状のコード

`src/utils.ts` の `parseQueryString` 内で `signalingUrlCandidates` を次のようにパース・代入している:

```ts
// JSON.parse 部
let signalingUrlCandidates: unknown;
const signalingUrlCandidatesValue = searchParams.get("signalingUrlCandidates");
if (signalingUrlCandidatesValue !== null) {
  try {
    signalingUrlCandidates = JSON.parse(signalingUrlCandidatesValue);
  } catch {
    // 例外の場合は何もしない
  }
}

// 結果オブジェクトへの代入
signalingUrlCandidates: Array.isArray(signalingUrlCandidates)
  ? signalingUrlCandidates
  : undefined,
```

`Array.isArray` の標準型ガードは `signalingUrlCandidates: unknown` を `unknown[]` までしか narrow しないが、`Partial<QueryStringParameters>` の `signalingUrlCandidates: string[] | undefined`（`src/types.ts`）への代入は構造的型適合の挙動で素通る。結果として `[1, 2, 3]` のような非 string 配列が `string[]` として下流に流れる。

### 入力経路と本 issue の対象

| 経路        | 流れ                                                                                                | 本 issue で扱う             |
| ----------- | --------------------------------------------------------------------------------------------------- | --------------------------- |
| URL クエリ  | `parseQueryString` → `applySignalingUrlCandidates` → `signals.setSignalingUrlCandidates`            | はい（本丸）                |
| OPFS        | `loadUrlEntries` → `applySignalingUrlCandidates` の else 分岐 → `signals.setSignalingUrlCandidates` | いいえ（0059 で扱う）       |
| UI モーダル | `SignalingUrlModal` → OPFS 保存 / `setSignalingUrlCandidates`                                       | いいえ（UI 改善は別 issue） |

### SDK の挙動

`node_modules/sora-js-sdk/dist/sora.js`（minified bundle）の `getSignalingWebSocket(e)` は要素を型検査せずそのまま `new WebSocket(_)` に渡す。`WebSocket` コンストラクタの WebIDL 引数は `USVString` 変換が走るため:

- `1` → `"1"` → URL パースで `SyntaxError: Failed to construct 'WebSocket': The URL '1' is invalid`
- `null` → `"null"` → 同上
- `true` → `"true"` → 同上
- `{}` → `"[object Object]"` → 同上
- `["wss://...", 1]` 混在: 複数候補分岐に入り 1 要素ずつ並列接続を試みるため、1 番目が成功すれば見えにくいが、2 番目で同種 `SyntaxError`

`createSignalingURL`（`src/utils.ts` L263-277）は `enabledSignalingUrlCandidates` が true のときに `=== ""` 空文字列のみ filter する。非 string 要素は filter されないため、本 issue が `parseQueryString` 段階で防がない限り SDK まで届く。

「`[]` 受理時の挙動」については次のとおり ( `applySignalingUrlCandidates` 自体は length チェックを持たないが、別箇所のガードで SDK には届かない):

- `applySignalingUrlCandidates` (`src/app/actions.ts` L263-275) は `qsParams.signalingUrlCandidates !== undefined` のチェックのみで `[]` を `signals.setSignalingUrlCandidates([])` に流す。
- `activateEnabledFlags` (`src/app/actions.ts` L303-305) で `if (signals.signalingUrlCandidates.value.length > 0)` の判定によって `enabledSignalingUrlCandidates` を true 化するか決まる。 `[]` のときは false のまま。
- 結果として `createSignalingURL(false, [])` 呼び出しになり、 dev では `VITE_SORA_SIGNALING_URL`、本番では `${location.protocol}//${location.hostname}:${port}/signaling` にフォールバックする。 SDK には空配列ではなくフォールバック URL が渡る。

### エッジケース一覧

| 入力 URL string                                     | `JSON.parse` 結果              | 修正前 `signalingUrlCandidates`                                                            | 修正後 `signalingUrlCandidates`                                   | 備考                                                                                                                                                                                                |
| --------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `?signalingUrlCandidates=` (空)                     | `undefined` (parse 試行されず) | `undefined`                                                                                | `undefined`                                                       | 変化なし                                                                                                                                                                                            |
| `?signalingUrlCandidates={invalid}`                 | `JSON.parse` 例外              | `undefined`                                                                                | `undefined`                                                       | 変化なし                                                                                                                                                                                            |
| `?signalingUrlCandidates={"a":1}`                   | `{a:1}`                        | `undefined` (`Array.isArray` false)                                                        | `undefined`                                                       | 変化なし                                                                                                                                                                                            |
| `?signalingUrlCandidates=[]`                        | `[]`                           | `[]` (受理)                                                                                | `[]` (受理)                                                       | 空配列は `every` で true。`activateEnabledFlags` の length > 0 判定で `enabledSignalingUrlCandidates` が true 化されず、`createSignalingURL` がフォールバック URL を返すため SDK に空配列は届かない |
| `?signalingUrlCandidates=[1,2,3]`                   | `[1,2,3]`                      | `[1,2,3]` (受理、SDK で SyntaxError)                                                       | `undefined`                                                       | **本丸**                                                                                                                                                                                            |
| `?signalingUrlCandidates=[null]`                    | `[null]`                       | `[null]` (同上)                                                                            | `undefined`                                                       | 本丸                                                                                                                                                                                                |
| `?signalingUrlCandidates=[true]`                    | `[true]`                       | `[true]` (同上)                                                                            | `undefined`                                                       | 本丸                                                                                                                                                                                                |
| `?signalingUrlCandidates=[{}]`                      | `[{}]`                         | `[{}]` (同上)                                                                              | `undefined`                                                       | 本丸                                                                                                                                                                                                |
| `?signalingUrlCandidates=[""]`                      | `[""]`                         | `[""]` (受理、`createSignalingURL` で filter されて空配列、SDK で「array is empty」エラー) | `[""]` (同左、要素は string なので受理。空文字列の挙動は既存通り) | 変化なし                                                                                                                                                                                            |
| `?signalingUrlCandidates=["wss://...","wss://..."]` | `["wss://...", "wss://..."]`   | 正常                                                                                       | 正常                                                              | 変化なし                                                                                                                                                                                            |
| `?signalingUrlCandidates=["wss://...",1]`           | `["wss://...", 1]`             | 受理（混在、2 要素目で SDK SyntaxError）                                                   | `undefined`                                                       | 混在も全弾き                                                                                                                                                                                        |

## 設計方針

### `parseQueryString` の修正

`src/utils.ts` の `parseQueryString` 内、`signalingUrlCandidates` の結果オブジェクト代入部を次のように変更する。

**before**:

```ts
signalingUrlCandidates: Array.isArray(signalingUrlCandidates)
  ? signalingUrlCandidates
  : undefined,
```

**after**:

`parseQueryString` 直前 (またはモジュールトップレベル) に型ガード関数を定義する。

```ts
// signalingUrlCandidates の配列性 + 要素 string 性を両方検証する型ガード関数。
// 要素に number / null / boolean / object が混在すると SDK 内部の new WebSocket(_) が
// USVString 変換後 URL パースに失敗して SyntaxError (DOMException) を投げるため、境界で undefined に落とす。
// every は空配列で true を返すため `[]` は受理されるが、`activateEnabledFlags` の length > 0 判定で
// `enabledSignalingUrlCandidates` が true 化されず、`createSignalingURL` がフォールバック URL を返すため SDK に空配列は届かない。
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
```

結果オブジェクトの代入は次のとおり ( `as` キャストは型ガード関数で narrow するため不要)。

```ts
signalingUrlCandidates: isStringArray(signalingUrlCandidates) ? signalingUrlCandidates : undefined,
```

`as string[]` キャストではなく型ガード関数を採用する理由は、「型で解決を優先、disable は型/リンターの誤検知に限定」とするプロジェクト方針に合わせるため。 0051 で `as` キャストを残置している判断とは別経路の方針だが、`Array.isArray + every` の組み合わせは型ガード関数として再利用しやすい形状のため本 issue では型ガード関数化を採用する。

### 他経路への防御を本 issue に入れない理由

- `setSignalingUrlCandidates(value: string[])` setter は呼び出し側で型保証する責務分担を維持する（[[0051-bug-fix-forwarding-filters-undefined-cast]] と同方針）。
- `createSignalingURL` は `parseQueryString` で `string[] | undefined` を保証すれば「`string[]` 想定」で良い。
- OPFS 経路は [[0059-bug-fix-load-url-entries-element-validation]] で別途扱う。UI モーダル経路の Connect 抑止は別 issue。

## テスト戦略

### `src/utils.test.ts` への単体テスト追加

既存の `parseQueryString` テストには `signalingUrlCandidates` のテストが 3 件（正常系 / JSON.parse 失敗 / 非配列）あるが、要素型異常系は未カバー。テスト 6 件（異常系 5 件 + 回帰防止 1 件）を追加する。

`parseQueryString` は既に `src/utils.test.ts` の named import に含まれているため追加 import は不要。

```ts
test("signalingUrlCandidates の要素が全て number の場合は undefined になる", () => {
  const searchParams = new URLSearchParams();
  searchParams.set("signalingUrlCandidates", JSON.stringify([1, 2, 3]));
  const result = parseQueryString(searchParams);
  assert.equal(result.signalingUrlCandidates, undefined);
});

test("signalingUrlCandidates の要素が全て null の場合は undefined になる", () => {
  const searchParams = new URLSearchParams();
  searchParams.set("signalingUrlCandidates", JSON.stringify([null, null]));
  const result = parseQueryString(searchParams);
  assert.equal(result.signalingUrlCandidates, undefined);
});

test("signalingUrlCandidates の要素が全て boolean の場合は undefined になる", () => {
  const searchParams = new URLSearchParams();
  searchParams.set("signalingUrlCandidates", JSON.stringify([true, false]));
  const result = parseQueryString(searchParams);
  assert.equal(result.signalingUrlCandidates, undefined);
});

test("signalingUrlCandidates の要素が全て object の場合は undefined になる", () => {
  const searchParams = new URLSearchParams();
  searchParams.set("signalingUrlCandidates", JSON.stringify([{ url: "wss://x" }]));
  const result = parseQueryString(searchParams);
  assert.equal(result.signalingUrlCandidates, undefined);
});

test("signalingUrlCandidates に文字列と非文字列が混在する配列は undefined になる", () => {
  const searchParams = new URLSearchParams();
  searchParams.set("signalingUrlCandidates", JSON.stringify(["wss://example.com/signaling", 1]));
  const result = parseQueryString(searchParams);
  assert.equal(result.signalingUrlCandidates, undefined);
});

test("signalingUrlCandidates が空配列 [] の場合は空配列として受理される（既存挙動の回帰防止）", () => {
  const searchParams = new URLSearchParams();
  searchParams.set("signalingUrlCandidates", JSON.stringify([]));
  const result = parseQueryString(searchParams);
  assert.deepEqual(result.signalingUrlCandidates, []);
});
```

### `src/utils.prop.ts` への PBT 追加

`parseQueryString` は既に `src/utils.prop.ts` の named import に含まれている。 PBT は `utils.prop.ts` 既存パターンに揃えて `test.prop([...])` API ( `@fast-check/vitest` 由来) で書く ( `fc.assert` + 裸の `test` 形式は使わない)。

異常系を含む arbitrary は既存の `signalingUrlCandidatesArb` (`fc.array(fc.webUrl())`、正常系のみ) と混同しないよう `signalingUrlCandidatesWithInvalidArb` のような明示的な命名で別建てに定義する。要素は `fc.oneof` で文字列・整数・null・boolean・JSON 値を混在生成する。 `fc.dictionary(fc.string(), fc.anything())` は `fc.anything()` が `BigInt` / `Function` / 循環参照を含み得て `JSON.stringify` が TypeError を投げるため使わず、 `fc.jsonValue()` を採用する。

```ts
const signalingUrlCandidatesWithInvalidArb = fc.array(
  fc.oneof(fc.webUrl(), fc.integer(), fc.constant(null), fc.boolean(), fc.jsonValue(), fc.string()),
  { minLength: 1 },
);

test.prop([signalingUrlCandidatesWithInvalidArb])(
  "signalingUrlCandidates のパース結果は常に undefined または string[] になる",
  (arr) => {
    const searchParams = new URLSearchParams();
    searchParams.set("signalingUrlCandidates", JSON.stringify(arr));
    const result = parseQueryString(searchParams);
    const v = result.signalingUrlCandidates;
    assert.isTrue(
      v === undefined || (Array.isArray(v) && v.every((item) => typeof item === "string")),
    );
  },
);
```

本 PBT は「正常 / 異常 どちらの配列でも不変条件 (undefined または string[]) を満たす」ことのみ検証する。「異常系入力が undefined に落ちる」ことの確認は単体テスト 6 件 (本 issue の異常系 5 件) でカバーする。

## 影響範囲と後方互換

- 修正後、`?signalingUrlCandidates=[1,2,3]` などの不正値は **silent に undefined** になる（修正前は SDK 内部で `SyntaxError`、修正後は OPFS 経路 / デフォルト URL にフォールバック）。
- `?signalingUrlCandidates=[""]` の挙動は変わらない（空文字列は string なので `every` で受理され、下流の `createSignalingURL` で `=== ""` filter されて結果的に空配列扱い）。
- `?signalingUrlCandidates=[]` の挙動は変わらない（`every` は空配列で true、呼び出し側ガードで SDK に届かない）。
- CLAUDE.md「後方互換性は考慮しないこと」方針により、`?signalingUrlCandidates=[1,2,3]` の silent 無視はバグ修正の結果として `[FIX]` に分類する。

## CHANGES.md エントリ

`CHANGES.md` の `## develop` 内 `[FIX]` セクション末尾（`### misc` セクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `signalingUrlCandidates` の URL クエリ経路で配列要素の型検証が漏れていた問題を修正する
  - `parseQueryString` で `Array.isArray` に加えて `every((item) => typeof item === "string")` を要求する
  - 不正要素を含む場合は `undefined` に落とし、SDK 側 `new WebSocket(_)` の `SyntaxError` を回避する
  - @voluntas
```

## 関連 issue

- [[0051-bug-fix-forwarding-filters-undefined-cast]]: 同種の境界型検証 issue（`createConnectOptions` 内の `parseMetadata` 戻り値ガード）。本 issue は `parseQueryString` の URL クエリ経路、0051 は `createConnectOptions` の補助関数群で対象範囲は別。設計方針（境界で型検証、setter は触らない、`Array.isArray` で narrow + `as` キャスト残置）は両 issue で揃える。
- [[0059-bug-fix-load-url-entries-element-validation]]: OPFS 経路の同種ガード抜け。`loadUrlEntries` で `{ url: string; enabled: boolean }` 構造を検証する別 issue。本 issue とは扱う経路が別だが、OPFS 経路の防御が抜けると本 issue だけでは完全に守れないため、両者をセットでマージする想定。

## スコープ外

下記は本 issue では扱わない:

- OPFS 経路の要素型検証 → [[0059-bug-fix-load-url-entries-element-validation]] で扱う。
- UI モーダル経由の入力バリデーション: `SignalingUrlModal` で URL 文字列を保存する際の検証拡張は本 issue では扱わない（別 issue）。
- `setSignalingUrlCandidates` setter のランタイム要素検証: 呼び出し側で型保証する責務分担を維持する。
- エラーメッセージ改善: 不正な `signalingUrlCandidates` が silent 無視される際の「設定が無視されました」アラート（別 issue）。
- SDK 型 `string | string[]` の string 単一形式サポート: 本リポジトリの `QueryStringParameters.signalingUrlCandidates` は `string[]` 固定。string 単一形式を URL パラメータで受理する拡張は別 issue。

## 検証手順

### A. 修正前の再現

1. `pnpm dev` で起動。
2. `?signalingUrlCandidates=[1,2,3]` の URL で開く。
3. Connect ボタン押下。
4. DebugPane の Log で SDK 内部の `new WebSocket(1)` 由来の `SyntaxError`（または `Failed to construct 'WebSocket': The URL '1' is invalid` 系の `DOMException`）が記録され、UI に `Failed to connect Sora` 系のエラーが出ることを確認する。

### B. 修正後の確認

5. 同じ URL で開く → `parseQueryString` の段階で `undefined` に落ち、`applySignalingUrlCandidates` の else 分岐で OPFS から URL を読み込む（OPFS が空ならデフォルト URL `wss://<host>/signaling` で接続を試みる）ことを確認する。
6. `?signalingUrlCandidates=[null]` / `[true]` / `[{}]` / `["wss://...",1]` 混在ケースで同様に `undefined` に落ちることを確認する。
7. `?signalingUrlCandidates=[]` で `signalingUrlCandidates: []` がセットされ、`enabledSignalingUrlCandidates && length > 0` ガードで SDK には届かないことを確認する（既存挙動の維持）。

### C. 正常系の回帰

8. `?signalingUrlCandidates=["wss://example.com/signaling"]` で開いて `SIGNALING_URL` ログに正しい URL が乗ることを確認する。
9. `?signalingUrlCandidates=["wss://a/","wss://b/"]` で複数 URL でも同様に動作することを確認する。
10. `?signalingUrlCandidates=[""]` の既存挙動（空文字列は受理されて `createSignalingURL` で filter）が変わらないことを確認する。

### D. テスト

11. `pnpm test` が pass すること（追加した単体テスト 6 件 + PBT 1 件を含む）。
12. 既存 Playwright e2e（`pnpm test:e2e`）が pass すること（`signalingUrlCandidates` を扱う e2e の非退行）。

## 完了条件

- 検証手順 A-D すべてが通過すること。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 追加した単体テスト 6 件 + PBT 1 件が pass すること。
- 既存テスト（`pnpm test`）および既存 Playwright e2e が通ること。
