# 0046-bug-fix-reconnect-failure-media-leak

- Priority: High
- Created: 2026-06-09
- Completed: 2026-06-15
- Model: Opus 4.7
- Branch: feature/fix-reconnect-failure-media-leak
- Polished: 2026-06-15

## 目的

`reconnectSora` は再接続用に `createMediaStream(state)` で新規 `mediaStream` と（fakeMedia 経路の場合）`audioContext` を生成するが、`attemptReconnection` が全試行失敗した経路で `cleanupSoraMediaState()` が呼ばれても、その時点の `signals.localMediaStream.value` は既に `null` で、新規生成した `mediaStream` / `audioContext` はどこからも参照されないまま leak する。失敗 return 直前で **ローカル変数として** 新規リソースを直接解放する（[[0045-bug-fix-update-media-stream-after-disconnect]] と同じ「signal を触らず、ローカル変数で stop/close」パターン）。

## 優先度根拠

- `mediaType === "fakeMedia"` の場合、新規 `audioContext` が動き続け Chrome の同時 AudioContext 上限（実装上 6）を消費。不安定回線で `attemptReconnection` の最大試行回数まで連続失敗すると 1 ラウンドで 1 個消費し、リロード以外で復旧できない。
- `mediaType === "getUserMedia"` / `"getDisplayMedia"` / `"mp4Media"` の場合、`audioContext` は `null` のため AudioContext leak は起きないが、新規 `mediaStream` の MediaStreamTrack が稼働し続けるためマイク / カメラの LED が点灯したまま残り、プライバシー上の問題になる。
- 不安定回線では現実に踏む経路で、症状の重大度（リロード必須 or LED 点灯）から High。

## 現状の問題

`src/app/actions.ts` の `reconnectSora` を関数名で特定すること（行番号は陳腐化するため記載しない）。概略は次のとおり。

```ts
let mediaStream: undefined | MediaStream;
let gainNode: undefined | GainNode | null;
let audioContext: undefined | AudioContext | null;
const roleValue = signals.role.value;
// ...
if (roleValue === "sendonly" || roleValue === "sendrecv") {
  try {
    [mediaStream, gainNode, audioContext] = await createMediaStream(state);
  } catch (error) {
    // createMediaStream の失敗時は再接続を中止し disconnected 状態に戻す
    if (error instanceof Error) {
      signals.setSoraErrorAlertMessage(error.message);
    }
    await cleanupSoraMediaState();
    signals.setSoraConnectionStatus("disconnected");
    signals.setSoraReconnecting(false);
    return;
  }
}
const soraConnection = await attemptReconnection(/* ... mediaStream ... */);
if (soraConnection === undefined) {
  // ← ここが本 issue の対象
  signals.setSora(null);
  await cleanupSoraMediaState();
  signals.setSoraErrorAlertMessage("failed to reconnect Sora");
  signals.setSoraConnectionStatus("disconnected");
  signals.setSoraReconnecting(false);
  return;
}
// 成功パス
signals.setSora(soraConnection);
if (mediaStream) signals.setLocalMediaStream(mediaStream);
if (audioContext !== undefined) signals.setFakeContentsAudio(audioContext, gainNode ?? null);
```

`cleanupSoraMediaState` は `signals.localMediaStream.value` を読んで cleanup し、内部で `signals.closeFakeContentsAudio()` も呼ぶが、これらは「**signal にセット済み**の旧リソース」を解放する設計。`attemptReconnection` 失敗時点でまだ signal にセットされていない新規 `mediaStream` / `audioContext` は対象外で、失敗 return で関数を抜けた瞬間にローカル変数の参照も切れ、どこからも到達不能な状態で稼働を続ける。[[closed/0049-bug-fix-fake-contents-audio-close]] は `setFakeContentsAudio` setter 内での旧 AudioContext 自動 close を「実装せず」と結論しているため、setter 経由での安全網も存在しない。本 issue で直接解放するのが唯一の対処になる。

`createMediaStream` 失敗パスの `await cleanupSoraMediaState()` 呼び出しは本 issue のスコープ外。`createMediaStream` 内部で `createUserMediaStream` の catch 内に gum で取得したトラックの個別停止処理が既に入っているため、その時点で新規リソースは生成されていない（部分生成された場合の解放は別 issue 扱い）。

`attemptReconnection` の早期 break（ループ内 `if (!signals.reconnecting.value) break;`、ユーザーが Reconnect Toast を閉じてキャンセルした経路）でも `undefined` が返るため、本 issue の失敗 return ブロックを通る。本修正で同様にリソース解放されるため、キャンセル経路でも leak しない。

## 設計方針

### 失敗 return ブロックでローカル変数を直接解放（0045 と同パターン）

`signals.setSora(null)` の直前に、ローカル変数 `mediaStream` の全 track を stop、ローカル変数 `audioContext` を close する処理を追加する。`signals.setLocalMediaStream(mediaStream)` や `signals.setFakeContentsAudio(audioContext, gainNode)` は呼ばない（呼ぶと旧 stream の即 stop による UI 副作用 / 旧 AudioContext の close 抜けによる新規 leak の両リスクがある）。

```ts
if (soraConnection === undefined) {
  // 新規生成した mediaStream / audioContext は signal にセットされていないため、
  // cleanupSoraMediaState では解放されない。ローカル変数として直接解放する。
  if (mediaStream) {
    for (const track of mediaStream.getTracks()) {
      track.stop();
    }
  }
  if (audioContext) {
    void audioContext.close();
  }
  signals.setSora(null);
  await cleanupSoraMediaState();
  signals.setSoraErrorAlertMessage("failed to reconnect Sora");
  signals.setSoraConnectionStatus("disconnected");
  signals.setSoraReconnecting(false);
  return;
}
```

ガード位置・順序の意図:

- ローカル解放を `signals.setSora(null)` の前に置く: signal を触る前にローカル変数を確定的に解放し、[[0045-bug-fix-update-media-stream-after-disconnect]] の擬似コードと統一する。
- 既存コードの `signals.setSora(null)` → `await cleanupSoraMediaState()` → `setSoraErrorAlertMessage` → `setSoraConnectionStatus` → `setSoraReconnecting` の順は維持する。

### AudioContext / gainNode の null 取り扱い

- `audioContext` は `reconnectSora` 内で `let audioContext: undefined | AudioContext | null;` と宣言され、`sendonly` / `sendrecv` 以外の roleValue では `try` 自体がスキップされて `undefined` のまま、fakeMedia 以外の経路では `createMediaStream` が `null` を返す。3 状態（`undefined | null | AudioContext`）を一括で捕捉するため、ガードは **`if (audioContext)`（truthy チェック）** で書く（`!== null` だけだと `undefined` で TypeError）。
- `gainNode` は `AudioContext` を close すれば破棄されるため個別処理不要。

### `cleanupMediaStreamOnError` の流用は避ける

`connectSora` の `createMediaStream` 失敗パスで使われている `cleanupMediaStreamOnError` は別経路用に設計されており、`reconnectSora` の失敗パスとは前提が異なる（前者は `mediaStream` がまだ部分生成中、後者は完全に生成済み）。本 issue では既存ヘルパーを流用せず、`for (const track of mediaStream.getTracks()) track.stop()` の最小ロジックを直接書く。

### 関連 issue

- [[0045-bug-fix-update-media-stream-after-disconnect]]: 同じ「ローカル変数で stop/close」パターン。0045 を先に着手し、本 issue で同パターンを踏襲する想定。
- [[0048-bug-fix-reconnect-double-launch]]: `reconnectSora` のエントリポイントに in-flight ガード追加。本 issue とは触る領域が異なる（0048 はエントリ、本 issue は失敗 return）。マージ順は両方向可、両方マージ後に手動確認。
- [[closed/0044-bug-fix-cleanup-sora-media-state-async]]: 既に closed。本 issue は async 化された `cleanupSoraMediaState` を `await` する形で設計している。
- [[closed/0049-bug-fix-fake-contents-audio-close]]: 既に closed（実装放棄）。`setFakeContentsAudio` setter 内の自動 close は存在しないため、本 issue で直接 close するのが唯一の対処。

### CHANGES.md エントリ

`CHANGES.md` の `## develop` 内 `[FIX]` セクション末尾（`### misc` セクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `reconnectSora` の `attemptReconnection` 全失敗パスで新規 MediaStream / AudioContext がリークする問題を修正する
  - 失敗 return 直前で新規生成した `mediaStream` の全 track を stop し `audioContext` を close する
  - キャンセル経路（Reconnect Toast を閉じる）でも同じガードに入りリークしない
  - @voluntas
```

### スコープ外

- `createMediaStream` 失敗パスでの追加解放: `createUserMediaStream` 内の既存処理でカバー済み。
- 成功パスでの旧 `audioContext` 自動 close: closed/0049 で実装放棄済み。新規 issue を立てる場合は別途。
- `reconnectSora` の二重起動防止: [[0048-bug-fix-reconnect-double-launch]] で扱う。
- `attemptReconnection` のキャンセル時の `setSoraErrorAlertMessage("failed to reconnect Sora")` 表示の妥当性（キャンセルでも "failed" と表示される UX 課題）: 別 issue で扱う。

## テスト戦略

`reconnectSora` は `navigator.mediaDevices.getUserMedia` と Sora 接続を含み jsdom 環境では実行不可能、モック禁止規約と両立する純粋関数化が現実的でないため、本 issue では新規 Vitest テストは追加しない。後述の検証手順で手動確認する。

## 検証手順

### A. fakeMedia 経路（AudioContext leak 検証用）

1. `pnpm dev` で起動し、`role=sendrecv` + `mediaType=fakeMedia` で接続する。
2. DevTools console で `signals.fakeContents.value.audioContext` の参照を控えておく。
3. abend を意図的に起こす。例: signaling サーバの WS を停止する、または DevTools の Network を Offline にする。
4. Reconnect Toast が表示され、`attemptReconnection` が最大試行回数まで失敗するまで待つ。
5. 失敗後に Sora 接続が `disconnected` 状態になることを UI で確認する。
6. 上記 3-5 を 6 ラウンド繰り返し、`NotAllowedError: The number of hardware contexts ...` 相当のエラーが出ないことを確認する（closed/0001 / 0045 と同じ判定方法。Chrome の同時 AudioContext 上限 6 を超えるかで判定）。

### B. getUserMedia 経路（マイク / カメラ LED 検証用）

7. `pnpm dev` で起動し、`role=sendrecv` + `mediaType=getUserMedia` で接続する。
8. 上記 3-5 と同じ手順で abend を起こす。
9. 失敗後、ブラウザのアドレスバーのカメラ / マイクアイコンが消えることを目視確認する（修正前は再接続中に取得したデバイスが活きたまま残る）。
10. OS 側の通知バー（macOS なら Control Center、Windows なら通知）でカメラ / マイクの利用表示が消えることを確認する。

### C. キャンセル経路

11. 接続後に abend を起こして Reconnect Toast を表示する。
12. Toast を手動で閉じる（`setSoraReconnecting(false)` 発火）。
13. キャンセル後にデバイス LED（getUserMedia）/ `NotAllowedError` の有無（fakeMedia、6 ラウンド分の蓄積で判定）で leak していないことを確認する。
14. キャンセル時に `setSoraErrorAlertMessage("failed to reconnect Sora")` の赤いアラートが表示されるのは既存挙動（修正前から発生）。本 issue ではこの UX は変更しない。

### D. 成功パス（regression 確認）

15. 接続後に弱いネットワーク劣化（一時的な切断）を起こし、`attemptReconnection` の途中で再接続が成功する状況を作る。
16. 接続が `connected` 状態に戻り、ローカル映像 / 音声が引き続き表示されることを確認する。
17. fakeMedia 経路では `signals.fakeContents.value.audioContext` が新規参照に切り替わり、不必要な重複生成（古いコンテキストが回収されず増え続ける）が起きていないことを確認する。

## 完了条件

- 検証手順 A の 6 で AudioContext 上限エラーが出ないこと（fakeMedia 経路）。
- 検証手順 B の 9-10 でブラウザ / OS のデバイス利用表示が修正後は消えること（getUserMedia 経路）。
- 検証手順 C の 13 でキャンセル経路でも leak しないこと。
- 検証手順 D の 16-17 で成功パス（再接続成功）の挙動が変わらないこと。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 既存テスト（`pnpm test`）および既存 Playwright e2e（`pnpm test:e2e`）が通ること。

## 解決方法

- `src/app/actions.ts` の `reconnectSora` の失敗 return ブロック（`soraConnection === undefined` 直後）に、ローカル変数として持っている新規 `mediaStream` の全 track を `stop()` し、`audioContext` を `close()` する処理を追加する。
- ガード位置は `signals.setSora(null)` の直前。`updateMediaStream`（0045）の中断ガードと同じ「signal 更新前にローカル変数で stop/close」パターンに揃える。
- `audioContext` は `let audioContext: undefined | AudioContext | null` で `sendonly` / `sendrecv` 以外の roleValue では `try` 自体がスキップされて `undefined` のまま残るため、`if (audioContext)` の truthy チェックで 3 状態（`undefined` / `null` / `AudioContext`）を一括捕捉する。
- ガード経路で停止した track もタイムラインに記録するため、`signals.setTimelineMessage(createSoraDevtoolsMediaStreamTrackLog("stop", track))` を併記する。
- `CHANGES.md` の `## develop` の `[FIX]` セクション末尾（`### misc` の直前）に `[FIX]` エントリを追記する。タイムラインログ追加もサブ箇条で明示する。
- `/review-diff-code` のレビューを 1 周回し、改善 3（CHANGES.md にタイムラインログ追加を記載）を反映した。改善 1・2（コメント追記）は既存コメントで意図が読めるため見送り、改善 4（既存挙動指摘のみ）は対応不要。
