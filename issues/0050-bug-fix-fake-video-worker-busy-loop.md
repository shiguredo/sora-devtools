# 0050-bug-fix-fake-video-worker-busy-loop

- Priority: Medium
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-fake-video-worker-busy-loop
- Polished: 2026-06-09

## 目的

`createFakeMediaConstraints` の `parsedFrameRate` 算出は `Number.isNaN(fps) ? 30 : fps` で `NaN` だけ弾いており、`?frameRate=0` / `?frameRate=-1` / UI のテキスト入力 `0` / `-1` 等を素通しする。素通しされた `0` / 負数は下流の `fakeVideo.worker.ts` の `setTimeout` 遅延計算で 0 ms にクランプされ、Worker スレッドが CPU 1 コアを飽和させる。`createFakeMediaConstraints` で「有限正数のみ受理、UI 候補上限 60 にクランプ」を強制する。`fakeVideo.worker.ts` の `init` ハンドラでも同じクランプを二重防御として入れる（機序の詳細は「現状の問題」を参照）。

## 優先度根拠

- 即時クラッシュではないため High ではない。
- ユーザーが URL パラメータ（`?frameRate=0`）と UI のテキスト入力（`FrameRateForm` の `type="text"`、`src/components/DevtoolsPane/FrameRateForm.tsx:51-56`）の両方で直接踏める経路があるため Low ではない。
- 修正は数行で済み、影響範囲は `src/utils.ts` の 1 関数と `src/workers/fakeVideo.worker.ts` の `init` ハンドラ 1 箇所に限定される。

## 現状の問題

実装時に行番号がずれている可能性があるため、関数名（`parseStringParameter` / `signals.setFrameRate` / `createFakeMediaConstraints` / `fakeVideo.worker.ts` の `animate` および `init` ハンドラ）を基準に特定すること。Polished 時点は 2026-06-09。

### 入力経路

1. **URL パラメータ**: `?frameRate=0` → `parseStringParameter` (`src/utils.ts:81`) は string をそのまま返す（バリデーションなし） → `signals.setFrameRate(qsParams.frameRate)` (`src/app/actions.ts:112-113`) → signal `frameRate` (`src/app/signals.ts:103`) に格納。`setFrameRate` (`src/app/signals.ts:361-363`) は `frameRate.value = value` で素通し。
2. **UI テキスト入力**: `FrameRateForm` の `<FormInput type="text" onChange={onChange} />` (`src/components/DevtoolsPane/FrameRateForm.tsx:51-56`) は任意の文字列を許容。`onChange` が `setFrameRate(target.value)` で string をそのまま signal に格納。
3. **UI ドロップダウン**: `FRAME_RATE_DATA` (`src/components/DevtoolsPane/FrameRateForm.tsx:20-29`) の候補は `5 / 10 / 15 / 20 / 24 / 30 / 60`（+ `""` 未指定）の 8 値のみ。ドロップダウン経由なら本問題は踏まない。

3 はガード済みだが 1, 2 はガードなし。

### 下流での挙動

signal 経由で `createFakeMediaConstraints` (`src/utils.ts:467-498`) に渡る:

```ts
// src/utils.ts:472-473
const fps = Number.parseInt(frameRate, 10);
const parsedFrameRate = Number.isNaN(fps) ? 30 : fps;
```

`Number.isNaN` だけのガードでは下記の問題ケースが素通しされる:

| 入力 string | `parseInt(_, 10)` | 既存 `parsedFrameRate` | 修正後 `parsedFrameRate` | 備考                                                                     |
| ----------- | ----------------- | ---------------------- | ------------------------ | ------------------------------------------------------------------------ |
| `"0"`       | `0`               | `0`                    | `30`                     | **本丸**（worker で過剰再帰描画）                                        |
| `"-1"`      | `-1`              | `-1`                   | `30`                     | 本丸（worker で `Math.floor(1000/-1) = -1000` → HTML 仕様で 0 ms）       |
| `"0.5"`     | `0`               | `0`                    | `30`                     | parseInt の整数化で 0、本丸と同経路                                      |
| `"0xFF"`    | `0`               | `0`                    | `30`                     | 第 2 引数 10 指定でも先頭 `0` を取って終了                               |
| `"1e5"`     | `1`               | `1`                    | `1`                      | parseInt は `e` 以降を読まない（誤読しやすい、修正後は範囲内のためパス） |
| `"99999"`   | `99999`           | `99999`                | `60`                     | 巨大値、修正後は上限クランプ                                             |

`Infinity` / `NaN` / `abc` / 空文字は `parseInt` 段階で `NaN` を返すため既存ガードで 30 に落ちる（URL からの到達経路上、`Infinity` 問題は存在しない）。

`parsedFrameRate` は `createFakeMediaStream` (`src/utils.ts:577-639`) で 2 箇所に渡る:

- **`canvas.captureStream(parameters.frameRate)`** (`src/utils.ts:591`): HTML Canvas 仕様 (Media Capture from DOM Elements §4.1) で `frameRequestRate=0` は「`requestFrame()` 明示呼び出し時のみフレーム生成」を意味する。負数の挙動は実装依存。
- **worker への init メッセージ** (`src/app/actions.ts:744-755` 経由) → `fakeVideo.worker.ts` の `init` ハンドラ (`src/workers/fakeVideo.worker.ts:136-138`)。

### worker での暴走描画の機序

`src/workers/fakeVideo.worker.ts:88-96` の `animate`:

```ts
function animate(): void {
  drawFrame();
  const interval = Math.floor(1000 / frameRate);
  animationId = globalThis.setTimeout(() => {
    animate();
  }, interval) as unknown as number;
}
```

- `frameRate = 0`: `1000 / 0 = +Infinity`、`Math.floor(+Infinity) = +Infinity`。`setTimeout` の delay は HTML Living Standard "Timers" §8.5 の timer initialisation steps で WebIDL `long` 変換（ECMA-262 `ToInt32`）を経由し `+Infinity → 0` になる。
- `frameRate = -1`: `1000 / -1 = -1000`、`Math.floor = -1000`。同仕様の負値 clamp で 0 になる。

両ケースとも delay 0 ms が要求されるが、同仕様の「nesting level >= 5 のときは 4 ms に clamp」が適用され、実効 ~250 fps の過剰再帰描画になる（純粋な「busy-loop」=同期スレッドブロックではないが、Worker スレッドが 1 コアを飽和させる）。

## 設計方針

### 1. 上限値の選定: 60

UI ドロップダウン候補の最大は 60。本 issue は「異常値で worker を暴走させない」が目的で、UI 候補と整合させて 60 を上限とする。`?frameRate=120` 等の高値は 60 にクランプされる（後方互換性は CLAUDE.md「後方互換性は考慮しないこと」方針で許容）。

本クランプは `createFakeMediaConstraints` (fake video 経路) のみに適用される。実機映像 `createVideoConstraints` や画面共有 `createGetDisplayMediaVideoConstraints` の `frameRate` 処理は別 issue で扱うため、ハイリフレッシュレートモニタ（120 / 144 / 240 Hz）需要には本 issue では影響しない（fake video は Canvas で人工生成する映像であり 60 fps 超の需要は実用上ほぼ無いため）。

### 2. `createFakeMediaConstraints` の修正

`src/utils.ts:472-473`:

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
// 本関数の戻り値 frameRate は常に [1, 60] の整数または 30 (invariant)
const fps = Number.parseInt(frameRate, 10);
const parsedFrameRate = Number.isNaN(fps) || fps <= 0 ? 30 : Math.min(60, fps);
```

`Number.isFinite` を使わない理由: `Number.parseInt(_, 10)` の戻り値は仕様上 `NaN` または有限整数のみで、`Infinity` を返さない（`Number.isFinite` チェックは `!Number.isNaN` と等価で冗長）。

下流 (`canvas.captureStream` / worker の `setTimeout`) はこの invariant に依存するため、本関数の戻り値型コメント等の文書化を行う場合は同 invariant を記載する。

### 3. `fakeVideo.worker.ts` の二重防御

`src/workers/fakeVideo.worker.ts:136-138`:

**before**:

```ts
if (data.frameRate !== undefined) {
  ({ frameRate } = data);
}
```

**after**:

```ts
if (data.frameRate !== undefined) {
  // 二重防御: utils.ts 側でクランプ済みでも、テストや将来の別経路から不正値が
  // 渡された場合に備えて worker 側でもクランプする。
  // postMessage の構造化クローンは NaN / Infinity / -0 を透過するため、
  // TypeScript の number 型では弾けない。Number.isFinite で実値検査が必要。
  // Math.max(1, ...) は将来 createFakeMediaConstraints を経由しない経路から
  // 小数 (例: 0.5) が渡された場合の最小 1 fps 保証として残す。
  const incoming = data.frameRate;
  frameRate = Number.isFinite(incoming) && incoming > 0 ? Math.max(1, Math.min(60, incoming)) : 30;
}
```

`utils.ts` 側は string → integer 変換の責務、worker 側は受信した number の範囲チェック責務、と責務分担する。worker 単体テストは追加しないため、本 issue 内では純粋関数化リファクタは行わない（4.3 を参照）。

### 4. テスト戦略

#### 4.1 `src/utils.test.ts` への新規テスト追加

`createFakeMediaConstraints` の単体テストは現状存在しない（`grep` で確認: `utils.test.ts` で `frameRate` を扱うのは `parseQueryString` のテストのみ）。新規 `test` を追加する。テストメッセージは日本語、`test`/`assert` API を使用、モック禁止。

**前提作業**: `src/utils.test.ts` の既存 import 文に `createFakeMediaConstraints` を追加する（現状 `import { getValueByAspectRatio, parseMetadata, parseQueryString } from "./utils.ts";`）。`src/utils.prop.ts` 側も同様に追加する。

代表的な単体テスト 4 件:

```ts
test("createFakeMediaConstraints は frameRate に '0' を渡すと parsedFrameRate を 30 に補正する", () => {
  const result = createFakeMediaConstraints({
    audio: false,
    video: true,
    frameRate: "0",
    resolution: "",
    volume: "0.5",
    aspectRatio: "",
    resizeMode: "",
  });
  assert.equal(result.frameRate, 30);
});

test("createFakeMediaConstraints は frameRate に '1' を渡すと parsedFrameRate を 1 にする（下限境界）", () => {
  // 上記と同形、frameRate のみ "1" にし、assert.equal(result.frameRate, 1)
});

test("createFakeMediaConstraints は frameRate に '60' を渡すと parsedFrameRate を 60 にする（上限境界）", () => {
  // 上記と同形、frameRate のみ "60" にし、assert.equal(result.frameRate, 60)
});

test("createFakeMediaConstraints は frameRate に '99999' を渡すと parsedFrameRate を 60 にクランプする", () => {
  // 上記と同形、frameRate のみ "99999" にし、assert.equal(result.frameRate, 60)
});
```

`-1` / `0.5` / `0xFF` / `1e5` / `Infinity` / `NaN` / 空文字等のケースは下記 4.2 の PBT で網羅するため、単体テストでの個別列挙は不要（境界値 4 件を単体テストで担保し、それ以外は PBT に委ねる）。本テストは `result.frameRate` のみを検証し、`width` / `height` / `volume` 等の他フィールドは本 issue のスコープ外。

#### 4.2 `src/utils.prop.ts` への PBT 追加

既存 PBT (`src/utils.prop.ts:108`) は `frameRate: fc.option(fc.integer({ min: 1, max: 60 }).map(String), ...)` で正常範囲のみ生成しており、`createFakeMediaConstraints` の `parsedFrameRate` ロジックを検証していない。`createFakeMediaConstraints` 専用の property test を別途追加する。

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
        // noNaN / noDefaultInfinity で NaN / Infinity 由来文字列を弾く
        // (上記 fc.constant("Infinity") / fc.constant("NaN") で別途網羅済み)
        fc.float({ min: -100, max: 100, noNaN: true, noDefaultInfinity: true }).map(String),
        fc.string(),
      ),
      (raw) => {
        const result = createFakeMediaConstraints({
          audio: false,
          video: true,
          frameRate: raw,
          resolution: "",
          volume: "0.5",
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

本 PBT は「結果が `[1, 60]` の整数になる」という不変条件のみを検証する。例えば `fc.string()` が `"60abc"` を生成した場合、`Number.parseInt("60abc", 10) === 60` で結果が 60 になるが、これは `parseInt` の仕様通りで不変条件を満たすため pass する（「不正値は 30 にフォールバック」のホワイトリスト検証は 4.1 の単体テストで個別に行う）。

#### 4.3 worker 側

`fakeVideo.worker.ts` は OffscreenCanvas / Worker API に依存しており jsdom 環境では実行不可能、モック禁止規約と両立する純粋関数化が現実的でないため、worker 単体テストは追加しない。worker 側のクランプは二重防御であり、4.1 / 4.2 の `utils.ts` 側テストで境界値を網羅すれば worker への入力は保証される。検証は下記「検証手順」の手動確認でカバーする（worker 単体テスト追加と純粋関数化リファクタは別 issue で扱う）。

### 5. スコープ外

下記はいずれも別 issue として後続で SEQUENCE を取得し起票する。本 issue 内では扱わない:

- **`createVideoConstraints` (`src/utils.ts:414-422`) の同種ガード抜け**: `Number.isNaN` のみで `0` / 負数を素通しする同じ欠陥がある。ただし下流は `getUserMedia` の `MediaTrackConstraints` でブラウザが `OverconstrainedError` で弾くため worker busy-loop には到達しない。
- **`createGetDisplayMediaVideoConstraints` (`src/utils.ts:553-558`) の同種ガード抜け**: 同上（`getDisplayMedia` 経由でブラウザが弾く）。
- **UI レベルでの `type="number"` 化**: `FrameRateForm.tsx` を `type="number"` + `min`/`max` に変えれば UI レベルで防御できるが、本 issue ではデータレベルのクランプで完結させる。
- **`setTimeout` → `setInterval` 置換 / `Math.round` 化**: 描画 fps のドリフト改善。
- **init 連続時の `clearTimeout` 漏れ** (`fakeVideo.worker.ts:160-161`): `stop` → `init` の順を守れば問題ないが、防御不足。
- **worker 純粋関数化リファクタとテスト追加**: 4.3 参照。

### 6. CHANGES.md エントリ

`CHANGES.md` の `## develop` の `[FIX]` セクション末尾（`### misc` サブセクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `fakeVideo` Worker の描画ループが `frameRate` 0 / 負数 / 小数で過剰再帰描画に陥る問題を修正する
  - `createFakeMediaConstraints` で `parsedFrameRate` を「有限正数のみ受理、上限 60 にクランプ」に厳格化する
  - 0 / 負数 / 0.5 / 0xN プレフィックス値は 30 にフォールバックし、60 超は 60 にクランプする
  - `fakeVideo.worker.ts` の `init` ハンドラでも `[1, 60]` にクランプして二重防御する
  - @voluntas
```

CLAUDE.md「後方互換性は考慮しないこと」方針により、後方互換のない挙動変更（`N > 60` の 60 クランプ、`N <= 0` の 30 フォールバック）はバグ修正の結果として `[FIX]` に分類する（`[CHANGE]` 区分にはしない）。

### 7. 関連 issue

- [[closed/0049-bug-fix-fake-contents-audio-close]]: 同じ fakeContents 周辺の AudioContext close 設計を扱った issue。「UI 操作で本丸経路が踏めない」判定で実装せず close された経緯があり、本 issue とは技術的に独立。
- CHANGES.md の `## develop` の `[CHANGE] Fake Video を Worker ベースに書き換える` エントリは本 issue が修正する Worker 化変更そのもの。本 issue は CHANGE 内の不具合修正のため独立 `[FIX]` として追記する。

## 検証手順

### A. 修正前の再現（main で実施して本 issue の現象を確認）

1. `vp dev` で起動。
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

10. `vp test src/utils.test.ts src/utils.prop.ts` が pass すること。
11. 既存 Playwright e2e が pass すること（fakeMedia 経路を踏むテストの非退行）。

## 完了条件

- 検証手順 A-E すべてが通過すること。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に「6. CHANGES.md エントリ」のエントリが追記され、担当者行が付いていること。
- 4.1 の単体テスト 4 件 + 4.2 の PBT 1 件が pass すること（`vp test` で確認）。
- 既存 Playwright e2e が pass すること。
