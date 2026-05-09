# 0012 エラーメッセージを CLAUDE.md 規約に準拠させる

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

コードベース全体で、エラーメッセージが CLAUDE.md:111-113 の規約（小文字始まり・末尾ピリオドなし）に違反している箇所が 20 箇所以上ある。また `SignalingUrlModal.tsx` では日本語のエラーメッセージが使われている。

## 違反箇所一覧

### 大文字始まり・ピリオド付き

| ファイル:行                           | メッセージ                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| `src/app/actions.ts:664`              | `"Failed to call getUserMedia. Make sure domain is secure"`                          |
| `src/app/actions.ts:808`              | `"Failed to start NoiseSuppressionProcessor. NoiseSuppressionProcessor is 'null'"`   |
| `src/app/actions.ts:823`              | `"Failed to start VirtualBackgroundProcessor. VirtualBackgroundProcessor is 'null'"` |
| `src/app/actions.ts:853`              | `"No MP4 file has been selected"`                                                    |
| `src/app/actions.ts:1380`             | `` `Failed to connect Sora. ${error.message}` ``                                     |
| `src/app/actions.ts:1387`             | `"Failed to connect Sora. Connection object is 'undefined'"`                         |
| `src/app/actions.ts:1389`             | `"Succeeded to connect Sora."`                                                       |
| `src/app/actions.ts:1452`             | `` `(trials ${i}) Failed to connect Sora. ${error.message}` ``                       |
| `src/app/actions.ts:1464`             | `"Failed to reconnect Sora."`                                                        |
| `src/app/actions.ts:1469`             | `"Succeeded to reconnect Sora."`                                                     |
| `src/app/actions.ts:1019`             | `"Disconnect Sora."`                                                                 |
| `src/app/actions.ts:1173`             | `` `Failed to get user devices. ${error.message}` ``                                 |
| `src/workers/fakeVideo.worker.ts:108` | `"Failed to get 2D context"`                                                         |

### 日本語エラーメッセージ（SignalingUrlModal.tsx）

| ファイル:行                                       | メッセージ                                            |
| ------------------------------------------------- | ----------------------------------------------------- |
| `src/components/Header/SignalingUrlModal.tsx:87`  | `"URL は wss:// または ws:// で始まる必要があります"` |
| `src/components/Header/SignalingUrlModal.tsx:92`  | `"この URL は既に追加されています"`                   |
| `src/components/Header/SignalingUrlModal.tsx:176` | `"URL は wss:// または ws:// で始まる必要があります"` |
| `src/components/Header/SignalingUrlModal.tsx:178` | `"この URL は既に追加されています"`                   |

## 修正方針

- 全エラーメッセージを英語に統一する
- 小文字で始め、末尾にピリオドをつけない
- 例: `"Failed to call getUserMedia."` → `"failed to call getUserMedia, make sure domain is secure"`
- SignalingUrlModal の日本語メッセージを英語に置き換える
