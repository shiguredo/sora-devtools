# 0052-bug-fix-signaling-url-candidates-validation

- Priority: Medium
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-signaling-url-candidates-validation
- Polished: 2026-06-09

## 目的

`parseQueryString` (`src/utils.ts:90-260`) で `signalingUrlCandidates` を JSON.parse した後、`Array.isArray` で配列性だけ確認して `string[]` 型として下流に流している。要素の型は一切検証しないため、`?signalingUrlCandidates=[1,2,3]` のような入力が素通りし、SDK 内部の `new WebSocket(_)` (`sora-js-sdk/dist/sora.mjs:888-908`) で「URL invalid」`SyntaxError` (`DOMException`) を引き起こす。境界で要素の `typeof === "string"` も検証して `undefined` に落とす。

OPFS 経路 (`loadUrlEntries` の同種ガード抜け) と UI モーダル経路 (`SignalingUrlModal` の `setSignalingUrlCandidates` 呼び出し) は別 issue でスコープ管理する（後述「7. スコープ外」）。

## 優先度根拠

- 即時クラッシュではないが、SDK 内部の `new WebSocket(1)` で `Failed to construct 'WebSocket': The URL '1' is invalid` 系の `SyntaxError` が投げられ、UI には `Failed to connect Sora` のような不明瞭エラーで返るためデバッグが困難。
- ユーザーが踏める経路は URL クエリ（`?signalingUrlCandidates=[1,2,3]`）。URL 共有・ブックマーク経由で意図せず混入する可能性があるため Low ではない。
- 即時クラッシュではないため High ではない。
- 修正は `parseQueryString` の `Array.isArray` ガードに `every((item) => typeof item === "string")` 追加 + 単体テスト 6 件（異常系 5 件 + 回帰防止 1 件）+ PBT 1 件で完結する。影響範囲は `src/utils.ts` の `parseQueryString` 内 1 関数のみ。
- Medium とする。

## 現状の問題

実装時に行番号がずれている可能性があるため、関数名（`parseQueryString` の `signalingUrlCandidates` パース部分）を基準に特定すること。Polished 時点は 2026-06-09。

### 現状のコード

`src/utils.ts:115-124` で JSON.parse:

```ts
// signalingUrlCandidates のパース
let signalingUrlCandidates: unknown;
const signalingUrlCandidatesValue = searchParams.get("signalingUrlCandidates");
if (signalingUrlCandidatesValue !== null) {
  try {
    signalingUrlCandidates = JSON.parse(signalingUrlCandidatesValue);
  } catch {
    // 例外の場合は何もしない
  }
}
```

`src/utils.ts:172-174` で結果オブジェクトに代入:

```ts
signalingUrlCandidates: Array.isArray(signalingUrlCandidates)
  ? signalingUrlCandidates
  : undefined,
```

`Array.isArray` の標準型ガードは `signalingUrlCandidates: unknown` を `unknown[]` までしか narrow しないが、`Partial<QueryStringParameters>` の `signalingUrlCandidates: string[] | undefined` (`src/types.ts:125`) への代入は構造的型適合の挙動で素通る。結果として `[1, 2, 3]` のような非 string 配列が `string[]` として下流に流れる。

### 入力経路と本 issue の対象

| 経路        | 流れ                                                                                                                      | 本 issue で扱う    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| URL クエリ  | `parseQueryString` → `applySignalingUrlCandidates` (`src/app/actions.ts:266-275`) → `signals.setSignalingUrlCandidates`   | はい（本丸）       |
| OPFS        | `loadUrlEntries` (`src/opfs.ts:18-41`) → `applySignalingUrlCandidates` の else 分岐 → `signals.setSignalingUrlCandidates` | いいえ（別 issue） |
| UI モーダル | `SignalingUrlModal` (`src/components/Header/SignalingUrlModal.tsx`) → OPFS 保存 / `setSignalingUrlCandidates`             | いいえ（別 issue） |

OPFS / UI モーダルは別 issue でスコープ管理する理由は「7. スコープ外」を参照。

### SDK の挙動（裏取り済み）

`node_modules/sora-js-sdk/dist/sora.mjs:888-908` の `getSignalingWebSocket(e)`（minified、概念整形）:

```js
async getSignalingWebSocket(e) {
  if (Array.isArray(e) && e.length === 0)
    throw new f("Signaling failed. The signalingUrlCandidates array is empty.");
  if (typeof e == "string" || e.length === 1) {
    const n = typeof e == "string" ? e : e[0];
    return new Promise((i, t) => {
      const o = new WebSocket(n);
      // ...
    });
  }
  if (Array.isArray(e)) {
    // ...
    const a = new WebSocket(t);
    // ...
  }
}
```

SDK は要素を型検査せずそのまま `new WebSocket(_)` に渡す。`WebSocket` コンストラクタの WebIDL 引数は `USVString` 変換が走るため:

- `1` → `"1"` → URL パースで `SyntaxError: Failed to construct 'WebSocket': The URL '1' is invalid`
- `null` → `"null"` → 同上
- `true` → `"true"` → 同上
- `{}` → `"[object Object]"` → 同上
- `["wss://...", 1]` 混在: 複数候補分岐に入り 1 要素ずつ並列接続を試みるため、1 番目が成功すれば見えにくいが、2 番目で同種 `SyntaxError`

`createSignalingURL` (`src/utils.ts:263-280`) は `enabledSignalingUrlCandidates && length > 0` 時に `=== ""` 空文字列のみ filter する。非 string 要素は filter されないため、本 issue が `parseQueryString` 段階で防がない限り SDK まで届く。

### エッジケース一覧

| 入力 URL string                                     | `JSON.parse` 結果              | 修正前 `signalingUrlCandidates`                                                            | 修正後 `signalingUrlCandidates`                                   | 備考                                                                                        |
| --------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `?signalingUrlCandidates=` (空)                     | `undefined` (parse 試行されず) | `undefined`                                                                                | `undefined`                                                       | 変化なし                                                                                    |
| `?signalingUrlCandidates={invalid}`                 | `JSON.parse` 例外              | `undefined`                                                                                | `undefined`                                                       | 変化なし                                                                                    |
| `?signalingUrlCandidates={"a":1}`                   | `{a:1}`                        | `undefined` (`Array.isArray` false)                                                        | `undefined`                                                       | 変化なし                                                                                    |
| `?signalingUrlCandidates=[]`                        | `[]`                           | `[]` (受理)                                                                                | `[]` (受理)                                                       | 空配列は `every` で true、`enabledSignalingUrlCandidates && length > 0` で SDK には届かない |
| `?signalingUrlCandidates=[1,2,3]`                   | `[1,2,3]`                      | `[1,2,3]` (受理、SDK で SyntaxError)                                                       | `undefined`                                                       | **本丸**                                                                                    |
| `?signalingUrlCandidates=[null]`                    | `[null]`                       | `[null]` (同上)                                                                            | `undefined`                                                       | 本丸                                                                                        |
| `?signalingUrlCandidates=[true]`                    | `[true]`                       | `[true]` (同上)                                                                            | `undefined`                                                       | 本丸                                                                                        |
| `?signalingUrlCandidates=[{}]`                      | `[{}]`                         | `[{}]` (同上)                                                                              | `undefined`                                                       | 本丸                                                                                        |
| `?signalingUrlCandidates=[""]`                      | `[""]`                         | `[""]` (受理、`createSignalingURL` で filter されて空配列、SDK で「array is empty」エラー) | `[""]` (同左、要素は string なので受理。空文字列の挙動は既存通り) | 変化なし                                                                                    |
| `?signalingUrlCandidates=["wss://...","wss://..."]` | `["wss://...", "wss://..."]`   | 正常                                                                                       | 正常                                                              | 変化なし                                                                                    |
| `?signalingUrlCandidates=["wss://...",1]`           | `["wss://...", 1]`             | 受理（混在、2 要素目で SDK SyntaxError）                                                   | `undefined`                                                       | 混在も全弾き                                                                                |

## 設計方針

### 1. `parseQueryString` の修正

`src/utils.ts:172-174`:

**before**:

```ts
signalingUrlCandidates: Array.isArray(signalingUrlCandidates)
  ? signalingUrlCandidates
  : undefined,
```

**after**:

```ts
// 配列性 + 要素 string 性を両方検証する。
// 要素に number / null / boolean / object が混在すると SDK 内部の new WebSocket(_) が
// USVString 変換後 URL パースに失敗して SyntaxError (DOMException) を投げるため、境界で undefined に落とす。
// every は空配列で true を返すため `[]` は受理されるが、enabledSignalingUrlCandidates && length > 0
// のチェック (actions.ts:488-489) で SDK には届かない。
// Array.isArray の標準型ガードは unknown[] までしか narrow しないため as string[] キャストは残す。
signalingUrlCandidates:
  Array.isArray(signalingUrlCandidates) &&
  signalingUrlCandidates.every((item) => typeof item === "string")
    ? (signalingUrlCandidates as string[])
    : undefined,
```

### 2. setter / `createSignalingURL` への防御は入れない理由

- `setSignalingUrlCandidates(value: string[])` (`src/app/signals.ts:388-389`) に Runtime 検証を入れる案もあるが、本 issue は「URL クエリ経路の境界バリデーション」に責務を絞る。0051 と同じく setter は呼び出し側で型保証する責務分担を維持する。
- `createSignalingURL` (`src/utils.ts:263-280`) も同様。`parseQueryString` で `string[] | undefined` を保証すれば、`createSignalingURL` 段階では「`string[]` 想定」で良い。
- OPFS / UI モーダル経路は別 issue で扱う（「7. スコープ外」を参照）。

### 3. テスト戦略

#### 3.1 `src/utils.test.ts` への新規テスト追加

既存テスト (`src/utils.test.ts:136-158`) は 3 件:

- 「signalingUrlCandidates を JSON として解析する」（正常系）
- 「無効な JSON の signalingUrlCandidates は undefined になる」（JSON.parse 失敗）
- 「signalingUrlCandidates が配列でない場合は undefined になる」（`{ key: "value" }` で `Array.isArray` false）

要素型異常系は未カバー。テスト 6 件（異常系 5 件 + 回帰防止 1 件）を追加する:

```ts
test("signalingUrlCandidates の要素が全て number の場合は undefined になる", () => {
  const searchParams = new URLSearchParams();
  searchParams.set("signalingUrlCandidates", JSON.stringify([1, 2, 3]));
  const result = parseQueryString(searchParams);
  assert.equal(result.signalingUrlCandidates, undefined);
});

test("signalingUrlCandidates の要素が全て null の場合は undefined になる", () => {
  // 同形、[null, null] を渡す
});

test("signalingUrlCandidates の要素が全て boolean の場合は undefined になる", () => {
  // 同形、[true, false] を渡す
});

test("signalingUrlCandidates の要素が全て object の場合は undefined になる", () => {
  // 同形、[{ url: "wss://x" }] を渡す
});

test("signalingUrlCandidates に文字列と非文字列が混在する配列は undefined になる", () => {
  // 同形、["wss://example.com/signaling", 1] を渡す
});

test("signalingUrlCandidates が空配列 [] の場合は空配列として受理される（既存挙動の回帰防止）", () => {
  // 同形、[] を渡して assert.deepEqual(result.signalingUrlCandidates, [])
});
```

**前提作業**: `src/utils.test.ts` の既存 import (`getValueByAspectRatio, parseMetadata, parseQueryString`) には `parseQueryString` が既に含まれているため追加 import は不要。

#### 3.2 `src/utils.prop.ts` への PBT 追加

既存 `signalingUrlCandidatesArb = fc.array(fc.webUrl())` (`src/utils.prop.ts:84-85`) は正常範囲のみ生成。`createSearchParams` 経由でランダム JSON 配列を投げる PBT を 1 件追加する。空配列は 3.1 の回帰防止テストでカバー済みのため、PBT 側は `minLength: 1` で空配列を除外して異常系のヒット率を上げる。`fc.dictionary` で非空 object も含める:

```ts
test("signalingUrlCandidates のパース結果は常に undefined または string[] になる", () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.oneof(
          fc.webUrl(),
          fc.integer(),
          fc.constant(null),
          fc.boolean(),
          fc.dictionary(fc.string(), fc.anything()),
          fc.string(),
        ),
        { minLength: 1 },
      ),
      (arr) => {
        const searchParams = new URLSearchParams();
        searchParams.set("signalingUrlCandidates", JSON.stringify(arr));
        const result = parseQueryString(searchParams);
        const v = result.signalingUrlCandidates;
        assert.isTrue(
          v === undefined || (Array.isArray(v) && v.every((item) => typeof item === "string")),
        );
      },
    ),
  );
});
```

**前提作業**: `src/utils.prop.ts` の既存 import に `parseQueryString` が含まれているか確認し、なければ追加する。

### 4. 影響範囲と後方互換

- 修正後、`?signalingUrlCandidates=[1,2,3]` などの不正値は **silent に undefined** になる（修正前は SDK 内部で `SyntaxError`、修正後は OPFS 経路 / デフォルト URL にフォールバック）。
- `?signalingUrlCandidates=[""]` の挙動は変わらない（空文字列は string なので `every` で受理され、下流の `createSignalingURL` で `=== ""` filter されて結果的に空配列扱い）。
- `?signalingUrlCandidates=[]` の挙動は変わらない（`every` は空配列で true、`enabledSignalingUrlCandidates && length > 0` ガードで SDK に届かない）。
- CLAUDE.md「後方互換性は考慮しないこと」方針により、`?signalingUrlCandidates=[1,2,3]` の silent 無視はバグ修正の結果として `[FIX]` に分類する。

### 5. CHANGES.md エントリ

`CHANGES.md` の `## develop` の `[FIX]` セクション末尾（`### misc` サブセクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `signalingUrlCandidates` の URL クエリ経路で配列要素の型検証が漏れていた問題を修正する
  - `parseQueryString` で `Array.isArray` に加えて `every((item) => typeof item === "string")` を要求する
  - 不正要素を含む場合は `undefined` に落とし、SDK 側 `new WebSocket(_)` の `SyntaxError` を回避する
  - @voluntas
```

### 6. 関連 issue

- [[0051-bug-fix-forwarding-filters-undefined-cast]]: 同種の境界型検証 issue（`createConnectOptions` 内の `parseMetadata` 戻り値ガード）。本 issue は `parseQueryString` の URL クエリ経路、0051 は `createConnectOptions` の 6 箇所のフィールドガードで、対象範囲は別。設計方針（境界で型検証、setter は触らない、`Array.isArray` で narrow + `as` キャスト残置）は両 issue で揃える。
- CHANGES.md `## develop` の `[ADD] signalingUrlCandidates の設定モーダルを追加する` (`SignalingUrlModal` 経由 OPFS 永続化) は本 issue の対象範囲とは別。本 issue の修正は URL クエリ経路のみで、UI モーダル経由 / OPFS 経由は別 issue で扱う。

### 7. スコープ外

下記は本 issue では扱わない。**OPFS 経路の要素型検証** は本 issue 着手前に独立 issue を起票し、本 issue とセットでマージする想定（OPFS 入出力周辺の責務が独立しているため別 issue とする方が clear）。それ以外は将来的な起票候補として認識する（必須ではない）:

- **OPFS 経路の要素型検証**: `src/opfs.ts:30-34` の `loadUrlEntries` は `Array.isArray(settings.urlEntries)` ガードのみで `{ url: string; enabled: boolean }` 構造を検証しない。ユーザーが DevTools の Application タブで OPFS の `signaling-url-candidates.json` を直接書き換えた場合、不正な要素が `setSignalingUrlCandidates` に届く。本 issue では扱わない（OPFS 入出力周辺は責務が独立しているため別 issue で扱う方が clear）。
- **UI モーダル経由の入力バリデーション**: `SignalingUrlModal` で URL 文字列を保存する際の `isValidUrl` チェックは既に存在するが、空文字列や `ws://` 以外の prefix を許容しているかの検証は本 issue では扱わない。
- **`setSignalingUrlCandidates` setter のランタイム要素検証**: 0051 と同じ責務分担（呼び出し側で型保証、setter は素通し）を維持する。
- **エラーメッセージ改善**: 不正な `signalingUrlCandidates` が silent 無視される際に「設定が無視されました」アラートを出す UI 改善は別 issue。
- **SDK 型 `string | string[]` の string 単一形式サポート**: sora-js-sdk は `signalingUrlCandidates: string | string[]` を受理する（`base.d.ts:41`）が、本リポジトリの `QueryStringParameters.signalingUrlCandidates` は `string[]` 固定。string 単一形式を URL パラメータで受理する拡張は別 issue。

## 検証手順

### A. 修正前の再現

1. `vp dev` で起動。
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

11. `vp test src/utils.test.ts src/utils.prop.ts` が pass すること（3.1 の単体テスト 6 件 + 3.2 の PBT 1 件を含む）。
12. 既存 Playwright e2e が pass すること（`signalingUrlCandidates` を扱う e2e の非退行）。

## 完了条件

- 検証手順 A-D すべてが通過すること。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に「5. CHANGES.md エントリ」のエントリが追記され、担当者行が付いていること。
- 3.1 の単体テスト 6 件 + 3.2 の PBT 1 件が pass すること（`vp test` で確認）。
- 既存 Playwright e2e が pass すること。
