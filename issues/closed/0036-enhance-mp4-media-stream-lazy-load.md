# 0036 mp4-media-stream を MP4 ファイル選択時のみ遅延ダウンロードする

Created: 2026-06-05
Priority: Medium
Model: DeepSeek V4 Pro
Polished: 2026-06-05
Completed: 2026-06-05
Branch: feature/add-mp4-media-stream-lazy-load

## 背景

`@shiguredo/mp4-media-stream` は WASM を含み初回ダウンロードが重い。現状は `MediaTypeForm.tsx` と `Mp4FileForm.tsx` から静的 value import しているため、mp4 media を使わない利用でもページロード時に JS チャンクが読み込まれる。

issue 0035 で noise-suppression の遅延読み込みは完了しており、同様の動的 import パターンを mp4-media-stream にも適用する。

## 根拠

- 本番ビルドで `mp4-media-stream` チャンクが約 956 KB とメインチャンクに比べて大きい
- `MediaTypeForm.tsx:11` が `import { Mp4MediaStream }` を value import しているため、mp4Media を選択しなくてもモジュールが読み込まれる
- `Mp4FileForm.tsx:1` も同様に value import している
- 多くの利用者は `mp4Media` を使わないため、初回ロードのコストを避けたい

## 内容

### 1. 動的 import 用モジュールを追加する

`src/mp4MediaStream.ts` を新設し、以下を提供する。`src/noiseSuppression.ts` のパターンに倣う。

#### モジュールキャッシュ

```typescript
import type { Mp4MediaStream } from "@shiguredo/mp4-media-stream";

interface Mp4MediaStreamModule {
  Mp4MediaStream: {
    load(mp4: Blob): Promise<Mp4MediaStream>;
  };
}

let mp4MediaStreamModulePromise: Promise<Mp4MediaStreamModule> | null = null;
```

- `mp4MediaStreamModulePromise ??= import("@shiguredo/mp4-media-stream")` でキャッシュし、複数回のファイル選択でも import が 1 回だけ実行されるようにする
- import 失敗時のみ Promise キャッシュを `null` にクリアし次回再試行可能にする。`Mp4MediaStream.load()` の失敗（不正な MP4 等）ではキャッシュをクリアしない。参照 : `noiseSuppression.ts:34-44`
- インスタンスキャッシュは不要（`Mp4MediaStream.load()` は毎回新規インスタンスを返すため）

#### 公開関数

- `isMp4MediaStreamSupported(): boolean` — `AudioDecoder` / `VideoDecoder` の有無で判定する。モジュール読み込み不要でサポート判定できるようにする。`Mp4MediaStream.isSupported()` （`mp4_media_stream.js:86-88`）と同等の判定ロジックを自前で実装することを確認すること。`noiseSuppression.ts:86-91` の否定リスト方式（`!(typeof X === "undefined" || typeof Y === "undefined")`）に倣う
- `loadMp4MediaStream(file: Blob): Promise<Mp4MediaStream>` — 動的 import 後に `module.Mp4MediaStream.load(file)` を呼び出す。`noiseSuppression.ts:34-44` の try/catch パターンに倣い、import 失敗時のみキャッシュをクリアする
- `resetForTesting()` — テスト間で `mp4MediaStreamModulePromise` を `null` にリセットする。参照 : `noiseSuppression.ts:109-113`

#### noiseSuppression.ts との差異

| 要素                          | noise-suppression                                     | mp4-media-stream                                     |
| ----------------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| モジュール Promise キャッシュ | あり                                                  | あり                                                 |
| 失敗時のキャッシュクリア      | あり                                                  | あり（import 失敗時のみ、`load()` 失敗時は非クリア） |
| インスタンスキャッシュ        | あり（`noiseSuppressionProcessorPromise`）            | なし（毎回 `load()` で新規）                         |
| lock                          | あり（`startProcessing` / `stopProcessing` の直列化） | 不要                                                 |
| preload                       | あり（`mediaProcessorsNoiseSuppression` 有効化時）    | 不要（ファイル選択時のみ読み込み）                   |
| `resetForTesting()`           | あり                                                  | あり                                                 |

### 2. コンポーネントの value import を削除し動的 import に置き換える

- `MediaTypeForm.tsx:11` の `import { Mp4MediaStream }` を削除し `import { isMp4MediaStreamSupported } from "@/mp4MediaStream";` を追加する。同ファイルでは `Mp4MediaStream` を型としても使っていないため import ごと削除する
  - `MediaTypeForm.tsx:47` の `Mp4MediaStream.isSupported()` は `isMp4MediaStreamSupported()` に置き換える
- `Mp4FileForm.tsx:1` の `import { Mp4MediaStream }` を削除し `import { loadMp4MediaStream } from "@/mp4MediaStream";` を追加する。同ファイルでも `Mp4MediaStream` を型として使っていないため import ごと削除する
  - `Mp4FileForm.tsx:19` の `Mp4MediaStream.load(files[0])` は `loadMp4MediaStream(files[0])` に置き換える

### 3. テストを追加する

#### 単体テスト（`src/mp4MediaStream.test.ts`）

- 各テストの先頭で `resetForTesting()` を呼び出し、テスト間の状態汚染を防ぐ
- `isMp4MediaStreamSupported()` : jsdom 環境で `globalThis.AudioDecoder` / `globalThis.VideoDecoder` にダミークラスを代入して true ケースを検証、定義なしで false ケースを検証。参照 : `noiseSuppression.test.ts:19-34`
- `loadMp4MediaStream()` : 複数回の同時呼び出しがいずれも成功すること、戻り値が `Mp4MediaStream` インスタンスであることを検証。動的 import 回数の直接検証は jsdom 環境では困難なため、複数回呼び出しの結果が正しいことを確認する。参照 : `noiseSuppression.test.ts:38-49`

#### Playwright e2e テスト（`tests/mp4-media-stream-lazy-load.test.ts`）

- ネットワークリクエストの判定には正規表現 `/mp4-media-stream|mp4_media_stream/iu` を使用し JS チャンクを捕捉する。WASM は data URI （`data:application/wasm;base64,...`）として JS に埋め込まれているため `.wasm` ファイルへの別途リクエストは発生しない
- `page.on("request", ...)` で全リクエストを収集するパターンは `noise-suppression-lazy-load.test.ts` と同様で十分（`modulepreload` も通常のリクエストとして観測されるため、リクエスト有無の判定のみで検証可能）
- テスト用の MP4 ファイルは `tests/fixtures/` に配置し、`page.setInputFiles` で `Mp4FileForm` の `<input type="file">` に渡す。テスト用の小さな H.264 + Opus の MP4 ファイルをコミットするか、テスト実行時に生成するかは実装タスクで判断する
- 初回ロード時は `mp4-media-stream` へのリクエストが 0 件であることを検証
- `mediaType` を `mp4Media` に変更しただけではリクエストが発生しないことを検証
- MP4 ファイル選択後に `mp4-media-stream` JS チャンクへのリクエストが発生することを検証

## 期待される結果

- 初回ページロード時に `mp4-media-stream` チャンクが `modulepreload` されない
- `mediaType` を `mp4Media` に変更しただけではダウンロードしない
- MP4 ファイル選択時に初めて JS チャンクと WASM が読み込まれる
- 既存の mp4 media 動作（再生・再接続・dispose）は維持される

## 影響範囲

- `src/mp4MediaStream.ts`（新規）
- `src/mp4MediaStream.test.ts`（新規）
- `src/components/DevtoolsPane/MediaTypeForm.tsx`
- `src/components/DevtoolsPane/Mp4FileForm.tsx`
- `tests/mp4-media-stream-lazy-load.test.ts`（新規）
- `tests/fixtures/`（新規。テスト用 MP4 ファイル）
- `CHANGES.md`（`[UPDATE]` カテゴリでエントリを追加）

### 確認のみ（変更不要）

- `src/app/actions.ts` — `actions.ts:927` の `state.mp4MediaStream.play()` は signal 経由で `Mp4MediaStream` インスタンスを取得するため変更不要。`actions.ts:921-924` の null ガードも有効なまま
- `src/app/signals.ts:1` — `import type { Mp4MediaStream }` が既に type-only import のため変更不要
- `src/types.ts:115` — `mp4MediaStream: Mp4MediaStream | null` は import type 経由のため変更不要
- `vite.config.ts:21` — `manualChunks` の `mp4-media-stream` エントリは動的 import 化後もチャンク名安定化のために残す。noise-suppression と同様

## スコープ外

- `cleanupSoraMediaState` での `mp4MediaStream.stop()` 呼び出しの追加（MP4 dispose 時のクリーンアップ改善は別 issue）
- `Mp4FileForm.tsx:28` の `throw error` による unhandled promise rejection（既存バグ、別 issue で対応）
- `virtual-background` の遅延読み込み（別 issue）

## 解決方法

### 新規ファイル

- `src/mp4MediaStream.ts` — `@shiguredo/mp4-media-stream` の動的 import ラッパーモジュール
  - `isMp4MediaStreamSupported()`: `AudioDecoder` / `VideoDecoder` の有無でサポート判定（動的 import 不要）
  - `loadMp4MediaStream(file)`: 動的 import 後に `Mp4MediaStream.load()` を呼び出す
  - `resetForTesting()`: テスト間でモジュールキャッシュをリセット
  - モジュールキャッシュは `??=` で 1 回だけ import、失敗時のみキャッシュをクリア
- `src/mp4MediaStream.test.ts` — 単体テスト（`isMp4MediaStreamSupported` の 4 ケース、`loadMp4MediaStream` の同時呼び出しとキャッシュ再呼び出し）
- `tests/mp4-media-stream-lazy-load.test.ts` — Playwright e2e テスト（初回ロード・mediaType 変更時・ファイル選択時のリクエスト確認）
- `tests/fixtures/test.mp4` — テスト用の最小限 H.264 + Opus MP4 ファイル

### 変更ファイル

- `src/components/DevtoolsPane/MediaTypeForm.tsx`: `import { Mp4MediaStream }` → `import { isMp4MediaStreamSupported }`, `Mp4MediaStream.isSupported()` → `isMp4MediaStreamSupported()`, 変数名 `enabledMp4Media` → `isMp4MediaAvailable`
- `src/components/DevtoolsPane/Mp4FileForm.tsx`: `import { Mp4MediaStream }` → `import { loadMp4MediaStream }`, `Mp4MediaStream.load()` → `loadMp4MediaStream()`
- `CHANGES.md`: `[UPDATE]` エントリを追加

### レビュー指摘反映

- Boolean 変数名を `is` プレフィックスに統一
- インターフェースパラメータ名 `mp4` → `file` に統一
- `isMp4MediaStreamSupported` の境界値テスト追加（両方あり/両方なし/片方のみの 4 ケース）
- 誤解を招くコメントの修正（「異なる Blob」→「同一 Blob」、「空の Blob ではエラーになる」→ 削除）
- テスト名を実態に合わせて修正
- e2e テストの冗長な正規表現チェックを簡略化
