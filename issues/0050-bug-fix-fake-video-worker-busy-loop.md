# 0050-bug-fix-fake-video-worker-busy-loop

- Priority: Medium
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-fake-video-worker-busy-loop
- Polished: 2026-06-15

## 目的

`createFakeMediaConstraints` の `parsedFrameRate` 算出は `Number.isNaN(fps) ? 30 : fps` で `NaN` だけ弾いており、`?frameRate=0` / `?frameRate=-1` / UI のテキスト入力 `0` / `-1` 等を素通しする。素通しされた `0` / 負数は下流の `fakeVideo.worker.ts` の `setTimeout` 遅延計算で 0 ms にクランプされ、Worker スレッドが CPU 1 コアを飽和させる。`createFakeMediaConstraints` で「有限正数のみ受理、UI 候補上限 60 にクランプ」を強制する。`fakeVideo.worker.ts` の `init` ハンドラでも同じクランプを二重防御として入れる。

## 優先度根拠

- 即時クラッシュではないため High ではない。
- ユーザーが URL パラメータ（`?frameRate=0`）と UI のテキスト入力（`FrameRateForm` の `type="text"`）の両方で直接踏める経路があるため Low ではない。
- 修正は数行で済み、影響範囲は `src/utils.ts` の 1 関数と `src/workers/fakeVideo.worker.ts` の `init` ハンドラ 1 箇所に限定される。

## 現状の問題

行番号は陳腐化するため記載しない。各箇所は関数名（`parseStringParameter` / `setFrameRate` / `createFakeMediaConstraints` / `fakeVideo.worker.ts` の `animate` および `init` ハンドラ）で特定する。

### 入力経路

1. **URL パラメータ**: `?frameRate=0` → `src/utils.ts` の `parseStringParameter` は string をそのまま返す（バリデーションなし） → `src/app/actions.ts` の `setSoraDevtoolsState` 内で `signals.setFrameRate(qsParams.frameRate)` → signal `frameRate` に格納。`signals.ts` の `setFrameRate` は `frameRate.value = value` で素通し。
2. **UI テキスト入力**: `src/components/DevtoolsPane/FrameRateForm.tsx` の `<FormInput type="text" onChange={onChange} />` は任意の文字列を許容。`onChange` が `setFrameRate(target.value)` で string をそのまま signal に格納。
3. **UI ドロップダウン**: 同コンポーネント内 `FRAME_RATE_DATA` の候補は `5 / 10 / 15 / 20 / 24 / 30 / 60`（+ `""` 未指定）の 8 値のみ。ドロップダウン経由なら本問題は踏まない。

3 はガード済みだが 1, 2 はガードなし。

### 下流での挙動

signal 経由で `createFakeMediaConstraints` (`src/utils.ts`) に渡る:

```ts
const fps = Number.parseInt(frameRate, 10);
const parsedFrameRate = Number.isNaN(fps) ? 30 : fps;
```

`Number.isNaN` だけのガードでは下記の問題ケースが素通しされる:

| 入力 string    | `parseInt(_, 10)` | 既存 `parsedFrameRate` | 修正後 `parsedFrameRate` | 備考                                               |
| -------------- | ----------------- | ---------------------- | ------------------------ | -------------------------------------------------- |
| `"0"`          | `0`               | `0`                    | `30`                     | **本丸**（worker で過剰再帰描画）                  |
| `"-1"`         | `-1`              | `-1`                   | `30`                     | 本丸（worker の setTimeout で 0 ms に丸められる）  |
| `"0.5"`        | `0`               | `0`                    | `30`                     | parseInt の整数化で 0、本丸と同経路                |
| `"0xFF"`       | `0`               | `0`                    | `30`                     | 第 2 引数 10 指定でも先頭 `0` を取って終了         |
| `"1e5"`        | `1`               | `1`                    | `1`                      | parseInt は `e` 以降を読まない（範囲内のためパス） |
| `"99999"`      | `99999`           | `99999`                | `60`                     | 巨大値、修正後は上限クランプ                       |
| `"Infinity"`   | `NaN`             | `30`                   | `30`                     | parseInt が NaN を返すため既存ガードで 30          |
| `"NaN"`        | `NaN`             | `30`                   | `30`                     | 同上                                               |
| `"abc"` / `""` | `NaN`             | `30`                   | `30`                     | 同上                                               |

`parsedFrameRate` は `createFakeMediaStream` (`src/utils.ts`) で 2 箇所に渡る:

- **`canvas.captureStream(parameters.frameRate)`**: HTML Canvas 仕様 (Media Capture from DOM Elements) で `frameRequestRate=0` は「`requestFrame()` 明示呼び出し時のみフレーム生成」を意味する。負数の挙動は実装依存。
- **worker への init メッセージ** (`src/app/actions.ts` 経由) → `fakeVideo.worker.ts` の `init` ハンドラ。

### worker での暴走描画の機序

`src/workers/fakeVideo.worker.ts` の `animate` は次の形:

```ts
function animate(): void {
  drawFrame();
  const interval = Math.floor(1000 / frameRate);
  animationId = globalThis.setTimeout(() => {
    animate();
  }, interval) as unknown as number;
}
```

- `frameRate = 0`: `1000 / 0 = +Infinity`、`Math.floor(+Infinity) = +Infinity`。`setTimeout` の `delay` 引数は WebIDL `long`（32 bit signed integer）に変換され、`+Infinity` は `+0` になる（ECMA-262 `ToInt32` の仕様 §7.1.6 で `+Infinity` / `-Infinity` / `NaN` は `+0` を返す）。
- `frameRate = -1`: `1000 / -1 = -1000`、`Math.floor = -1000`。HTML Living Standard "Timers" の "run steps after a timeout" 算法（HTML §8.6 Timers）で「If `timeout` is less than 0, set `timeout` to 0」のステップにより 0 にされる。

両ケースとも `delay = 0` が要求されるが、同仕様の「nesting level >= 5 のときは 4 ms に clamp」が適用され、実効 ~250 fps の過剰再帰描画になる（純粋な「busy-loop」=同期スレッドブロックではないが、Worker スレッドが 1 コアを飽和させる）。

## 設計方針

### 上限値の選定: 60

UI ドロップダウン候補の最大は 60。本 issue は「異常値で worker を暴走させない」が目的で、UI 候補と整合させて 60 を上限とする。`?frameRate=120` 等の高値は 60 にクランプされる（CLAUDE.md「後方互換性は考慮しないこと」方針で許容）。本クランプは `createFakeMediaConstraints`（fake video 経路）のみに適用し、実機映像／画面共有の `frameRate` は本 issue では変更しない。

### `createFakeMediaConstraints` の修正

`src/utils.ts` 内 `createFakeMediaConstraints` の parseInt → parsedFrameRate ロジックを次の形に変更する。

**before**:

```ts
const fps = Number.parseInt(frameRate, 10);
const parsedFrameRate = Number.isNaN(fps) ? 30 : fps;
```

**after**:

```ts
// frameRate は URL パラメータ / UI のテキスト入力由来の string。
// 0 / 負数 / 0.5 / 0xN プレフィックスを素通しすると下流 worker の setTimeout が
// 過剰再帰描画 (実効 ~250 fps) に陥るため、有限正数のみ受理して UI 上限 60 にクランプする。
// 本関数の戻り値 frameRate は常に [1, 60] の整数 (invariant)
const fps = Number.parseInt(frameRate, 10);
const parsedFrameRate = Number.isFinite(fps) && fps > 0 ? Math.min(60, fps) : 30;
```

`createFakeMediaConstraints` の JSDoc（または戻り値型 `FakeMediaStreamConstraints` のコメント）に「`frameRate` は常に `[1, 60]` の整数」を明記して下流（`canvas.captureStream` / worker）の前提を文書化する。

### `fakeVideo.worker.ts` の二重防御

`src/workers/fakeVideo.worker.ts` の `init` ハンドラ内の `frameRate` 更新を次の形に変更する。utils 側と対称の `Number.isFinite && > 0` 判定で number 入力を検証する（`postMessage` の構造化クローンは `NaN` / `Infinity` を透過するため TypeScript の `number` 型では実値を保証できない）。

**before**:

```ts
if (data.frameRate !== undefined) {
  ({ frameRate } = data);
}
```

**after**:

```ts
if (data.frameRate !== undefined) {
  // 二重防御: utils.ts 側で [1, 60] にクランプ済みでも、構造化クローン経由で
  // 不正値 (NaN / Infinity / 負数) が届く可能性に備えて worker 側でも検査する。
  const incoming = data.frameRate;
  frameRate = Number.isFinite(incoming) && incoming > 0 ? Math.min(60, Math.floor(incoming)) : 30;
}
```

責務分担:

- `createFakeMediaConstraints`: string → integer 変換 + `[1, 60]` 範囲保証
- `fakeVideo.worker.ts`: 受信した number の `isFinite && > 0` 検査 + `[1, 60]` 再クランプ + 整数化

worker 側で `Math.floor` を追加するのは、将来 utils を経由しない別経路から小数（例: `0.5`）が届いた場合の整数化を担保するため。

## テスト戦略

### `src/utils.test.ts` への単体テスト追加

`createFakeMediaConstraints` の単体テストは現状存在しない。`createFakeMediaConstraints` を `src/utils.test.ts` の named import に追加し、境界値テスト 4 件を追加する（テストメッセージは日本語、`test`/`assert` API を使用、モック禁止）。

代表的なテスト:

```ts
test("createFakeMediaConstraints は frameRate に '0' を渡すと parsedFrameRate を 30 に補正する", () => {
  const result = createFakeMediaConstraints({
    audio: false,
    video: true,
    frameRate: "0",
    resolution: "",
    volume: "0",
    aspectRatio: "",
    resizeMode: "",
  });
  assert.equal(result.frameRate, 30);
});
```

- 「`'1'` を渡すと 1 になる（下限境界）」
- 「`'60'` を渡すと 60 になる（上限境界）」
- 「`'99999'` を渡すと 60 にクランプされる」

`-1` / `0.5` / `0xFF` / `1e5` / `Infinity` / `NaN` / 空文字等のケースは PBT で網羅するため単体テストには含めない。本テストは `result.frameRate` のみを検証し、`width` / `height` / `volume` 等の他フィールドは本 issue のスコープ外。`volume: "0"` で固定する。

### `src/utils.prop.ts` への PBT 追加

既存 PBT は正常範囲のみ生成しており `createFakeMediaConstraints` の `parsedFrameRate` ロジックを検証していない。`createFakeMediaConstraints` を `src/utils.prop.ts` の named import に追加し、専用の property test を追加する。

```ts
test("createFakeMediaConstraints の frameRate は常に [1, 60] の整数になる", () => {
  fc.assert(
    fc.property(
      fc.oneof(
        fc.constant("0"),
        fc.constant("-1"),
        fc.constant("0.5"),
        fc.constant("0xFF"),
        fc.constant("1e5"),
        fc.constant("Infinity"),
        fc.constant("NaN"),
        fc.constant("abc"),
        fc.constant(""),
        fc.integer({ min: -1000, max: 10000 }).map(String),
        fc.float({ min: -100, max: 100, noNaN: true, noDefaultInfinity: true }).map(String),
        fc.string(),
      ),
      (raw) => {
        const result = createFakeMediaConstraints({
          audio: false,
          video: true,
          frameRate: raw,
          resolution: "",
          volume: "0",
          aspectRatio: "",
          resizeMode: "",
        });
        assert.isTrue(Number.isInteger(result.frameRate));
        assert.isAtLeast(result.frameRate, 1);
        assert.isAtMost(result.frameRate, 60);
      },
    ),
  );
});
```

「結果が `[1, 60]` の整数になる」という不変条件のみを検証する。`fc.string()` が `"60abc"` を生成した場合、`Number.parseInt("60abc", 10) === 60` で結果が 60 になるが、これは `parseInt` の仕様通りで不変条件を満たす（「不正値は 30 にフォールバック」のホワイトリスト検証は上記単体テストでカバー）。

### worker 単体テスト

`fakeVideo.worker.ts` は OffscreenCanvas / Worker API に依存しており jsdom 環境では実行不可能、モック禁止規約と両立する純粋関数化が現実的でないため、worker 単体テストは追加しない。worker 側のクランプは二重防御であり、上記 utils 側テストで境界値を網羅すれば worker への入力は保証される。

## スコープ外

下記はいずれも別 issue として後続で起票する。本 issue 内では扱わない:

- `createVideoConstraints` の同種ガード抜け（下流は `getUserMedia` の `MediaTrackConstraints` でブラウザが `OverconstrainedError` で弾くため worker busy-loop には到達しない）。
- `createGetDisplayMediaVideoConstraints` の同種ガード抜け（`getDisplayMedia` 経由でブラウザが弾く）。
- UI レベルでの `type="number"` 化（`FrameRateForm.tsx` を `type="number"` + `min`/`max`）。
- `setTimeout` → `setInterval` 置換 / `Math.round` 化（描画 fps のドリフト改善）。
- init 連続時の `clearTimeout` 漏れ（`stop` → `init` の順を守れば問題ないが、防御不足）。
- worker 純粋関数化リファクタとテスト追加。

## CHANGES.md エントリ

`CHANGES.md` の `## develop` 内 `[FIX]` セクション末尾（`### misc` セクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `fakeVideo` Worker の描画ループが `frameRate` 0 / 負数 / 小数で過剰再帰描画に陥る問題を修正する
  - `createFakeMediaConstraints` で `parsedFrameRate` を「有限正数のみ受理、上限 60 にクランプ」に厳格化する
  - 0 / 負数 / 0.5 / 0xN プレフィックス値は 30 にフォールバックし、60 超は 60 にクランプする
  - `fakeVideo.worker.ts` の `init` ハンドラでも `[1, 60]` にクランプして二重防御する
  - @voluntas
```

CLAUDE.md「後方互換性は考慮しないこと」方針により、後方互換のない挙動変更（`N > 60` の 60 クランプ、`N <= 0` の 30 フォールバック）はバグ修正の結果として `[FIX]` に分類する（`[CHANGE]` 区分にはしない）。

## 検証手順

### A. 修正前の再現（main で実施して本 issue の現象を確認）

1. `pnpm dev` で起動。
2. `?mediaType=fakeMedia&video=true&frameRate=0` の URL で開く。
3. 「Request Media」ボタンを押して fake media stream を生成する。
4. macOS Activity Monitor または Chrome `chrome://process-internals` で対象タブの Worker プロセスを観測。Worker スレッドが 1 コアを飽和（CPU 100% 近辺）させることを確認する。

### B. 修正後の確認

5. 本 issue の修正を入れた後、以下 5 パターンの URL で開いて Worker の CPU 使用率が 1 桁 % に収まることを確認する:
   - `?frameRate=0` → 30 にフォールバック
   - `?frameRate=-1` → 30 にフォールバック
   - `?frameRate=0.5` → 30 にフォールバック（parseInt で 0 → 30）
   - `?frameRate=0xFF` → 30 にフォールバック（parseInt で 0 → 30）
   - `?frameRate=99999` → 60 にクランプ
6. DebugPane の Timeline / Log で `media-constraints` の `frameRate` フィールドが上記の補正値で記録されていることを確認する。

### C. UI テキスト入力経路

7. UI を開き `FrameRateForm` のテキスト入力に `0` / `-1` / `0.5` / `99999` を順に入力 → Request Media → CPU が飽和しないことを確認する。

### D. 正常系の回帰確認

8. `?frameRate=30` / `?frameRate=60` で開き、映像が滑らかに表示されることを確認する。
9. ドロップダウン候補 `5 / 10 / 15 / 20 / 24 / 30 / 60` をそれぞれ選択し、映像が表示されることを確認する。

### E. テスト

10. `pnpm test` が pass すること（追加した単体 4 件 + PBT 1 件含む）。
11. 既存 Playwright e2e（`pnpm test:e2e`）が pass すること（fakeMedia 経路を踏むテストの非退行）。

## 完了条件

- 検証手順 A-E すべてが通過すること。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 追加した単体テスト 4 件 + PBT 1 件が pass すること。
- 既存テスト（`pnpm test`）および既存 Playwright e2e が通ること。
