# 0046-bug-fix-reconnect-failure-media-leak

- Priority: High
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-reconnect-failure-media-leak
- Polished: 2026-06-09

## 目的

`reconnectSora` は再接続用に `createMediaStream(state)` で新規 `mediaStream` と（fakeMedia 経路の場合）`audioContext` を生成するが、`attemptReconnection` が全試行失敗した経路で `cleanupSoraMediaState()` が呼ばれても、その時点の `signals.localMediaStream.value` は既に `null` で、新規生成した `mediaStream` / `audioContext` はどこからも参照されないまま leak する。失敗 return 直前で **ローカル変数として** 新規リソースを直接解放する（[[0045-bug-fix-update-media-stream-after-disconnect]] と同じ「signal を触らず、ローカル変数で stop/close」パターン）。

## 優先度根拠

- `mediaType === "fakeMedia"` の場合、新規 `audioContext` が動き続け Chrome の同時 AudioContext 上限（実装上 6）を消費。不安定回線で 10 回連続失敗（`attemptReconnection` の最大試行回数）すると 1 ラウンドで 1 個消費し、リロード以外で復旧できない。
- `mediaType === "getUserMedia"` / `"getDisplayMedia"` / `"mp4Media"` の場合、`audioContext` は `null` のため AudioContext leak は起きないが、新規 `mediaStream` の MediaStreamTrack が稼働し続けるためマイク / カメラの LED が点灯したまま残り、プライバシー上の問題になる。
- 不安定回線では現実に踏む経路で、症状の重大度（リロード必須 or LED 点灯）から High。

## 現状の問題

`src/app/actions.ts` の `reconnectSora` は Polished 時点 (2026-06-09) で 1618-1681 行付近にある。実装時に行番号がずれている可能性があるため、関数名 `reconnectSora` を基準に特定すること。

```ts
let mediaStream: MediaStream | undefined;
let gainNode: GainNode | null = null;
let audioContext: AudioContext | null = null;
if (roleValue === "sendonly" || roleValue === "sendrecv") {
  try {
    [mediaStream, gainNode, audioContext] = await createMediaStream(state);
  } catch (error) {
    signals.setSoraConnectionStatus("disconnected");
    signals.setSoraReconnecting(false);
    cleanupSoraMediaState();
    throw error;
  }
}
const soraConnection = await attemptReconnection(/* ... mediaStream ... */);
if (soraConnection === undefined) {
  // ←ここが本 issue の対象（行 1660-1666 付近）
  signals.setSora(null);
  cleanupSoraMediaState();
  signals.setSoraErrorAlertMessage("failed to reconnect Sora");
  signals.setSoraConnectionStatus("disconnected");
  signals.setSoraReconnecting(false);
  return;
}
// 成功パス
signals.setSora(soraConnection);
if (mediaStream) signals.setLocalMediaStream(mediaStream);
if (audioContext !== undefined) signals.setFakeContentsAudio(audioContext, gainNode);
```

`cleanupSoraMediaState` は `signals.localMediaStream.value` を読んで cleanup するため、まだ signal にセットされていない新規 `mediaStream` / `audioContext` は対象外。失敗 return で関数を抜けた瞬間にローカル変数の参照も切れ、どこからも到達不能な状態で稼働を続ける。

`createMediaStream` 失敗パス（1640-1648 付近）の `cleanupSoraMediaState()` 呼び出しは本 issue のスコープ外。`createMediaStream` 内部で `createUserMediaStream` の catch 内に gum で取得したトラックの個別停止処理が既に入っているため、その時点で新規リソースは生成されていない（部分生成された場合の解放は別 issue 扱い）。

`attemptReconnection` の早期 break（ループ内 `if (!signals.reconnecting.value) break;`、ユーザーが Reconnect Toast を閉じてキャンセルした経路）でも `undefined` が返るため、本 issue の失敗 return ブロックを通る。本修正で同様にリソース解放されるため、キャンセル経路でも leak しない。

## 設計方針

### 1. 失敗 return ブロックでローカル変数を直接解放（0045 と同パターン）

`signals.setSora(null)` の直前に、ローカル変数 `mediaStream` の全 track を stop、ローカル変数 `audioContext` を close する処理を追加する。`signals.setLocalMediaStream(mediaStream)` や `signals.setFakeContentsAudio(audioContext, gainNode)` は呼ばない（呼ぶと旧 stream の即 stop による UI 副作用 / 旧 AudioContext の close 抜けによる新規 leak の両リスクがある）。

[[0044-bug-fix-cleanup-sora-media-state-async]] がマージ済みの前提で、`cleanupSoraMediaState` は `await` する。

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

- ローカル解放を `signals.setSora(null)` の前に置く: signal を触る前にローカル変数を確定的に解放する。順序の入れ替えは挙動を変えないが、0045 の擬似コードと統一する。
- `signals.setSora(null)` を `await cleanupSoraMediaState()` の前に置く: 既存コード（同期版）でこの順序になっており、書き順を統一する目的のみ。`signals.sora` を見て即時 return する経路は本ブロックに無い。
- `cleanupSoraMediaState` は 0044 で `Promise<void>` に変わるため `await` する。0044 マージ前なら `cleanupSoraMediaState();`（同期）でも動作するが、本 issue の修正は 0044 マージ後の形で行う。

### 2. AudioContext / gainNode の null 取り扱い

- `audioContext` は `reconnectSora` 内で `let audioContext: undefined | AudioContext | null;` と宣言され、`sendonly` / `sendrecv` 以外の roleValue では `try` 自体がスキップされて `undefined` のまま、fakeMedia 以外の経路では `createMediaStream` が `null` を返す。3 状態（`undefined | null | AudioContext`）を一括で捕捉するため、ガードは **`if (audioContext)`（truthy チェック）** で書く（`!== null` だけだと `undefined` で TypeError）。
- `gainNode` は `AudioContext` を close すれば破棄されるため個別処理不要。

### 3. `cleanupMediaStreamOnError` の流用は避ける

`connectSora` の `createMediaStream` 失敗パスで使われている `cleanupMediaStreamOnError` (`actions.ts:1423-1445`) は別経路用に設計されており、`reconnectSora` の失敗パスとは前提が異なる（前者は `mediaStream` がまだ部分生成中、後者は完全に生成済み）。本 issue では既存ヘルパーを流用せず、`for (const track of mediaStream.getTracks()) track.stop()` の最小ロジックを直接書く。

### 4. 関連 issue と依存

- [[0044-bug-fix-cleanup-sora-media-state-async]]: `cleanupSoraMediaState` を `Promise<void>` に変える。本 issue で `await cleanupSoraMediaState()` を使うため、**0044 を先に着手し、本 issue はその上に rebase する** 推奨順。0044 マージ前なら一時的に `cleanupSoraMediaState()`（同期）でも動作するが、最終形は `await` する。
- [[0045-bug-fix-update-media-stream-after-disconnect]]: 同じ「ローカル変数で stop/close」パターン。**0045 を先に着手し、本 issue で同パターンを踏襲する** 推奨順。
- [[0048-bug-fix-reconnect-double-launch]]: `reconnectSora` のエントリポイントに in-flight ガード追加。本 issue とは触る領域が異なる（0048 はエントリ、本 issue は失敗 return）。マージ順は両方向可、両方マージ後に手動確認。
- [[0049-bug-fix-fake-contents-audio-close]]: `setFakeContentsAudio` setter 内で旧 AudioContext を自動 close。本 issue は signal にセットされる前の AudioContext を扱うため別経路で、0049 とは独立に必要。

### 5. CHANGES.md エントリ

`CHANGES.md` の `## develop` の `[FIX]` セクション末尾（`### misc` サブセクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `reconnectSora` の `attemptReconnection` 全失敗パスで新規 MediaStream / AudioContext がリークする問題を修正する
  - 失敗 return 直前で新規生成した `mediaStream` の全 track を stop し `audioContext` を close する
  - キャンセル経路（Reconnect Toast を閉じる）でも同じガードに入りリークしない
  - @voluntas
```

### 6. スコープ外

- `createMediaStream` 失敗パス（1640-1648）の追加解放: `createUserMediaStream` 内の既存処理でカバー済み。
- 成功パスでの `audioContext` 旧値 close（`setFakeContentsAudio` setter 内の自動 close）: [[0049-bug-fix-fake-contents-audio-close]] で扱う。
- `reconnectSora` の二重起動防止: [[0048-bug-fix-reconnect-double-launch]] で扱う。
- `attemptReconnection` のキャンセル時の `setSoraErrorAlertMessage("failed to reconnect Sora")` 表示の妥当性: 別 issue で扱う（キャンセルでも「failed」と表示される UX 課題）。

## 検証手順

### A. fakeMedia 経路（AudioContext leak 検証用）

1. `vp dev` で起動し、`role=sendrecv` + `mediaType=fakeMedia` で接続する。
2. devtools console を開き、`chrome://media-internals` の AudioContext 一覧で現在の AudioContext 数を記録する。
3. abend を意図的に起こす。例: devtools console で `(await fetch("/some-signal")).abort()` 相当の WebSocket 強制断（実環境では signaling サーバの WS を停止 / network throttling で Offline）。
4. Reconnect Toast が表示され、`attemptReconnection` が 10 回失敗するまで待つ（約 10 秒程度、設定次第）。
5. 失敗後に Sora 接続が `disconnected` 状態になることを UI で確認する。
6. `chrome://media-internals` で AudioContext 数が修正前は +1、修正後は +0 になっていることを確認する。
7. 上記 3-6 を 3 ラウンド繰り返し、修正後の AudioContext 数が増加しないことを確認する。

### B. getUserMedia 経路（マイク/カメラ LED 検証用）

8. `vp dev` で起動し、`role=sendrecv` + `mediaType=getUserMedia` で接続する。
9. 上記 3-5 と同じ手順で abend を起こす。
10. 失敗後、ブラウザのアドレスバーのカメラ/マイクアイコンが消えることを目視確認する（修正前は再接続中に取得したデバイスが活きたまま残る）。
11. OS 側の通知バー（macOS なら Control Center、Windows なら通知）でカメラ/マイクの利用表示が消えることを確認する。

### C. キャンセル経路

12. 接続後に abend を起こして Reconnect Toast を表示する。
13. Toast を手動で閉じる（`setSoraReconnecting(false)` 発火）。
14. キャンセル後に `chrome://media-internals` の AudioContext 数（fakeMedia の場合）/ デバイス LED（getUserMedia の場合）が leak していないことを確認する。
15. キャンセル時に `setSoraErrorAlertMessage("failed to reconnect Sora")` の赤いアラートが表示されるのは既存挙動（修正前から発生）。本 issue ではこの UX は変更しない（別 issue でキャンセル時の表示分離を扱う）。

### D. 成功パス

16. 接続後に弱いネットワーク劣化（一時的な切断）を起こし、`attemptReconnection` の途中で再接続が成功する状況を作る。
17. 接続が `connected` 状態に戻り、ローカル映像 / 音声が引き続き表示されることを確認する。
18. `chrome://media-internals` の AudioContext 数（fakeMedia の場合）が修正前と同じく +1 にとどまり、不必要な close / 再生成が起きていないことを確認する。

## 完了条件

- 検証手順 A の 6-7 で AudioContext 数が修正後は増えないこと（fakeMedia 経路）。
- 検証手順 B の 10-11 でブラウザ / OS のデバイス利用表示が修正後は消えること（getUserMedia 経路）。
- 検証手順 C の 14 でキャンセル経路でも leak しないこと。
- 検証手順 D の 17-18 で成功パス（再接続成功）の挙動が変わらないこと。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 既存テスト (`vp test`) および既存 Playwright e2e が通ること。
- 新規テストは追加しない。`reconnectSora` は `navigator.mediaDevices.getUserMedia` と Sora 接続を含み jsdom 環境では実行不可能、モック禁止規約と両立する純粋関数化が現実的でないため、本 issue では検証手順による手動確認のみとする（テスト追加は別 issue で扱う）。
