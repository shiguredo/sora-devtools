# 0051-bug-fix-forwarding-filters-undefined-cast

- Priority: Medium
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-forwarding-filters-undefined-cast
- Polished: 2026-06-09

## 目的

`createConnectOptions` (`src/utils.ts:897-918`) の補助関数で `parseMetadata` の戻り値を型検証せずに代入している箇所がある。enable フラグ true のときは「値が無効でも」必ず代入が走るため、`parseMetadata` がパース成功して返した非配列値（`null` / `boolean` / `number` / `string` / `object`）が `as ForwardingFilter[]` の TypeScript キャストで偽装され、SDK のシグナリングペイロードにそのまま乗って Sora サーバ側で `connect.failed` を引き起こす。本 issue では以下 6 箇所を境界で型検証する:

- `forwardingFilters` (`src/utils.ts:850-855`): `Array.isArray` ガードのみ受理。
- `videoVP9Params` / `videoAV1Params` / `videoH264Params` / `videoH265Params` (`src/utils.ts:780-791`): object（非 null・非 array）のみ受理。
- `signalingNotifyMetadata` (`src/utils.ts:844-849`): 同上。

`parseMetadata` 自体は変更しない（`src/app/actions.ts:1419` の `metadata` 引数は SDK 型 `JSONType` で任意値を許容するため、関数を絞ると現行挙動を壊す）。

## 優先度根拠

- 即時クラッシュではないが、SDK 側 (`node_modules/sora-js-sdk/dist/sora.mjs:86`) は `t.forwardingFilters !== void 0 && (s.forwarding_filters = t.forwardingFilters)` のように `undefined` だけガードして JSON object に素通し代入する。非配列を `as ForwardingFilter[]` 偽装代入すると、シグナリングメッセージに不正値が乗り Sora サーバ側で `connect.failed` を返す。ユーザーには `Failed to connect Sora` のような不明瞭なエラーで返るためデバッグが困難。
- ユーザーが踏める経路は 2 つ:
  - **UI 経路**: `JSONInputField` (`src/components/DevtoolsPane/JSONInputField.tsx:45-56`) で `JSON.parse` 検査して赤枠表示するが、Connect ボタン自体は disable していない。`parseMetadata("42") === 42` のように **JSON として valid** だが意味的に不正な値は赤枠も出ない。
  - **URL クエリパラメータ経路**: `parseStringParameter("forwardingFilters")` (`src/utils.ts:175`) などは string のみ取得し JSON 検査なし。URL シェアやブックマークから即発火する。
- 修正は数行で済み、影響範囲は `src/utils.ts` の 2 補助関数のみ。
- High ではない（クライアントクラッシュではなくサーバ側 reject）が、Low ではない（ユーザーがコピペで踏める）ため Medium。

## 現状の問題

実装時に行番号がずれている可能性があるため、関数名（`parseMetadata` / `applyVideoCodecOptions` / `applySignalingMetadataOptions` / `applyDataChannelOptions`）を基準に特定すること。Polished 時点は 2026-06-09。

### `parseMetadata` の仕様

`src/utils.ts:651-663`:

```ts
export function parseMetadata(enabledMetadata: boolean, metadata: string): Json | undefined {
  if (!enabledMetadata) {
    return undefined;
  }
  try {
    return JSON.parse(metadata) as Json;
  } catch {
    return undefined;
  }
}
```

戻り値型 `Json | undefined` の `Json` は `src/types.ts:217-225`:

```ts
export type Json = null | boolean | number | string | Json[] | { [prop: string]: Json | undefined };
```

つまり戻り値の可能性は `undefined` / `null` / `boolean` / `number` / `string` / `Json[]` / `object` の 7 種類。

### `parseMetadata` の呼び出し 7 箇所と本 issue の対象

| 行                        | 呼び出し元                                                | 修正方針                            | 理由                                                                                                                                                                                                       |
| ------------------------- | --------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/utils.ts:781`        | `videoVP9Params` (applyVideoCodecOptions)                 | object（非 null・非 array）のみ受理 | Sora 仕様で codec params は JSON object 期待                                                                                                                                                               |
| `src/utils.ts:784`        | `videoAV1Params` (同上)                                   | 同上                                | 同上                                                                                                                                                                                                       |
| `src/utils.ts:787`        | `videoH264Params` (同上)                                  | 同上                                | 同上                                                                                                                                                                                                       |
| `src/utils.ts:790`        | `videoH265Params` (同上)                                  | 同上                                | 同上                                                                                                                                                                                                       |
| `src/utils.ts:845`        | `signalingNotifyMetadata` (applySignalingMetadataOptions) | object（非 null・非 array）のみ受理 | Sora 仕様でメタデータは JSON object 期待                                                                                                                                                                   |
| `src/utils.ts:852`        | `forwardingFilters` (同上)                                | `Array.isArray` のみ受理            | SDK 型 `ForwardingFilter[]` が配列限定。要素構造はサーバに委ねる                                                                                                                                           |
| `src/app/actions.ts:1419` | `metadata` (connectSora)                                  | **本 issue では変更しない**         | SDK 型 `JSONType` 任意値を許容（Sora 仕様で metadata は任意の JSON 値 OK）。`soraConnection.metadata = metadata` (`actions.ts:1388` 付近) で SDK 側 `void 0` ガードがあるため `undefined` 代入でも実害なし |

### SDK の挙動（裏取り済み）

`node_modules/sora-js-sdk/dist/sora.mjs:86` の関連ライン（minified、整形済み）:

```js
i !== void 0 && (s.metadata = i),
t.signalingNotifyMetadata !== void 0 && (s.signaling_notify_metadata = t.signalingNotifyMetadata),
t.forwardingFilters !== void 0 && (s.forwarding_filters = t.forwardingFilters),
```

SDK は **`undefined` だけ** ガードし、他の値（`null` / `false` / `42` / `"foo"` / `{}` / `[1,2,3]`）はそのまま signaling JSON に乗せる。よって:

- `parseMetadata` が `undefined` を返した場合: 現状の `connectionOptions.X = undefined` でも SDK 側ガードで signaling 送信時にプロパティが落ちる（実害は「ユーザー設定が silent に無視される」のみ）。
- `parseMetadata` が `null` / `42` / `"foo"` 等を返した場合: SDK 側ガードを通過し signaling JSON に不正値が乗る。Sora サーバ側で `connect.failed` を返す。
- `parseMetadata` が `[1,2,3]` を返した場合（`forwardingFilters` のみ）: `Array.isArray` を通すと SDK 経由でサーバに送られる。サーバ側で要素構造 (`rules` / `action` 等) を検証する。

### 既存の `Array.isArray` 安全パターン

同ファイル内 `applyDataChannelOptions` (`src/utils.ts:883-893`) は既に同種パターンを実装している:

```ts
if (connectionOptionsState.dataChannels !== "") {
  let dataChannels: DataChannelConfiguration[] = [];
  try {
    dataChannels = JSON.parse(connectionOptionsState.dataChannels) as DataChannelConfiguration[];
  } catch {
    // 例外が起きた場合は何もしない
  }
  if (Array.isArray(dataChannels)) {
    connectionOptions.dataChannels = dataChannels;
  }
}
```

本 issue の `forwardingFilters` 修正はこのパターンと一貫させる。

## 設計方針

### 1. `forwardingFilters` の修正

`src/utils.ts:850-855`:

**before**:

```ts
if (connectionOptionsState.enabledForwardingFilters) {
  connectionOptions.forwardingFilters = parseMetadata(
    true,
    connectionOptionsState.forwardingFilters,
  ) as ForwardingFilter[];
}
```

**after**:

```ts
if (connectionOptionsState.enabledForwardingFilters) {
  const parsed = parseMetadata(true, connectionOptionsState.forwardingFilters);
  // 配列のみ受理する。非配列を SDK 経由でサーバに送ると connect.failed になる。
  // 配列要素 (rules / action / version 等) の構造検証はサーバ側に委ねる。
  // Array.isArray の標準型ガードは Json[] までしか narrow しないため as キャストは残す。
  if (Array.isArray(parsed)) {
    connectionOptions.forwardingFilters = parsed as ForwardingFilter[];
  }
}
```

### 2. `videoXxxParams` 4 箇所の修正

`src/utils.ts:780-791`（同パターン 4 箇所）:

**before**（VP9 を例示、AV1 / H264 / H265 も同形）:

```ts
if (connectionOptionsState.enabledVideoVP9Params) {
  connectionOptions.videoVP9Params = parseMetadata(true, connectionOptionsState.videoVP9Params);
}
```

**after**:

```ts
if (connectionOptionsState.enabledVideoVP9Params) {
  const parsed = parseMetadata(true, connectionOptionsState.videoVP9Params);
  // Sora 仕様で codec params は JSON object を期待する。
  // null / boolean / number / string / array は意味的に不正なため代入しない。
  // typeof === "object" は null と array も含むため明示的に除外する。
  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    connectionOptions.videoVP9Params = parsed;
  }
}
```

AV1 / H264 / H265 も同形で書き換える。

### 3. `signalingNotifyMetadata` の修正

`src/utils.ts:844-849`:

**before**:

```ts
if (connectionOptionsState.enabledSignalingNotifyMetadata) {
  connectionOptions.signalingNotifyMetadata = parseMetadata(
    true,
    connectionOptionsState.signalingNotifyMetadata,
  );
}
```

**after**:

```ts
if (connectionOptionsState.enabledSignalingNotifyMetadata) {
  const parsed = parseMetadata(true, connectionOptionsState.signalingNotifyMetadata);
  // Sora 仕様で signalingNotifyMetadata は JSON object を期待する。
  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    connectionOptions.signalingNotifyMetadata = parsed;
  }
}
```

### 4. `parseMetadata` 自体は変更しない

[改善案] として「`parseMetadata` の戻り値を `object | Json[] | undefined` に絞る」が考えられるが採用しない:

- `src/app/actions.ts:1419` の `metadata = parseMetadata(...)` 経路は SDK 型 `JSONType`（`null | boolean | number | string | array | object`）を許容しており、Sora 仕様でも `metadata` フィールドは任意の JSON 値を受理する。`parseMetadata` を絞ると `metadata: "string-value"` や `metadata: 42` の現行ユースケースを壊す。
- 既存 PBT (`src/utils.prop.ts:384-407`) の不変条件「任意文字列で常に undefined または有効値を返す（生文字列は返さない）」も壊す。
- 呼び出し側で個別に絞る方が責務分担として妥当。

### 5. エッジケース一覧

| 入力 string   | `parseMetadata` 戻り値 | 修正前 `forwardingFilters`                                          | 修正後 `forwardingFilters` | 修正前 `videoVP9Params`                     | 修正後 `videoVP9Params` |
| ------------- | ---------------------- | ------------------------------------------------------------------- | -------------------------- | ------------------------------------------- | ----------------------- |
| `""`          | `undefined`            | `undefined as ForwardingFilter[]`（SDK 側 `void 0` で送信から除外） | 未代入                     | `undefined`（同上）                         | 未代入                  |
| `"{invalid}"` | `undefined`            | 同上                                                                | 未代入                     | 同上                                        | 未代入                  |
| `"null"`      | `null`                 | `null as ForwardingFilter[]`（SDK 透過、サーバ reject）             | 未代入                     | `null`（SDK 透過、サーバ reject）           | 未代入                  |
| `"true"`      | `true`                 | `true as ForwardingFilter[]`（同上）                                | 未代入                     | `true`（同上）                              | 未代入                  |
| `"42"`        | `42`                   | `42 as ForwardingFilter[]`（同上）                                  | 未代入                     | `42`（同上）                                | 未代入                  |
| `"\"foo\""`   | `"foo"`                | `"foo" as ForwardingFilter[]`（同上）                               | 未代入                     | `"foo"`（同上）                             | 未代入                  |
| `"[]"`        | `[]`                   | `[]`（SDK 透過、空配列でサーバ受理）                                | `[]`（同左、未対応）       | `[]`（サーバ側で object 期待のため reject） | 未代入                  |
| `"[{...}]"`   | `[...]`                | `[...]`（正常）                                                     | `[...]`（正常）            | `[...]`（同 reject）                        | 未代入                  |
| `"{}"`        | `{}`                   | `{} as ForwardingFilter[]`（SDK 透過、サーバ reject）               | 未代入                     | `{}`（SDK 透過、正常）                      | `{}`（正常）            |
| `"{\"a\":1}"` | `{a:1}`                | 同上                                                                | 未代入                     | `{a:1}`（正常）                             | `{a:1}`（正常）         |

### 6. 影響範囲と後方互換

- 修正後、`forwardingFilters` に `42` / `null` / `"foo"` / `{}` を入れると **silent に未代入** になる（修正前はサーバまで送られて `connect.failed`、修正後はサーバに送られないので Connect は成功する可能性があるが、`forwardingFilters` 機能は無効）。後方互換性は考慮しない（CLAUDE.md 方針）。
- `videoXxxParams` / `signalingNotifyMetadata` に object 以外を入れていた既存 URL は同様に silent 未代入になる。
- UI 経路でユーザーが `?forwardingFilters=42` のような URL をシェアした場合、Connect は通るが filter は無効。エラーメッセージで「JSON 配列を入れてください」と通知する改善は本 issue ではスコープ外（UI 改善は別 issue）。

### 7. テスト戦略

#### 7.1 `src/utils.test.ts` への新規テスト追加

`createConnectOptions` は `src/utils.ts:897` で export 済みのため直接テスト可能。`applyVideoCodecOptions` / `applySignalingMetadataOptions` は private function だが、`createConnectOptions` 経由で網羅できる。

**前提作業**: `src/utils.test.ts` の既存 import 文に `createConnectOptions` を追加する（現状 `getValueByAspectRatio, parseMetadata, parseQueryString` のみ）。テスト用に最低限の `ConnectionOptionsState` を組み立てるヘルパーが必要なら同ファイル先頭に定義する。

代表テスト:

```ts
test("createConnectOptions: forwardingFilters が無効 JSON + enable=true なら未代入", () => {
  const state = createTestConnectionOptionsState({
    enabledForwardingFilters: true,
    forwardingFilters: "{invalid}",
  });
  const result = createConnectOptions(state);
  assert.equal(result.forwardingFilters, undefined);
});

test("createConnectOptions: forwardingFilters が '42' + enable=true なら未代入", () => {
  // 同形、forwardingFilters: "42"、assert.equal(result.forwardingFilters, undefined)
});

test("createConnectOptions: forwardingFilters が '[]' + enable=true なら空配列を代入", () => {
  // 同形、forwardingFilters: "[]"、assert.deepEqual(result.forwardingFilters, [])
});

test("createConnectOptions: forwardingFilters が valid な配列 + enable=true なら代入", () => {
  // 同形、forwardingFilters: '[[{"field":"connection_id","operator":"is_in","values":["x"]}]]'
});

test("createConnectOptions: videoVP9Params が '42' + enable=true なら未代入", () => {
  // 同形、enabledVideoVP9Params: true, videoVP9Params: "42"
});

test("createConnectOptions: videoVP9Params が '{\"a\":1}' + enable=true なら代入", () => {
  // 同形、assert.deepEqual(result.videoVP9Params, { a: 1 })
});

test("createConnectOptions: signalingNotifyMetadata が 'null' + enable=true なら未代入", () => {
  // 同形
});
```

各テストは `result` の他フィールドではなく対象フィールドのみを検証する（本 issue のスコープに集中）。

#### 7.2 `src/utils.prop.ts` への PBT 追加

```ts
test("createConnectOptions の forwardingFilters は常に undefined または配列", () => {
  fc.assert(
    fc.property(fc.string(), (raw) => {
      const state = createTestConnectionOptionsState({
        enabledForwardingFilters: true,
        forwardingFilters: raw,
      });
      const result = createConnectOptions(state);
      assert.isTrue(
        result.forwardingFilters === undefined || Array.isArray(result.forwardingFilters),
      );
    }),
  );
});

test("createConnectOptions の videoVP9Params は常に undefined または object（非 null・非 array）", () => {
  fc.assert(
    fc.property(fc.string(), (raw) => {
      const state = createTestConnectionOptionsState({
        enabledVideoVP9Params: true,
        videoVP9Params: raw,
      });
      const result = createConnectOptions(state);
      const v = result.videoVP9Params;
      assert.isTrue(v === undefined || (typeof v === "object" && v !== null && !Array.isArray(v)));
    }),
  );
});
```

**前提作業**: `src/utils.prop.ts` の既存 import に `createConnectOptions` を追加する。

### 8. スコープ外

下記は別 issue として SEQUENCE を取得し起票する:

- **`parseMetadata` の戻り値型変更**: `actions.ts:1419` の `metadata` 経路を壊すため不採用（理由は本 issue 設計方針 4 を参照）。
- **`actions.ts:1419` の `metadata` 引数の型検証**: SDK 型 `JSONType` 任意値を許容し、SDK 側 `void 0` ガードで実害なし。
- **UI 側の `JSONInputField` での Connect 抑止**: 現状は赤枠表示のみで接続は通る。配列・object 期待のフィールドに対して「JSON 構造が期待と異なります」エラーを出して Connect を抑止する改善は別 issue。
- **`forwardingFilters` 配列要素の構造検証** (`rules` / `action` enum 等): クライアント側で検証すると Sora 仕様変更への追随コストが増えるため、サーバに委ねる。
- **`dataChannels` (`applyDataChannelOptions` 883-893) の修正**: 既に `Array.isArray` ガード実装済み（本 issue の参考パターン）。

### 9. CHANGES.md エントリ

`CHANGES.md` の `## develop` の `[FIX]` セクション末尾（`### misc` サブセクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `createConnectOptions` で `parseMetadata` 戻り値の型検証が漏れていた問題を修正する
  - `forwardingFilters` は `Array.isArray` でガードし、非配列を SDK 経由でサーバに送って `connect.failed` を引き起こすのを防ぐ
  - `videoVP9Params` / `videoAV1Params` / `videoH264Params` / `videoH265Params` / `signalingNotifyMetadata` は object（非 null・非 array）のみ受理する
  - @voluntas
```

CLAUDE.md「後方互換性は考慮しないこと」方針により、`?forwardingFilters=42` などの不正値が silent 未代入になる挙動変更はバグ修正の結果として `[FIX]` に分類する。

### 10. 関連 issue

- CHANGES.md `## develop` の `[CHANGE] forwardingFilter（単数形）を削除し forwardingFilters（複数形）に統一する` は forwardingFilters への単数形廃止変更で、本 issue の検証範囲（`forwardingFilters` 複数形）と同じフィールドを触る。マージ順は不問だが、`forwardingFilters` の e2e 検証は両方マージ後に実施する。
- [[0042-bug-fix-log-messages-json-parse-crash]]: 同じ `JSON.parse` 周りの堅牢化として位置づけは近いが、対象範囲は別（ログメッセージのパース vs connect オプションのパース）。

## 検証手順

### A. forwardingFilters の本丸再現（修正前）

1. `vp dev` で起動。
2. `?forwardingFilters=42&enabledForwardingFilters=true` の URL で開く。
3. Connect ボタン押下。
4. Sora サーバ側で signaling-decode に失敗し `connect.failed` が返ることを DebugPane の Timeline で確認する（修正前は `forwarding_filters: 42` が signaling に乗ってサーバ reject）。

### B. 修正後の確認

5. 同じ URL で開いて Connect → DebugPane で signaling メッセージに `forwarding_filters` キーが含まれないことを確認する（`Array.isArray` ガードで未代入）。
6. `?forwardingFilters=null` / `?forwardingFilters="foo"` / `?forwardingFilters={}` でも同様にサーバに送られないことを確認する。
7. `?forwardingFilters=[]` で空配列が signaling に乗ることを確認する。
8. `?forwardingFilters=[[{"field":"connection_id","operator":"is_in","values":["x"]}]]` で正しい配列が signaling に乗りサーバ受理されることを確認する。

### C. videoXxxParams / signalingNotifyMetadata の確認

9. `?videoVP9Params=42&enabledVideoVP9Params=true` で Connect → signaling に `video_vp9_params` キーが含まれないことを確認する。
10. `?videoVP9Params={\"a\":1}&enabledVideoVP9Params=true` で `video_vp9_params: { a: 1 }` が signaling に乗ることを確認する。
11. `?signalingNotifyMetadata=null&enabledSignalingNotifyMetadata=true` で signaling に `signaling_notify_metadata` キーが含まれないことを確認する。

### D. UI テキスト入力経路

12. UI を開き `ForwardingFiltersForm` のテキストエリアに `42` を入力して enable チェック → Connect → サーバ側 reject されないことを確認する。
13. `videoVP9Params` のテキストエリアにも同様に。

### E. 正常系の回帰

14. `?enabledMetadata=true&metadata={\"user\":\"x\"}` で Connect → `metadata: { user: "x" }` が signaling に乗り正常接続することを確認する（`metadata` 経路は本 issue で触らないため非退行確認）。
15. `?enabledMetadata=true&metadata=42` で Connect → SDK 型 `JSONType` 許容のため `metadata: 42` が signaling に乗りサーバが受理することを確認する（本 issue で `parseMetadata` を変えないため非退行）。

### F. テスト

16. `vp test src/utils.test.ts src/utils.prop.ts` が pass すること（7.1 の単体テスト + 7.2 の PBT を含む）。
17. 既存 Playwright e2e が pass すること。

## 完了条件

- 検証手順 A-F すべてが通過すること。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に「9. CHANGES.md エントリ」のエントリが追記され、担当者行が付いていること。
- 7.1 の単体テスト 7 件 + 7.2 の PBT 2 件が pass すること（`vp test` で確認）。
- 既存 Playwright e2e が pass すること。
