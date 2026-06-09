# 0058-bug-fix-vite-manual-chunks-include-check

- Priority: Low
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-vite-manual-chunks-include-check
- Polished: 2026-06-09

## 目的

`vite.config.ts` の `manualChunks` 判定が `moduleId.includes("node_modules/preact")` のような **包含一致** で実装されているため、`preact-render-to-string` 等の同プレフィックスのサードパーティが誤マッチして意図しない chunk に巻き込まれる可能性がある。本 issue は **現状の依存グラフでは発火していない予防的修正**（`pnpm-lock.yaml` で `preact-render-to-string` が存在しないことを確認済み）であり、将来の依存追加時の地雷を未然に塞ぐ。末尾スラッシュ付きの境界一致 (`includes("/node_modules/${mod}/")`) に厳格化する。

## 優先度根拠

- 現状の `pnpm-lock.yaml` には `preact-render-to-string` 等の同プレフィックス別パッケージは存在しない（`@preact/preset-vite` の devDependencies に間接的に居るのみで runtime 依存ではない）。現状の chunk 分割は壊れていない。即時の致命ではないため High ではない。
- 「遅延ロード対象 (`@shiguredo/mp4-media-stream` / `@shiguredo/noise-suppression` / `@shiguredo/virtual-background`) の chunk 分割」が崩れた瞬間に `tests/mp4-media-stream-lazy-load.test.ts` / `tests/noise-suppression-lazy-load.test.ts` で検知される。
- 依存追加（特に preact 関連や @shiguredo 派生ライブラリ）のタイミングで突然壊れうる「将来の地雷」。Low ではない。
- 修正は数文字、影響範囲は `vite.config.ts` の 1 関数のみ。
- 予防的修正のため Low で確定する。

## 現状の問題

実装時に行番号がずれている可能性があるため、ファイル名 (`vite.config.ts`) と関数名 (`manualChunks`) を基準に特定すること。Polished 時点は 2026-06-09。

### 該当コード

`vite.config.ts` の `manualChunks` 関数（17-31 行付近）:

```ts
output: {
  manualChunks(moduleId) {
    const chunks: Record<string, string[]> = {
      preact: ["preact"],
      "mp4-media-stream": ["@shiguredo/mp4-media-stream"],
      "noise-suppression": ["@shiguredo/noise-suppression"],
      "virtual-background": ["@shiguredo/virtual-background"],
      "sora-js-sdk": ["sora-js-sdk"],
    };
    const matched = Object.entries(chunks).find(([, modules]) =>
      modules.some((mod) => moduleId.includes(`node_modules/${mod}`)),
    );
    return matched?.[0];
  },
},
```

`moduleId.includes("node_modules/preact")` は `node_modules/preact-render-to-string` / `node_modules/preact-iso` / `node_modules/preact-router` 等にもマッチする。

### 誤マッチ候補一覧

各 chunk 設定値で、包含一致時に誤マッチする可能性のあるパッケージ:

| chunk 設定値                    | 同プレフィックスで誤マッチする可能性のあるパッケージ                                    |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| `preact`                        | `preact-render-to-string` / `preact-iso` / `preact-router` / `preact-custom-element` 等 |
| `@shiguredo/mp4-media-stream`   | `@shiguredo/mp4-media-stream-worker` 等の派生名                                         |
| `@shiguredo/noise-suppression`  | `@shiguredo/noise-suppression-*` 派生                                                   |
| `@shiguredo/virtual-background` | `@shiguredo/virtual-background-*` 派生                                                  |
| `sora-js-sdk`                   | `sora-js-sdk-types` / `sora-js-sdk-react` 等の派生名                                    |

`@preact/signals` は `node_modules/@preact/signals` (スコープ付き) に解決され、`node_modules/preact` (スコープ無し) に対する `includes` ではマッチしない。スコープ違いの誤マッチは起きない。

### pnpm 環境での `moduleId` 形状

本リポジトリは pnpm を使用。pnpm では `node_modules/preact` は `.pnpm/preact@10.29.2/node_modules/preact/` への symlink で、Rolldown / Vite が `manualChunks` に渡す `moduleId` は resolve 後の実パスになる:

- npm / yarn: `/abs/path/node_modules/preact/dist/preact.module.js`
- pnpm: `/abs/path/node_modules/.pnpm/preact@10.29.2/node_modules/preact/dist/preact.module.js`

どちらの場合も `/node_modules/preact/` 部分が含まれるため、末尾 `/` 付き `includes("/node_modules/preact/")` は pnpm 環境でも正しく境界を検出できる。`startsWith` 系の判定は `moduleId` が絶対パス（pnpm では `.pnpm/<resolved>/...` から始まる）のため使えない。

## 設計方針

### 1. 末尾 `/` 付き境界一致への厳格化

`vite.config.ts` の `manualChunks` 関数:

**before**（17-31 行付近）:

```ts
output: {
  manualChunks(moduleId) {
    const chunks: Record<string, string[]> = {
      preact: ["preact"],
      "mp4-media-stream": ["@shiguredo/mp4-media-stream"],
      "noise-suppression": ["@shiguredo/noise-suppression"],
      "virtual-background": ["@shiguredo/virtual-background"],
      "sora-js-sdk": ["sora-js-sdk"],
    };
    const matched = Object.entries(chunks).find(([, modules]) =>
      modules.some((mod) => moduleId.includes(`node_modules/${mod}`)),
    );
    return matched?.[0];
  },
},
```

**after**:

```ts
output: {
  manualChunks(moduleId) {
    // パッケージ名で chunk を分割する。
    // 包含一致 (`includes("node_modules/preact")`) では `preact-render-to-string` 等
    // 同プレフィックスの別パッケージが誤マッチするため、末尾 `/` 付きで境界を区切る。
    // pnpm の場合 moduleId は `.../node_modules/.pnpm/preact@10.29.2/node_modules/preact/dist/preact.module.js`
    // のように `.pnpm/<resolved>/node_modules/<pkg>/...` 形式になり、末尾の `/node_modules/<pkg>/`
    // 境界で真のパッケージ境界を検出できる。
    const chunks: Record<string, string[]> = {
      preact: ["preact"],
      "mp4-media-stream": ["@shiguredo/mp4-media-stream"],
      "noise-suppression": ["@shiguredo/noise-suppression"],
      "virtual-background": ["@shiguredo/virtual-background"],
      "sora-js-sdk": ["sora-js-sdk"],
    };
    const matched = Object.entries(chunks).find(([, modules]) =>
      modules.some((mod) => moduleId.includes(`/node_modules/${mod}/`)),
    );
    return matched?.[0];
  },
},
```

`startsWith` ヘルパー案は不採用（pnpm の絶対パス先頭が `.pnpm/<resolved>` で `startsWith` 不可、`includes` で十分）。

### 2. テスト戦略

- **単体テスト追加なし**: `manualChunks` 関数は `vite.config.ts` の inline 関数で export されておらず、独立 import 可能な純粋関数に切り出すには `vite.config.ts` の構造変更が必要。本 issue では構造変更を行わないため追加しない。
- **PBT 追加なし**: `moduleId` の形状は環境依存（pnpm / npm / yarn で異なる）でプロパティ化に向かない。
- **e2e 追加なし**: 既存 `tests/mp4-media-stream-lazy-load.test.ts` / `tests/noise-suppression-lazy-load.test.ts` は「動的 import がネットワークを介して遅延ロードされる」ことを URL 文字列 (`/mp4-media-stream/` / `/noise-suppression|rnnoise|\.wasm/` の正規表現) で確認するもので、chunk 分割の境界そのものは検証していない。本 issue の予防的修正でも既存テストの動作は変わらず、追加 e2e も不要（chunk 分割の本質確認は検証手順 B の手動検証で行う）。
- **手動検証**: 後述「検証手順」で `vp build` 後の `dist/assets/*.js` のファイル名一覧と、`preact-render-to-string` 一時追加時の chunk 分布を確認する。

### 3. CHANGES.md エントリ

本修正は現状の依存グラフでは chunk 分割の結果を変えない予防的修正であり、ユーザーから見える挙動は変わらない。CLAUDE.md「機能に直接影響しない変更（ドキュメント追加、リファクタリング等）は `### misc` サブセクションに記載すること」に従い、`[FIX]` ではなく `### misc` セクションに追記する。

`CHANGES.md` の `## develop` の `### misc` セクション末尾に以下を追記する。担当者行を忘れないこと。既存 `### misc` エントリの種別タグ慣習に従い `[CHANGE]` を付ける（内部実装の変更扱い）。

```
- [CHANGE] `vite.config.ts` の `manualChunks` 判定を末尾 `/` 付き境界一致に厳格化する
  - 従来の `includes("node_modules/preact")` だと `preact-render-to-string` 等の同プレフィックス別パッケージが誤マッチするリスクがあったため、`includes("/node_modules/preact/")` 等に修正する
  - 現状の依存グラフでは挙動変化なし、将来の依存追加時の予防策
  - @voluntas
```

### 4. スコープ外

下記は本 issue では扱わない:

- **`manualChunks` 関数の `vite.config.ts` 外への切り出し / 単体テスト基盤導入**: 構造変更を伴うため別 issue。
- **`chunks` 設定の拡充**: `@preact/signals` 等を独立 chunk にする最適化は別 issue で扱う。
- **`startsWith` ヘルパー化**: `includes` で十分であり pnpm 環境では絶対パス先頭が `.pnpm/<resolved>` 固定でないため `startsWith` 案は不採用。
- **遅延ロード対象パッケージリストの追加**: 本 issue は判定ロジックの厳格化のみで、対象パッケージリスト変更は別 issue。

### 5. 関連 issue

- 直接関連する既存 issue は無い（Vite/Rolldown chunk 分割設定系は本 issue が初）。
- 遅延ロード e2e の参考: `tests/mp4-media-stream-lazy-load.test.ts` / `tests/noise-suppression-lazy-load.test.ts`。
- `CHANGES.md` の `## develop` の `[CHANGE] Fake Video を Worker ベースに書き換える` は worker chunk 化と関連するが、本 issue の修正範囲外（`fakeVideo.worker.ts` は Vite の `?worker` import で別経路で chunk 化される）。

## 検証手順

### A. 修正前後で chunk 分割結果が変わらないことの確認（回帰防止）

1. develop ブランチで `pnpm install && vp build` を実行し、`dist/assets/*.js` のファイル名一覧（hash 部分は無視）を控える（現状: `preact-*.js` / `mp4-media-stream-*.js` / `noise-suppression-*.js` / `virtual-background-*.js` / `sora-js-sdk-*.js` / `index-*.js` / `fakeVideo.worker-*.js` 等）。
2. 本修正を入れた後、再度 `pnpm install && vp build` を実行し、ファイル名一覧（hash 部分は無視）が変わらないことを確認する。

### B. `preact-render-to-string` 追加時の誤マッチ防止の確認（修正の本質確認）

3. 一時的に `pnpm add -D preact-render-to-string` を実行する。`pnpm-workspace.yaml` の `minimumReleaseAge: 10080`（7 日）制約で失敗する場合は `pnpm add -D preact-render-to-string --config.minimumReleaseAge=0` を付けて再実行する。
4. `src/main.tsx` 等で **side-effect import** (`import "preact-render-to-string";`) を追加するか、named import + 実際の参照 (`import { renderToString } from "preact-render-to-string"; console.log(renderToString);`) でバンドル対象に含める。未使用の named import は tree-shaking で取り除かれてバンドルに残らないため不十分。
5. `vp build` を実行。
6. 修正前: `preact-*.js` 内に `preact-render-to-string` のコードが含まれていることを確認する（`grep -l "preact-render-to-string" dist/assets/preact-*.js` で 1 件以上ヒット、または `dist/assets/preact-*.js` のファイルサイズが本修正前後で増加）。
7. 修正後: `preact-render-to-string` は `preact` chunk に巻き込まれず、`index-*.js` または別 chunk に同梱されることを確認する（`grep -l "preact-render-to-string" dist/assets/preact-*.js` で 0 件）。
8. 検証完了後、`pnpm remove preact-render-to-string` と import 削除でリバートする。

### C. 遅延ロード e2e の非退行

9. `pnpm test:e2e` の `tests/mp4-media-stream-lazy-load.test.ts` / `tests/noise-suppression-lazy-load.test.ts` が pass すること（chunk 分割の境界そのものは検証しないが、動的 import のリクエスト発火が引き続き行われていることを確認）。

### D. テスト

10. `vp test` が pass すること（既存テストのリグレッション確認）。

## 完了条件

- 検証手順 A-D すべてが通過すること。
- 修正後コード（設計方針 1 の after）と一致して実装されていること（`includes("/node_modules/${mod}/")` の末尾 `/` 付き境界一致になっていること）。
- `CHANGES.md` の `## develop` の `### misc` セクション末尾に「3. CHANGES.md エントリ」のエントリが追記され、担当者行が付いていること。
- 既存テスト (`vp test`) および既存 Playwright e2e (`pnpm test:e2e`) が pass すること。
- 新規テストは追加しない（理由は設計方針 2 に記載）。
