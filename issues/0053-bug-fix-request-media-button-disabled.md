# 0053-bug-fix-request-media-button-disabled

- Priority: Medium
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-request-media-button-disabled
- Polished: 2026-06-16

## 目的

`RequestMediaButton` (`src/components/DevtoolsPane/RequestMediaButton.tsx`) と `DisposeMediaButton` (`src/components/DevtoolsPane/DisposeMediaButton.tsx`) は **同一の `disabled` 条件をコピペ流用** していて、それぞれのボタンの責務（メディア取得 / 破棄）に合っていない。`localMediaStream` の有無を反映していないため:

- `RequestMediaButton`: `localMediaStream !== null` でも押せて、`requestMedia` が再度 `getUserMedia` を呼び出して権限プロンプトが再表示される（または同種デバイス取得で UX 体感劣化）。
- `DisposeMediaButton`: `localMediaStream === null` でも押せて、`disposeMedia` が空打ちで以下の副作用を持つ:
  - `virtualBackgroundProcessor` が `isProcessing()` を返すなら `getOriginalTrack` + `stopProcessing` が走り、 processor が不本意に停止する可能性がある (通常は `localMediaStream === null` なら processor も active でないが、外部経路で残存する可能性は捨てきれない)
  - `stopLocalAudioTrack(null, noiseSuppressionProcessor)` が必ず呼ばれる。 noiseSuppressionProcessor が以前に active 化されてから明示停止されていない場合、この呼び出しで processor が不本意に停止する可能性がある
  - `fakeContents.worker` が非 null なら `postMessage({type:"stop"})` で worker を停止する
  - `closeFakeContentsAudio` で AudioContext を解放する (AudioContext が無ければ no-op)
  - `setLocalMediaStream(null)` は既に null のため track stop は走らず冪等

両ボタンの `disabled` に `localMediaStream` の状態を反映させて UI 状態の整合性を取る。

## 優先度根拠

- 即時クラッシュではないため High ではない。
- 二重 `getUserMedia` 呼び出しによる権限プロンプト再表示やデバイス取得遅延で UX 体感が劣化する。`Dispose` の空打ちは無害だが操作の意図と乖離する。Low ではない。
- 修正は 2 つのコンポーネントの `disabled` 式にそれぞれ 1 つの条件を追加するだけで、影響範囲は `RequestMediaButton.tsx` / `DisposeMediaButton.tsx` の 2 ファイルに限定される。
- 関連する 0054 と DevtoolsPane の disabled 整合性ファミリーで揃ってマージする想定のため Medium。

## 現状の問題

行番号は陳腐化するため記載しない。各箇所はコンポーネント名（`RequestMediaButton` / `DisposeMediaButton`）および関数名（`requestMedia` / `disposeMedia` / `setLocalMediaStream`）で特定する。

### 該当コード

`RequestMediaButton.tsx`:

```ts
const disabled = role.value === "recvonly" || sora.value !== null || isFormDisabled.value;
```

`DisposeMediaButton.tsx`（**完全に同一**）:

```ts
const disabled = role.value === "recvonly" || sora.value !== null || isFormDisabled.value;
```

両ボタンが `localMediaStream` の有無を見ない。

### `setLocalMediaStream` の冒頭 stop ロジック (track leak の不在)

`src/app/signals.ts` の `setLocalMediaStream` (関数名で特定する。行番号は陳腐化するため省略する):

```ts
export const setLocalMediaStream = (mediaStream: MediaStream | null): void => {
  if (localMediaStream.value) {
    for (const track of localMediaStream.value.getTracks()) {
      track.stop();
    }
  }
  localMediaStream.value = mediaStream;
};
```

`requestMedia` 末尾の `signals.setLocalMediaStream(mediaStream)` で旧 stream の全 track が stop される。連打しても旧 stream の track は確実に停止され、マイク・カメラ LED は消える（track leak は発生しない）。本 issue は track 解放問題ではなく、**UI 状態の整合性問題**を扱う。

### `isFormDisabled` の役割

`src/app/signals.ts` の `isFormDisabled`:

```ts
export const isFormDisabled = computed(() => {
  const status = connectionStatus.value;
  return status === "preparing" || status === "connected" || status === "connecting";
});
```

両ボタンは `isFormDisabled.value` を含むため `preparing` / `connecting` / `connected` は既にカバー済み。本 issue は `connectionStatus` 系の遷移とは独立に `localMediaStream` の有無で disable する条件を追加するだけで、`isFormDisabled` には触れない。

### `role === "recvonly"` 条件の維持

`requestMedia` は role に依存せず `createMediaStream` を呼ぶため、recvonly でも `getUserMedia` が走る。`role === "recvonly"` を `disabled` で弾く既存ロジックは正しい（recvonly は送信メディア不要）。本 issue でも維持する。

## 設計方針

### `RequestMediaButton.tsx` の修正

**before**:

```ts
import { isFormDisabled, role, sora } from "@/app/signals";
...
const disabled = role.value === "recvonly" || sora.value !== null || isFormDisabled.value;
```

**after**:

```ts
import { isFormDisabled, localMediaStream, role, sora } from "@/app/signals";
...
// recvonly: 送信メディア不要なので request 不要
// sora !== null: 接続済みは UpdateMediaStreamButton で更新するため request 不要
// localMediaStream !== null: 既に取得済みなので重複取得を防ぐ
// isFormDisabled: connecting / preparing / connected の同期防止
const disabled =
  role.value === "recvonly" ||
  sora.value !== null ||
  localMediaStream.value !== null ||
  isFormDisabled.value;
```

### `DisposeMediaButton.tsx` の修正

**before**:

```ts
import { isFormDisabled, role, sora } from "@/app/signals";
...
const disabled = role.value === "recvonly" || sora.value !== null || isFormDisabled.value;
```

**after**:

```ts
import { isFormDisabled, localMediaStream, role, sora } from "@/app/signals";
...
// recvonly: localMediaStream を持たない
// sora !== null: 接続中は dispose せず disconnectSora 経由でクリーンアップ
// localMediaStream === null: そもそも dispose 対象が無い
// isFormDisabled: connecting / preparing / connected の同期防止
const disabled =
  role.value === "recvonly" ||
  sora.value !== null ||
  localMediaStream.value === null ||
  isFormDisabled.value;
```

### `requestMedia` / `disposeMedia` 関数側のガードは追加しない

両関数は `RequestMediaButton` / `DisposeMediaButton` からのみ呼ばれる（grep 確認済）。ボタン側ガードで重複呼び出しを抑止すれば関数側ガードは過剰防御。[[0054-bug-fix-update-media-stream-button-disabled]] の `updateMediaStream` は別経路（`AudioInputForm` / `VideoInputForm` の onChange からも呼ばれる）で in-flight ガードが必要だが、本 issue の対象関数にはその事情がない。

### 状態遷移マトリクス

修正前後で `RequestMediaButton` / `DisposeMediaButton` の disabled 状態を主要遷移で確認する（「修正」と書いた箇所が本 issue の対象）:

| connectionStatus | role     | sora     | localMediaStream | Request 修正前            | Request 修正後  | Dispose 修正前            | Dispose 修正後  |
| ---------------- | -------- | -------- | ---------------- | ------------------------- | --------------- | ------------------------- | --------------- |
| initializing     | sendrecv | null     | null             | 押下可（正常）            | 押下可（正常）  | 押下可（誤、対象なし）    | disable（修正） |
| initializing     | sendrecv | null     | 取得済           | 押下可（誤、重複取得）    | disable（修正） | 押下可（正常）            | 押下可（正常）  |
| initializing     | recvonly | null     | null             | disable（recvonly）       | disable         | disable（recvonly）       | disable         |
| preparing        | sendrecv | null     | null             | disable（isFormDisabled） | disable         | disable（isFormDisabled） | disable         |
| connecting       | sendrecv | not null | 取得済           | disable（sora）           | disable         | disable（sora）           | disable         |
| connected        | sendrecv | not null | 取得済           | disable（sora）           | disable         | disable（sora）           | disable         |
| disconnected     | sendrecv | null     | null             | 押下可（正常）            | 押下可（正常）  | 押下可（誤、対象なし）    | disable（修正） |
| disconnected     | sendrecv | null     | 取得済           | 押下可（誤、重複取得）    | disable（修正） | 押下可（正常）            | 押下可（正常）  |

## テスト戦略

本修正は純粋な JSX prop の式変更で、 disabled の検証には `RequestMediaButton` / `DisposeMediaButton` の render 結果からボタンの `disabled` 属性を読み取るテストが必要だが、これを書くには次の制約がある:

- vitest の `environment: "jsdom"` で `MediaStream` / `MediaStreamTrack` / `AudioContext` が未提供のため、`localMediaStream` を実値で生成できない
- CLAUDE.md「モックやスタブは絶対に利用しないこと」によりダミー `MediaStream` を作って `signals.localMediaStream.value` にセットできない
- Playwright e2e (`tests/sendrecv.test.ts` 等) は現状 `RequestMediaButton` / `DisposeMediaButton` を踏むシナリオを持たない (既存 e2e は ConnectButton → 3 秒 → DisconnectButton の最小フロー)

closed/0033 で同じ「`MediaStream` 系を要するロジックは jsdom + モック禁止と両立しない」結論が確立されているため、本 issue でも単体テスト追加なし・e2e 追加なしの判断を維持する。手動検証 (後述「検証手順」) で状態遷移マトリクスを網羅する。 Preact コンポーネントの単体テスト基盤導入と DevtoolsPane の disabled マトリクス e2e は別 issue ( #0038 の系列) で扱う。

## CHANGES.md エントリ

`CHANGES.md` の `## develop` 内 `[FIX]` セクション末尾（`### misc` セクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `RequestMediaButton` / `DisposeMediaButton` の `disabled` 条件に `localMediaStream` の状態を反映する
  - `RequestMediaButton` は `localMediaStream` が取得済みのとき無効化し、重複した `getUserMedia` 呼び出しによる権限プロンプト再表示を防ぐ
  - `DisposeMediaButton` は `localMediaStream` が null のとき無効化し、無意味な空打ちを防ぐ
  - @voluntas
```

## スコープ外

下記は本 issue では扱わない:

- **`disconnected` 状態で `localMediaStream !== null` のときデバイスを変更したいケース**: 本 issue の修正後は Request Media が disable になるため、 Dispose Media → Request Media の 2 ステップ操作が必要になる ( `UpdateMediaStreamButton` は `updateMediaStream` の `connectionStatus === "disconnected"` 早期 return により実質的に no-op になるため動線として使えない)。本 issue では「重複 `getUserMedia` 呼び出し抑止」を優先し、デバイス変更動線の 1 ステップ化は別 issue で扱う。
- **`role` 動的切替後の `localMediaStream` 残留**: `RoleForm` で `sendrecv` → `recvonly` に切り替えた場合、本 issue の修正後も `role === "recvonly"` 短絡で両ボタンとも disable のまま `localMediaStream` が残る。残留した stream をクリアする UI 動線追加 (例: role 切替時の自動 dispose) は別 issue で扱う。本 issue の修正後挙動には影響しない。
- [[0054-bug-fix-update-media-stream-button-disabled]]: `UpdateMediaStreamButton` の disabled 欠落と in-flight ガード。本 issue の `localMediaStream` 状態反映の方針と同じ系列。
- [[0056-bug-fix-media-type-form-synthetic-event]]: `MediaTypeForm` の合成 Event 問題。disabled 整合性とは別系統の UI 不具合。
- [[closed/0055-bug-fix-disconnect-button-preparing]]: closed（実装せず）。当初 `DisconnectButton` に `preparing` を追加する案だったが、`preparing` 中も Disconnect を許可する既存設計（closed/0007 で確立）を維持する判断で close された。本 issue の `isFormDisabled` 利用アプローチとは独立。
- `onClick` 内 `void requestMedia()` の unhandled rejection 対応: `requestMedia` の `catch` 内で `setAPIErrorAlertMessage` 経由でアラート通知されるため実害は薄い。`.catch(() => {})` 追記は別 issue で検討。
- `ReloadDevicesButton` その他 DevtoolsPane 全体の disabled マトリクス監査: 別 issue で扱う。
- Preact コンポーネントの単体テスト基盤導入: 別 issue で扱う。

## 関連 issue

- [[0054-bug-fix-update-media-stream-button-disabled]]: 同じ DevtoolsPane の disabled 整合性ファミリー。`localMediaStream` 状態の反映方針が共通。
- [[0056-bug-fix-media-type-form-synthetic-event]]: 同じ DevtoolsPane だが別系統。

## 検証手順

### A. 修正前の現象確認（develop ブランチで実施）

1. `pnpm dev` で起動し `?role=sendrecv` で開く。
2. Request Media を押して localMediaStream を取得する（local video が表示される）。
3. もう一度 Request Media を押す → 修正前は押せて、ブラウザの権限プロンプトが（権限が許可済みなら）出ないが、`getUserMedia` が再度走り devtools の Network / Log に `REQUEST_MEDIA` ログが追加される。
4. Dispose Media を押して localMediaStream を破棄する（local video が消える）。
5. もう一度 Dispose Media を押す → 修正前は押せて、`closeFakeContentsAudio` / worker `postMessage({type:"stop"})` が空打ちされる（無害だが UI 操作として無意味）。

### B. 修正後の確認

6. 同じ手順で:
   - 手順 2 後の Request Media: disable になっていることを確認。
   - 手順 4 後の Dispose Media: disable になっていることを確認。
   - Request Media 直後（取得済）→ Dispose Media が enable で、押すと正常に破棄されること。
   - Dispose Media 直後（null）→ Request Media が enable で、押すと正常に取得されること。

### C. recvonly の確認

7. `?role=recvonly` で開く → 修正前後とも Request Media / Dispose Media とも disable（リグレッション無し）。

### D. 接続中の確認

8. `?role=sendrecv` で Request Media → Connect → 両ボタンが disable（`sora !== null` でカバー、既存挙動の維持）。
9. `preparing` / `connecting` フェーズは時間窓が短く手動で押下確認は現実的でないため、 コードレビューで `isFormDisabled` が `preparing` / `connecting` / `connected` を含むこと ( `signals.ts` の `isFormDisabled` 定義) を確認するか、 ブラウザ DevTools の Elements パネルで Connect 押下直後の `RequestMediaButton` / `DisposeMediaButton` の `disabled` 属性が true になっていることを確認する ( `signals` モジュールはグローバル公開されていないため console から `signals.connectionStatus.value` を直接読み取ることはできない)。
10. Disconnect 後、`localMediaStream` が null になることを `cleanupSoraMediaState` 経由で確認 → Request Media が enable、Dispose Media が disable。

### E. テスト

11. `pnpm test` が pass すること（リグレッション確認）。
12. 既存 Playwright e2e（`pnpm test:e2e`、`tests/sendrecv.test.ts` / `tests/sendonly.test.ts` / `tests/recvonly.test.ts`）が pass すること。

## 完了条件

- 検証手順 A-E すべてが通過すること。
- 状態遷移マトリクスの「修正」セルすべてが期待通り disable になること。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 既存テスト（`pnpm test`）および既存 Playwright e2e が pass すること。
