# 0054-bug-fix-update-media-stream-button-disabled

- Priority: Medium
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-update-media-stream-button-disabled
- Polished: 2026-06-15

## 目的

本 issue は **UI 側と関数本体の両方** を修正する:

1. `UpdateMediaStreamButton` (`src/components/DevtoolsPane/UpdateMediaStreamButton.tsx`) は `<Button>` に `disabled` を渡さず常に押せる。`localMediaStream === null` でも `connectionStatus === "preparing"` でも押せて、関数側の早期 return / レースに依存する状態になっている。
2. `updateMediaStream` (`src/app/actions.ts`) には in-flight ガードがなく、`UpdateMediaStreamButton` の連打 / `AudioInputForm` (`onChange`) / `VideoInputForm` (`onChange`) の 3 経路から並列に起動可能。並列起動が起きると signal 上書きと AudioContext 重複生成の競合がある（詳細は「並列起動時の競合機序」を参照）。

UI 側に `disabled` を追加して無意味な押下を防ぎ、関数本体には [[0048-bug-fix-reconnect-double-launch]] と同形の wrapper + module-local in-flight Promise を入れて二重起動を防止する。

## 優先度根拠

- 即時クラッシュではないため High ではない。
- `UpdateMediaStreamButton` の連打、または `AudioInputForm` / `VideoInputForm` のデバイス切替操作は普段から行われるため踏みやすい。並列起動時の signal 上書きでローカル映像が一瞬切れる、AudioContext が重複生成される、といった UX 劣化と軽微なリークが起きる。Low ではない。
- 修正は 2 ファイル（`UpdateMediaStreamButton.tsx` の `disabled` 追加、`actions.ts` の wrapper パターン追加）に限定される。
- 関連する 0053 と DevtoolsPane の整合性ファミリーで揃ってマージする想定のため Medium。

## 現状の問題

行番号は陳腐化するため記載しない。各箇所はコンポーネント名（`UpdateMediaStreamButton`）および関数名（`updateMediaStream` / `setLocalMediaStream` / `setFakeContentsAudio`）で特定する。

### `UpdateMediaStreamButton` の現状

`src/components/DevtoolsPane/UpdateMediaStreamButton.tsx`:

```tsx
import { updateMediaStream } from "@/app/actions";
import { Button } from "@/components/ui";

export function UpdateMediaStreamButton() {
  const onClick = (): void => {
    void updateMediaStream();
  };
  return (
    <div className="col-auto mb-1">
      <Button variant="outline-secondary" onClick={onClick}>
        update-mediastream
      </Button>
    </div>
  );
}
```

`disabled` prop 未指定。常に押せる。

### `updateMediaStream` の呼び出し元 3 経路

grep で確認:

- `UpdateMediaStreamButton.tsx` の `onClick`: `void updateMediaStream()`
- `AudioInputForm.tsx` の `onChange`: `setAudioInput(target.value); void updateMediaStream();`
- `VideoInputForm.tsx` の `onChange`: `setVideoInput(target.value); void updateMediaStream();`

UpdateMediaStreamButton 連打 + 入力デバイス切替の併発で 3 経路すべてが並列発火する可能性がある。

### `updateMediaStream` 本体（抜粋）

`src/app/actions.ts`:

```ts
export const updateMediaStream = async (): Promise<void> => {
  const state = getStateForMediaStream();
  const localMediaStreamValue = signals.localMediaStream.value;
  const soraValue = signals.sora.value;
  const virtualBackgroundProcessorValue = signals.virtualBackgroundProcessor.value;
  const noiseSuppressionProcessorValue = signals.noiseSuppressionProcessor.value;
  if (!localMediaStreamValue) {
    return;
  }
  // ... 旧 video track の stop（virtualBackground / 直接）
  await stopLocalAudioTrack(localMediaStreamValue, noiseSuppressionProcessorValue);
  const [mediaStream, gainNode, audioContext] = await createMediaStream(state).catch(...);
  const replaceResults = await Promise.allSettled(
    mediaStream.getTracks().map(async (track) => {
      if (!soraValue?.pc) return;
      const sender = soraValue.pc.getSenders().find((s) => s.track?.kind === track.kind);
      if (sender) await sender.replaceTrack(track);
    }),
  );
  // ...失敗時のアラート発火
  signals.setLocalMediaStream(mediaStream);
  signals.setFakeContentsAudio(audioContext, gainNode);
};
```

### 並列起動時の競合機序

連打または onChange 重複で先発 A と後発 B が並列に走る場合:

1. **A の `stopLocalAudioTrack` → A の `createMediaStream` (gum 取得中、await)** の間に B が起動。
2. B 冒頭で `localMediaStream.value` は **A 起動時点の旧 stream** を読み取り、`stopLocalAudioTrack` を呼ぶ（A も同じ stream の audio track を stop しているが、B 側で再呼び出しは no-op）。
3. B の `createMediaStream` (gum 取得中、await) の間に A が `Promise.allSettled` の `replaceTrack` を実行。A の末尾 `signals.setLocalMediaStream(streamA)` が走る。
4. `setLocalMediaStream` は **冒頭で旧 stream の全 track を stop** する:
   ```ts
   if (localMediaStream.value) {
     for (const track of localMediaStream.value.getTracks()) {
       track.stop();
     }
   }
   localMediaStream.value = mediaStream;
   ```
   この時点で signal の `localMediaStream` は元の旧 stream → streamA に置き換わる（旧 stream の track が stop される）。
5. B が `Promise.allSettled` の `replaceTrack` を実行 → 末尾 `signals.setLocalMediaStream(streamB)` が走る。`setLocalMediaStream` の冒頭で **streamA の全 track を stop** してから `localMediaStream.value = streamB` する。
6. **結果**: streamA は signal にも入らず、その track は B によって stop される（無駄）。Video.tsx が再描画するたびに `srcObject` が変わって映像が一瞬切れる。
7. `setFakeContentsAudio` も同様に 2 回呼ばれ、A の AudioContext が B の AudioContext で上書きされて誰からも参照されないまま生き続ける（AudioContext の重複生成リーク）。

[[0045-bug-fix-update-media-stream-after-disconnect]] が末尾 2 行の前に「外部 Disconnect で `connectionStatus !== "connecting"` 等のガード」を追加する設計だが、これは「Disconnect 経由の中断」を扱う範囲で、本 issue の「並列起動による上書き」とは別経路。

### `updateMediaStream` の主用途と過渡状態の整理

`updateMediaStream` の主用途は「**デバイスの変更時などに Sora との接続を維持したまま MediaStream のみ更新**」（実コード冒頭コメント）で、`connectionStatus === "connected"` 時のデバイス切替。よって `disabled` 式に `isFormDisabled.value` (`preparing | connecting | connected`) を **含めない**（含めると本来の用途を殺す）。`connected` は enable、`preparing` / `connecting` / `disconnecting` の過渡状態は disable する。

`isFormDisabled` を使う [[0053-bug-fix-request-media-button-disabled]] とアプローチが異なる: 0053 のボタンは「接続前のメディア取得 / 破棄」が主用途で `connected` 中は対象外、本 issue のボタンは「接続中のメディア更新」が主用途で `connected` 中こそ enable。

## 設計方針

### `updateMediaStream` の in-flight ガード（wrapper パターン）

[[0048-bug-fix-reconnect-double-launch]] と同形の wrapper パターンを採用する。後発呼び出しは **既存の in-flight Promise を返す**（no-op で `undefined` を返す形ではなく、caller が `await` できる形を維持）。`try/finally` で確実にクリアする。

`src/app/actions.ts`:

**before**:

```ts
export const updateMediaStream = async (): Promise<void> => {
  // ... 既存の本体
};
```

**after**:

```ts
// updateMediaStream の in-flight Promise（同時起動防止）
// AudioInputForm / VideoInputForm の onChange と UpdateMediaStreamButton 押下が並列発火しても
// 同じ Promise を共有して signal 上書きと AudioContext 重複生成を防ぐ
let updateMediaStreamInFlight: Promise<void> | null = null;

export const updateMediaStream = (): Promise<void> => {
  if (updateMediaStreamInFlight) {
    return updateMediaStreamInFlight;
  }
  updateMediaStreamInFlight = (async () => {
    try {
      await updateMediaStreamImpl();
    } finally {
      updateMediaStreamInFlight = null;
    }
  })();
  return updateMediaStreamInFlight;
};

const updateMediaStreamImpl = async (): Promise<void> => {
  // 既存の updateMediaStream 本体をここに移植する
  // [[0045]] が末尾 2 行直前に追加するガードもここに残る（マージ順は 0045 → 0054）
  const state = getStateForMediaStream();
  const localMediaStreamValue = signals.localMediaStream.value;
  // ... 以下既存ロジック
};
```

理由:

- 後発呼び出しに in-flight Promise を返すのは、`AudioInputForm.onChange` / `VideoInputForm.onChange` が `void updateMediaStream()` で発火するため返値の差は実害なし。将来 `await updateMediaStream()` を別 caller が書いた場合の整合性を維持する。
- wrapper を `export const` にすることで既存の呼び出し元（3 経路）は何も変更しなくて良い（インターフェース互換）。

### `UpdateMediaStreamButton` の `disabled` 追加

**before**:

```tsx
import { updateMediaStream } from "@/app/actions";
import { Button } from "@/components/ui";

export function UpdateMediaStreamButton() {
  const onClick = (): void => {
    void updateMediaStream();
  };
  return (
    <div className="col-auto mb-1">
      <Button variant="outline-secondary" onClick={onClick}>
        update-mediastream
      </Button>
    </div>
  );
}
```

**after**:

```tsx
import { updateMediaStream } from "@/app/actions";
import { connectionStatus, localMediaStream } from "@/app/signals";
import { Button } from "@/components/ui";

export function UpdateMediaStreamButton() {
  const onClick = (): void => {
    void updateMediaStream();
  };
  // localMediaStream === null: そもそも更新対象が無い（updateMediaStream 冒頭で早期 return される無意味な呼び出し）
  // preparing / connecting / disconnecting: 過渡状態でメディア更新するとレースを誘発する
  // connected は disable しない: 本関数の主用途は接続中のデバイス切替
  const status = connectionStatus.value;
  const disabled =
    localMediaStream.value === null ||
    status === "preparing" ||
    status === "connecting" ||
    status === "disconnecting";
  return (
    <div className="col-auto mb-1">
      <Button variant="outline-secondary" onClick={onClick} disabled={disabled}>
        update-mediastream
      </Button>
    </div>
  );
}
```

`role === "recvonly"` / `isFormDisabled` を含めない理由は前述「`updateMediaStream` の主用途と過渡状態の整理」を参照。

### `isUpdatingMediaStream` signal は追加しない

「進行中も disable する」UX 案を検討したが採用しない:

- in-flight ガード（前節）で後発呼び出しは無害化される。UI 側の二重 disable は冗長。
- `AudioInputForm.tsx` / `VideoInputForm.tsx` の `<select>` も同 signal を見て disable する必要が出てきて、影響範囲が広がる（本 issue のスコープを超える）。
- 「進行中表示」のための spinner や進行表示 UI は別 issue で扱う方が clear。

### 状態遷移マトリクス

修正前後で `UpdateMediaStreamButton.disabled` の挙動を主要遷移で確認する:

| connectionStatus | sora     | localMediaStream | 修正前 | 修正後                           | 期待                               |
| ---------------- | -------- | ---------------- | ------ | -------------------------------- | ---------------------------------- |
| initializing     | null     | null             | enable | disable（修正）                  | 対象なし→disable                   |
| initializing     | null     | 取得済           | enable | enable                           | 取得済で更新可能                   |
| preparing        | null     | null             | enable | disable（修正）                  | preparing 中は disable             |
| preparing        | null     | 取得済           | enable | disable（修正）                  | preparing 中は disable             |
| connecting       | not null | 取得済           | enable | disable（修正）                  | connecting 中は disable            |
| connected        | not null | 取得済           | enable | **enable**（本来の主用途を維持） | 接続中のデバイス切替を許可         |
| disconnecting    | not null | 取得済           | enable | disable（修正）                  | 切断中は新 stream を作っても無意味 |
| disconnected     | null     | 取得済           | enable | enable                           | local プレビュー中は更新可能       |
| disconnected     | null     | null             | enable | disable（修正）                  | 対象なしで disable                 |

「修正」と書いた箇所が本 issue で新たに disable される条件。`connected` は本来の主用途（デバイス切替）のため enable を維持する。

### AudioInputForm / VideoInputForm との整合性

関数側 in-flight ガードがあれば onChange 並列発火は in-flight Promise を共有して無害化される。ただし以下の挙動は許容する:

- onChange ハンドラは `setAudioInput(target.value); void updateMediaStream();` の順で動く。先発 A の `updateMediaStream` が in-flight 中に B の onChange が走ると、`setAudioInput` で signal だけ書き換わって、`void updateMediaStream()` は in-flight Promise を共有して **A の中身を実行するだけ**（B の `audioInput` 反映なし）。`updateMediaStreamImpl` 冒頭の `getStateForMediaStream()` は **先発が走った瞬間** の signal を読み取るため、後発呼び出しが signal を書き換えても反映されない。
- ユーザーが先発完了を待たずに連続デバイス選択した場合、最新 selection が反映されないケースがある。
- 同じ value への onChange は React/Preact の標準セマンティクスで再発火しないため、「ユーザーが同じデバイスを再度選択する」では復旧しない。復旧手順は次のいずれか:
  - 一度別のデバイスを経由してから戻す（onChange が 2 回発火する）。
  - 先発完了を待って `UpdateMediaStreamButton` を手動押下する（本 issue で `disabled` が `connected` 中も enable のため可能）。
- 「最新 selection を保留して再実行する」キューイング機構は別 issue で扱う。

## テスト戦略

- 単体テスト追加なし: 0053 と同様に Preact コンポーネントの render 結果から `disabled` を読み取るテスト基盤は本リポジトリに無い。in-flight ガード wrapper のテストは `updateMediaStreamImpl` を関数注入できる形に小リファクタすれば可能だが、`updateMediaStream` は `navigator.mediaDevices.getUserMedia` と Sora 接続を含むため jsdom + モック禁止規約と両立しない。
- e2e 追加なし: 既存 Playwright e2e は `UpdateMediaStreamButton` を踏むシナリオを持たないが、本 issue のために新規シナリオを追加するコストは過大。
- 手動検証（後述「検証手順」）で状態遷移マトリクスを網羅する。

## スコープ外

下記は本 issue では扱わない:

- **`AudioInputForm` / `VideoInputForm` での最新 selection キューイング**: 「AudioInputForm / VideoInputForm との整合性」で許容した挙動の改善は別 issue で扱う。
- **`connectSora` / `disconnectSora` の同種 in-flight ガード**: 別 issue で扱う（0048 が `reconnectSora` を扱う前例があり、`connectSora` / `disconnectSora` の同種化は順次別 issue 化）。
- **`isUpdatingMediaStream` signal を含む UI 進行中表示（spinner 等）**: 「`isUpdatingMediaStream` signal は追加しない」で採用しない判断の延長として別 issue で扱う。
- **Preact コンポーネントの単体テスト基盤導入**: 別 issue で扱う。
- **`updateMediaStream` の中断時 signal 上書き防止**: [[0045-bug-fix-update-media-stream-after-disconnect]] で扱う範囲（外部 Disconnect 経由）。本 issue は「並列起動による上書き」を扱う。

## CHANGES.md エントリ

`CHANGES.md` の `## develop` 内 `[FIX]` セクション末尾（`### misc` セクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `UpdateMediaStreamButton` の `disabled` と `updateMediaStream` の in-flight ガードを追加する
  - `updateMediaStream` をモジュールローカルな in-flight Promise でガードし、連打 / `AudioInputForm` / `VideoInputForm` の onChange と重なっても同時に複数走らないようにする
  - `UpdateMediaStreamButton` の `disabled` に `localMediaStream === null` および `preparing` / `connecting` / `disconnecting` の過渡状態を反映し、対象が無い / 過渡状態での押下を防ぐ（`connected` 中はデバイス切替が主用途のため enable のまま）
  - @voluntas
```

## 関連 issue

- [[0045-bug-fix-update-media-stream-after-disconnect]]: `updateMediaStream` の同関数を触る。0045 は「外部 Disconnect 経由の中断時 signal 上書き防止」、本 issue は「並列起動による上書き防止」で対象範囲が異なる。マージ順は **0045 → 0054** を推奨。0045 を先にマージした場合: 0045 が `updateMediaStream` 末尾 2 行の直前に追加したガード（ローカル `mediaStream` / `audioContext` の解放 + return）を、本 issue では `updateMediaStreamImpl` 関数内へそのまま移植する（位置は末尾 2 行の直前で変わらない）。ローカル変数のスコープは `updateMediaStreamImpl` 内で完結するため追加の変更不要。本 issue を先にマージした場合の 0045 側 rebase は「0045 のガードを `updateMediaStreamImpl` の末尾 2 行直前に追加する」だけで完結する。
- [[closed/0049-bug-fix-fake-contents-audio-close]]: `setFakeContentsAudio` setter 内で旧 AudioContext を自動 close する案の issue（実装せず close 済み）。本 issue の「AudioContext 重複生成リーク」は `setFakeContentsAudio` setter で旧を自動 close すれば緩和されるが、その案は closed 済み。本 issue の `setLocalMediaStream` の旧 stream stop による「先発の新規 stream を後発が誤って stop する」問題は独立に残るため、本 issue は必要。
- [[0048-bug-fix-reconnect-double-launch]]: `reconnectSora` の同種 in-flight ガード。本 issue の wrapper パターンの参考元。両者のコード構造を揃える。
- [[0053-bug-fix-request-media-button-disabled]]: 同じ DevtoolsPane の disabled 整合性ファミリー。`localMediaStream` 状態の反映方針が共通だが、本 issue は `isFormDisabled` を式に含めない点で 0053 とアプローチが異なる（理由は「`updateMediaStream` の主用途と過渡状態の整理」を参照）。
- [[closed/0055-bug-fix-disconnect-button-preparing]]: 同上の disabled 整合性ファミリー（実装せず close）。
- [[0056-bug-fix-media-type-form-synthetic-event]]: 同じ DevtoolsPane だが別系統。

## 検証手順

### A. 連打レースの修正前再現（fakeMedia 経路）

1. `pnpm dev` で起動し `?role=sendrecv&mediaType=fakeMedia` で Connect する。
2. DevTools console で `signals.fakeContents.value.audioContext` の参照を控える。
3. `UpdateMediaStreamButton` を素早く 3-4 回連打する。
4. 修正前: DevTools console で `signals.fakeContents.value.audioContext` の参照が連打前と異なるオブジェクトに何度も置き換わり、旧 AudioContext が close されないまま参照消失していることを Performance プロファイルや `audioContext.state` の変化で確認する（リーク。`NotAllowedError: The number of hardware contexts ...` は 6 回未満では出ないため判定には使わない）。`?mediaType=getUserMedia` の場合は AudioContext は生成されないため判定はローカル映像が一瞬切れる現象（`setLocalMediaStream` の冒頭 stop で先発の新規 stream の track が後発によって誤 stop される）の目視確認のみ。

### B. 連打レースの修正後確認

5. 修正後: 同じ操作で `UpdateMediaStreamButton` を連打しても、後発呼び出しは in-flight Promise を共有して 1 回しか実行されない（DevTools console で `signals.fakeContents.value.audioContext` の参照が 1 回だけ置き換わることで確認）。
6. fakeMedia 経路で AudioContext の重複生成が起きないこと（連打 6 ラウンドを繰り返しても `NotAllowedError` が出ない）を確認する。
7. getUserMedia 経路でローカル映像が一瞬切れる現象が起きないことを目視確認する。

### C. AudioInputForm / VideoInputForm との並列

8. Connect 中に `AudioInputForm` でデバイスを変更すると同時に `UpdateMediaStreamButton` を押下する。
9. 修正後: 2 経路の `updateMediaStream` が in-flight Promise を共有して 1 回しか実行されない。「AudioInputForm / VideoInputForm との整合性」で許容した「最新 selection が反映されないケース」を確認する。復旧手順:
   - 一度別のデバイスを経由してから元のデバイスに戻す（onChange が 2 回発火する）。
   - または先発完了を待って `UpdateMediaStreamButton` を手動押下する（本 issue で `disabled` が `connected` 中も enable のため可能）。

### D. disabled 状態の確認

10. `?role=sendrecv` で起動直後（`localMediaStream === null`）: `UpdateMediaStreamButton` が disable。
11. Request Media 後（`localMediaStream != null`、`connectionStatus === "initializing"`）: enable。
12. Connect 押下中（`connectionStatus === "preparing"` → `"connecting"`）: disable。
13. **Connect 完了（`connectionStatus === "connected"`）: enable**（本来の主用途、デバイス切替を許可）。
14. Disconnect 押下中（`connectionStatus === "disconnecting"`）: disable。
15. Disconnect 後（`localMediaStream === null`, `connectionStatus === "disconnected"`）: disable。
16. Disconnect 後に Request Media したとき（`localMediaStream != null`, `connectionStatus === "disconnected"`）: enable。

### E. テスト

17. `pnpm test` が pass すること。
18. 既存 Playwright e2e（`pnpm test:e2e`）が pass すること。

## 完了条件

- 検証手順 A-E すべてが通過すること。
- 状態遷移マトリクスの「修正」セルすべてが期待通り disable になること。
- 連打しても `updateMediaStreamImpl` が同時に複数走らないこと（in-flight Promise 共有を DevTools console で確認）。
- 連打 6 ラウンドを繰り返しても `NotAllowedError: The number of hardware contexts ...` 相当のエラーが出ないこと（fakeMedia 経路）。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 既存テスト（`pnpm test`）および既存 Playwright e2e が pass すること。
