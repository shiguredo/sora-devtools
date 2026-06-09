# 0053-bug-fix-request-media-button-disabled

- Priority: Medium
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-request-media-button-disabled
- Polished: 2026-06-09

## 目的

`RequestMediaButton` (`src/components/DevtoolsPane/RequestMediaButton.tsx:9`) と `DisposeMediaButton` (`src/components/DevtoolsPane/DisposeMediaButton.tsx:9`) は **同一の `disabled` 条件をコピペ流用** していて、それぞれのボタンの責務（メディア取得 / 破棄）に合っていない。`localMediaStream` の有無を反映していないため:

- `RequestMediaButton`: `localMediaStream !== null` でも押せて、`requestMedia` が再度 `getUserMedia` を呼び出して権限プロンプトが再表示される（または同種デバイス取得で UX 体感劣化）。
- `DisposeMediaButton`: `localMediaStream === null` でも押せて、`disposeMedia` が空打ちで `closeFakeContentsAudio` / worker `postMessage({type:"stop"})` を実行する（無意味）。

両ボタンの `disabled` に `localMediaStream` の状態を反映させて UI 状態の整合性を取る。

## 優先度根拠

- 即時クラッシュではないため High ではない。
- 二重 `getUserMedia` 呼び出しによる権限プロンプト再表示やデバイス取得遅延で UX 体感が劣化する。`Dispose` の空打ちは無害だが操作の意図と乖離する。Low ではない。
- 修正は 2 つのコンポーネントの `disabled` 式にそれぞれ 1 つの条件を追加するだけで、影響範囲は `RequestMediaButton.tsx` / `DisposeMediaButton.tsx` の 2 ファイルに限定される。
- 関連する 0054 / 0055 と DevtoolsPane の disabled 整合性ファミリーで揃ってマージする想定のため Medium。

## 現状の問題

実装時に行番号がずれている可能性があるため、コンポーネント名（`RequestMediaButton` / `DisposeMediaButton`）および関数名（`requestMedia` / `disposeMedia` / `setLocalMediaStream`）を基準に特定すること。Polished 時点は 2026-06-09。

### 該当コード

`src/components/DevtoolsPane/RequestMediaButton.tsx:9`:

```ts
const disabled = role.value === "recvonly" || sora.value !== null || isFormDisabled.value;
```

`src/components/DevtoolsPane/DisposeMediaButton.tsx:9`（**完全に同一**）:

```ts
const disabled = role.value === "recvonly" || sora.value !== null || isFormDisabled.value;
```

両ボタンが `localMediaStream` の有無を見ない。

### `setLocalMediaStream` の冒頭 stop ロジック（track leak の不在）

`src/app/signals.ts:490-497`:

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

`requestMedia` (`src/app/actions.ts:1317-1338`) の末尾 1337 行 `signals.setLocalMediaStream(mediaStream)` で旧 stream の全 track が stop される。連打しても旧 stream の track は確実に停止され、マイク・カメラ LED は消える（track leak は発生しない）。本 issue は track 解放問題ではなく、**UI 状態の整合性問題**を扱う。

### `isFormDisabled` の役割

`src/app/signals.ts:185-188`:

```ts
export const isFormDisabled = computed(() => {
  const status = connectionStatus.value;
  return status === "preparing" || status === "connected" || status === "connecting";
});
```

両ボタンは `isFormDisabled.value` を含むため `preparing` / `connecting` / `connected` は既にカバー済み。本 issue は `connectionStatus` 系の遷移とは独立に `localMediaStream` の有無で disable する条件を追加するだけで、`isFormDisabled` には触れない。0055 が `DisconnectButton` に `preparing` を追加するのは、`DisconnectButton` が `isFormDisabled.value` を使わず手書きで条件を並べているため。本 issue とアプローチは別。

### `role === "recvonly"` 条件の維持

`requestMedia` (`actions.ts:1317`) は role に依存せず `createMediaStream` を呼ぶため、recvonly でも `getUserMedia` が走る。`role === "recvonly"` を `disabled` で弾く既存ロジックは正しい（recvonly は送信メディア不要）。本 issue でも維持する。

## 設計方針

### 1. `RequestMediaButton.tsx` の修正

`src/components/DevtoolsPane/RequestMediaButton.tsx`:

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
// isFormDisabled: connecting / preparing / connected (signals.ts:185-188) の同期防止
const disabled =
  role.value === "recvonly" ||
  sora.value !== null ||
  localMediaStream.value !== null ||
  isFormDisabled.value;
```

### 2. `DisposeMediaButton.tsx` の修正

`src/components/DevtoolsPane/DisposeMediaButton.tsx`:

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

### 3. `requestMedia` / `disposeMedia` 関数側のガードは追加しない

`requestMedia` / `disposeMedia` 関数本体に in-flight ガード（`if (localMediaStream.value !== null) return;` 等）を追加する案も検討したが、不採用。

- 両関数は `RequestMediaButton` / `DisposeMediaButton` からのみ呼ばれる（grep で確認: `actions.ts:1317` の `requestMedia` 呼び出し元は `RequestMediaButton.tsx:7`、`actions.ts:1340` の `disposeMedia` 呼び出し元は `DisposeMediaButton.tsx:7` のみ）。
- ボタン側ガードで重複呼び出しを抑止すれば関数側ガードは過剰防御。
- 0054 (`updateMediaStream`) の in-flight ガードは別経路（`UpdateMediaStreamButton` 以外に `AudioInputForm` / `VideoInputForm` の onChange からも呼ばれる）で必要だが、本 issue の対象関数にはその事情がない。

### 4. 状態遷移マトリクス

修正前後で `RequestMediaButton` / `DisposeMediaButton` の disabled 状態を主要遷移で確認する:

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

「修正」と書いた箇所が本 issue の対象。

### 5. テスト戦略

本修正は純粋な JSX prop の式変更で、Preact コンポーネントの render 結果から disabled を読み取る単体テスト基盤は現状本リポジトリには無い。本 issue のためにテスト基盤を立ち上げるコストは修正範囲に対して過大。

Playwright e2e (`tests/sendrecv.test.ts` 等) も現状 `RequestMediaButton` / `DisposeMediaButton` を踏むシナリオを持たない（既存 e2e は ConnectButton → 3 秒 → DisconnectButton の最小フロー）。

方針:

- 単体テスト追加なし。
- e2e 追加なし（DevtoolsPane の disabled マトリクス検証は別 issue で扱う、後述「7. スコープ外」）。
- 手動検証（後述「検証手順」）で 4. の状態遷移マトリクスを網羅する。

### 6. CHANGES.md エントリ

`CHANGES.md` の `## develop` の `[FIX]` セクション末尾（`### misc` サブセクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `RequestMediaButton` / `DisposeMediaButton` の `disabled` 条件に `localMediaStream` の状態を反映する
  - `RequestMediaButton` は `localMediaStream` が取得済みのとき無効化し、重複した `getUserMedia` 呼び出しによる権限プロンプト再表示を防ぐ
  - `DisposeMediaButton` は `localMediaStream` が null のとき無効化し、無意味な空打ちを防ぐ
  - @voluntas
```

### 7. スコープ外

下記は本 issue では扱わない:

- **`UpdateMediaStreamButton` の disabled 欠落と in-flight ガード**: [[0054-bug-fix-update-media-stream-button-disabled]] で扱う。本 issue の `localMediaStream` 状態反映の方針と同じ系列。
- **`DisconnectButton` の `preparing` 欠落**: [[closed/0055-bug-fix-disconnect-button-preparing]] で扱う。`DisconnectButton` は `isFormDisabled.value` を使っていないアプローチで、本 issue とは独立。
- **`MediaTypeForm` の合成 Event 問題**: [[0056-bug-fix-media-type-form-synthetic-event]] で扱う。disabled 整合性とは別系統の UI 不具合。
- **`onClick` 内 `void requestMedia()` の unhandled rejection 対応**: `requestMedia` の `catch` 内で `setAPIErrorAlertMessage` 経由でアラート通知される（`actions.ts:1326-1334`）ため実害は薄い。`.catch(() => {})` 追記は別 issue で検討。
- **`ReloadDevicesButton` その他 DevtoolsPane 全体の disabled マトリクス監査**: 別 issue で扱う。
- **Preact コンポーネントの単体テスト基盤導入**: 別 issue で扱う（5. テスト戦略を参照）。

### 8. 関連 issue

- [[0054-bug-fix-update-media-stream-button-disabled]]: 同じ DevtoolsPane の disabled 整合性ファミリー。`localMediaStream` 状態の反映方針が共通。
- [[closed/0055-bug-fix-disconnect-button-preparing]]: 同上。`isFormDisabled` 使用 vs 手書き条件のアプローチの違いに注意。
- [[0056-bug-fix-media-type-form-synthetic-event]]: 同じ DevtoolsPane だが別系統。

## 検証手順

### A. 修正前の現象確認（develop ブランチで実施）

1. `vp dev` で起動し `?role=sendrecv` で開く。
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
9. Connect 中の `preparing` / `connecting` フェーズで両ボタンが disable（`isFormDisabled` で `preparing` / `connecting` がカバー、`signals.ts:185-188`）。
10. Disconnect 後、`localMediaStream` が null になることを `cleanupSoraMediaState` (`actions.ts:1080`) 経由で確認 → Request Media が enable、Dispose Media が disable。

### E. テスト

11. `vp test` が pass すること（リグレッション確認）。
12. 既存 Playwright e2e (`tests/sendrecv.test.ts` / `tests/sendonly.test.ts` / `tests/recvonly.test.ts`) が pass すること。

## 完了条件

- 検証手順 A-E すべてが通過すること。
- 状態遷移マトリクス（設計方針 4.）の「修正」セルすべてが期待通り disable になること。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に「6. CHANGES.md エントリ」のエントリが追記され、担当者行が付いていること。
- 既存テスト (`vp test`) および既存 Playwright e2e が pass すること。
