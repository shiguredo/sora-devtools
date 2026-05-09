# 0016 utils / rpc / opfs / worker のテストカバレッジを追加する

Created: 2026-05-09
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

- PBT で書ける関数は PBT（`*.prop.ts`）でテストする
- ブラウザ API 依存の関数は Vitest の browser mode でテストする
- CLAUDE.md のテスト規約（Vitest Chai API, モック禁止, PBT 優先）を遵守する
