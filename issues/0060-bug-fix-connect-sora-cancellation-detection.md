# 0060-bug-fix-connect-sora-cancellation-detection

- Priority: Medium
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-connect-sora-cancellation-detection
- Polished: 2026-06-15

## 目的

`connectSora` が `preparing` / `connecting` 状態の途中でユーザーから Disconnect を押された場合、`disconnectSora` は `soraValue == null` で SDK 切断をスキップし `setSoraConnectionStatus("disconnected")` を立てるが、並列で動いている `connectSora` が `setSoraConnectionStatus("connecting")` で上書きし、最終的に `setSoraConnectionStatus("connected")` で接続が確立してしまう経路がある。ユーザーは Disconnect を押したのに接続される UX バグ。`connectSora` 内の各 `await` 直後で `connectionStatus.value === "disconnected"` を検知して接続を放棄する仕組みを追加する。

## 優先度根拠

- 即時のクラッシュではないため High ではない。
- ユーザーが Disconnect を押したのに接続される UX バグで、不安定な操作（接続ボタンを押した直後の Disconnect）で踏みやすい。Low ではない。
- 修正は `connectSora` 内の各 `await` ポイントへのキャンセル検知の追加で、影響範囲は `src/app/actions.ts` の 1 関数。
- Medium で確定する。

## 現状の問題

行番号は陳腐化するため記載しない。`src/app/actions.ts` の `connectSora` / `disconnectSora` を関数名で特定する。

### `connectSora` のフロー

1. `setSoraConnectionStatus("preparing")` （冒頭）
2. `await soraValue.disconnect()` （既存接続あり時）
3. `await createMediaStream(state)` （sendrecv / sendonly）
4. `setSoraConnectionStatus("connecting")`
5. `setSora(soraConnection)`
6. `await soraConnection.connect(mediaStream)`
7. 成功時: `await setStatsReportInternal(soraConnection)` → `setSoraConnectionStatus("connected")`

### `disconnectSora` の挙動（既存）

`disconnectSora` 内:

```ts
const soraValue = signals.sora.value;
const connectionStatusValue = signals.connectionStatus.value;
await cleanupSoraMediaState();
stopStatsReportTimer();
if (connectionStatusValue === "disconnected") {
  return;
}
if (soraValue && (connectionStatusValue === "connected" || ...)) {
  signals.setSoraConnectionStatus("disconnecting");
  await soraValue.disconnect();
}
signals.setSoraConnectionStatus("disconnected");
```

`connectSora` の `preparing` 中（`signals.sora` がまだ null）に Disconnect が押されると、`soraValue == null` のため `signals.setSoraConnectionStatus("disconnecting")` も `await soraValue.disconnect()` もスキップされ、最後の `signals.setSoraConnectionStatus("disconnected")` だけが立つ。

その後 `connectSora` は処理を継続し、`setSoraConnectionStatus("connecting")` で上書きしてしまう。

### 並列タイミング

例えば次の経路:

1. ユーザーが Connect ボタン押下 → `connectSora` 起動
2. `setSoraConnectionStatus("preparing")` 完了
3. `await createMediaStream(state)` 中（gum 取得中）
4. ユーザーが Disconnect ボタン押下 → `disconnectSora` 起動
5. `disconnectSora` は `connectionStatus === "preparing"` を見て `if (soraValue && ...)` で false → `setSoraConnectionStatus("disconnected")` だけ立てる
6. `createMediaStream` 完了 → `connectSora` が処理継続 → `setSoraConnectionStatus("connecting")` → `setSora(soraConnection)` → `await soraConnection.connect(mediaStream)` → 成功 → `setSoraConnectionStatus("connected")`

結果: ユーザーが Disconnect を押したにもかかわらず接続が確立する。

## 設計方針

### `connectSora` の各 `await` 直後にキャンセル検知

`connectSora` 内の各 `await` 直後に「`signals.connectionStatus.value === "disconnected"` ならキャンセル扱いで放棄する」処理を入れる。検知ポイントは:

- `await soraValue.disconnect()` 直後（既存接続あり時）
- `await createMediaStream(state)` 直後
- `await (soraConnection as ConnectionPublisher).connect(mediaStream)` 直後
- `await (soraConnection as ConnectionSubscriber).connect()` 直後

キャンセル時のリソース解放は次の手順:

- ローカル変数 `mediaStream` が non-null なら全 track を stop する
- ローカル変数 `audioContext` が non-null なら `void audioContext.close()`
- `soraConnection` が生成済みで未 connect の場合は副作用なし。connect が完了している場合は `void soraConnection.disconnect()` を呼ぶ（disconnect の失敗は無視。`disconnectSora` 側で signal はすでに `disconnected` に揃っているため）
- `signals.setSora(null)` で参照を整理する（既に `setSora(soraConnection)` を呼んだ後の場合のみ）

### 共通ヘルパーで重複を抑える

検知ポイントが複数あるため、`connectSora` 内のローカルヘルパー関数として共通化する:

```ts
// connectSora 内ローカル変数として宣言（mediaStream / audioContext / soraConnection を closure 捕捉）
const abortIfCancelled = (): boolean => {
  if (signals.connectionStatus.value !== "disconnected") {
    return false;
  }
  // ユーザーが Disconnect を押した。ローカル変数として生成済みの資源を解放する。
  if (mediaStream) {
    for (const track of mediaStream.getTracks()) {
      track.stop();
    }
  }
  if (audioContext) {
    void audioContext.close();
  }
  if (soraConnection && signals.sora.value === soraConnection) {
    // setSora で参照済みだった場合は signal も整理する
    signals.setSora(null);
    void soraConnection.disconnect();
  }
  return true;
};
```

各 `await` 直後で次のように使う:

```ts
await createMediaStream(state).catch(...);
if (abortIfCancelled()) return;
```

### 設計上の判断

- **`setSoraConnectionStatus("disconnected")` を再度立てない**: `disconnectSora` が既に `disconnected` を立てているため、`connectSora` 側は上書きしないようにする。ヘルパー内で `signal.connectionStatus` を一切書き換えない。
- **`cleanupSoraMediaState` を呼ばない**: `disconnectSora` 側で既に `await cleanupSoraMediaState()` が走っているため重複呼び出しは不要。本ヘルパーはローカル変数の解放のみに責務を限定する（[[0045-bug-fix-update-media-stream-after-disconnect]] / [[0046-bug-fix-reconnect-failure-media-leak]] と同じ「ローカル変数で stop/close」パターン）。
- **`setSoraInfoAlertMessage` / timeline メッセージは出さない**: キャンセルは正常系操作の一つで、ユーザーには既に「Disconnect を押した」事実だけ伝わっていれば十分。「キャンセルしました」アラートは別 issue で扱う。
- **`closed/0007` の設計を維持**: `DisconnectButton` の `disabled` に `preparing` を追加するアプローチ（closed/0055 で却下）は採用しない。`preparing` / `connecting` 中の Disconnect を意図的にサポートする closed/0007 の方針は維持し、本 issue は「`connectSora` 側でキャンセル意図を観測する」補完的な変更。

### エッジケース一覧

| `connectSora` の進行段階                                     | Disconnect 押下時点の signal                             | 修正前の挙動                   | 修正後の挙動                                                      |
| ------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------- |
| `preparing` 直後（既存接続なし）                             | `connectionStatus = "disconnected"`                      | `connecting` 上書き → 接続確立 | `await createMediaStream` 後に放棄、最終 status は `disconnected` |
| `await createMediaStream` 中（gum 取得中）                   | `connectionStatus = "disconnected"`                      | 同上                           | gum 取得後すぐ放棄、mediaStream を stop                           |
| `await soraConnection.connect` 中                            | `connectionStatus = "disconnected"`                      | 接続完了後 `connected` 上書き  | connect 完了後に放棄、`soraConnection.disconnect()` を呼ぶ        |
| 既に接続済みで再接続中の `await soraValue.disconnect()` 直後 | `connectionStatus = "disconnected"`                      | 後続処理が走って再接続される   | `await soraValue.disconnect()` 後に放棄                           |
| 正常系（Disconnect 押されない）                              | `connectionStatus` は preparing → connecting → connected | 接続確立                       | 変化なし（既存の `connected` 経路を通る）                         |

### 「`await soraValue.disconnect()`」直後の検知の意味

既存接続あり時の `await soraValue.disconnect()` 直後にも検知を入れる理由: ユーザーが既存接続中に Connect を押した場合、`connectSora` は先に旧 sora を disconnect してから新接続を作る。この `await` 中に Disconnect が押された場合（実装上希少だが）、`disconnectSora` は旧 sora の `disconnect` 中にもう一度 `disconnect` を呼ぶ形になる。ここで放棄しないと旧 sora の disconnect 完了後に新接続が立ち上がる経路が残る。

## テスト戦略

`connectSora` は `navigator.mediaDevices.getUserMedia` と Sora 接続を含み jsdom 環境では実行不可能、モック禁止規約と両立する純粋関数化が現実的でないため、本 issue では新規 Vitest テストは追加しない。後述の検証手順で手動確認する。Playwright e2e は競合タイミング再現の難易度が高いため別 issue で扱う。

## CHANGES.md エントリ

`CHANGES.md` の `## develop` 内 `[FIX]` セクション末尾（`### misc` セクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `connectSora` の `preparing` / `connecting` 中に Disconnect を押されたときに接続が確立してしまう問題を修正する
  - `connectSora` 内の各 `await` 直後に `connectionStatus === "disconnected"` を検知し、放棄時にローカル変数の `mediaStream` / `audioContext` / `soraConnection` を解放する
  - closed/0007 の「`preparing` / `connecting` 中の Disconnect を意図的にサポート」設計は維持する
  - @voluntas
```

## スコープ外

下記は本 issue では扱わない:

- **`disconnectSora` 側の改修**: `disconnectSora` は `soraValue` の null チェックで SDK 切断をスキップする既存設計を維持する。本 issue は `connectSora` 側でキャンセル意図を観測する補完的な変更で、`disconnectSora` の構造は触らない。
- **キャンセル時のアラート通知**: 「Connect 操作をキャンセルしました」を AlertMessages で通知する UI 改善は別 issue。
- **`connectSora` の in-flight ガード**: [[0048-bug-fix-reconnect-double-launch]] の `reconnectSora` と同形の wrapper 追加は別 issue で扱う。本 issue はキャンセル検知のみ。
- **`reconnectSora` への同種キャンセル検知**: `reconnectSora` も同種の構造を持つが、`attemptReconnection` のループ内 `if (!signals.reconnecting.value) break;` で別経路のキャンセル検知が既にある。`disconnected` 観測の追加は別 issue で検討。

## 関連 issue

- [[closed/0055-bug-fix-disconnect-button-preparing]]: 本 issue の「真のバグ」を抽出した close 済 issue。closed/0055 は「`DisconnectButton` の `disabled` に `preparing` を追加」案だったが closed/0007 と矛盾するため close され、本 issue が真の対処として起票された。
- [[closed/0007-fix-disconnect-during-connecting]]: 「`preparing` / `connecting` 中の Disconnect を意図的にサポート」設計を確立した過去 issue。本 issue はその設計を維持しつつ、`connectSora` 側でキャンセル検知を実装する。
- [[0048-bug-fix-reconnect-double-launch]]: `reconnectSora` の in-flight ガード。本 issue の `connectSora` キャンセル検知とは別観点だが、同関数群の防御強化として整合する。
- [[0045-bug-fix-update-media-stream-after-disconnect]] / [[0046-bug-fix-reconnect-failure-media-leak]]: ローカル変数で stop/close するパターンの先例。本 issue はその責務分担を `connectSora` キャンセル時にも適用する。

## 検証手順

### A. 修正前の再現（develop ブランチで実施）

1. `pnpm dev` で起動し `?role=sendrecv&mediaType=getUserMedia` で開く。
2. Connect ボタンを押下し、ブラウザの権限プロンプトが出たら **承認せずに残したまま** Disconnect を押す（gum 取得中の `await` を捕捉する）。
3. 修正前: 権限プロンプトを承認すると、`connectSora` が処理を継続して `setSoraConnectionStatus("connecting")` → `connected` まで遷移し、UI 上接続が確立する。
4. `?mediaType=fakeMedia` の場合は gum 取得が同期に近く再現が難しい。`await soraConnection.connect` 中の検知は Playwright で `route.continue()` を遅延させる等で再現可能だが、本検証では gum 経路で代表確認する。

### B. 修正後の確認

5. 同じ手順で:
   - 手順 2 で権限プロンプト承認 → `await createMediaStream` 完了直後に `abortIfCancelled()` が true を返し、`mediaStream` の track を stop して return する。UI は `disconnected` 状態のまま、接続は確立しない。
6. Connect → 即座に Disconnect（権限プロンプトを出さずに）の連続操作でも、`abortIfCancelled()` が `await soraConnection.connect` 完了直後に検知して、生成済み `soraConnection` の `disconnect()` を呼んで放棄することを確認する。

### C. 既存接続中の再接続キャンセル

7. 接続成功状態で再度 Connect を押す（既存 sora の disconnect が走る経路）→ `await soraValue.disconnect()` 中に Disconnect を押すと、`abortIfCancelled()` が disconnect 完了後に検知して放棄する。最終的に UI は `disconnected` で、旧 sora は disconnect 完了、新 sora は作られない。

### D. 正常系の回帰

8. Connect → そのまま放置 → `connected` 状態に到達することを確認する（キャンセル検知が誤発火しないこと）。
9. Connect → Connect 完了後に Disconnect → 正常に切断されることを確認する（既存挙動の維持）。
10. fakeMedia / getUserMedia / mp4Media / getDisplayMedia の各 mediaType で D の 8 を実行する。

### E. テスト

11. `pnpm test` が pass すること。
12. 既存 Playwright e2e（`pnpm test:e2e`）が pass すること。

## 完了条件

- 検証手順 A-E すべてが通過すること。
- `connectSora` の `preparing` / `connecting` 中にユーザーが Disconnect を押した場合、`connectSora` が接続を完了させずに放棄すること。
- 放棄時に取得済みの `mediaStream` の track が確実に stop されること。
- 放棄時に生成済みの `soraConnection` が `disconnect()` され `setSora(null)` で整理されること。
- closed/0007 の「`preparing` 中の Disconnect も意図的にサポート」設計が維持されていること（`DisconnectButton` の `disabled` に `preparing` を追加するアプローチは採用しない）。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 既存テスト（`pnpm test`）および既存 Playwright e2e が pass すること。
