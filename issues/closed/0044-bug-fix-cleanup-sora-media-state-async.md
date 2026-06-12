# 0044-bug-fix-cleanup-sora-media-state-async

- Priority: Medium
- Created: 2026-06-09
- Completed: 2026-06-12
- Model: Opus 4.7
- Branch: feature/fix-cleanup-sora-media-state-async
- Polished: 2026-06-09

## 目的

`cleanupSoraMediaState` は同期関数として宣言されているが、内部で `void (async () => { await stopLocalVideoTrack(...) })()` を fire-and-forget で起動し、`stopLocalVideoTrack` は `track.stop()` 前に 100ms の sleep を含む。呼び出し元が次の処理（特に `disconnectSora` の `await soraValue.disconnect()` や次の `connectSora`）に進んだ後で `stopLocalVideoTrack` の `setTimelineMessage("stop-...")` が遅れて発火し、**新セッションの timeline に古い stop ログが混入する**。`cleanupSoraMediaState` の戻り値を `Promise<void>` に変えて、呼び元が必要に応じて `await` できる形にする。

closed/0030 / closed/0033 / closed/0034 で確立した「**`setLocalMediaStream(null)` で signal を即 null にして UI から映像を即座に消す（同期）→ 後追いで track stop を待つ → `setLocalMediaStream(null)` 内の即 stop が安全網**」の設計は本 issue でも維持する。変更は「fire-and-forget の `void (async () => ...)()` を `await Promise.allSettled([...])` に置き換え、戻り値を `Promise<void>` にする」だけに絞り、`stopVideoProcessors` / fakeContents worker の `postMessage({ type: "stop" })` / `closeFakeContentsAudio` / `setLocalMediaStream(null)` の呼び出し順序と存在は崩さない。

## 優先度根拠

実害は「タイムラインへのログ混入」のみで、signal や接続状態が壊れる経路は無い（`stopLocalVideoTrack` は引数で旧 stream をローカル変数として閉じ込めるため、新セッションの `signals.localMediaStream.value` を書き換えない）。デバッグログ観察時に時系列が分かりにくくなるレベル。closed/0034 で結論された「最終フレーム残留」は本 issue とは別観点（向こうは映像の見た目、こちらは timeline の整合性）。Medium。

## 現状の問題

`src/app/actions.ts` の `cleanupSoraMediaState` は Polished 時点 (2026-06-09) で 1056-1082 行付近にある。実装時に行番号がずれている可能性があるため、関数名 `cleanupSoraMediaState` を基準に特定すること。

```ts
export const cleanupSoraMediaState = (): void => {
  clearRemoteMediaClients();
  const localMediaStreamValue = signals.localMediaStream.value;
  const virtualBackgroundProcessorValue = signals.virtualBackgroundProcessor.value;
  const noiseSuppressionProcessorValue = signals.noiseSuppressionProcessor.value;
  const fakeContentsValue = signals.fakeContents.value;
  const originalTrack = stopVideoProcessors(virtualBackgroundProcessorValue);
  void (async () => {
    try {
      await stopLocalVideoTrack(localMediaStreamValue, originalTrack);
    } catch (error) {
      signals.setLogMessages({
        title: "STOP_LOCAL_VIDEO_TRACK",
        description: getErrorMessage(error),
      });
    }
  })();
  void stopLocalAudioTrack(localMediaStreamValue, noiseSuppressionProcessorValue);
  if (fakeContentsValue.worker) {
    fakeContentsValue.worker.postMessage({ type: "stop" });
  }
  signals.closeFakeContentsAudio();
  signals.setLocalMediaStream(null);
};
```

呼び出し箇所は 5 つ（grep 確認）。

| 行   | 場所                                                                    | コンテキスト         | 現状の呼び方               |
| ---- | ----------------------------------------------------------------------- | -------------------- | -------------------------- |
| 1168 | `setSoraCallbacks` 内の `on("disconnect", (event) => { ... })` ハンドラ | **同期コールバック** | `cleanupSoraMediaState();` |
| 1548 | `connectSora` の catch ブロック                                         | `async` 関数内       | `cleanupSoraMediaState();` |
| 1645 | `reconnectSora` の `createMediaStream` 失敗パス                         | `async` 関数内       | `cleanupSoraMediaState();` |
| 1662 | `reconnectSora` の `attemptReconnection` 全失敗パス                     | `async` 関数内       | `cleanupSoraMediaState();` |
| 1690 | `disconnectSora` 冒頭                                                   | `async` 関数内       | `cleanupSoraMediaState();` |

`stopLocalVideoTrack` は引数の `localMediaStreamValue` / `originalTrack` をローカル変数として閉じ込めているため、新セッションの `signals.localMediaStream.value` を直接書き換えるレースは起きない（closed/0030 で意図的に設計されたパターン）。実害は `stopLocalVideoTrack` が 100ms sleep 後に `signals.setTimelineMessage("stop-video-mediastream-track")` を発火する点で、新セッション開始後の timeline にこの古い stop ログが追記される。

SDK のコールバック型 `Callbacks.disconnect: (event: SoraCloseEvent) => void` は同期で、ハンドラを async 化しても SDK は戻り値の Promise を待たない。`disconnectSora` (1690) が `await soraValue.disconnect()` で SDK の disconnect を呼ぶときも、disconnect ハンドラ内の cleanup は経路上 fire-and-forget になる。

## 設計方針

### 1. `cleanupSoraMediaState` のシグネチャ変更

戻り値を `Promise<void>` に変える。内部の `void (async () => ...)()` を撤去し、`stopLocalVideoTrack` / `stopLocalAudioTrack` を `Promise.allSettled` で並列に待つ。それ以外の同期処理（`stopVideoProcessors`、`fakeContentsValue.worker.postMessage`、`closeFakeContentsAudio`、`setLocalMediaStream(null)`）の順序と存在は維持する。

```ts
export const cleanupSoraMediaState = async (): Promise<void> => {
  clearRemoteMediaClients();
  const localMediaStreamValue = signals.localMediaStream.value;
  const virtualBackgroundProcessorValue = signals.virtualBackgroundProcessor.value;
  const noiseSuppressionProcessorValue = signals.noiseSuppressionProcessor.value;
  const fakeContentsValue = signals.fakeContents.value;
  // media processor は同期処理で停止する
  const originalTrack = stopVideoProcessors(virtualBackgroundProcessorValue);
  // fakeMedia の worker を停止する
  if (fakeContentsValue.worker) {
    fakeContentsValue.worker.postMessage({ type: "stop" });
  }
  // closed/0030 の安全網: signal を先に null にして UI から映像を即座に消す（同期）
  signals.closeFakeContentsAudio();
  signals.setLocalMediaStream(null);
  // 後追いで video / audio track stop を並列に待つ
  const results = await Promise.allSettled([
    stopLocalVideoTrack(localMediaStreamValue, originalTrack),
    stopLocalAudioTrack(localMediaStreamValue, noiseSuppressionProcessorValue),
  ]);
  const trackLabels = ["STOP_LOCAL_VIDEO_TRACK", "STOP_LOCAL_AUDIO_TRACK"] as const;
  for (let index = 0; index < results.length; index += 1) {
    const result = results[index];
    if (result.status === "rejected") {
      signals.setLogMessages({
        title: trackLabels[index],
        description: getErrorMessage(result.reason),
      });
    }
  }
};
```

**ポイント**:

- 旧コードの `void stopLocalAudioTrack(...)` は audio 側の rejection をログに残せていなかった（video のみ try/catch）。`Promise.allSettled` への統一で audio 側のエラーも `STOP_LOCAL_AUDIO_TRACK` 名でログに残るようになる（副作用としての小さな改善）。
- `signals.setLocalMediaStream(null)` の即 stop 安全網は `await` の前に置くため、closed/0030 の即時 UI 消去設計を維持する。
- 既存 `stopVideoProcessors` / `worker.postMessage({ type: "stop" })` / `closeFakeContentsAudio` の呼び出しはすべて維持。

### 2. 呼び出し箇所の修正

| 行                                               | 修正方針                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1168（disconnect ハンドラ）                      | `void cleanupSoraMediaState();` に変更（SDK が Promise を待たないため await しても caller に伝播しない）。後段の `signals.setSora(null)` / `setSoraConnectionStatus("disconnected")` は cleanup を待たず即実行し、UI 反応を維持する。タイムラインへの古い stop 混入は SDK 主導切断（サーバ主導切断・ネットワーク断・abend）の経路では本 issue で完全には解消されないが、abend からの再接続経路では [[0048-bug-fix-reconnect-double-launch]] で `reconnectSora` 起動を直列化するため、新セッション開始は cleanup 完了後となり混入が抑制される。             |
| 1548（connectSora catch）                        | `await cleanupSoraMediaState();`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 1645（reconnectSora createMediaStream 失敗）     | `await cleanupSoraMediaState();`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 1662（reconnectSora attemptReconnection 全失敗） | `await cleanupSoraMediaState();`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 1690（disconnectSora 冒頭）                      | `await cleanupSoraMediaState();` を入れた上で、その後 `await soraValue.disconnect()` する。**100ms 程度の遅延が `disconnect()` 通知前に挿入される**が、これは本 issue の目的（切断完了通知前にローカル track 完了を保証）の本質的なトレードオフ。UI からの映像消去は `setLocalMediaStream(null)` が同期で先に走るため、ユーザー体感の即時性は維持される。closed/0030 で「fire-and-forget で UI 即時性を優先」とした判断は `setLocalMediaStream(null)` の安全網で達成済みで、本修正はその安全網を保ったまま「呼び元が完了を観測できる」を追加する位置づけ。 |

`disconnectSora` (1690) で先頭で `await cleanupSoraMediaState()` した後、SDK から disconnect イベントが発火して 1168 のハンドラから二度目の `cleanupSoraMediaState()` が走る経路があるが、ここは冪等で安全（closed/0030 / closed/0034 で確立済み）。`localMediaStream` と各種 processor は既に null になっており、`stopLocalVideoTrack(null, undefined)` 等は no-op で完了する。

### 3. 既存テストの更新

`src/app/actions.test.ts:48-57` の `cleanupSoraMediaState` 冪等性テストを async 化する。新規アサーションも追加する。

- 「`cleanupSoraMediaState` は初期状態で `await` しても例外を投げない」（既存）
- 「`cleanupSoraMediaState` は `await` 完了後に `localMediaStream` が null である」
- 「`cleanupSoraMediaState` は `await` 完了後に `remoteClients` が空である」
- 「`cleanupSoraMediaState` を 2 回連続で `await` しても例外を投げない（冪等性）」

`test` / `assert` 利用、テストメッセージは日本語、モック禁止規約に従う。closed/0033 で確立したパターン（signal を直接初期化してから呼ぶ）を維持。

### 4. 関連 issue との依存

- [[0046-bug-fix-reconnect-failure-media-leak]] は `reconnectSora` の 1660-1666 行を触り、本 issue の 1662 行修正と物理的に同じ範囲。**0044 を先に着手し、0046 はその上に rebase する** 推奨順。
- [[0047-bug-fix-disconnect-listener-self-check]] は disconnect ハンドラ (1152-1183) に自己同一性チェックを追加。本 issue の 1168 行修正と物理的に同じハンドラ。**0044 を先に着手し、0047 はその上に rebase する** 推奨順。0047 で「ハンドラ先頭で自己同一性 return」が入れば、本 issue の `void cleanupSoraMediaState()` 起動も古いハンドラからは発火しない。
- [[0048-bug-fix-reconnect-double-launch]] は `reconnectSora` 全体に in-flight ガード。本 issue とは別観点だが同関数を触る。abend からの cleanup → reconnect の二重起動を防ぐことで、SDK 主導切断時の timeline 混入抑制を支援する。
- [[0045-bug-fix-update-media-stream-after-disconnect]] とは触る関数が異なる（0045 は `updateMediaStream`）ため衝突なし。

### 5. CHANGES.md エントリ

`CHANGES.md` の `## develop` の `[FIX]` セクション末尾（`### misc` サブセクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `cleanupSoraMediaState` を async 化して呼び出し元が完了を待てる形にする
  - disconnect/reconnect/connectSora 失敗時のタイムラインに古い stop ログが混入する問題を解消する
  - `stopLocalAudioTrack` の rejection もログに残す（旧来は無視）
  - @voluntas
```

### 6. スコープ外

- disconnect ハンドラ (1168) の self-check は [[0047-bug-fix-disconnect-listener-self-check]] で扱う
- `reconnectSora` の失敗時メディアリークは [[0046-bug-fix-reconnect-failure-media-leak]] で扱う
- `reconnectSora` の二重起動防止は [[0048-bug-fix-reconnect-double-launch]] で扱う
- SDK 主導 disconnect 経路での timeline 混入抑制は 0047 / 0048 と組み合わせて達成する（本 issue 単独では解消しない）

## 検証手順

1. `vp dev` で起動 → 接続 → 切断 → 即座に再接続のフローを 5 回繰り返す（明示的な Disconnect ボタン押下経由）。
2. DebugPane の Timeline タブで `stop-video-mediastream-track` / `stop-audio-mediastream-track` ログのタイムスタンプが、対応する `event-on-disconnect` ログの **前** に並んでいる（= 切断完了通知より前に track stop が完了している）ことを確認する。
3. 修正前: `stop-video-...` が `event-on-connected`（次セッション）の **後** に混入する。
4. 修正後: 各セッションの timeline 内で `stop-video-...` / `stop-audio-...` が `event-on-disconnect` の前にあり、`event-on-connected`（次セッション）が `stop-*` より後にしか現れないこと。
5. UI 上の映像消去のタイミングが体感で遅くなっていないこと（`setLocalMediaStream(null)` が同期で先に走ることが前提）。
6. `actions.test.ts` の冪等性テスト（async 化後 + 新規アサーション）が `vp test` で pass すること。

## 完了条件

- `cleanupSoraMediaState` の戻り値が `Promise<void>` であること。
- 5 呼び出し箇所が表のとおり修正されていること（disconnect ハンドラのみ `void` 起動、他は `await`）。
- 擬似コードに示した内部構造（`stopVideoProcessors` / `worker.postMessage({ type: "stop" })` / `closeFakeContentsAudio` / `setLocalMediaStream(null)` の呼び出しと順序）が維持されていること。
- `actions.test.ts` の冪等性テストが async 化され、新規アサーション 3 件と合わせて pass すること。
- 検証手順 4: 各セッション内で `stop-*` が `event-on-disconnect` の前、`event-on-connected`（次セッション）が `stop-*` より後に並ぶこと（手動 Disconnect 経路）。
- 検証手順 5: UI 反応の体感劣化がないこと。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 既存テスト (`vp test`) および既存 Playwright e2e が通ること。

## 解決方法

`src/app/actions.ts` の `cleanupSoraMediaState` を `async` 関数化し、戻り値を `Promise<void>` に変更した。内部の `void (async () => { await stopLocalVideoTrack(...) })()` の fire-and-forget を撤去し、`stopLocalVideoTrack` / `stopLocalAudioTrack` を `Promise.allSettled` で並列に待つ形に統一した。`signals.setLocalMediaStream(null)` は `await` の前に置き、closed/0030 の「signal 即時 null 化で UI から映像を即座に消す」設計を維持している。

`Promise.allSettled` の結果を `const [videoResult, audioResult] = ...` で分割代入し、それぞれの `rejection` を `STOP_LOCAL_VIDEO_TRACK` / `STOP_LOCAL_AUDIO_TRACK` ラベルで `setLogMessages` に渡す。旧コードでは audio 側の rejection を握り潰していたが、本対応で audio 側もログに残るようになった。

呼び出し 5 箇所のうち disconnect コールバック (`soraConnection.on("disconnect", ...)`) のみ `async (event) => { ... }` 化したうえで末尾で `try { await cleanupSoraMediaState(); } catch (error) { ... }` でログ化し、SDK が戻り値 `Promise` を待たない契約に合わせて fire-and-forget となるよう構成した。残り 4 箇所（`connectSora` の `catch`、`reconnectSora` の `createMediaStream` 失敗パス、`reconnectSora` の `attemptReconnection` 全失敗パス、`disconnectSora` 冒頭）はすべて `await cleanupSoraMediaState();` に変更している。

`src/app/actions.test.ts` の冪等性テストを `async` 化し、`await` 完了後に `localMediaStream` が null である / `await` 完了後に `remoteClients` が空である / 2 回連続で `await` しても例外を投げない、の新規アサーション 3 件を追加した。

`CHANGES.md` の `## develop` の `[FIX]` セクション末尾に対応エントリを追記した。

SDK 主導切断（`abend` / サーバ主導切断 / ネットワーク断）経路は、本 issue の方針通りスコープ外として残しており、関連 issue 0047 / 0048 で補完予定。
