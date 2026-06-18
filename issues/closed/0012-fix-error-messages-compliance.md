# 0012 エラーメッセージを CLAUDE.md 規約に準拠させる

Created: 2026-05-09
Completed: 2026-05-09
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

全エラーメッセージを以下の 3 原則に従って修正する:

1. 英語に統一する（日本語メッセージは不可）
2. 小文字で始める
3. 末尾にピリオドをつけない

### 大文字始まりの修正例

| Before                                                                               | After                                                                     |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `"Failed to call getUserMedia. Make sure domain is secure"`                          | `"failed to call getUserMedia, make sure domain is secure"`               |
| `"Failed to start NoiseSuppressionProcessor. NoiseSuppressionProcessor is 'null'"`   | `"failed to start NoiseSuppressionProcessor, processor is null"`          |
| `"Failed to start VirtualBackgroundProcessor. VirtualBackgroundProcessor is 'null'"` | `"failed to start VirtualBackgroundProcessor, processor is null"`         |
| `"No MP4 file has been selected"`                                                    | `"no MP4 file has been selected"`                                         |
| `` `Failed to connect Sora. ${error.message}` ``                                     | `` `failed to connect Sora: ${error.message}` ``                          |
| `"Failed to connect Sora. Connection object is 'undefined'"`                         | `"failed to connect Sora, connection object is undefined"`                |
| `"Succeeded to connect Sora."`                                                       | `"succeeded to connect Sora"` (info メッセージのため末尾ピリオド削除のみ) |
| `"Failed to reconnect Sora."`                                                        | `"failed to reconnect Sora"`                                              |
| `"Succeeded to reconnect Sora."`                                                     | `"succeeded to reconnect Sora"`                                           |
| `"Disconnect Sora."`                                                                 | `"disconnected Sora"`                                                     |
| `` `Failed to get user devices. ${error.message}` ``                                 | `` `failed to get user devices: ${error.message}` ``                      |
| `"Failed to get 2D context"`                                                         | `"failed to get 2D context"`                                              |

### 日本語→英語の修正

| Before                                                | After                                   |
| ----------------------------------------------------- | --------------------------------------- |
| `"URL は wss:// または ws:// で始まる必要があります"` | `"URL must start with wss:// or ws://"` |
| `"この URL は既に追加されています"`                   | `"this URL has already been added"`     |

### 修正対象ファイル一覧

- `src/app/actions.ts` — 12 箇所
- `src/workers/fakeVideo.worker.ts` — 1 箇所
- `src/components/Header/SignalingUrlModal.tsx` — 4 箇所

## テスト戦略

エラーメッセージの文字列変更のみのため、既存テストがあればそれを更新する。新規テストは不要。

## 解決方法

- `src/app/actions.ts` の 12 箇所のエラー / 情報メッセージを小文字始まり・末尾ピリオドなしの英語に書き換えた。
- `src/workers/fakeVideo.worker.ts` の "Failed to get 2D context" を小文字始まりに変更した。
- `src/components/Header/SignalingUrlModal.tsx` の日本語メッセージ (`URL は wss:// または ws://...`、`この URL は既に追加されています`) を英語化した。
