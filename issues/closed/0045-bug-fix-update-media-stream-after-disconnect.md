# 0045-bug-fix-update-media-stream-after-disconnect

- Priority: High
- Created: 2026-06-09
- Completed: 2026-06-15
- Model: Opus 4.7
- Branch: feature/fix-update-media-stream-after-disconnect
- Polished: 2026-06-15

## 目的

`updateMediaStream` は複数の `await` を跨ぐが、その途中で切断が走った場合に末尾の `signals.setLocalMediaStream(mediaStream)` と `signals.setFakeContentsAudio(audioContext, gainNode)` が「切断状態の signal」を上書きしてしまい、UI に新規メディアが「復活して」貼り付き、AudioContext がどこからも参照されないまま生き続けてリークする。末尾 2 行の直前にガードを入れ、ガード時はローカル変数として持っている新規 `mediaStream` の全 track を `stop()`、新規 `audioContext` を `close()` してから return する。

## 優先度根拠

- ローカルプレビュー後の Disconnect 経路で `updateMediaStream` を踏むと、UI には切断済みのはずの新規プレビュー映像が貼り付くため挙動が直感に反する。
- AudioContext は Chrome の同時 AudioContext 上限を消費するため、繰り返すと `NotAllowedError` でリロード必須になる。[[closed/0001-fix-audio-context-leak]] で `closeFakeContentsAudio` を入れたが、`updateMediaStream` の中間で生成され signal に積まれる前の AudioContext は当該安全網の対象外で、本 issue は補完的に必要。
- 修正は数行で済むが、影響範囲は `UpdateMediaStreamButton` / `AudioInputForm` / `VideoInputForm` の 3 経路全てに及ぶ。

## 現状の問題

`src/app/actions.ts` の `updateMediaStream` を関数名で特定すること（行番号は陳腐化するため記載しない）。概略は次のとおり。

```ts
export const updateMediaStream = async (): Promise<void> => {
  const state = getStateForMediaStream();
  const localMediaStreamValue = signals.localMediaStream.value;
  const soraValue = signals.sora.value;
  // ... 仮想背景 / 旧 audio・video track の停止（同期処理）
  if (!localMediaStreamValue) return;
  // ...
  await stopLocalAudioTrack(localMediaStreamValue, noiseSuppressionProcessorValue);
  const [mediaStream, gainNode, audioContext] = await createMediaStream(state).catch(
    (error: unknown) => {
      const message = getErrorMessage(error);
      signals.setSoraErrorAlertMessage(message);
      signals.setSoraConnectionStatus("disconnected");
      throw error;
    },
  );
  const replaceResults = await Promise.allSettled(
    mediaStream.getTracks().map(async (track) => {
      if (!soraValue?.pc) return;
      const sender = soraValue.pc.getSenders().find((s) => s.track?.kind === track.kind);
      if (sender) await sender.replaceTrack(track);
    }),
  );
  const failures = replaceResults.filter((result) => result.status === "rejected");
  if (failures.length > 0) {
    signals.setSoraErrorAlertMessage(
      `failed to replace ${failures.length} track(s) of ${replaceResults.length}`,
    );
  }
  signals.setLocalMediaStream(mediaStream); // ← ここがガード対象
  signals.setFakeContentsAudio(audioContext, gainNode); // ← ここもガード対象
};
```

呼び出し元は次の 3 箇所。デバイス切替の自動 `updateMediaStream` が高頻度トリガで、ボタン押下より踏みやすい。

- `src/components/DevtoolsPane/UpdateMediaStreamButton.tsx`（手動）
- `src/components/DevtoolsPane/AudioInputForm.tsx` の `onChange`
- `src/components/DevtoolsPane/VideoInputForm.tsx` の `onChange`

中断パターン:

- `soraValue` は冒頭で `const soraValue = signals.sora.value` としてキャプチャされる。`replaceTrack` ループ内は `soraValue?.pc` を null 安全に参照しているが、関数末尾の signal 書き込みは無条件で走る。
- `createMediaStream` の catch は `setSoraErrorAlertMessage` と `setSoraConnectionStatus("disconnected")` を呼んで `throw error` するため、catch 経路は末尾 2 行に到達しない。
- 一方で `createMediaStream` 成功後の `Promise.allSettled([... replaceTrack ...])` を待っている間に Disconnect が走ると、`signals.sora.value` は `null` になり `connectionStatus` は `"disconnecting"` → `"disconnected"` に遷移する。`Promise.allSettled` は完了して関数は末尾に到達し、新規 `mediaStream` / `audioContext` を signal に書き戻してしまう。

`signals.setLocalMediaStream` は新値設定前に旧 stream の全 track を `stop()` する安全網があるが、これは「旧 stream を新 stream で上書きするとき」の挙動で、上書き直後は新 stream の track が生きたまま残る（リーク防止対象が無い）。`signals.setFakeContentsAudio` setter は旧 audioContext を close せず素通しでフィールドを書き換えるだけ（[[closed/0049-bug-fix-fake-contents-audio-close]] で「実装せずに close」と結論済み）であり、新 audioContext が signal に積まれて誰も close しなくなる。

## 設計方針

### ガード条件

末尾 2 行の直前で以下のガード条件を評価し、満たしたら新規生成リソースを解放して return する。

```ts
// 切断が走った後にこの関数の末尾まで来た場合、signal を上書きせずに新規リソースを解放する
if (
  soraValue === null ||
  signals.sora.value !== soraValue ||
  signals.localMediaStream.value === null ||
  signals.connectionStatus.value === "disconnecting" ||
  signals.connectionStatus.value === "disconnected"
) {
  for (const track of mediaStream.getTracks()) {
    track.stop();
  }
  if (audioContext !== null) {
    void audioContext.close();
  }
  return;
}
signals.setLocalMediaStream(mediaStream);
signals.setFakeContentsAudio(audioContext, gainNode);
```

条件の意図:

- `soraValue === null`: そもそも接続せずに `updateMediaStream` が走った異常系。signal を書き戻す意味がない。
- `signals.sora.value !== soraValue`: 関数開始時の sora と現在の sora が違う = 切断後の再接続で新セッションになった。古いフローの結果を新セッションに混ぜない。
- `signals.localMediaStream.value === null`: `disconnectSora` 冒頭の `await cleanupSoraMediaState()` 内では `signals.setLocalMediaStream(null)` を同期で走らせた後に `await Promise.allSettled([stopLocalVideoTrack, stopLocalAudioTrack])` を待つ構造になっており、その `await` を跨いだ瞬間は「`localMediaStream.value === null` だが `connectionStatus` はまだ `"connected"` のままで `signals.sora.value` も同一」という時間窓がある。この窓を捕捉する。
- `connectionStatus === "disconnecting" | "disconnected"`: SDK 切断完了通知や `setSora(null)` 後の過渡状態を捕捉する。

[[closed/0044-bug-fix-cleanup-sora-media-state-async]] により `cleanupSoraMediaState` は async 化済みで `disconnectSora` 冒頭で `await cleanupSoraMediaState()` として呼ばれる。本 issue のガードはその await 跨ぎを含めて捕捉する設計であり、closed/0044 を前提に成立する。

### リソース解放方法

- `signals.setLocalMediaStream(null)` は呼ばない（signal を触らない方が安全。`localMediaStream.value` は既に cleanup で `null` になっている）。代わりに、関数内で生成した `mediaStream` のローカル変数から `getTracks()` して `track.stop()` を直接呼ぶ。
- `signals.closeFakeContentsAudio()` は呼ばない（signal を触らない）。代わりに、関数内で生成した `audioContext` のローカル変数を直接 `void audioContext.close()` する。
- `createMediaStream` の戻り値型は `Promise<[MediaStream, GainNode | null, AudioContext | null]>` で、`getUserMedia` / `getDisplayMedia` 経路では `audioContext` は常に `null`、fakeMedia 経路でのみ AudioContext が生成される。`audioContext !== null` の null チェックは fakeMedia 経路だけが対象。
- `gainNode` は `audioContext` を close すれば破棄されるので個別処理は不要。

### ガード位置

挿入位置は **末尾 2 行の直前のみ**。`createMediaStream` の前後や `replaceTrack` ループの前には入れない。理由:

- `createMediaStream` の catch は既に `disconnected` を立てて throw するので catch 経路は末尾に到達しない。
- `replaceTrack` ループ内は `soraValue?.pc` の null チェックがあり、close 済み PC への replaceTrack は no-op で済む。`Promise.allSettled` のため例外でも捕捉される。ループ自体に追加ガードを入れると重複が増える。
- 末尾 1 箇所のガードで「signal を切断状態の上に書き戻さない」目的は達成できる。

### `replaceTrack` 失敗時のアラート

`Promise.allSettled` のループ内で `soraValue.pc` が close 状態（`signalingState === "closed"`）に対して `replaceTrack` を呼ぶと `InvalidStateError` を投げ、failures が積まれて `setSoraErrorAlertMessage("failed to replace N track(s) of M")` が発火する（`pc` が null になった場合は早期 return でアラートは出ない）。本 issue のガードは「signal 上書きを防ぐ」目的に絞っており、このアラート抑制は別 issue で扱う。

### 関連 issue と依存

- [[closed/0044-bug-fix-cleanup-sora-media-state-async]]: 既に closed。本 issue はその上に積む形で `localMediaStream.value === null` ガードを設計している。
- [[0046-bug-fix-reconnect-failure-media-leak]]: `reconnectSora` の失敗パスでの同種リーク。本 issue で確立する「中断時にローカル変数として stop/close」パターンを 0046 にも適用する。**本 issue を 0046 より先に着手し、0046 で同パターンを踏襲する** 推奨順。

### CHANGES.md エントリ

`CHANGES.md` の `## develop` 内 `[FIX]` セクション末尾（`### misc` セクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `updateMediaStream` の `await` 中に切断された場合に signal を上書きしてリソースリークする問題を修正する
  - 末尾の signal 更新前にガードを追加し、ガード時は新規生成した MediaStream と AudioContext を解放する
  - @voluntas
```

### スコープ外

- `createMediaStream` 失敗時の `setSoraConnectionStatus("disconnected")` の妥当性検証（接続中に media 取得失敗で `disconnected` に書き換える挙動）。
- `replaceTrack` 失敗時の `setSoraErrorAlertMessage` の表示抑制。
- [[0054-bug-fix-update-media-stream-button-disabled]] の連打抑止（`UpdateMediaStreamButton` の disabled + 関数自体の in-flight ガード）。0054 が入れば連打レースの window は狭まるが、`AudioInputForm` / `VideoInputForm` の onChange と Disconnect の競合は依然残るため、本 issue は独立に必要。

## テスト戦略

`updateMediaStream` は `navigator.mediaDevices.getUserMedia` を含み jsdom 環境では実行不可能、モック禁止規約と両立する純粋関数化が現実的でないため、本 issue では新規 Vitest テストは追加しない。後述の検証手順で手動確認する。Playwright e2e でのカバレッジ追加は競合タイミング再現の難易度が高いため別 issue で扱う。

## 検証手順

### A. fakeMedia 経路（AudioContext leak 検証用）

1. `pnpm dev` で起動し、`role=sendrecv` + `mediaType=fakeMedia` で接続する。
2. DevTools console で `signals.fakeContents.value.audioContext` の参照を確認する。`null` なら未生成、それ以外なら現在生きている AudioContext。
3. `UpdateMediaStreamButton` を押した直後（500ms 以内）に `disconnect` を押す。これを 6 回繰り返す。
4. ローカル映像が切断後に再表示されないことを目視確認する（`replaceTrack` 失敗時の `failed to replace ...` アラートが残ることは既存挙動として許容）。
5. 6 回繰り返した時点で `NotAllowedError: The number of hardware contexts ...` 相当のエラーが出ないことを確認する（closed/0001 の再現条件と同等）。`chrome://media-internals` の「Audio Components」タブには AudioContext の直接カウントは無いため、判定は上記エラーの有無で行う。
6. 正常系（切断なしで `updateMediaStream` 完了）でローカル映像が新デバイスに切り替わり、AudioContext が signal に積まれていることを `signals.fakeContents.value.audioContext` で確認する。

### B. getUserMedia 経路（UI 復活検証用）

7. `pnpm dev` で起動し、`role=sendrecv` + `mediaType=getUserMedia` で接続する（AudioContext は生成されない経路）。
8. `AudioInputForm` でデバイスを切り替えた直後（500ms 以内）に `disconnect` を押す。これを 3 回繰り返す。
9. ローカル映像が切断後に再表示されないことを確認する。
10. `VideoInputForm` でも同じ手順で確認する。

## 完了条件

- 検証手順 A の 4-5、B の 9-10 で UI 上のローカル映像が残らず AudioContext 関連エラーが出ないこと。
- 検証手順 A の 6 で正常系の挙動が変わらないこと。
- 再接続成功直後（`updateMediaStream` 実行中に reconnect が完了したケース）でも誤動作しないこと（ガード条件で捕捉される）。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 既存テスト（`pnpm test`）および既存 Playwright e2e（`pnpm test:e2e`）が通ること。

## 解決方法

- `src/app/actions.ts` の `updateMediaStream` 末尾、`signals.setLocalMediaStream(mediaStream)` と `signals.setFakeContentsAudio(audioContext, gainNode)` の直前にガード条件を追加する。中断と判定できる場合は新規生成した `mediaStream` の全 track を `stop()` し、`audioContext !== null` なら `void audioContext.close()` してから return する。
- ガード条件は以下の 4 つの OR で構成する。
  - `signals.sora.value !== soraValue`（関数開始時の sora と現在の sora が違う = 切断後の再接続で新セッションに移行）
  - `signals.localMediaStream.value === null`（`disconnectSora` 内の `await cleanupSoraMediaState()` を跨いだ時間窓を捕捉）
  - `signals.connectionStatus.value === "disconnecting"`（ユーザー操作の disconnect が走行中）
  - `signals.connectionStatus.value === "disconnected"`（disconnect 完了済みの過渡状態）
- レビュー指摘を踏まえ、issue 設計方針の `soraValue === null` 条件は採用しない。理由: `requestMedia` プレビュー後 connect 前の `updateMediaStream` 経路（preview 中のデバイス切替）を「異常系」として弾くと、UI の新デバイス切替が機能しなくなるため。本ガード（`signals.sora.value !== soraValue`）は `soraValue === null` のとき参照比較が `null !== null` で false となり、preview 経路は素通りする。
- ガード経路で停止した track もタイムラインに記録するため、`signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track))` を併記する。
- `CHANGES.md` の `## develop` の `[FIX]` セクション末尾（`### misc` の直前）に `[FIX]` エントリを追記する。
- `/review-diff-code` のレビューを 1 周回し、重要 1 件（`soraValue === null` ガードと preview 経路の干渉）と改善 1・2・4（条件ごとの 1 行コメント / ガード経路のタイムラインログ / コメント表現修正）を反映した。改善 3（`void audioContext.close()` の rejection 握り潰し）は既存 `closeFakeContentsAudio` と同パターンで一貫性を優先し見送った。
