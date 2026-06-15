# 0051-bug-fix-forwarding-filters-undefined-cast

- Priority: Medium
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-forwarding-filters-undefined-cast
- Polished: 2026-06-15

## 目的

`createConnectOptions` の補助関数で `parseMetadata` の戻り値を型検証せずに代入している箇所が残っており、enable フラグ true のときは「値が無効でも」必ず代入が走るため、`parseMetadata` がパース成功して返した非配列値（`null` / `boolean` / `number` / `string` / `array`）が SDK のシグナリングペイロードにそのまま乗って Sora サーバ側で `connect.failed` を引き起こす。本 issue では `createConnectOptions` の補助関数で **未修正の 5 箇所** を境界で型検証する。

- `videoVP9Params` / `videoAV1Params` / `videoH264Params` / `videoH265Params` (`applyVideoCodecOptions` 内): object（非 null・非 array）のみ受理する。
- `signalingNotifyMetadata` (`applySignalingMetadataOptions` 内): 同上。

`forwardingFilters` は `applySignalingMetadataOptions` 内で **既に `Array.isArray` ガード実装済み**（develop ブランチに先行マージ済み）。本 issue では参考パターンとして引用するのみで、再修正は行わない。タイトル / ブランチ名に `forwarding-filters` を残しているのは git 履歴を切らないためで、実作業は上記 5 箇所が対象。

`parseMetadata` 自体は変更しない（`actions.ts` の `connectSora` 内 `metadata` 引数は SDK 型 `JSONType` で任意値を許容するため、関数を絞ると現行挙動を壊す）。

## 優先度根拠

- 即時クラッシュではないが、SDK は `forwarding_filters` / `signaling_notify_metadata` / `video_*_params` 系のプロパティに対して `undefined` だけガードして JSON object に素通し代入する。非配列・非 object を素通し代入すると、シグナリングメッセージに不正値が乗り Sora サーバ側で `connect.failed` を返す。ユーザーには `Failed to connect Sora` のような不明瞭なエラーで返るためデバッグが困難。
- ユーザーが踏める経路は 2 つ:
  - **UI 経路**: `JSONInputField` で `JSON.parse` 検査して赤枠表示するが、Connect ボタン自体は disable していない。`parseMetadata("42") === 42` のように **JSON として valid** だが意味的に不正な値は赤枠も出ない。
  - **URL クエリパラメータ経路**: `parseStringParameter("videoVP9Params")` などは string のみ取得し JSON 検査なし。URL シェアやブックマークから即発火する。
- 修正は数行で済み、影響範囲は `src/utils.ts` の `applyVideoCodecOptions` / `applySignalingMetadataOptions` の 2 補助関数のみ。
- High ではない（クライアントクラッシュではなくサーバ側 reject）が、Low ではない（ユーザーがコピペで踏める）ため Medium。

## 現状の問題

行番号は陳腐化するため記載しない。各箇所は関数名（`parseMetadata` / `applyVideoCodecOptions` / `applySignalingMetadataOptions` / `applyDataChannelOptions`）で特定する。

### `parseMetadata` の仕様

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

戻り値型 `Json | undefined` の `Json` は `src/types.ts` 内で次のように定義されている。

```ts
export type Json = null | boolean | number | string | Json[] | { [prop: string]: Json | undefined };
```

つまり戻り値の可能性は `undefined` / `null` / `boolean` / `number` / `string` / `Json[]` / `object` の 7 種類。

### `parseMetadata` の呼び出し 7 箇所と本 issue の対象

| 呼び出し元                                                  | 修正方針                            | 状態                                         |
| ----------------------------------------------------------- | ----------------------------------- | -------------------------------------------- |
| `videoVP9Params` (`applyVideoCodecOptions`)                 | object（非 null・非 array）のみ受理 | **本 issue**                                 |
| `videoAV1Params` (同上)                                     | 同上                                | **本 issue**                                 |
| `videoH264Params` (同上)                                    | 同上                                | **本 issue**                                 |
| `videoH265Params` (同上)                                    | 同上                                | **本 issue**                                 |
| `signalingNotifyMetadata` (`applySignalingMetadataOptions`) | object（非 null・非 array）のみ受理 | **本 issue**                                 |
| `forwardingFilters` (同上)                                  | `Array.isArray` のみ受理            | 実装済み（参考パターン）                     |
| `metadata` (`connectSora` の `parseMetadata` 呼び出し)      | 変更しない                          | スコープ外（SDK 型 `JSONType` 任意値を許容） |

### SDK の挙動

`node_modules/sora-js-sdk/dist/sora.js`（minified bundle）の signaling メッセージ構築箇所は、`forwardingFilters` / `signalingNotifyMetadata` / `videoVP9Params` 等のプロパティを **`undefined` だけ** ガードして他の値（`null` / `false` / `42` / `"foo"` / `{}` / `[1,2,3]`）はそのまま signaling JSON に乗せる。よって:

- `parseMetadata` が `undefined` を返した場合: 現状の `connectionOptions.X = undefined` でも SDK 側ガードで signaling 送信時にプロパティが落ちる（実害は「ユーザー設定が silent に無視される」のみ）。
- `parseMetadata` が `null` / `42` / `"foo"` 等を返した場合: SDK 側ガードを通過し signaling JSON に不正値が乗る。Sora サーバ側で `connect.failed` を返す。
- `parseMetadata` が `[1,2,3]` を返した場合（forwardingFilters の参考パターンで対応済）: `Array.isArray` を通すと SDK 経由でサーバに送られる。

### 既存の参考ガードパターン

同ファイル内 `applySignalingMetadataOptions` の `forwardingFilters` 処理が既に実装済みの参考パターン:

```ts
if (connectionOptionsState.enabledForwardingFilters) {
  const parsedForwardingFilters = parseMetadata(true, connectionOptionsState.forwardingFilters);
  if (Array.isArray(parsedForwardingFilters)) {
    connectionOptions.forwardingFilters = parsedForwardingFilters as unknown as ForwardingFilter[];
  }
}
```

加えて `applyDataChannelOptions` 内 `dataChannels` も既に `Array.isArray` ガード実装済み。本 issue の `videoXxxParams` / `signalingNotifyMetadata` 修正はこれらと一貫させる（ただし object 期待のため `Array.isArray` ではなく `typeof === "object" && !== null && !Array.isArray` で判定する）。

## 設計方針

### `videoXxxParams` 4 箇所の修正

`src/utils.ts` の `applyVideoCodecOptions` 内、VP9 / AV1 / H264 / H265 の 4 箇所を次のパターンに統一する。

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

### `signalingNotifyMetadata` の修正

`src/utils.ts` の `applySignalingMetadataOptions` 内、signalingNotifyMetadata を次のパターンに変更する。

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

### `parseMetadata` 自体は変更しない

`actions.ts` の `connectSora` 内 `metadata = parseMetadata(...)` 経路は SDK 型 `JSONType`（`null | boolean | number | string | array | object`）を許容しており、Sora 仕様でも `metadata` フィールドは任意の JSON 値を受理する。`parseMetadata` を絞ると `metadata: "string-value"` や `metadata: 42` の現行ユースケースを壊す。既存 PBT（`src/utils.prop.ts` の `parseMetadata` 不変条件「任意文字列で常に undefined または有効値を返す（生文字列は返さない）」）も壊す。呼び出し側で個別に絞る方が責務分担として妥当。

### エッジケース一覧（videoVP9Params を例示）

| 入力 string   | `parseMetadata` 戻り値 | 修正前 `videoVP9Params`                       | 修正後 `videoVP9Params` |
| ------------- | ---------------------- | --------------------------------------------- | ----------------------- |
| `""`          | `undefined`            | `undefined`（SDK 側 `void 0` で送信から除外） | 未代入                  |
| `"{invalid}"` | `undefined`            | 同上                                          | 未代入                  |
| `"null"`      | `null`                 | `null`（SDK 透過、サーバ reject）             | 未代入                  |
| `"true"`      | `true`                 | `true`（同上）                                | 未代入                  |
| `"42"`        | `42`                   | `42`（同上）                                  | 未代入                  |
| `"\"foo\""`   | `"foo"`                | `"foo"`（同上）                               | 未代入                  |
| `"[]"`        | `[]`                   | `[]`（同上、object 期待のためサーバ reject）  | 未代入                  |
| `"{}"`        | `{}`                   | `{}`（SDK 透過、正常）                        | `{}`（正常）            |
| `"{\"a\":1}"` | `{a:1}`                | `{a:1}`（正常）                               | `{a:1}`（正常）         |

`signalingNotifyMetadata` も同じ表で挙動が一致する（object のみ受理）。

### 影響範囲と後方互換

- 修正後、`videoXxxParams` / `signalingNotifyMetadata` に object 以外（`42` / `null` / `"foo"` / `[]` 等）を入れると **silent に未代入** になる。修正前はサーバまで送られて `connect.failed`、修正後はサーバに送られないので Connect は成功する可能性があるが、当該機能は無効。
- CLAUDE.md「後方互換性は考慮しないこと」方針により許容する。
- UI 経路でユーザーが `?videoVP9Params=42` のような URL をシェアした場合、Connect は通るが codec param は無効。エラーメッセージで「JSON object を入れてください」と通知する改善は本 issue のスコープ外（UI 改善は別 issue）。

## テスト戦略

### `src/utils.test.ts` への単体テスト追加

`createConnectOptions` を `src/utils.test.ts` の named import に追加する（現状は `getValueByAspectRatio`, `parseMetadata`, `parseQueryString` のみ）。テスト用に最低限の `ConnectionOptionsState` を組み立てるヘルパー（`createTestConnectionOptionsState`）を同ファイル先頭に定義する。

代表的なテスト 5 件:

```ts
test("createConnectOptions: videoVP9Params が '42' + enable=true なら未代入", () => {
  const state = createTestConnectionOptionsState({
    enabledVideoVP9Params: true,
    videoVP9Params: "42",
  });
  const result = createConnectOptions(state);
  assert.equal(result.videoVP9Params, undefined);
});
```

- 「`videoVP9Params` が `'{\"a\":1}'` + enable=true なら `{a:1}` を代入」
- 「`videoVP9Params` が `'null'` + enable=true なら未代入」
- 「`signalingNotifyMetadata` が `'null'` + enable=true なら未代入」
- 「`signalingNotifyMetadata` が `'{\"user\":\"x\"}'` + enable=true なら object を代入」

各テストは `result` の他フィールドではなく対象フィールドのみを検証する。

### `src/utils.prop.ts` への PBT 追加

`createConnectOptions` を named import に追加し、不変条件を property test で網羅する。

```ts
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

`signalingNotifyMetadata` についても同形の PBT を追加する（計 2 件）。`videoAV1Params` / `videoH264Params` / `videoH265Params` は `videoVP9Params` と同コードパスのため PBT 追加は省略する（単体テストでカバー）。

### worker 単体テストはなし

本 issue は `createConnectOptions` 経由の純粋関数テストのみで完結する。worker は触らない。

## スコープ外

下記は別 issue として後続で起票する:

- `parseMetadata` の戻り値型変更（`actions.ts` の `metadata` 経路を壊すため不採用）。
- `connectSora` の `metadata` 引数の型検証（SDK 型 `JSONType` 任意値を許容し、SDK 側 `void 0` ガードで実害なし）。
- UI 側の `JSONInputField` での Connect 抑止（現状は赤枠表示のみで接続は通る。配列・object 期待のフィールドに対して「JSON 構造が期待と異なります」エラーを出して Connect を抑止する改善は別 issue）。
- `forwardingFilters` 配列要素の構造検証（`rules` / `action` enum 等）はサーバに委ねる。
- `forwardingFilters` の参考パターン自体は既に実装済みのため本 issue では再修正しない。

## CHANGES.md エントリ

`CHANGES.md` の `## develop` 内 `[FIX]` セクション末尾（`### misc` セクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `createConnectOptions` で `parseMetadata` 戻り値の型検証が漏れていた問題を修正する
  - `videoVP9Params` / `videoAV1Params` / `videoH264Params` / `videoH265Params` / `signalingNotifyMetadata` は object（非 null・非 array）のみ受理する
  - object 以外を SDK 経由でサーバに送って `connect.failed` を引き起こすのを防ぐ
  - @voluntas
```

CLAUDE.md「後方互換性は考慮しないこと」方針により、`?videoVP9Params=42` などの不正値が silent 未代入になる挙動変更はバグ修正の結果として `[FIX]` に分類する。

## 関連 issue

- CHANGES.md `## develop` の `[CHANGE] forwardingFilter（単数形）を削除し forwardingFilters（複数形）に統一する` は forwardingFilters への単数形廃止変更。本 issue とは別作業で先行マージ済み。
- [[0042-bug-fix-log-messages-json-parse-crash]]: 同じ `JSON.parse` 周りの堅牢化として位置づけは近いが、対象範囲は別（ログメッセージのパース vs connect オプションのパース）。

## 検証手順

### A. 本丸再現（修正前、main で実施して本 issue の現象を確認）

1. `pnpm dev` で起動。
2. `?videoVP9Params=42&enabledVideoVP9Params=true` の URL で開く。
3. Connect ボタン押下。
4. Sora サーバ側で signaling-decode に失敗し `connect.failed` が返ることを DebugPane の Timeline で確認する（修正前は `video_vp9_params: 42` が signaling に乗ってサーバ reject）。

### B. 修正後の確認

5. 同じ URL で開いて Connect → DebugPane で signaling メッセージに `video_vp9_params` キーが含まれないことを確認する（object ガードで未代入）。
6. `?videoVP9Params=null` / `?videoVP9Params="foo"` / `?videoVP9Params=[]` でも同様にサーバに送られないことを確認する。
7. `?videoVP9Params={\"a\":1}&enabledVideoVP9Params=true` で `video_vp9_params: { a: 1 }` が signaling に乗りサーバ受理されることを確認する。
8. `?signalingNotifyMetadata=null&enabledSignalingNotifyMetadata=true` で signaling に `signaling_notify_metadata` キーが含まれないことを確認する。

### C. UI テキスト入力経路

9. UI を開き `videoVP9Params` のテキストエリアに `42` を入力して enable チェック → Connect → サーバ側 reject されないことを確認する。
10. `signalingNotifyMetadata` のテキストエリアにも同様に。

### D. 正常系の回帰

11. `?enabledMetadata=true&metadata={\"user\":\"x\"}` で Connect → `metadata: { user: "x" }` が signaling に乗り正常接続することを確認する（`metadata` 経路は本 issue で触らないため非退行確認）。
12. `?enabledMetadata=true&metadata=42` で Connect → SDK 型 `JSONType` 許容のため `metadata: 42` が signaling に乗りサーバが受理することを確認する（本 issue で `parseMetadata` を変えないため非退行）。
13. `?forwardingFilters=[[{"field":"connection_id","operator":"is_in","values":["x"]}]]&enabledForwardingFilters=true` で `forwarding_filters` が正しく signaling に乗り、サーバ受理することを確認する（参考パターンの非退行確認）。

### E. テスト

14. `pnpm test` が pass すること（追加した単体テスト 5 件 + PBT 2 件含む）。
15. 既存 Playwright e2e（`pnpm test:e2e`）が pass すること。

## 完了条件

- 検証手順 A-E すべてが通過すること。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 追加した単体テスト 5 件 + PBT 2 件が pass すること。
- 既存テスト（`pnpm test`）および既存 Playwright e2e が通ること。
