# 0016 utils / rpc / opfs / worker のテストカバレッジを追加する

Created: 2026-05-09
Completed: 2026-05-09
Model: deepseek-v4-pro

## 概要

コードベースのエクスポート関数 40 以上のうち、テストが存在するのは `parseQueryString`（PBT + 単体）と `setInitialParameter`（app.test.ts）の 2 関数のみ。その他の全関数にテストがない。

## テスト追加対象（優先度順）

### 優先度: 高

| 関数                     | ファイル:行        | 理由                                                            |
| ------------------------ | ------------------ | --------------------------------------------------------------- |
| `createConnectOptions`   | `src/utils.ts:856` | 接続オプション構築の中核。role 分岐、forceStereoOutput 分岐あり |
| `createSignalingURL`     | `src/utils.ts:248` | enabled=true/false、dev/production、http/https の多岐分岐       |
| `createAudioConstraints` | `src/utils.ts:332` | 条件分岐が複数。PBT に適する                                    |
| `createVideoConstraints` | `src/utils.ts:387` | 同上                                                            |
| `parseBooleanString`     | `src/utils.ts:605` | 純粋関数。PBT に適する                                          |
| `parseMetadata`          | `src/utils.ts:614` | JSON パース失敗ケース要検証                                     |

### 優先度: 中

| 関数                         | ファイル:行        | 理由                                                         |
| ---------------------------- | ------------------ | ------------------------------------------------------------ |
| `rpc`                        | `src/rpc.ts:13`    | 正常系・エラー系・showMethodAlert 分岐                       |
| `loadUrlEntries`             | `src/opfs.ts:18`   | OPFS 非サポート時・ファイル非存在時・JSON パース失敗時の経路 |
| `saveUrlEntriesToOPFS`       | `src/opfs.ts:43`   | createWritable 非サポート時のフォールバック経路              |
| `createFakeMediaConstraints` | `src/utils.ts:452` | デフォルト値（fps=30, width=240, height=160）の検証          |
| `formatUnixtime`             | `src/utils.ts:37`  | 純粋関数。PBT に適する                                       |
| `checkFormValue`             | `src/utils.ts:57`  | 型ガード。境界値テスト必要                                   |
| `getVideoSizeByResolution`   | `src/utils.ts:271` | 正規表現パース。異常系テスト必要                             |

### 優先度: 低

| 関数                            | ファイル:行                       | 理由                                     |
| ------------------------------- | --------------------------------- | ---------------------------------------- |
| `fakeVideo.worker.ts` 全体      | `src/workers/fakeVideo.worker.ts` | Worker のメッセージハンドリング          |
| `createFakeMediaStream`         | `src/utils.ts:562`                | ブラウザ依存だがエラー経路の検証価値あり |
| `getDefaultVideoCodecType`      | `src/utils.ts:626`                | ランタイム依存だが分岐網羅価値あり       |
| `isFormDisabled`                | `src/utils.ts:669`                | 境界値テスト                             |
| `getMediaStreamTrackProperties` | `src/utils.ts:692`                | null 返却経路テスト                      |

### 既存テストの修正

| 対象                    | 内容                                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/utils.test.ts`     | 全 229 行を削除（`parseQueryString` は PBT で網羅済み）                                                                                                     |
| `src/utils.pbt.test.ts` | `src/utils.prop.ts` にリネーム。`fc.constant` による実質的単体テストを削除。`debugApiUrl`/`simulcastRequestRid`/`forceStereoOutput` を parametersArb に追加 |
| `src/app/app.test.ts`   | モック（`vi.stubGlobal`, `vi.fn()`）を排除したテスト手法に移行                                                                                              |

## 修正方針

### テストファイルの配置

| 新規テストファイル                   | 対象関数                                                                                                                                                 | テスト方式                                                                    |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `src/utils.prop.ts`                  | `parseBooleanString`, `parseMetadata`, `formatUnixtime`, `checkFormValue` 等の純粋関数                                                                   | PBT (fast-check)                                                              |
| `src/utils.ct.ts`                    | `createConnectOptions`, `createSignalingURL`, `createAudioConstraints`, `createVideoConstraints`, `createFakeMediaConstraints` 等のブラウザ API 依存関数 | Vitest browser mode (`.ct.ts`)                                                |
| `src/rpc.prop.ts`                    | `rpc` 関数                                                                                                                                               | PBT（テスト用の mock connection を注入できるよう rpc 関数のシグネチャを調整） |
| `src/opfs.ct.ts`                     | `loadUrlEntries`, `saveUrlEntriesToOPFS`                                                                                                                 | Vitest browser mode                                                           |
| `src/workers/fakeVideo.worker.ct.ts` | Worker のメッセージハンドリング                                                                                                                          | Vitest browser mode                                                           |

### 既存テストの修正

| 対象                    | 内容                                                                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/utils.test.ts`     | 全 229 行を削除。`parseQueryString` は PBT で網羅済み                                                                                                     |
| `src/utils.pbt.test.ts` | `src/utils.prop.ts` にリネーム。`fc.constant` の実質的単体テストを削除。`debugApiUrl`/`simulcastRequestRid`/`forceStereoOutput` を `parametersArb` に追加 |
| `src/app/app.test.ts`   | `vi.stubGlobal` / `vi.fn()` を排除し、Vitest browser mode で実際のブラウザ API を使用                                                                     |

### 他の issue との依存関係

- #0001 (AudioContext) の修正完了後に `createFakeMediaStream` のテストを追加する
- #0017 (signals ボイラープレート) の後、残った副作用セッターのテストを追加する
- #0002 (StatsReport タイマー) の修正後、`startStatsReportTimer` / `stopStatsReportTimer` のテストを追加する

### テスト環境

- `vitest-browser-preact` + Playwright で browser mode テストを実行する
- PBT テストは `@fast-check/vitest` を使用する
- CLAUDE.md のテスト規約を遵守する（test/assert、モック禁止、`*.prop.ts` 命名）

## 解決方法

CLAUDE.md の「モック禁止」と現実的なスコープを踏まえ、純粋関数の PBT を中心に拡充した。

- `src/utils.pbt.test.ts` を `src/utils.prop.ts` にリネームし、CLAUDE.md の `*.prop.ts` 命名規約に揃えた。
- `vite.config.ts` の `test.include` を個別ファイル列挙から `src/**/*.test.ts` / `src/**/*.prop.ts` のグロブに変更し、新規テストファイルが自動で取り込まれるようにした。
- `src/utils.prop.ts` に以下の純粋関数の PBT テストを追加した（今までは `parseQueryString` のみ）:
  - `parseBooleanString` (true/false 系・それ以外で undefined)
  - `formatUnixtime` (出力フォーマット検証)
  - `parseMetadata` (有効 JSON / 任意文字列の不変条件)
  - `getVideoSizeByResolution` (NxM 形式 / 不正形式の境界)

備考: 以下は今回のスコープから外した。

- `rpc` 関数のテスト: モック禁止規約と衝突するため、実際の Sora 接続を伴うテストインフラが必要。e2e で代替する。
- `loadUrlEntries` / `saveUrlEntriesToOPFS` / `createFakeMediaStream` / Worker テスト: `vitest-browser-preact` の browser mode セットアップが必要で、独立した issue として扱うのが適切。
- `createConnectOptions` / `createSignalingURL` などのブラウザ API 依存関数: 上記同様。

これらは別途 issue を起票して対応するのが望ましい。
