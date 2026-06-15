# 0047-bug-fix-disconnect-listener-self-check

- Priority: High
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-disconnect-listener-self-check
- Polished: 2026-06-15

## 目的

`setSoraCallbacks` で `soraConnection.on("disconnect", ...)` 等に登録したリスナーは、`reconnectSora` で旧接続が破棄された後も解除されない。`sora-js-sdk` (`package.json` 上 `2026.1.0-canary.1`) のリスナー API は `on<T extends keyof Callbacks>(kind: T, callback: Callbacks[T]): void` のみで、`off` / `removeAllListeners` / `removeListener` は存在しない（`node_modules/sora-js-sdk/dist/base.d.ts` の `Callbacks` API 定義で確認）。解除自体が実装不可能なため、各リスナー先頭で「自分が現在の `signals.sora.value` か」を判定して、一致しない場合は state を破壊しうる処理を skip する自己同一性チェックを導入する。

`disconnect` だけでなく、`notify` / `track` / `removetrack` も `remoteClients` / `setSoraReconnecting` 等の状態を直接書き換えるため、これらにも同じガードを横展開する。`log` / `push` / `signaling` / `timeline` / `message` / `datachannel` / `switched` / `connected` はログ・タイムライン汚染レベルで状態破壊の即時リスクは無いが、整合性のため同パターンを推奨する。

## 優先度根拠

- 再接続成功直後に旧接続の disconnect イベントが遅延発火すると、新セッションの `signals.sora.value` が `null` で上書きされ、UI 上は「再接続成功 → 直後に勝手に切断」という観測になる。
- 旧接続の `track` / `removetrack` / `notify` イベントが新セッションの `remoteClients` を書き換えると、closed/0030 で対処したはずの「映像残り / 誤クライアント混在」が再発する。
- 旧接続の disconnect ハンドラ内の `setSoraReconnecting(true)`（abend 経路）が走ると、新接続にもかかわらず無条件で reconnect ループに入る経路がある。
- 再現条件は SDK の disconnect イベント発火タイミング次第で、ログにも残りにくいため原因特定が難しい。

## 現状の問題

`src/app/actions.ts` の `setSoraCallbacks` を関数名で特定する（行番号は陳腐化するため記載しない）。同関数内に `disconnect` / `notify` / `track` / `removetrack` / `log` / `push` / `timeline` / `signaling` / `message` / `datachannel` / `switched` / `connected` のリスナー登録があり、いずれも `soraConnection.on(...)` で SDK にコールバックを 1 つだけ登録する。

- `grep "soraConnection.off"` は 0 件で、リスナー解除経路は存在しない。
- `sora-js-sdk` の `Sora.connection().on()` は内部で `this.callbacks[kind] = callback` の単一スロット上書き設計（`node_modules/sora-js-sdk/dist/sora.js` は minified bundle なので可読性は低いが、`on(e, t) { e in this.callbacks && (this.callbacks[e] = t); }` の実装で確認できる）。
- `reconnectSora` は旧 sora の `await soraValue.disconnect()` を呼ぶ。SDK 内で `await ...; this.callbacks.disconnect(e)` が呼ばれるが、WebSocket onclose 経路や abend 経路では non-`await` で `this.callbacks.disconnect(t)` が呼ばれる箇所もあり、これらは task queue に積まれてイベントループを跨ぐ可能性がある。旧接続のハンドラが「新セッションの上」で発火するレースが残る。

disconnect ハンドラが触る signal と新セッション破壊の重大度:

| signal 操作                                                                     | 新セッション破壊の重大度                             |
| ------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `setTimelineMessage("event-on-disconnect", message)`                            | 軽微: タイムライン記録のみ                           |
| `stopStatsReportTimer()`                                                        | 重要: 新セッションの統計タイマーを止める             |
| `signals.setSora(null)`                                                         | 致命: 新接続の参照を失う                             |
| `signals.setSoraSessionId(null)` 等の各種 ID null 化                            | 致命: 新セッションの ID 表示が消える                 |
| `signals.setSoraConnectionStatus("disconnected")`                               | 致命: 新接続を切断表示にする                         |
| `signals.setSoraInfoAlertMessage("disconnected Sora")`                          | 重要: 誤情報アラート                                 |
| `signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("disconnected"))` | 軽微: タイムライン汚染のみ                           |
| `signals.setSoraReconnecting(true)`（abend かつ reconnect 有効時）              | 致命: 新接続を強制 reconnect する                    |
| `await cleanupSoraMediaState()`（末尾、try / catch でログ化）                   | 致命: 新セッションの localMediaStream を null にする |

`notify` ハンドラは `handleSpotlightEvent` / `handleConnectionCreatedNotify` / `isConnectionDestroyedNotify` 経由で `removeRemoteClientCleanup` を発火させ、`setNotifyMessages` で履歴を汚す（`setTimelineMessage` は呼ばない）。`track` ハンドラは冒頭で `setTimelineMessage("event-on-track")` を呼んだ後、`setRemoteClient` で `remoteClients` を直接書き換える。`removetrack` ハンドラは冒頭で `setTimelineMessage("event-on-removetrack")` を呼んだ後 `removeRemoteClientCleanup` を呼ぶ。これら 3 ハンドラはいずれも旧接続からの遅延発火で新セッションの状態を確実に壊す。

## 設計方針

### `isCurrent()` ヘルパーで共通ガード

`setSoraCallbacks` 関数の冒頭で、引数の `soraConnection` を捕捉した自己同一性判定ヘルパーを 1 つ用意する。各リスナーの先頭または timeline 記録直後で `if (!isCurrent()) return;` で skip する。

```ts
function setSoraCallbacks(soraConnection: ConnectionPublisher | ConnectionSubscriber): void {
  // 古い接続から遅延発火したイベントが新セッションの signal を破壊するのを防ぐ自己同一性チェック
  const isCurrent = (): boolean => signals.sora.value === soraConnection;
  // ... 各リスナー（後述）
}
```

### 必須ハンドラと推奨ハンドラの分離

- **必須**: `disconnect` / `notify` / `track` / `removetrack`。状態破壊リスクがあるため必ず自己同一性チェックを入れる。
- **推奨**: `log` / `push` / `signaling` / `timeline` / `message` / `datachannel` / `switched` / `connected`。タイムライン・ログ汚染レベルだが、`isCurrent()` ヘルパーが既にあるため同パターンを適用するコストは最小。整合性のため全ハンドラに入れる。

### disconnect ハンドラのガード位置（記録 1 と記録 2 の区別）

disconnect ハンドラ内には timeline 記録が 2 回ある:

- **記録 1**: `setTimelineMessage("event-on-disconnect", message)`。SDK イベントの発火そのものを記録する目的。
- **記録 2**: `setTimelineMessage("disconnected")`。アプリ側の状態遷移（`setSoraConnectionStatus("disconnected")` 等）の一部として記録される。

**`isCurrent()` チェックは記録 1 と記録 2 の間に置く**。理由:

- 記録 1 は古い接続でも記録する。「いつどのセッションが終わったか」を timeline で観察できる方がデバッグに有用。append-only で signal を破壊しないため整合性は崩れない。
- 記録 2 は state 操作（`setSora(null)` 等の一連）の一部で、古い接続では skip させる。新セッションの `event-on-connected` の後に `disconnected` ログが混入すると closed/0030 で確立した整合性が崩れる。

[[closed/0044-bug-fix-cleanup-sora-media-state-async]] により disconnect ハンドラは既に `async (event) => { ... await cleanupSoraMediaState(); }` の形に変更済み。`await cleanupSoraMediaState()` も `isCurrent()` の false 経路では skip され、旧接続のハンドラから新セッションの localMediaStream を破壊しなくなる。

```ts
soraConnection.on("disconnect", async (event) => {
  const message: Record<string, unknown> = {
    type: event.type,
    title: event.title,
  };
  if (event.code !== undefined) message.code = event.code;
  if (event.reason !== undefined) message.reason = event.reason;
  if (event.params !== undefined) message.params = event.params;
  // 記録 1: 古い接続でも記録する
  signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-disconnect", message));
  if (!isCurrent()) return;
  // 以下は新セッションの場合のみ実行（既存処理）
  const reconnectValue = signals.reconnect.value;
  stopStatsReportTimer();
  signals.setSora(null);
  // ... 各種 ID null 化、setSoraConnectionStatus("disconnected")、setSoraInfoAlertMessage、
  // 記録 2: setTimelineMessage("disconnected")
  // setSoraReconnecting(true)（abend + reconnect 有効時）
  try {
    await cleanupSoraMediaState();
  } catch (error) {
    signals.setLogMessages({
      title: "CLEANUP_SORA_MEDIA_STATE",
      description: getErrorMessage(error),
    });
  }
});
```

### `notify` / `track` / `removetrack` ハンドラのガード位置

`notify` ハンドラはタイムライン記録を呼ばないため、ハンドラ先頭で `isCurrent()` チェック → skip で問題ない。

`track` / `removetrack` ハンドラは冒頭で `setTimelineMessage("event-on-track")` / `setTimelineMessage("event-on-removetrack")` を呼んでいる（append-only で state 破壊なし）。これは disconnect の「記録 1」と同じ位置付けで、古い接続でも記録する方がデバッグに有用。**timeline 記録の直後に `isCurrent()` を置く**。

### 0041 との合成（thin wrapper パターン）

[[0041-bug-fix-track-event-streams-null-check]] は `handleTrackEvent` を `actions.ts` のトップレベル関数として `export` し、`setSoraCallbacks` 内では `soraConnection.on("track", handleTrackEvent)` の形で渡す設計を採用している。本 issue の `isCurrent()` は `setSoraCallbacks` のクロージャに依存するため、`handleTrackEvent` 内で `isCurrent()` を直接呼ぶことはできない。

合成は `setSoraCallbacks` 側で **thin wrapper** を入れる形にする。`handleTrackEvent` 自体は触らない。

```ts
soraConnection.on("track", (event) => {
  // 0041 の handleTrackEvent は冒頭で setTimelineMessage("event-on-track") を呼ぶため、
  // wrapper 側でその記録を残してから isCurrent() チェックすると 0041 の処理と二重発火する。
  // 0041 の handleTrackEvent 内には setTimelineMessage が含まれるので、
  // isCurrent() は wrapper 先頭で判定し、true のときだけ handleTrackEvent を呼ぶ。
  // 旧接続からの発火は timeline 含めて完全に skip する（remoteClients 破壊リスクが大きいため）。
  if (!isCurrent()) return;
  handleTrackEvent(event);
});
```

0041 のテスト（`handleTrackEvent` を `actions.test.ts` で直接呼ぶ）は本 issue マージ後も影響を受けない（テストは wrapper を通らず純粋に `handleTrackEvent` を呼ぶため）。本 issue で `setSoraCallbacks` 内の wrapper 経由の挙動はテスト対象外のまま。

`removetrack` ハンドラは 0041 で触らないため、本 issue でハンドラ本体を直接書き換えて timeline 記録の直後に `isCurrent()` を置く。

### abend 経路の `setSoraReconnecting(true)` の扱い

disconnect ハンドラ内の `setSoraReconnecting(true)`（abend + reconnect 有効時）も `isCurrent()` の false 経路では skip される。これにより「古い接続が abend で死んだのに新接続が強制 reconnect される」経路を絶てる。[[0048-bug-fix-reconnect-double-launch]] の二重起動防止と組み合わせると、abend 経路全体で「古い接続由来の reconnect 起動」を確実に止められる。

### SDK の disconnect イベント発火タイミングの根拠

`sora.js`（minified）の `this.callbacks.disconnect(t)` 呼び出しは複数箇所にあり、WebSocket `onclose` のハンドラから呼ばれる経路は task queue を跨ぐ。本 issue は「すべての発火経路で同期発火する」とは仮定せず、遅延発火の可能性を前提に防御する。

### 関連 issue

- [[0041-bug-fix-track-event-streams-null-check]]: 同じ `setSoraCallbacks` 内の `track` ハンドラを触る。本 issue は thin wrapper パターンで合成する（前節）。0041 → 0047 の順でマージする想定。
- [[0048-bug-fix-reconnect-double-launch]]: `reconnectSora` のエントリポイントに in-flight ガード追加。本 issue とは独立に有効。0048 が `reconnectSora` 全体を直列化しても、`attemptReconnection` 内部の `setSora(soraConnection)` と旧接続イベントのレースは残るため、本 issue は独立に必要。
- [[closed/0044-bug-fix-cleanup-sora-media-state-async]]: 既に closed。disconnect ハンドラは async + 末尾 `await cleanupSoraMediaState()` の形になっており、本 issue はその上に `isCurrent()` ガードを追加する。
- 共通テーマ: 0041 / 0047 が同じ `setSoraCallbacks` を触るため、両者マージ時はコンフリクトに注意。

### CHANGES.md エントリ

`CHANGES.md` の `## develop` 内 `[FIX]` セクション末尾（`### misc` セクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `setSoraCallbacks` の各リスナーに自己同一性チェックを追加し、古い接続からの遅延発火が新セッションを破壊する問題を修正する
  - sora-js-sdk にリスナー解除 API が無いため、ハンドラ側で `signals.sora.value === soraConnection` を判定する
  - disconnect / notify / track / removetrack の状態破壊リスクのあるハンドラを必須でガードし、他は整合性のため同パターンを適用する
  - @voluntas
```

### スコープ外

- sora-js-sdk への `off` / `removeAllListeners` API 追加要望（SDK 側の改善は別 issue で SDK チームへ）。
- 古い接続の timeline 記録を別 channel に分けて表示する UX 改善（本 issue では一律 `setTimelineMessage` に積む）。
- `notify` ハンドラ内の `handleConnectionCreatedNotify` / `handleSpotlightEvent` の細部見直し。

## テスト戦略

新規ユニットテストは追加しない。SDK のリスナー発火を実環境なしで再現するのは現実的でなく、`setSoraCallbacks` 全体を export して各ハンドラを直接呼ぶリファクタは本 issue のスコープを超える。手動確認 + 既存 e2e でカバーする。

## 検証手順

旧接続の disconnect イベントを「強制的に遅延発火」させる手段は限定的なため、主に手動でのコード読み合わせと、Playwright e2e による回帰確認が中心。

1. 修正後のコードで `setSoraCallbacks` の各リスナー（`disconnect` / `notify` / `track` / `removetrack` ほか）の先頭または timeline 記録直後に `if (!isCurrent()) return;` が入っていることをコードレビューで確認する。
2. `pnpm dev` で起動し、`role=sendrecv` で接続 → 切断 → 即座に再接続を 10 回繰り返す。
3. DebugPane の Timeline タブで `disconnected` ログが新セッションの `event-on-connected` の **後ろ** に混入していないことを確認する（closed/0030 の挙動が維持されていること）。
4. UI 上で「再接続成功直後に勝手に切断される」現象が起きないことを確認する。
5. abend を意図的に起こす（network throttling で Offline → Online を繰り返す）。abend 後の自動 reconnect が正常に動き、新セッションが余計な reconnect ループに入らないことを確認する。

## 完了条件

- `setSoraCallbacks` 内で `isCurrent()` ヘルパーが 1 度定義され、必須 4 ハンドラ（`disconnect` / `notify` / `track` / `removetrack`）の先頭または timeline 記録直後で `if (!isCurrent()) return;` ガードが入っていること。
- 推奨 8 ハンドラ（`log` / `push` / `signaling` / `timeline` / `message` / `datachannel` / `switched` / `connected`）にも同パターンが入っていること。
- 検証手順 3 / 4 / 5 の挙動を満たすこと。
- disconnect ハンドラの `setSoraReconnecting(true)`（abend + reconnect 有効時）が古い接続からは発火しないこと（検証手順 5 で確認）。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 既存テスト（`pnpm test`）および既存 Playwright e2e（`pnpm test:e2e`）が通ること。
