# 0026-fmt-remove-lint-rule-name-comments

Created: 2026-05-10
Completed: 2026-05-10
Model: deepseek-v4-pro

## 背景

`feature/vite-plus-migrate` ブランチで lint ルール準拠のためにコード変更した箇所に、変更理由として lint ルール名を記載したコメントが 7 箇所存在する。コード変更内容自体が自明であり、これらのコメントはノイズとなる。

## 内容

| ファイル                  | 行  | コメント                                                        |
| ------------------------- | --- | --------------------------------------------------------------- |
| `CopyLogButton.tsx`       | 42  | `// promise/prefer-await-to-then に従い async/await で記述する` |
| `CopyUrlButton.tsx`       | 8   | 同上                                                            |
| `SessionStatusBar.tsx`    | 13  | 同上                                                            |
| `ConnectionStatusBar.tsx` | 14  | 同上                                                            |
| `Dropdown.tsx`            | 49  | `// no-else-return に従い早期 return でネストを浅くする`        |
| `Toast.tsx`               | 44  | 同上                                                            |
| `JsonTree.tsx`            | 110 | 同上                                                            |

## 解決方法

全 7 箇所の lint ルール名コメント行を削除した。コード変更内容自体が自明であり、lint ルール由来の変更であることは `vp check` の実行結果や CHANGES.md で記録されているため、コード内コメントとして残す価値はない。
