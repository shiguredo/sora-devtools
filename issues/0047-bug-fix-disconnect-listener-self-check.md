# 0047-bug-fix-disconnect-listener-self-check

- Priority: High
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-disconnect-listener-self-check
- Polished: 2026-06-09

## 目的

`setSoraCallbacks` で `soraConnection.on("disconnect", ...)` 等に登録したリスナーは、`reconnectSora` で旧接続が破棄された後も解除されない。`sora-js-sdk` 2025.2.0 のリスナー API は `on()` のみで `off` / `removeAllListeners` / `removeListener` は **存在しない**（`node_modules/sora-js-sdk/dist/base.d.ts:183` 確認）ため、解除自体が実装不可能。代わりに、各リスナー先頭で「自分が現在の `signals.sora.value` か」を判定して、一致しない場合は state を破壊しうる処理を skip する自己同一性チェックを導入する。

`disconnect` だけでなく、`notify` / `track` / `removetrack` も `remoteClients` / `setSoraReconnecting` 等の状態を直接書き換えるため、これらにも同じガードを横展開する。`log` / `push` / `signaling` / `timeline` / `message` / `datachannel` / `switched` / `connected` はログ・タイムライン汚染レベルで状態破壊の即時リスクは無いが、整合性のため同パターンを推奨する。

## 優先度根拠

- 再接続成功直後に旧接続の disconnect イベントが遅延発火すると、新セッションの `signals.sora.value` が `null` で上書きされ、UI 上は「再接続成功 → 直後に勝手に切断」という観測になる。
- 旧接続の `track` / `removetrack` / `notify` イベントが新セッションの `remoteClients` を書き換えると、closed/0030 で対処したはずの「映像残り / 誤クライアント混在」が再発する。
- 旧接続の disconnect ハンドラ内の `setSoraReconnecting(true)`（abend 経路）が走ると、新接続にもかかわらず無条件で reconnect ループに入る経路がある。
- 再現条件は SDK の disconnect イベント発火タイミング次第で、ログにも残りにくいため原因特定が難しい。

## 現状の問題

`src/app/actions.ts` の `setSoraCallbacks` は Polished 時点 (2026-06-09) で 1085-1225 行付近、disconnect ハンドラは 1152-1183 行付近にある。実装時に行番号がずれている可能性があるため、関数名 `setSoraCallbacks` と各リスナーの `on("<event>", ...)` 登録箇所を基準に特定すること。

- `grep "soraConnection.off"` は 0 件で、リスナー解除経路は存在しない。
- `sora-js-sdk` の `Sora.connection().on()` は内部で `this.callbacks[kind] = callback` で単一スロット上書き設計（`node_modules/sora-js-sdk/dist/sora.mjs:429-430` 付近）。`off` / `removeAllListeners` / `removeListener` は base.d.ts / publisher.d.ts / subscriber.d.ts / types.d.ts のいずれにも存在しない。
- `reconnectSora` (`actions.ts:1618-1681` 付近) は旧 sora の `await soraValue.disconnect()` を呼ぶ。SDK 内で `await ...; this.callbacks.disconnect(e)` が同期的に発火するが、abend 経路や WebSocket onclose 経路では発火がイベントループを跨ぐ可能性があり、その間に `attemptReconnection` が `signals.setSora(soraConnection)` で新接続を signal にセットすると、旧 sora の disconnect ハンドラが「新セッションの上」で発火する。

disconnect ハンドラが触る signal とその副作用:

| signal 操作                                                                          | 行 (Polished 時点) | 新セッション破壊の重大度                             |
| ------------------------------------------------------------------------------------ | ------------------ | ---------------------------------------------------- |
| `cleanupSoraMediaState()`                                                            | 1168               | 致命: 新セッションの localMediaStream を null にする |
| `stopStatsReportTimer()`                                                             | 1170               | 重要: 新セッションの統計タイマーを止める             |
| `signals.setSora(null)`                                                              | 1171               | 致命: 新接続の参照を失う                             |
| `signals.setSoraSessionId(null)` 等の各種 ID null 化                                 | 1172-1175          | 致命: 新セッションの ID 表示が消える                 |
| `signals.setSoraConnectionStatus("disconnected")`                                    | 1176               | 致命: 新接続を切断表示にする                         |
| `signals.setSoraInfoAlertMessage("disconnected Sora")`                               | 1177               | 重要: 誤情報アラート                                 |
| `signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("disconnected", ...))` | 1178               | 軽微: タイムライン汚染のみ                           |
| `signals.setSoraReconnecting(true)`（abend かつ reconnect 有効時）                   | 1181               | 致命: 新接続を強制 reconnect する                    |

`notify` ハンドラ（1092-1104）は `setNotifyMessages` で履歴を汚し、`handleConnectionCreatedNotify` と `isConnectionDestroyedNotify` 経由で `removeRemoteClientCleanup` を発火させると、新セッションの remoteClient を誤削除する。`track` ハンドラ（1112-1137）は `setRemoteClient` で `remoteClients` を直接書き換える。`removetrack` ハンドラ（1138-1150）は `removeRemoteClient` を呼ぶ。これら 3 ハンドラはいずれも旧接続からの遅延発火で新セッションの状態を確実に壊す。

## 設計方針

### 1. `isCurrent()` ヘルパーで共通ガード

`setSoraCallbacks` 関数の冒頭で、引数の `soraConnection` を捕捉した自己同一性判定ヘルパーを 1 つ用意する。各リスナーの先頭で `if (!isCurrent()) return;` で skip する。

```ts
function setSoraCallbacks(soraConnection: ConnectionPublisher | ConnectionSubscriber): void {
  // 古い接続から遅延発火したイベントが新セッションの signal を破壊するのを防ぐ自己同一性チェック
  const isCurrent = (): boolean => signals.sora.value === soraConnection;

  soraConnection.on("disconnect", (event) => {
    // タイムラインへの記録は古い接続でも行うが、state を破壊する処理は skip する
    signals.setTimelineMessage(
      createSoraDevtoolsTimelineMessage("disconnected", { ... }),
    );
    if (!isCurrent()) return;
    // 以下は新セッションの場合のみ実行（既存の cleanupSoraMediaState / setSora(null) 等）
    ...
  });

  soraConnection.on("notify", (message, transportType) => {
    if (!isCurrent()) return;
    // 既存処理
  });

  soraConnection.on("track", (event) => {
    if (!isCurrent()) return;
    // 既存処理
  });

  soraConnection.on("removetrack", (event) => {
    if (!isCurrent()) return;
    // 既存処理
  });

  // log / push / signaling / timeline / message / datachannel / switched / connected も同パターンで isCurrent() ガード
  ...
}
```

### 2. 必須ハンドラと推奨ハンドラの分離

- **必須**: `disconnect` / `notify` / `track` / `removetrack`。状態破壊リスクがあるため必ず自己同一性チェックを入れる。
- **推奨**: `log` / `push` / `signaling` / `timeline` / `message` / `datachannel` / `switched` / `connected`。タイムライン・ログ汚染レベルだが、`isCurrent()` ヘルパーが既にあるため同パターンを適用するコストは最小。整合性のため全ハンドラに入れる。

### 3. `disconnect` ハンドラの timeline 記録の扱い（2 件の `setTimelineMessage` の区別）

`disconnect` ハンドラ内には `setTimelineMessage` が 2 回ある。

- **記録 1** (Polished 時点で行 1166 直前付近): `setTimelineMessage("event-on-disconnect", message)`。SDK イベントの発火そのものを記録する目的。
- **記録 2** (Polished 時点で行 1178 付近): `setTimelineMessage("disconnected")`。アプリ側の状態遷移（`setSoraConnectionStatus("disconnected")` 等）の一部として記録される。

**`isCurrent()` チェックは記録 1 と記録 2 の間に置く**。理由:

- 記録 1 は古い接続でも記録する。「いつどのセッションが終わったか」を timeline で観察できる方がデバッグに有用。append-only で signal を破壊しないため整合性は崩れない。
- 記録 2 は state 操作（`setSora(null)` 等の一連）の一部で、古い接続では skip させる。新セッションの `event-on-connected` の後に `disconnected` ログが混入すると closed/0030 で確立した整合性が崩れる。

```ts
soraConnection.on("disconnect", (event) => {
  const message = { ... };
  signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-disconnect", message)); // 記録 1
  if (!isCurrent()) return;
  // 以下は新セッションの場合のみ実行
  cleanupSoraMediaState();
  stopStatsReportTimer();
  signals.setSora(null);
  ...
  signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("disconnected")); // 記録 2
  ...
});
```

`notify` / `track` / `removetrack` ではタイムライン記録より先に `isCurrent()` チェックを置く（これらは記録自体が状態に紐づくため、古い接続の記録は混ぜない）。

### 4. abend 経路の `setSoraReconnecting(true)` の扱い

disconnect ハンドラ内の `setSoraReconnecting(true)`（abend + reconnect 有効時）も `isCurrent()` の false 経路では skip される。これにより「古い接続が abend で死んだのに新接続が強制 reconnect される」経路を絶てる。

### 5. SDK の disconnect イベント発火タイミングの根拠

`node_modules/sora-js-sdk/dist/sora.mjs` の `await ...; this.callbacks.disconnect(e)` は基本パスでは同期発火だが、abend 経路や WebSocket onclose 経路はイベントループを跨ぐ可能性がある。本 issue は「すべての発火経路で同期発火する」とは仮定せず、遅延発火の可能性を前提に防御する。

### 6. 関連 issue と依存

- [[0041-bug-fix-track-event-streams-null-check]]: 同じ `setSoraCallbacks` 内の `track` ハンドラを触る。本 issue で `track` ハンドラ先頭に `isCurrent()` ガードを入れるため、0041 の擬似コード（`event.streams.length === 0` 早期 return）と組み合わせる必要がある。**0041 を先に着手し、本 issue で `isCurrent()` ガードを追加する**推奨順。合成後の最終形:

  ```ts
  soraConnection.on("track", (event) => {
    if (!isCurrent()) return; // 0047
    signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-track"));
    if (event.streams.length === 0) {
      // 0041
      signals.setTimelineMessage(
        createSoraDevtoolsTimelineMessage("event-on-track", {
          emptyStreams: true,
          trackId: event.track.id,
          kind: event.track.kind,
        }),
      );
      return;
    }
    // 既存の find / setRemoteClient / registerTrackEndedListener
  });
  ```

  0041 のテスト（`handleTrackEvent` を export して直接呼ぶ方針）は本 issue マージ後、テスト setup で `signals.sora.value` をテスト対象の `soraConnection` と同一参照に揃える必要がある。0041 のテストアサーションには本 issue 適用後を見越して「`isCurrent()` が true の前提で発火」を明記する。

- [[0044-bug-fix-cleanup-sora-media-state-async]]: disconnect ハンドラ内の `cleanupSoraMediaState()` を `void cleanupSoraMediaState()` に変える。本 issue でガードが入れば、古い接続の disconnect から `void cleanupSoraMediaState()` 自体が起動しないため、0044 の方針と整合的。**0044 を先に着手し、本 issue はその上に rebase する**推奨順（0044 側にも明記済み）。
- [[0048-bug-fix-reconnect-double-launch]]: `reconnectSora` のエントリポイントに in-flight ガード追加。本 issue とは独立に有効（先後関係なし）。0048 が `reconnectSora` 全体を直列化しても、`attemptReconnection` 内部の `setSora(soraConnection)` と旧接続イベントのレースは残るため、本 issue は独立に必要。
- 共通テーマ: 0041/0044/0047 が同じ `setSoraCallbacks` を触るため、3 件並行マージ時はコンフリクトが起きやすい。0041 → 0044 → 0047 の順で着手する想定。

### 7. CHANGES.md エントリ

`CHANGES.md` の `## develop` の `[FIX]` セクション末尾（`### misc` サブセクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `setSoraCallbacks` の各リスナーに自己同一性チェックを追加し、古い接続からの遅延発火が新セッションを破壊する問題を修正する
  - sora-js-sdk にリスナー解除 API が無いため、ハンドラ側で `signals.sora.value === soraConnection` を判定する
  - disconnect / notify / track / removetrack の状態破壊リスクのあるハンドラを必須でガードし、他は整合性のため同パターンを適用する
  - @voluntas
```

### 8. スコープ外

- sora-js-sdk への `off` / `removeAllListeners` API 追加要望（SDK 側の改善は別 issue で SDK チームへ）。
- 古い接続の timeline 記録を別 channel に分けて表示する UX 改善（本 issue では一律 `setTimelineMessage` に積む）。
- `notify` ハンドラ内の `handleConnectionCreatedNotify` / `handleSpotlightEvent` の細部見直し。

## 検証手順

旧接続の disconnect イベントを「強制的に遅延発火」させる手段は限定的なため、主に手動でのコード読み合わせと、Playwright e2e による回帰確認が中心。

1. 修正後のコードで `setSoraCallbacks` の各リスナー（`disconnect` / `notify` / `track` / `removetrack` ほか）の先頭または timeline 記録直後に `if (!isCurrent()) return;` が入っていることをコードレビューで確認する。
2. `vp dev` で起動し、`role=sendrecv` で接続 → 切断 → 即座に再接続を 10 回繰り返す。
3. DebugPane の Timeline タブで `disconnected` ログが新セッションの `event-on-connected` の **後ろ** に混入していないことを確認する（既存 0030 の挙動が維持されていること）。
4. UI 上で「再接続成功直後に勝手に切断される」現象が起きないことを確認する。
5. abend を意図的に起こす（network throttling で Offline → Online を繰り返す）。abend 後の自動 reconnect が正常に動き、新セッションが余計な reconnect ループに入らないことを確認する。
6. 既存 Playwright e2e (`tests/sendrecv.test.ts` 等) が全パスで通ることを確認する。

テスト方針: 新規ユニットテストは追加しない。SDK のリスナー発火を実環境なしで再現するのは現実的でなく、`setSoraCallbacks` 全体を export して各ハンドラを直接呼ぶリファクタは本 issue のスコープを超える。手動確認 + 既存 e2e でカバーする。

## 完了条件

- `setSoraCallbacks` 内で `isCurrent()` ヘルパーが 1 度定義され、必須 4 ハンドラ（`disconnect` / `notify` / `track` / `removetrack`）の先頭または timeline 記録直後で `if (!isCurrent()) return;` ガードが入っていること。
- 推奨 8 ハンドラ（`log` / `push` / `signaling` / `timeline` / `message` / `datachannel` / `switched` / `connected`）にも同パターンが入っていること。
- 検証手順 3 / 4 / 5 の挙動を満たすこと。
- disconnect ハンドラの `setSoraReconnecting(true)`（abend + reconnect 有効時）が古い接続からは発火しないこと（検証手順 5 で確認）。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 既存テスト (`vp test`) および既存 Playwright e2e が通ること。
