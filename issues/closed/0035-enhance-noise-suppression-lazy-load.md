# 0035 noise-suppression を有効化時のみ遅延ダウンロードする

Created: 2026-06-05
Completed: 2026-06-05
Priority: Medium
Model: Composer 2.5
Polished: 2026-06-05

## 背景

`@shiguredo/noise-suppression` は WASM を含み初回ダウンロードが重い（本番ビルドで約 4.8 MB の別チャンク）。現状は `signals.ts` / `actions.ts` から静的 import しているため、noise suppression を使わない利用でもページロード時に JS チャンクが読み込まれる。

`media-processors` 側では `NoiseSuppressionProcessor.startProcessing()` 内の `Rnnoise.load()` で WASM を遅延ロードしているが、sora-devtools 側でモジュール自体を先にバンドル・取得してしまうと初回表示が重くなる。

## 根拠

- 本番ビルドで `noise-suppression-*.js` が約 4.8 MB（gzip 約 3.2 MB）とメインチャンク（約 151 KB）に比べて極端に大きい
- `setMediaProcessorsNoiseSuppression(true)` 時点で `new NoiseSuppressionProcessor()` しており、チェック ON だけでもモジュール読み込みが走る
- 多くの利用者は `mediaProcessorsNoiseSuppression` を使わないため、初回ロードのコストを避けたい

## 内容

### 1. 動的 import 用モジュールを追加する

`src/noiseSuppression.ts` を新設し、以下を提供する。

- `isNoiseSuppressionSupported()` — `MediaStreamTrackProcessor` / `MediaStreamTrackGenerator` の有無で判定（モジュール読み込み不要）
- `getOrCreateNoiseSuppressionProcessor()` — 初回呼び出し時に `import("@shiguredo/noise-suppression")` で遅延ロード

### 2. プロセッサ生成タイミングをメディア取得時に移す

- `setMediaProcessorsNoiseSuppression` はフラグ更新のみとする
- `createMediaStream` の getUserMedia 音声処理直前で `getOrCreateNoiseSuppressionProcessor()` を呼び、`noiseSuppressionProcessor` signal を更新する
- `signals.ts` / `actions.ts` の `@shiguredo/noise-suppression` 静的 import を `import type` またはヘルパー経由に置き換える

### 3. テストを追加する

- 単体: `src/noiseSuppression.test.ts` で `isNoiseSuppressionSupported()` を検証
- e2e: `tests/noise-suppression-lazy-load.test.ts` で Playwright のネットワーク監視により、初回ロード・チェック ON 時はリクエスト 0 件、`request media` 後に `noise-suppression` / `rnnoise` 関連リクエストが発生することを検証

## 期待される結果

- 初回ページロード時に `noise-suppression` チャンクが `modulepreload` されない
- `mediaProcessorsNoiseSuppression` を ON にしただけではダウンロードしない
- `request media`（getUserMedia 実行）時に初めて JS チャンクと WASM が読み込まれる
- 既存の noise suppression 動作（接続・デバイス切替・dispose）は維持される

## 影響範囲

- `src/noiseSuppression.ts`（新規）
- `src/noiseSuppression.test.ts`（新規）
- `src/app/signals.ts`
- `src/app/actions.ts`
- `tests/noise-suppression-lazy-load.test.ts`（新規）
- `CHANGES.md`

## 解決方法

- `src/noiseSuppression.ts` を新設し `import("@shiguredo/noise-suppression")` による動的 import を実装した
- `signals.ts` / `actions.ts` の `@shiguredo/noise-suppression` 静的 import を `import type` に置き換えた
- `setMediaProcessorsNoiseSuppression` から `new NoiseSuppressionProcessor()` を削除し、フラグ更新のみとした
- `createUserMediaStream` の音声処理直前に `getOrCreateNoiseSuppressionProcessor()` で遅延生成するようにした
- `runWithNoiseSuppressionProcessorLock()` で `startProcessing` / `stopProcessing` を直列化し並行実行を防止した
- `getUserMedia()` 後のエラーハンドリングで未追加 track のみ停止するよう修正し、正常処理済み track の共連れ停止を防止した
- `cleanupMediaStreamOnError` / `stopLocalAudioTrack` / `disposeMedia` / `updateMediaStream` / `setMicDeviceAction` / `cleanupSoraMediaState` で処理済み音声トラックの停止を統一した
- `createUserMediaStream` から `processAudioTrack` / `processVideoTrack` を抽出しネスト深度とステートメント数を低減した
- 単体テスト (`src/noiseSuppression.test.ts`) と PBT (`src/noiseSuppression.prop.ts`) と Playwright e2e テスト (`tests/noise-suppression-lazy-load.test.ts`) を追加した

## スコープ外

- `virtual-background` / `mp4-media-stream` の遅延読み込み（別 issue）
- `VITE_NOISE_SUPPRESSION_ASSETS_PATH` の利用（現状未使用のまま）
