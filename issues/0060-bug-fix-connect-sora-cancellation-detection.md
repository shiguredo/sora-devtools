# 0060-bug-fix-connect-sora-cancellation-detection

- Priority: Medium
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-connect-sora-cancellation-detection
- Polished: 2026-06-16

## 目的

`connectSora` が `preparing` / `connecting` 状態の途中でユーザーから Disconnect を押された場合、 `disconnectSora` は `soraValue == null` で SDK 切断をスキップし `setSoraConnectionStatus("disconnected")` を立てるが、並列で動いている `connectSora` が `setSoraConnectionStatus("connecting")` で上書きし、最終的に `setSoraConnectionStatus("connected")` で接続が確立してしまう経路がある。ユーザーは Disconnect を押したのに接続される UX バグ。 `connectSora` 内の各 `await` 直後で `connectionStatus.value === "disconnected"` を検知して接続を放棄する仕組みを追加する。

## 優先度根拠

- 即時のクラッシュではないため High ではない。
- ユーザーが Disconnect を押したのに接続される UX バグで、不安定な操作 (接続ボタンを押した直後の Disconnect) で踏みやすい。 Low ではない。
- 修正は `connectSora` 内の各 `await` ポイントへのキャンセル検知の追加で、影響範囲は `src/app/actions.ts` の 1 関数。
- Medium で確定する。

## 現状の問題

行番号は陳腐化するため記載しない。 `src/app/actions.ts` の `connectSora` / `disconnectSora` を関数名で特定する。

### `connectSora` のフロー (現状)

`connectSora` 本体は以下の流れで動く。 try ブロック外の早期 await ( `soraValue.disconnect()` ) と try ブロック内の各 await、 try ブロック後の成功経路の 3 領域に分かれる。

1. `setTimelineMessage("start-connection")` + `setSoraConnectionStatus("preparing")` (try ブロック外)
2. 既存接続あり時の `await soraValue.disconnect()` (try ブロック外、 `forceCreateMediaStream = true` をセット)
3. `prepareSignalingConnection` で接続前準備、ローカル変数 `soraConnection` / `mediaStream` / `gainNode` / `audioContext` を宣言 (try ブロック外)
4. try ブロック開始
5. `createSoraConnectionByRole` で `soraConnection` を生成 (同期)
6. sendrecv / sendonly の場合の mediaStream 準備:
   - 6a. 既存 `localMediaStreamValue` を再利用 (同期、 `!forceCreateMediaStream && localMediaStreamValue` 条件)
   - 6b. または `await createMediaStream(state).catch(...)` で新規取得 (失敗時は catch 内で `setSoraErrorAlertMessage` + `setSoraConnectionStatus("disconnected")` + throw)
7. sendrecv / sendonly の場合: `setSoraConnectionStatus("connecting")` → `setSora(soraConnection)` → `await soraConnection.connect(mediaStream)`
8. recvonly の場合: `setSoraConnectionStatus("connecting")` → `setSora(soraConnection)` → `await soraConnection.connect()`
9. try ブロック後 (成功経路): `setSoraInfoAlertMessage` → `await setStatsReportInternal(soraConnection)` → `startStatsReportTimer` → 条件付き `setLocalMediaStream(mediaStream)` → 条件付き `setFakeContentsAudio` → `setSoraConnectionStatus("connected")` → `setTimelineMessage("connected")`

### `disconnectSora` の挙動 (現状)

`disconnectSora` は以下の流れで動く (実コードに沿った擬似コード):

```ts
const soraValue = signals.sora.value;
const connectionStatusValue = signals.connectionStatus.value;
await cleanupSoraMediaState();
stopStatsReportTimer();
if (connectionStatusValue === "disconnected") {
  return;
}
if (
  soraValue &&
  (connectionStatusValue === "connected" ||
    connectionStatusValue === "connecting" ||
    connectionStatusValue === "preparing")
) {
  signals.setSoraConnectionStatus("disconnecting");
  await soraValue.disconnect();
}
signals.setSoraConnectionStatus("disconnected");
signals.setSoraReconnecting(false);
```

`connectSora` の `preparing` 中 ( `signals.sora` がまだ null) に Disconnect が押されると、 `soraValue == null` のため `setSoraConnectionStatus("disconnecting")` も `await soraValue.disconnect()` もスキップされ、最後の `setSoraConnectionStatus("disconnected")` と `setSoraReconnecting(false)` だけが立つ。 その後 `connectSora` は処理を継続し、 `setSoraConnectionStatus("connecting")` で上書きしてしまう。

### 並列タイミングの代表例

例えば次の経路:

1. ユーザーが Connect ボタン押下 → `connectSora` 起動
2. `setSoraConnectionStatus("preparing")` 完了
3. `await createMediaStream(state)` 中 (gum 取得中)
4. ユーザーが Disconnect ボタン押下 → `disconnectSora` 起動
5. `disconnectSora` は `await cleanupSoraMediaState()` を開始
6. 順序の不確実性: `disconnectSora` の `cleanupSoraMediaState` 完了と `connectSora` の `createMediaStream` 完了のどちらが先かは保証されない。
   - `disconnectSora` が先に `setSoraConnectionStatus("disconnected")` を立てた場合: `connectSora` の `createMediaStream` 完了直後の `abortIfCancelled` が `connectionStatus === "disconnected"` を検知して放棄する (本 issue の修正で防げる)。
   - `connectSora` が先に `createMediaStream` から復帰した場合: `disconnectSora` の `cleanupSoraMediaState` が完了する前に `connectSora` が `setSoraConnectionStatus("connecting")` まで進む可能性。 その後 `disconnectSora` が後追いで `setSoraConnectionStatus("disconnected")` を立てる。 次の `await` (`await soraConnection.connect(...)`) 直後の `abortIfCancelled` でようやく検知される。
7. 結果: いずれの順序でも、本 issue の修正 (各 `await` 直後の `abortIfCancelled`) で「最終的にどこかの `await` 直後で `connectionStatus === "disconnected"` を観測して放棄する」ことが保証される (`setStatsReportInternal` まで含めれば例外なく観測可能)。

## 設計方針

### 検知ポイントの完全リスト

`connectSora` 内の以下のすべての `await` 直後で `abortIfCancelled()` を呼ぶ。 検知ポイントは合計 5 箇所:

- **try ブロック外**:
  1. `await soraValue.disconnect()` 直後 (既存接続あり時、 `forceCreateMediaStream = true` セット後)
- **try ブロック内**: 2. `await createMediaStream(state).catch(...)` 直後 (新規取得パスのみ。 既存 `localMediaStream` 再利用パス (`mediaStream = localMediaStreamValue` の同期代入) は `await` を踏まないため検知ポイントの直後ではないが、後続の `setSoraConnectionStatus("connecting")` の前で同じ `abortIfCancelled` を一度呼ぶ) 3. `await (soraConnection as ConnectionPublisher).connect(mediaStream)` 直後 (sendrecv / sendonly) 4. `await (soraConnection as ConnectionSubscriber).connect()` 直後 (recvonly)
- **try ブロック後 (成功経路)**: 5. `await setStatsReportInternal(soraConnection)` 直後

検知ポイント 5 (`setStatsReportInternal` 直後) を入れる理由: 検知ポイント 3 / 4 (`soraConnection.connect(...)` 直後) で disconnected が成立しない場合でも、 `await setStatsReportInternal(soraConnection)` 中に Disconnect が押される可能性が残るため、ここでも検知して `setSoraConnectionStatus("connected")` を立てる前に放棄する。

### `abortIfCancelled` ヘルパー

`connectSora` 内のローカルヘルパー関数として共通化する。 ローカル変数 `mediaStream` / `audioContext` / `soraConnection` を closure 捕捉する。 ヘルパー宣言の位置は **`prepareSignalingConnection` 直後 ( `let soraConnection` 等のローカル変数宣言の直後、 try ブロックの直前)** とする。 検知ポイント 1 ( `await soraValue.disconnect()` 直後) はヘルパー宣言より前なので、 別の専用ガード ( `if (signals.connectionStatus.value === "disconnected") return;` の 1 行) で対応する (検知ポイント 1 時点ではローカル変数 `mediaStream` / `audioContext` / `soraConnection` がまだ undefined のため解放処理が不要)。

```ts
// 検知ポイント 1 用の専用ガード (let 変数宣言前のため abortIfCancelled は使えない)
const soraValue = signals.sora.value;
if (soraValue) {
  await soraValue.disconnect();
  if (signals.connectionStatus.value === "disconnected") {
    // ユーザーが Disconnect を押した。 旧 sora の disconnect は完了済み、 新接続は作らないで放棄する。
    signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-connect-cancelled"));
    return;
  }
  forceCreateMediaStream = true;
}

const { connection, connectionOptions, metadata } = prepareSignalingConnection();
let soraConnection: undefined | ConnectionPublisher | ConnectionSubscriber;
let mediaStream: undefined | MediaStream;
let gainNode: undefined | GainNode | null;
let audioContext: undefined | AudioContext | null;
// ... (既存のローカル変数宣言)

// 検知ポイント 2-5 用のヘルパー
// ローカル変数 mediaStream / audioContext / soraConnection を closure 捕捉する
const abortIfCancelled = (): boolean => {
  if (signals.connectionStatus.value !== "disconnected") {
    return false;
  }
  // ユーザーが Disconnect を押した。 ローカル変数として生成済みの資源を解放する。
  // disconnectSora 側で既に cleanupSoraMediaState が走っているが、 新規に生成した
  // mediaStream / audioContext / soraConnection は cleanupSoraMediaState では解放されない
  // (signal に積まれていないため)。 ローカル変数として直接解放してリークを防ぐ ( 0046 と同じパターン)。
  if (mediaStream && !(forceCreateMediaStream === false && localMediaStreamValue === mediaStream)) {
    // 既存 localMediaStream 再利用パスでは mediaStream は signal が保持しているため stop しない
    for (const track of mediaStream.getTracks()) {
      track.stop();
    }
  }
  if (audioContext) {
    void audioContext.close();
  }
  if (soraConnection && signals.sora.value === soraConnection) {
    // setSora で参照済みだった場合は signal も整理する。
    // signals.setSora(null) は内部で soraDataChannels.value = [] も実行する (signals.ts 確認)。
    // void soraConnection.disconnect() は失敗を無視 (disconnectSora 側で signal は既に整理済み)。
    // setSora(null) 後の disconnect ハンドラは 0047 の isCurrent() ガードで skip されるが、
    // disconnectSora 側で cleanupSoraMediaState が走るため実害なし。
    signals.setSora(null);
    void soraConnection.disconnect();
  }
  // 観測可能にするため timeline message を吐く。
  // disconnectSora 側で setSoraConnectionStatus を変えるわけではないため status 上書きはしない。
  signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-connect-cancelled"));
  return true;
};

try {
  soraConnection = createSoraConnectionByRole(...);
  if (roleValue === "sendonly" || roleValue === "sendrecv") {
    if (!forceCreateMediaStream && localMediaStreamValue) {
      mediaStream = localMediaStreamValue;
    } else {
      [mediaStream, gainNode, audioContext] = await createMediaStream(state).catch(...);
    }
    // 検知ポイント 2: 新規取得パスと再利用パス両方で 1 回検知する (if-else 後に集約)
    if (abortIfCancelled()) return;
    signals.setSoraConnectionStatus("connecting");
    signals.setSora(soraConnection);
    await (soraConnection as ConnectionPublisher).connect(mediaStream);
    if (abortIfCancelled()) return;  // 検知ポイント 3
  } else {
    signals.setSoraConnectionStatus("connecting");
    signals.setSora(soraConnection);
    await (soraConnection as ConnectionSubscriber).connect();
    if (abortIfCancelled()) return;  // 検知ポイント 4
  }
} catch (error) {
  // 既存の catch (変更なし)
  // ...
}
signals.setSoraInfoAlertMessage("succeeded to connect Sora");
await setStatsReportInternal(soraConnection);
if (abortIfCancelled()) return;  // 検知ポイント 5
startStatsReportTimer();
// ... (既存の成功経路)
signals.setSoraConnectionStatus("connected");
signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("connected"));
```

### 設計上の判断

- **`setSoraConnectionStatus("disconnected")` を再度立てない**: `disconnectSora` が既に `disconnected` を立てているため、 `connectSora` 側は上書きしないようにする。 ヘルパー内で `signal.connectionStatus` を一切書き換えない。
- **`cleanupSoraMediaState` を呼ばない**: `disconnectSora` 側で既に `await cleanupSoraMediaState()` が走っているため重複呼び出しは不要。 本ヘルパーはローカル変数の解放のみに責務を限定する (closed/0045 / closed/0046 と同じ「ローカル変数で stop/close」パターン)。
- **timeline message `event-connect-cancelled` を吐く**: ヘルパーの発火を Timeline タブで観測可能にする ( closed/0046 で確立した「ガード経路で停止した track もタイムラインに記録する」パターンに揃える)。 検証手順でも本 message の有無で判定する。
- **virtualBackgroundProcessor / noiseSuppressionProcessor は本ヘルパーで触らない**: `createMediaStream(state)` が返す `mediaStream` は処理済みストリーム ( `virtualBackgroundProcessor.startProcessing()` 完了後) だが、 `processor` 自身は `cleanupSoraMediaState` が `signals.virtualBackgroundProcessor.value` 経由で停止する。 本ヘルパーはローカル変数 `mediaStream` の track stop のみに専念し、 processor の停止責務は `disconnectSora` 側の `cleanupSoraMediaState` に委ねる。
- **stats 系 signal ( `statsReport` / `soraTurnUrl` ) は残置を許容する**: 検知ポイント 5 ( `await setStatsReportInternal` 直後) で `abortIfCancelled` が発火する場合、 `setStatsReportInternal` 内で `signals.setStatsReport` / `signals.setSoraTurnUrl` が既にセットされている可能性がある。 `disconnectSora` の `cleanupSoraMediaState` は stats 系 signal を触らないため、 キャンセル後も前接続の stats / turnUrl が UI に残置する。 これは本 issue のリグレッションではなく既存の `disconnectSora` 経路でも残置する挙動と同じため許容する ( UI 表示は `connectionStatus === "disconnected"` で抑制される)。 stats 系 signal の整理は別 issue で扱う。
- **`createMediaStream` 失敗経路との区別**: `createMediaStream` の catch 内で `signals.setSoraConnectionStatus("disconnected")` + `throw error` が走り、 throw が `connectSora` の try-catch に飛んでいくため、 検知ポイント 2 の `abortIfCancelled` には到達しない ( throw が先)。 そのため `abortIfCancelled` が「ユーザー Disconnect」と「`createMediaStream` 失敗」を判定式で区別する必要はない (実体としては失敗時は catch 経路で別処理が走る)。 将来 catch から throw を外す改修が入った場合は本 issue の前提が崩れるため、 本 issue の修正対象に「catch 内の throw は維持する」を明記する。
- **`closed/0007` の設計を維持**: `DisconnectButton` の `disabled` に `preparing` を追加するアプローチ ( closed/0055 で却下) は採用しない。 `preparing` / `connecting` 中の Disconnect を意図的にサポートする closed/0007 の方針は維持し、 本 issue は「`connectSora` 側でキャンセル意図を観測する」補完的な変更。

### 検知ポイント 1 (`await soraValue.disconnect()` 直後) の意義

既存接続あり時の `await soraValue.disconnect()` 直後にも検知を入れる理由: ユーザーが既存接続中に Connect を押した場合、 `connectSora` は先に旧 sora を disconnect してから新接続を作る。 この `await` 中に Disconnect が押された場合 (実装上希少だが)、 `disconnectSora` は旧 sora の `signals.sora.value === soraValue` を読んで `soraValue.disconnect()` を再度呼ぶ可能性がある。 sora-js-sdk の `disconnect()` は冪等で WebSocket / PeerConnection を close するだけのため二重呼び出しでも実害はないが、 ここで `connectSora` 側が放棄しないと旧 sora の disconnect 完了後に新接続が立ち上がる経路が残る。 検知ポイント 1 で `connectSora` 側を放棄することで、 新接続の作成を確実に止める。

なお検知ポイント 1 はローカル変数 `mediaStream` / `audioContext` / `soraConnection` がまだ undefined のため、 ヘルパーではなく専用ガード ( `if (signals.connectionStatus.value === "disconnected") return;` ) で対応する (上記コード例参照)。

### エッジケース一覧

`connectSora` 復帰時点の `connectionStatus` 別に整理 (Disconnect 押下「時点」ではなく、 `disconnectSora` 完了後の `connectionStatus` を見る)。

| `connectSora` の進行段階 (await)                                                                                   | role                                                                   | `connectSora` 復帰時点の `connectionStatus`         | 修正前                                       | 修正後                                                                                      |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 検知ポイント 1: `await soraValue.disconnect()` 直後 (既存接続あり時)                                               | sendrecv/sendonly/recvonly いずれも                                    | `disconnected`                                      | `connecting` 上書き → 新接続が確立してしまう | 専用ガードで return、 新接続は作らない                                                      |
| 検知ポイント 2: `await createMediaStream` 直後 (新規取得パス)                                                      | sendrecv/sendonly                                                      | `disconnected`                                      | 同上                                         | `abortIfCancelled` で `mediaStream` の track stop + `audioContext.close` で return          |
| 検知ポイント 2 (再利用パスでも 1 回): `mediaStream = localMediaStreamValue` 同期代入後の `if (abortIfCancelled())` | sendrecv/sendonly (`!forceCreateMediaStream && localMediaStreamValue`) | `disconnected`                                      | 同上                                         | `abortIfCancelled` 内で `mediaStream === localMediaStreamValue` のため stop しない、 return |
| 検知ポイント 3: `await soraConnection.connect(mediaStream)` 直後                                                   | sendrecv/sendonly                                                      | `disconnected`                                      | `connected` 上書き → 接続確立                | `abortIfCancelled` で `soraConnection.disconnect()` + リソース解放 + return                 |
| 検知ポイント 4: `await soraConnection.connect()` 直後                                                              | recvonly                                                               | `disconnected`                                      | 同上                                         | 同上 ( `mediaStream` は undefined のため stop なし)                                         |
| 検知ポイント 5: `await setStatsReportInternal` 直後                                                                | すべて                                                                 | `disconnected`                                      | `connected` 上書き → 接続確立                | `abortIfCancelled` で同上、 `setSoraConnectionStatus("connected")` は走らない               |
| 正常系 (Disconnect 押されない)                                                                                     | すべて                                                                 | `preparing` → `connecting` → `connected` を順に遷移 | 接続確立                                     | 変化なし (各 `abortIfCancelled` は false を返す)                                            |

## テスト戦略

`connectSora` は `navigator.mediaDevices.getUserMedia` と Sora 接続を含み jsdom 環境では実行不可能、 モック禁止規約と両立する純粋関数化が現実的でないため、 本 issue では新規 Vitest テストは追加しない。 後述の検証手順で手動確認する。 Playwright e2e は競合タイミング再現の難易度が高いため別 issue で扱う。

## CHANGES.md エントリ

`CHANGES.md` の `## develop` 内 `[FIX]` セクション末尾 ( `### misc` セクションの直前) に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `connectSora` の `preparing` / `connecting` 中に Disconnect を押されたときに接続が確立してしまう問題を修正する
  - `connectSora` 内の 5 箇所の `await` 直後で `connectionStatus === "disconnected"` を検知し、放棄時にローカル変数の `mediaStream` / `audioContext` / `soraConnection` を解放する
  - 検知時に `event-connect-cancelled` の timeline メッセージを記録する
  - closed/0007 の「`preparing` / `connecting` 中の Disconnect を意図的にサポート」設計は維持する
  - @voluntas
```

## スコープ外

下記は本 issue では扱わない:

- **`disconnectSora` 側の改修**: `disconnectSora` は `soraValue` の null チェックで SDK 切断をスキップする既存設計を維持する。 本 issue は `connectSora` 側でキャンセル意図を観測する補完的な変更で、 `disconnectSora` の構造は触らない。
- **キャンセル時のアラート通知**: 「Connect 操作をキャンセルしました」を AlertMessages で通知する UI 改善は別 issue。
- **`connectSora` の in-flight ガード**: closed/0048 の `reconnectSora` と同形の wrapper 追加は別 issue で扱う。 本 issue はキャンセル検知のみ。
- **`reconnectSora` への同種キャンセル検知**: `reconnectSora` も同種の構造を持つが、 `attemptReconnection` のループ内 `if (!signals.reconnecting.value) break;` で別経路のキャンセル検知が既にある。 `disconnected` 観測の追加は別 issue で検討。
- **`createMediaStream` 失敗時の catch 内 throw の見直し**: 本 issue は catch 内の throw を維持する前提で `abortIfCancelled` の判定式を組んでいる。 将来 throw を外す改修が入った場合は本 issue の前提が崩れるため別 issue で扱う。
- **`disconnectSora` 内の `await cleanupSoraMediaState()` と `connectSora` の `await createMediaStream` の並走順序保証**: どちらが先に完了するかは保証されないが、 本 issue の検知ポイント 5 ( `setStatsReportInternal` 直後) まで含めれば「いずれかの `await` 直後で `disconnected` を観測する」ことは保証される。 順序を厳密に保証する仕組み ( AbortController 等) の導入は別 issue。

## 関連 issue

- closed/0055-bug-fix-disconnect-button-preparing: 本 issue の「真のバグ」を抽出した close 済 issue。 closed/0055 は「`DisconnectButton` の `disabled` に `preparing` を追加」案だったが closed/0007 と矛盾するため close され、 本 issue が真の対処として起票された。
- closed/0007-fix-disconnect-during-connecting: 「`preparing` / `connecting` 中の Disconnect を意図的にサポート」設計を確立した過去 issue。 本 issue はその設計を維持しつつ、 `connectSora` 側でキャンセル検知を実装する。
- closed/0048-bug-fix-reconnect-double-launch: `reconnectSora` の in-flight ガード。 本 issue の `connectSora` キャンセル検知とは別観点だが、 同関数群の防御強化として整合する。
- closed/0045-bug-fix-update-media-stream-after-disconnect / closed/0046-bug-fix-reconnect-failure-media-leak: ローカル変数で stop/close するパターンの先例。 本 issue はその責務分担を `connectSora` キャンセル時にも適用する。
- closed/0047-bug-fix-disconnect-listener-self-check: SDK イベントハンドラの `isCurrent()` ガード。 本 issue で `setSora(null)` した後の `disconnect` ハンドラが skip される設計と整合する。

## 検証手順

### A. 修正前の再現 (develop ブランチで実施)

1. `pnpm dev` で起動し `?role=sendrecv&mediaType=getUserMedia&debug=true&debugType=timeline` で開く (DebugPane Timeline タブを開いておく)。
2. Connect ボタンを押下し、ブラウザの権限プロンプトが出たら **承認せずに残したまま** Disconnect を押す (gum 取得中の `await` を捕捉する)。 その後、 権限プロンプトを承認する。
3. 修正前: 権限プロンプトを承認すると、 `connectSora` が処理を継続して `setSoraConnectionStatus("connecting")` → `connected` まで遷移し、 UI 上接続が確立する。 Timeline タブには `start-connection` → `media-constraints` → ... → `connected` の通常フローが記録される。

### B. 修正後の確認

4. 同じ手順で `connectSora` のフローを再現:
   - 手順 2 で権限プロンプト承認 → `await createMediaStream` 完了直後に検知ポイント 2 の `abortIfCancelled()` が true を返し、 取得した `mediaStream` の track を stop して return する。 UI は `disconnected` 状態のまま、 接続は確立しない。 Timeline タブに `event-connect-cancelled` が記録されることを確認する。
5. Connect → 即座に Disconnect (権限プロンプトを出さずに) の連続操作でも、 `await soraConnection.connect()` 完了直後に検知ポイント 3 の `abortIfCancelled()` が検知して、 生成済み `soraConnection` の `disconnect()` を呼んで放棄することを確認する。 Timeline タブに `event-connect-cancelled` が記録される。

### C. 既存接続中の再接続キャンセル (検知ポイント 1)

6. 接続成功状態で再度 Connect を押す (既存 sora の disconnect が走る経路) → `await soraValue.disconnect()` 中に Disconnect を押すと、 検知ポイント 1 の専用ガードが `await soraValue.disconnect()` 完了後に検知して放棄する。 最終的に UI は `disconnected` で、 旧 sora は disconnect 完了、 新 sora は作られない。 Timeline タブに `event-connect-cancelled` が記録される。

### D. `setStatsReportInternal` 中のキャンセル (検知ポイント 5)

7. Connect → 接続成功直後 ( `connected` 表示前) に Disconnect を押す。 `await setStatsReportInternal` 中に `setSoraConnectionStatus("disconnected")` が立つと、 検知ポイント 5 の `abortIfCancelled()` が `connected` 状態への遷移前に検知して放棄する。 最終的に UI は `disconnected` のまま。 Timeline タブに `event-connect-cancelled` が記録される。 ( `setStatsReportInternal` は短時間で完了するため再現は難しいが、 Chrome DevTools の Performance タブで CPU throttling 6x slowdown を設定すると再現しやすい)

### E. 正常系の回帰

8. Connect → そのまま放置 → `connected` 状態に到達することを確認する (キャンセル検知が誤発火しないこと、 Timeline タブに `event-connect-cancelled` が現れないこと)。
9. Connect → Connect 完了後に Disconnect → 正常に切断されることを確認する (既存挙動の維持)。
10. fakeMedia / getUserMedia / mp4Media / getDisplayMedia の各 mediaType で 8 を実行する。
11. recvonly role でも検知ポイント 4 が動作することを確認する (`?role=recvonly` で Connect → 即 Disconnect)。

### F. テスト

12. `pnpm test` が pass すること。
13. 既存 Playwright e2e ( `pnpm test:e2e` ) が pass すること。

## 完了条件

- 検証手順 A-F すべてが通過すること。
- `connectSora` 内の 5 箇所の `await` 直後 (検知ポイント 1-5) で `connectionStatus === "disconnected"` 検知が実装されていること。
- `connectSora` の `preparing` / `connecting` 中にユーザーが Disconnect を押した場合、 `connectSora` が接続を完了させずに放棄すること。
- 放棄時に取得済みの `mediaStream` の track が確実に stop されること (既存 `localMediaStream` 再利用パスでは stop しない)。
- 放棄時に生成済みの `soraConnection` が `disconnect()` され `setSora(null)` で整理されること。
- 放棄時に `event-connect-cancelled` の timeline message が記録されること。
- closed/0007 の「`preparing` 中の Disconnect も意図的にサポート」設計が維持されていること (`DisconnectButton` の `disabled` に `preparing` を追加するアプローチは採用しない)。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 既存テスト ( `pnpm test` ) および既存 Playwright e2e が pass すること。
