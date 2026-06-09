# 0045-bug-fix-update-media-stream-after-disconnect

- Priority: High
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-update-media-stream-after-disconnect
- Polished: 2026-06-09

## 目的

`updateMediaStream` は複数の `await` を跨ぐが、その途中で切断が走った場合に末尾の `signals.setLocalMediaStream(mediaStream)` と `signals.setFakeContentsAudio(audioContext, gainNode)` が「切断状態の signal」を上書きしてしまい、UI に新規メディアが「復活して」貼り付き、AudioContext がどこからも参照されないまま生き続けてリークする。末尾 2 行の直前にガードを入れ、ガード時はローカル変数として持っている新規 `mediaStream` の全 track を `stop()`、新規 `audioContext` を `close()` してから return する。

## 優先度根拠

- ローカルプレビュー後の Disconnect 経路で `updateMediaStream` を踏むと、UI には切断済みのはずの新規プレビュー映像が貼り付くため挙動が直感に反する。
- AudioContext は Chrome の同時 AudioContext 上限を消費するため、繰り返すと `NotAllowedError` でリロード必須になる。closed/0001 で `closeFakeContentsAudio` を入れたが、`updateMediaStream` の中間で生成され signal に積まれる前の AudioContext は当該安全網の対象外。
- 修正は数行で済むが、影響範囲は `UpdateMediaStreamButton` / `AudioInputForm` / `VideoInputForm` の 3 経路全てに及ぶ。

## 現状の問題

`src/app/actions.ts` の `updateMediaStream` は Polished 時点 (2026-06-09) で 1746-1804 行付近にある。実装時に行番号がずれている可能性があるため、関数名 `updateMediaStream` を基準に特定すること。

```ts
export const updateMediaStream = async (): Promise<void> => {
  const soraValue = signals.sora.value;
  const localMediaStreamValue = signals.localMediaStream.value;
  if (!localMediaStreamValue) return;
  // 旧 audio / video track の停止（冒頭の同期処理）
  ...
  const [mediaStream, gainNode, audioContext] = await createMediaStream(state).catch((error: unknown) => {
    signals.setSoraConnectionStatus("disconnected");
    throw error;
  });
  ...
  await Promise.allSettled(senders.map(async ({ sender, track }) => {
    if (!soraValue?.pc) return;
    ...
    sender.replaceTrack(track);
  }));
  ...
  signals.setLocalMediaStream(mediaStream);          // ← ここがガード対象
  signals.setFakeContentsAudio(audioContext, gainNode); // ← ここもガード対象
};
```

呼び出し元は次の 3 箇所（grep で確認）。デバイス切替の自動 `updateMediaStream` が高頻度トリガで、ボタン押下より踏みやすい。

- `src/components/DevtoolsPane/UpdateMediaStreamButton.tsx`（手動）
- `src/components/DevtoolsPane/AudioInputForm.tsx` の `onChange`
- `src/components/DevtoolsPane/VideoInputForm.tsx` の `onChange`

中断パターン:

- `soraValue` は冒頭 (`const soraValue = signals.sora.value`) でキャプチャされる。`replaceTrack` ループ内では `soraValue?.pc` を null 安全に参照しているが、関数末尾の signal 書き込みは無条件で走る。
- `createMediaStream` の catch（`updateMediaStream` 内 1771-1778 付近）は `setSoraConnectionStatus("disconnected")` を呼んで `throw error` するため、catch 経路は末尾 2 行に到達しない。
- 一方で `createMediaStream` 成功後の `Promise.allSettled([... replaceTrack ...])` を待っている間に Disconnect が走ると、`signals.sora.value` は `null` になり `connectionStatus` は `"disconnecting"` → `"disconnected"` に遷移する。`Promise.allSettled` は完了して関数は末尾に到達し、新規 `mediaStream` / `audioContext` を signal に書き戻してしまう。

`signals.setLocalMediaStream` (`signals.ts:490-497`) は新値設定前に旧 stream の全 track を `stop()` する安全網があるが、これは「旧 stream を新 stream で上書きするとき」の挙動で、上書き直後は新 stream の track が生きたまま残る（リーク防止対象が無い）。新 audioContext も同様に signal に積まれて誰も close しなくなる。

## 設計方針

### 1. ガード条件

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
- `signals.localMediaStream.value === null`: cleanup 完了の最も確実なシグナル。`disconnectSora` は冒頭で `cleanupSoraMediaState()` を呼び `setLocalMediaStream(null)` が同期で走るが、その直後はまだ `connectionStatus` が `"connected"` のままで `signals.sora.value` も同一のため、他の条件では捕捉できない時間窓がある。`localMediaStream.value === null` を入れることでこの窓も埋める。
- `connectionStatus === "disconnecting" | "disconnected"`: SDK 切断完了通知や `setSora(null)` 後の過渡状態を捕捉する。

### 2. リソース解放方法

- `signals.setLocalMediaStream(null)` は呼ばない（signal を触らない方が安全。`localMediaStream.value` は既に cleanup で `null` になっている）。代わりに、関数内で生成した `mediaStream` のローカル変数から `getTracks()` して `track.stop()` を直接呼ぶ。
- `signals.closeFakeContentsAudio()` は呼ばない（signal を触らない）。代わりに、関数内で生成した `audioContext` のローカル変数を直接 `void audioContext.close()` する。`audioContext` は `createMediaStream` の戻り値で `AudioContext | null` の可能性があるため null チェックを挟む。
- `gainNode` は `audioContext` を close すれば破棄されるので個別処理は不要。

### 3. ガード位置

挿入位置は **末尾 2 行の直前のみ**。`createMediaStream` の前後や `replaceTrack` ループの前には入れない。理由:

- `createMediaStream` の catch は既に `disconnected` を立てて throw するので catch 経路は末尾に到達しない。
- `replaceTrack` ループ内は `soraValue?.pc` の null チェックがあり、close 済み PC への replaceTrack は no-op で済む。`Promise.allSettled` のため例外でも捕捉される。ループ自体に追加ガードを入れると重複が増える。
- 末尾 1 箇所のガードで「signal を切断状態の上に書き戻さない」目的は達成できる。

### 4. ガード条件の網羅性と `disconnectSora` の現状フロー

`disconnectSora` (`actions.ts:1684-1709`) の現状フロー:

```
1690: cleanupSoraMediaState();          ← localMediaStream.value = null（同期）
1692: stopStatsReportTimer();
1694: if (connectionStatusValue === "disconnected") return;
1697: if (soraValue && (connected|connecting|preparing))
1703:   signals.setSoraConnectionStatus("disconnecting");
1704:   await soraValue.disconnect();
1707: signals.setSoraConnectionStatus("disconnected");
```

`"disconnecting"` は冒頭ではなく `cleanupSoraMediaState()` の後、かつ `soraValue` があり接続中系状態のときだけ立つ。`updateMediaStream` の `Promise.allSettled` 進行中に `cleanupSoraMediaState()` だけが走ると、`localMediaStream.value = null` になっているが `connectionStatus` はまだ `"connected"` のまま、`signals.sora.value` も同一の状態がある。この窓を捕捉するため、ガード条件に `signals.localMediaStream.value === null` を入れる。

[[0044-bug-fix-cleanup-sora-media-state-async]] が `cleanupSoraMediaState` を async 化した後でも、`disconnectSora` 冒頭で `await cleanupSoraMediaState()` した時点で `setLocalMediaStream(null)` は同期で走るため、`localMediaStream.value === null` の条件は引き続き有効。0044 のマージ順に依存しない。

### 5. `replaceTrack` 失敗時のアラートとの交差

`Promise.allSettled` のループ内で `replaceTrack` が close 済み PC に対して `InvalidStateError` を投げると、本 issue のガードに引っかかる前に `signals.setSoraErrorAlertMessage("failed to replace N track(s) of M")` が発火する経路がある（既存挙動）。本 issue のガードは「signal 上書きを防ぐ」目的に絞っており、このアラート抑制は別 issue で扱う。検証手順では「切断時の `failed to replace` アラートが残ること」を許容する（既存挙動）。

### 6. closed/0001 との関係

closed/0001 は fakeMedia の AudioContext leak（`disposeMedia` / `cleanupSoraMediaState` 内の `closeFakeContentsAudio`）を扱った。本 issue は「`updateMediaStream` の中間で生成された AudioContext が signal に積まれる前に切断され、参照を失う」経路で、closed/0001 の対策範囲外。両者で扱う AudioContext の生成タイミングが異なるため、本 issue は補完的に必要。

### 7. 関連 issue と依存

- [[0044-bug-fix-cleanup-sora-media-state-async]]: `cleanupSoraMediaState` の async 化により `disconnectSora` 経路で cleanup 完了が確定するため、本 issue のレース窓が狭まる。ただし `disconnectSora` 経由でない切断（SDK 主導切断・abend）でも本 issue のレースは独立に起きるため、0044 と本 issue は独立に必要。**0044 を先に着手し、本 issue はその上に rebase する** 推奨順。
- [[0046-bug-fix-reconnect-failure-media-leak]]: `reconnectSora` の失敗パスでの同種リーク。本 issue で確立する「中断時にローカル変数として stop/close」パターンを 0046 にも適用する。**本 issue を 0046 より先に着手し、0046 で同パターンを踏襲する** 推奨順。
- [[0054-bug-fix-update-media-stream-button-disabled]]: `UpdateMediaStreamButton` の disabled + `updateMediaStream` 関数自体の in-flight ガードを追加。0054 が先に入れば連打レースの window は狭まるが、`AudioInputForm` / `VideoInputForm` の onChange と Disconnect の競合は依然として残るため、本 issue は独立に必要。
- [[0049-bug-fix-fake-contents-audio-close]]: `setFakeContentsAudio` setter 内で旧 AudioContext を自動 close する変更。本 issue で「ローカル変数の audioContext を直接 close する」設計を採るため 0049 とは別経路。

### 8. CHANGES.md エントリ

`CHANGES.md` の `## develop` の `[FIX]` セクション末尾（`### misc` サブセクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `updateMediaStream` の `await` 中に切断された場合に signal を上書きしてリソースリークする問題を修正する
  - 末尾の signal 更新前にガードを追加し、ガード時は新規生成した MediaStream と AudioContext を解放する
  - @voluntas
```

### 9. スコープ外

- `createMediaStream` 失敗時の `setSoraConnectionStatus("disconnected")` の妥当性検証（接続中に media 取得失敗で `disconnected` に書き換える挙動）は別 issue で扱う。
- `replaceTrack` 失敗時のアラート表示の抑制は本 issue では扱わない（既存挙動を維持）。
- `setFakeContentsAudio` setter 内の自動 close は [[0049-bug-fix-fake-contents-audio-close]] で扱う。

## 検証手順

### A. fakeMedia 経路（AudioContext leak 検証用）

1. `vp dev` で起動し、`role=sendrecv` + `mediaType=fakeMedia` で接続する。
2. devtools console を開き、`chrome://media-internals` の AudioContext 一覧で現在の AudioContext 数を記録する。
3. `update-mediastream` ボタンを押した直後（500ms 以内）に `disconnect` ボタンを押す。これを 5 回繰り返す。
4. ローカル映像が切断後に再表示されないことを目視確認する（`replaceTrack` 失敗時の `failed to replace ...` アラートが残ることは既存挙動として許容）。
5. 接続を切った状態で AudioContext 数が増加していないことを `chrome://media-internals` で確認する。
6. 正常系（切断なしで `updateMediaStream` 完了）でローカル映像が新デバイスに切り替わり、AudioContext が signal に積まれていることを devtools console の `signals.fakeContents.value.audioContext` で確認する。

### B. getUserMedia 経路（UI 復活検証用）

7. `vp dev` で起動し、`role=sendrecv` + `mediaType=getUserMedia` で接続する（AudioContext は生成されないため `chrome://media-internals` は使わない）。
8. `AudioInputForm` でデバイスを切り替えた直後（500ms 以内）に `disconnect` を押す。これを 3 回繰り返す。
9. ローカル映像が切断後に再表示されないこと、AudioContext 数が変化しないことを確認する。
10. `VideoInputForm` でも同じ手順で確認する。

## 完了条件

- 検証手順 A の 4-5、B の 9-10 で UI 上のローカル映像が残らず AudioContext 数が増加しないこと。
- 検証手順 A の 6 で正常系の挙動が変わらないこと。
- 再接続成功直後（`updateMediaStream` 実行中に reconnect が完了したケース）でも誤動作しないこと（ガード条件で捕捉される）。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 既存テスト (`vp test`) および既存 Playwright e2e が通ること。
- 新規テストは追加しない。`updateMediaStream` は `navigator.mediaDevices.getUserMedia` を含み jsdom 環境では実行不可能、モック禁止規約と両立する純粋関数化が現実的でないため、本 issue では検証手順による手動確認のみとする（テスト追加は別 issue で扱う）。
