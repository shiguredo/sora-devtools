# 0015 コードベースから死にコード・不要なコメントを削除する

Created: 2026-05-09
Completed: 2026-05-09
Model: deepseek-v4-pro

## 概要

コードベース全体に、使用されていないコード・型・コメント・ディレクティブが複数存在する。

## 削除対象一覧

### 未使用エクスポート

| ファイル:行            | 内容                                                             |
| ---------------------- | ---------------------------------------------------------------- |
| `src/types.ts:211-213` | `CustomHTMLCanvasElement` インターフェース（全 import なし）     |
| `src/utils.ts:267-269` | `testVideoResolutionPattern` 関数（全 import なし）              |
| `src/utils.ts:669-677` | `isFormDisabled` 関数（signals.ts の computed 版が使われている） |
| `src/opfs.ts:98-110`   | `purgeUrlEntriesFromOPFS` 関数（全 import なし）                 |
| `src/constants.ts:117` | `INSTRUCTIONS` 定数（全 import なしの可能性。要確認）            |

### 虚偽の型参照

| ファイル:行        | 内容                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| `src/types.ts:415` | `"localTestMediaStream"` — `SoraDevtoolsState` に存在しないプロパティ名 |

### 不要なコメント・ディレクティブ

| ファイル:行               | 内容                                                                           |
| ------------------------- | ------------------------------------------------------------------------------ |
| `src/app/signals.ts:13`   | `// eslint-disable-next-line import/default` — eslint は不使用                 |
| `src/utils.ts:240`        | `// biome-ignore lint:` — Biome は不使用                                       |
| `src/utils.pbt.test.ts:1` | `// このテストは Cline https://cline.bot/ による自動生成です。` — 宣伝コメント |
| `src/types.ts:273-274`    | `// 元々定義されてたやつ` — 口語的コメント                                     |
| `src/types.ts:281-282`    | `// 新しく追加したやつ` — 口語的コメント                                       |

### プロジェクト規約と矛盾する後方互換レイヤー

| ファイル:行                    | 内容                                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| `src/app/actions.ts:1811-1901` | signals.ts の全セッターを再エクスポートする約 90 行 — CLAUDE.md に「後方互換性は考慮しない」と明記 |

## 修正方針

### 1. 未使用エクスポートの削除

| ファイル               | 削除対象                                   | 確認結果                                                               |
| ---------------------- | ------------------------------------------ | ---------------------------------------------------------------------- |
| `src/types.ts:211-213` | `CustomHTMLCanvasElement` インターフェース | 全 import なし → 削除                                                  |
| `src/utils.ts:267-269` | `testVideoResolutionPattern` 関数          | 全 import なし → 削除                                                  |
| `src/utils.ts:669-677` | `isFormDisabled` 関数                      | `signals.ts:181` の computed 版が全コンポーネントで使われている → 削除 |
| `src/opfs.ts:98-110`   | `purgeUrlEntriesFromOPFS` 関数             | 全 import なし → 削除                                                  |
| `src/constants.ts:117` | `INSTRUCTIONS` 定数                        | 全 import なし → 削除（`instructions.json` の import も合わせて削除）  |

### 2. 虚偽の型参照の削除

`src/types.ts:415` の `"localTestMediaStream"` を `DownloadReportParameters` の Omit リストから削除する。`SoraDevtoolsState` に存在しないプロパティ名であり、TypeScript はエラーを出さないが誤解を招く。

### 3. 不使用ディレクティブの削除

- `src/app/signals.ts:13` — `// eslint-disable-next-line import/default -- Vite の ?worker サフィックスによる Web Worker インポート` を削除（eslint 不使用）
- `src/utils.ts:240` — `// biome-ignore lint: 型安全なキーによる代入` を削除（Biome 不使用）

### 4. 口語的・宣伝コメントの削除

- `src/utils.pbt.test.ts:1` — `// このテストは Cline https://cline.bot/ による自動生成です。` を削除
- `src/types.ts:273-274` — `// 元々定義されてたやつ` を削除
- `src/types.ts:281-282` — `// 新しく追加したやつ` を削除

### 5. 後方互換 re-export ブロックの削除（条件付き）

`src/app/actions.ts:1811-1901` の再エクスポートブロックは、全コンポーネントの import 元を `@/app/actions` から `@/app/signals` に直接変更できる場合に限り削除する。CLAUDE.md に「後方互換性は考慮しないこと」と明記されているため、段階的移行は不要。

## テスト戦略

- 削除後に `vp check`（fmt + lint + typecheck）が pass すること
- 削除後に `vp test run` が pass すること
- `INSTRUCTIONS` 削除に伴い、`instructions.json` の import が不要になる場合は `constants.ts` の import 行も削除すること

## 解決方法

- `src/types.ts` から未使用の `CustomHTMLCanvasElement` インターフェースを削除した。
- `src/utils.ts` から未使用の `testVideoResolutionPattern` 関数を削除した。
- `src/utils.ts` から signals 版に置き換えられた `isFormDisabled` 関数を削除した（callers は `signals.ts` の computed を使用済み）。
- `src/types.ts` の `DownloadReportParameters` から存在しない `"localTestMediaStream"` を Omit リストから削除した。
- `src/app/signals.ts` から不要な `// eslint-disable-next-line import/default` を削除した（eslint 不使用）。
- `src/utils.ts` から不要な `// biome-ignore lint:` を削除した（Biome 不使用）。
- `src/types.ts` の `RTCInboundRtpStreamStats` 内の口語コメント `// 元々定義されてたやつ` / `// 新しく追加したやつ` を削除した。
- `src/utils.pbt.test.ts` 冒頭の `// このテストは Cline ... による自動生成です。` コメントを削除した。

備考: 以下は issue では削除候補として挙がっていたが実際には使用されていたため残した。

- `INSTRUCTIONS` (`src/constants.ts`) は `TooltipFormLabel.tsx` / `TooltipFormCheck.tsx` で使用中。
- `purgeUrlEntriesFromOPFS` (`src/opfs.ts`) は `SignalingUrlModal.tsx` で使用中。

`src/app/actions.ts` の signals 再エクスポートブロックは 50 ファイルからの import に依存しており、削除は別途まとまった移行作業を要するため今回は触っていない。
