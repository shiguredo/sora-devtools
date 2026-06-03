# 0030 切断後もリモート / ローカル映像が UI に残る問題を修正する

Created: 2026-06-03
Model: Composer 1.0
Polished: 2026-06-03
Completed: 2026-06-03

ブランチ: `feature/fix-video-persists-after-disconnect`

## 背景

sora-js-sdk が切断したあとも、Devtools の `<video>` に映像（最終フレームの静止画）が残り続けることがある。

調査の結果、映像表示は `connectionStatus` ではなく `localMediaStream` と `remoteClients` signal で決まっており、これらのクリアが **sora-js-sdk の `disconnect` コールバック 1 本** に依存していることが根因である。

closed issue 0014（`connectSora` の `soraConnection.stream = null` ハック削除）で「sora-js-sdk 2025.2.0 の `disconnect` は stream を停止しないため、devtools 側でメディアを掃除する必要がある」ことは既に判明している。本 issue はその掃除が一部の経路でしか行われていない問題を扱う。

再現操作と対応する問題は後述の再現手順テーブルに集約する。

注: 以下の行番号は `Polished` 時点（2026-06-03）のものであり実装時にずれている可能性がある。編集時は行番号ではなく関数名・シンボルを基準に対象を特定すること。

## 現状の問題

### 1. メディア state のクリア箇所が限定的

`removeAllRemoteClients()` と `setLocalMediaStream(null)` は次のときのみ呼ばれる。

- `setSoraCallbacks` 内の `disconnect` イベントハンドラ（`src/app/actions.ts` の `setLocalMediaStream(null)` / `removeAllRemoteClients()` 呼び出し、L1043-1044）
- `resetSoraConnectionState()`（ページ初期化。`src/app/signals.ts` L861-875。直接代入のため track.stop() は伴わない）

`disconnectSora` / `connectSora` の catch / `reconnectSora` 失敗では **呼ばれない**。`attemptReconnection` の各試行失敗時に呼ばないのは意図的だが（後述）、`reconnectSora` 全体の失敗時にも掃除されない。

### 2. `disconnectSora` は SDK コールバックに依存し、失敗時は二度と掃除できない

`disconnectSora`（`src/app/actions.ts` L1569-1590）は `await soraValue.disconnect()` の前後で `connectionStatus` を更新するだけで、メディア signal を触らない。

closed issue 0007 で「`connectionStatus === "disconnected"` のときは早期 return して二重切断を防ぐ」方針（`disconnectSora` L1573-1575 の早期 return）が取られたが、これは SDK が `disconnect` コールバックを発火しなかった場合に `remoteClients` / `localMediaStream` が残留する問題への対処を含んでいない。早期 return を維持したまま、その **前に** メディア掃除を挿入することで両立させる。

### 3. sora-js-sdk の `disconnect()` がコールバックを省略する場合がある

sora-js-sdk 2025.2.0（`package.json` 指定）の `disconnect()`（`node_modules/sora-js-sdk/dist/sora.mjs` L858-874）は、非 DataChannel 経路（else 分岐 L869-871）で `disconnectWebSocket("NO-ERROR")` の戻り値が `null` のとき close イベント `e` を生成せず、L873 の `e && (... this.callbacks.disconnect(e))` ガードにより **`callbacks.disconnect` を呼ばない**。`disconnectWebSocket`（L753-769）が `null` を返すのは次のとき:

- `this.ws` が既に `null`（L756-757）
- `this.ws.readyState !== OPEN`（L766-767）

`connectSora` 冒頭の `await soraValue.disconnect()`（L1386）でも devtools 側のメディア掃除は行われないため、コールバックが来なかった前セッションの `remoteClients` が Connect 再試行時に残る。

### 4. 接続失敗時に `ontrack` 後の `remoteClients` が残る

recvonly の `connect()` は `setRemoteDescription` 以降・接続確立前に `track` イベントが来うる（SDK `multiStream` の順序）。このとき `on("track")`（L953-974）で `remoteClients` にクライアントが積まれる。

`connectSora` の catch（L1431-1440）は `setSora(null)` と `disconnected` のみで、`cleanupMediaStreamOnError`（L1306-1338）は publisher 用 `mediaStream` の track を停止するだけで **`remoteClients` は不変**。

SDK の `signalingTerminate()`（接続中の例外時に呼ばれる。`sora.mjs` L615-621）は ws/pc を閉じるだけで `callbacks.disconnect` を呼ばない。その後 `connect()` の Promise が reject され `connectSora` の catch に落ちるため、残留した `remoteClients` が掃除されない。

### 5. 他参加者退出時の notify を映像削除に使っていない

`connection.destroyed` notify はスポットライト ID 削除のみ（`handleSpotlightEvent` L878-880 の `deleteFocusedSpotlightConnectionId`）。リモートクライアントの削除は `removetrack`（L975-988）でしか行われない。

相手がすぐタブを閉じた場合、`event-on-track` のあと `removetrack` / `disconnect` が来ないと、**`connected` のまま** 静止画が残る。

### 6. Connect 二重押下のレース

`ConnectButton`（`src/components/DevtoolsPane/ConnectButton.tsx` L9-12）の disabled 条件は `disconnecting` / `connecting` / `initializing` のみで `preparing` を含まない。そのため `preparing`（`getUserMedia` 待ち）中に Connect ボタンが押下可能。

`connectSora` に並行実行の排他がないため、1 回目が `setSora()`（L1423 / L1428）に到達する前に 2 回目が走ると、前の `soraConnection` は `disconnect()` されず（冒頭の `if (soraValue)` が `null` を見る）、複数 `soraConnection` の `on("track")` が同一 `remoteClients` に書き込みうる。

`DisconnectButton`（`src/components/DevtoolsPane/DisconnectButton.tsx` L9-12）も disabled が `disconnecting` / `connecting` / `initializing` のみで `disconnected` を含まないため `disconnected` 状態で有効だが、現状は `disconnectSora` が早期 return するため押しても何も起きない。この挙動は P0 修正後に「押すと残留メディアを掃除する」へ変える（後述）。

## 再現手順と対応する問題の対応関係

| 手順 | 内容                           | 対応する現状の問題 | トリガー                                       |
| ---- | ------------------------------ | ------------------ | ---------------------------------------------- |
| A    | 相手がすぐブラウザを閉じる     | 問題 4, 5          | `track` 後に `removetrack` / `disconnect` 未着 |
| B    | Connect 2 回（切断後に再接続） | 問題 2, 3, 4       | 前回の `remoteClients` 残留                    |
| C    | `preparing` 中の Connect 連打  | 問題 6             | 並行実行ガード不在                             |

## 期待される動作

- sora-js-sdk が切断したあと、または接続試行が失敗したあと、**常に** `remoteClients` が空になり、ローカルプレビュー用 `localMediaStream` が UI から消える
- `connectionStatus === "disconnected"` のとき Disconnect を押すと、コールバック未発火で残ったメディアも掃除される（DisconnectButton は `disconnected` でも有効に保つ）
- 他参加者が channel から退出したとき、該当リモート `<video>` が消える（`connection.destroyed` で削除）
- Connect の二重押下で古い connection の `track` が `remoteClients` を汚染しない（UI ガードと、必要なら `connectSora` の in-flight フラグで対応。いずれも P1 のため、この項目の達成は P1 の実装範囲に依存する）

## 修正方針

### メディア掃除関数の責務定義

リモート掃除とローカル掃除を分離し、`connectSora` / `reconnectSora` の冒頭ではリモートのみ掃除する。冒頭では `localMediaStream` を再利用する（request media で取得済みのプレビュー用ストリームをそのまま `connect()` に渡す。`connectSora` L1409-1410）ため、冒頭で `localMediaStream` の track を停止すると死んだ track で接続を試みることになる。

**`clearRemoteMediaClients()`（新規・同期）**:

- `remoteClients` の各クライアントの全 track.stop()
- `removeAllRemoteClients()`

**`cleanupSoraMediaState()`（新規）**:

- `clearRemoteMediaClients()`
- ローカルメディア掃除: video processor 停止（`stopVideoProcessors`。戻り値 originalTrack を `stopLocalVideoTrack` に渡す）/ `stopLocalVideoTrack`（100ms sleep を含む）/ `stopLocalAudioTrack`（`noiseSuppressionProcessor` もここで停止）/ fakeContents worker 停止 / `closeFakeContentsAudio()` / `setLocalMediaStream(null)`

**並行性（実装の要点）**: 現行 `disconnect` ハンドラ（L1011-1044）の並行構造を保つ。`cleanupSoraMediaState()` の本体順序を以下に固定する。`localMediaStreamValue` は fire-and-forget 起動時にローカル変数へ束縛し、後続の `setLocalMediaStream(null)` の影響を受けないようにする:

```
clearRemoteMediaClients()                                     // 同期（remote track stop + removeAllRemoteClients。リモート映像を即消去）
const originalTrack = stopVideoProcessors(...)                 // 同期
void (async () => { await stopLocalVideoTrack(localMediaStreamValue, originalTrack) })()  // fire-and-forget（100ms sleep を含む）
stopLocalAudioTrack(localMediaStreamValue, ...)               // 同期
worker?.postMessage({ type: "stop" }); closeFakeContentsAudio()  // 同期
setLocalMediaStream(null)                                     // 同期（残存 track を stop）
```

signal クリア（`setLocalMediaStream(null)` / `removeAllRemoteClients()`）と remote track stop は同期的に即実行されるため、UI からの映像消去は video track の sleep を待たない。`cleanupSoraMediaState()` は同期関数として実装でき、呼び出し元は `await` せず呼べる（呼び出し元が return しても fire-and-forget の video track 停止は背景で完走する。実害なし）。`setLocalMediaStream(null)`（`signals.ts` L489-496）が残存 track を stop() するため、後追いが間に合わなくても track は確実に止まる（二重停止は冪等で無害）。

いずれの関数も次は **含まない**（呼び出し元の責務）: `setSora(null)` / `connectionStatus` 変更 / sessionId・connectionId・clientId・turnUrl の null 化 / alert・timeline メッセージ / `setSoraReconnecting` / `stopStatsReportTimer()`。`cleanupSoraMediaState()` は冪等（null・空で再呼び出しても安全）なので、切断時に SDK の `disconnect` コールバックと二重実行されても問題ない。

#### 既存 `disposeMedia()` との重複

`disposeMedia()`（`actions.ts` L1208-1251。Dispose Media ボタンから呼ばれる）は `cleanupSoraMediaState()` のローカル掃除部分とほぼ同一だが、(1) `remoteClients` を触らない、(2) sleep なしで即 `track.stop()` する（未接続プレビューの破棄なので配信先の最終コマ対策が不要）という差がある。共通化する場合はローカル掃除部分のみを sleep フラグ付きヘルパに切り出し、`disposeMedia` 側に `remoteClients` を触らせない。`cleanupSoraMediaState` 全体のラッパにすると Dispose Media ボタンがリモート映像まで消す後方非互換になるため禁止する。sleep の有無という差で共通化が割に合わなければ、両者を独立した関数として保ってよい。

### P0（必須）

1. **メディア掃除関数の切り出し**  
   `disconnect` ハンドラ（L989-1051）の掃除処理を 2 関数に切り出す。ハンドラ内で処理が非連続に並ぶため、各行がどちらの関数へ移るかを示す:
   - `clearRemoteMediaClients()` へ: リモート track stop（L1025-1029）と `removeAllRemoteClients()`（L1044）
   - `cleanupSoraMediaState()` のローカル掃除へ: `stopVideoProcessors`（L1011。戻り値の originalTrack を `stopLocalVideoTrack` に渡す）/ `stopLocalVideoTrack`（L1013-1023）/ `stopLocalAudioTrack`（L1024）/ fakeContents worker stop（L1030-1032）/ `closeFakeContentsAudio()`（L1034）/ `setLocalMediaStream(null)`（L1043）

   間に挟まる L1036-1042（`stopStatsReportTimer` / `setSora(null)` / 各 ID の null 化 / `setSoraConnectionStatus`）は責務定義の「含まない」に該当するため **関数に含めず** ハンドラ側に残す。`cleanupSoraMediaState()` は内部で `clearRemoteMediaClients()` を呼ぶため、ハンドラからは `cleanupSoraMediaState()` 1 本の呼び出しに置き換わる。

2. **各経路からの呼び分け**

   | 呼び出し元                        | 呼ぶ関数                    | 位置・理由                                                                                                                                                                                                                      |
   | --------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `disconnect` ハンドラ             | `cleanupSoraMediaState()`   | 正常切断時のフル掃除（切り出し元）                                                                                                                                                                                              |
   | `disconnectSora`                  | `cleanupSoraMediaState()`   | 早期 return（L1573-1575）の **前**。`disconnected` でも残留メディアを掃除する                                                                                                                                                   |
   | `connectSora` 冒頭                | `clearRemoteMediaClients()` | 関数冒頭、`if (soraValue)` 判定の前（L1384 取得直後）。初回 connect（soraValue=null）でも前セッション残留を掃除するためガード外に置く。localMediaStream は再利用のため触らない                                                  |
   | `connectSora` catch（L1431-1440） | `cleanupSoraMediaState()`   | `setSora(null)` の後。残留 `remoteClients` と signals.localMediaStream を掃除し、期待される動作 L79 を満たす。既存 `cleanupMediaStreamOnError`（L1437）は残す（表の後の注記参照）                                               |
   | `reconnectSora` 冒頭              | `clearRemoteMediaClients()` | `mediaStream` は別途作り直すため localMediaStream は触らない。`connectionStatus` 取得（L1512）の直後・`disconnect()` ガード（L1514）の前に置く。recvonly 再接続ではリモート映像が一時的に消え、再接続成功で復帰する（許容する） |
   | `reconnectSora` 失敗 return 前    | `cleanupSoraMediaState()`   | `createMediaStream` 失敗時（L1527-1535）と `attemptReconnection` 全失敗時（L1546-1552）の両方。完全に切断状態へ戻す                                                                                                             |
   | `attemptReconnection` 各試行失敗  | 呼ばない                    | `reconnectSora` で一度だけ作成した `mediaStream` を後続試行で使い回すため。現状どおり connect 前に `setSora(soraConnection)`（L1482）、失敗時に `setSora(null)`（L1491）のまま変更しない                                        |

   catch の補足: 既存の `cleanupMediaStreamOnError`（L1437、接続に使った publisher 用 `mediaStream` の track stop）を残し、その後・`setSoraConnectionStatus("disconnected")`（L1438）の前に `cleanupSoraMediaState()` を挿入する。新規作成された `mediaStream` は成功時（L1446）まで `signals.localMediaStream` に反映されないため `cleanupMediaStreamOnError` でしか掃除できず、両者は役割が異なる（`cleanupMediaStreamOnError` は削除しない）。再利用ケース（`mediaStream === localMediaStream`）でのみ同一 track を二重 stop するが冪等で、Timeline に同一 track の stop ログが 2 行出ることは許容する。

3. **`connection.destroyed` notify でリモートクライアント削除**  
   `setSoraCallbacks` の notify コールバック（L937-945）内で、`handleSpotlightEvent`（L938）/ `handleConnectionCreatedNotify`（L939）の呼び出し後に、`event_type === "connection.destroyed"` のとき該当リモートクライアントを削除する処理を分離して追加する（既存 2 関数の責務は変えない）。`removeRemoteClient`（`signals.ts` L515-516）は `connectionId` で filter するだけで track.stop() しないため、削除前に該当 `MediaStream` の全 track を stop() する。`connection.destroyed` は自分自身の退出時にも自分の connection_id で届きうるが、自分は `remoteClients` に存在しない（`on("track")` はリモートのみ積む）ため空振りで無害。

   **前提**: `removeRemoteClient` に渡す `connection_id` は `remoteClients[].connectionId`（`on("track")` で `event.streams[0].id` から設定。L957 / L970）と一致する必要がある。この「notify の `connection_id` == リモート `MediaStream.id`」は、既存の `setSoraRemoteClientId`（`signals.ts` L500-510）が `connection.created` notify の `connection_id` で `remoteClients` を引いて `clientId` を更新している事実から、コードベースで既に前提とされている。この前提が崩れる SDK 構成では削除が空振りする点に注意する。

### P1（推奨）

4. **二重押下ガード**: `ConnectButton` の disabled 条件に `preparing` を追加する。`DisconnectButton` は `disconnected` で **有効のまま**にする（P0-2 で `disconnected` でも Disconnect で残留メディアを掃除するため。disabled にすると期待される動作と矛盾する）。UI ガードは Connect ボタン経由の連打を防ぐが、`connectSora` をプログラムから直接連続呼び出しした場合は防げない。完全な排他が必要なら `connectSora` に in-flight フラグを設けて多重実行をガードする。
5. **リモート track の `ended` でのクライアント削除**（`removetrack` 補完）: `on("track")`（L953-974）でクライアント追加時に各 track へ `ended` リスナーを登録する。削除粒度は `removetrack` と同じ stream 単位とし、いずれか 1 track の `ended` でクライアントごと削除する（相手退出時は全 track が ended になるため、片方だけ ended で生存 track が消える事態は実運用上起きにくい）。削除時はその `MediaStream` の **全 track** の `ended` リスナーを `removeEventListener` で解除し、解除漏れを防ぐ。`connection.destroyed`（P0-3）・`disconnect`・`removetrack`・`ended` の複数経路から `removeRemoteClient` が呼ばれうるが filter は冪等のため重複削除は安全。

### 対象外（別 issue 可）

- `Video.tsx`（`src/components/Video/Video.tsx`）の useEffect cleanup での `srcObject = null`: 既に `stream === null` のとき `videoElement.srcObject = null` を実行している（L46-50）。P0 で `remoteClients` / `localMediaStream` を掃除すれば該当 Video の `stream` prop が `null` になり既存処理で映像が消える。アンマウント時は要素ごと DOM から消えるため、cleanup での `srcObject = null` は不要。
- ローカル `stopLocalVideoTrack` の 100ms sleep と Firefox 配信先の最終コマ残り（`src/app/actions.ts` L1916-1917 のコメント）。UI からプレビューが消えない本 issue の問題とは別。
- `removetrack` 経路での track.stop() 漏れ（既存バグ）。P0-3 は `connection.destroyed` 経由で track.stop() するが、`removetrack` 経由（L986）は SDK が track を ended にした後の通知のため stop しない。挙動が分かれるが、`removetrack` 側の停止漏れ是正は影響が限定的なため本 issue のスコープ外とする。

## 影響範囲

| ファイル                                        | 変更内容                                                                                                                                                                                                                                 |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/actions.ts`                            | `cleanupSoraMediaState` / `clearRemoteMediaClients` 追加、`disposeMedia` のローカル掃除を共通化（任意）、`disconnectSora` / `connectSora`（冒頭・catch）/ `reconnectSora` / notify ハンドラ修正、`on("track")` に `ended` リスナー（P1） |
| `src/components/DevtoolsPane/ConnectButton.tsx` | disabled 条件に `preparing` 追加（P1）                                                                                                                                                                                                   |

`DisconnectButton.tsx` はコードを変更しない。`disconnected` での押下時に掃除が走るのは `disconnectSora`（actions.ts）側の修正による。

## CHANGES.md エントリ案

実装範囲（特に P1 項目）に応じて加筆する。

```
- [FIX] 切断後もリモート / ローカル映像が UI に残る問題を修正する
  - cleanupSoraMediaState / clearRemoteMediaClients を抽出し、disconnect ハンドラ / disconnectSora / connectSora 冒頭・catch / reconnectSora の各経路から呼ぶ
  - connection.destroyed notify でリモートクライアントを削除する
  - disconnected 状態で Disconnect を押した場合も残留メディアを掃除する
  - ConnectButton の preparing 中の二重押下を防止する
  - @voluntas
```

## テスト戦略

- モック・スタブは使わない（AGENTS.md）
- **手動確認（合否基準を明示する）**:
  - 再現手順 A / B / C それぞれで、操作後 3 秒以内に該当 `<video>` から映像が消えること
  - 正常 connect → disconnect で Timeline に `event-on-disconnect` があり映像が消えること
  - `disconnected` 状態で Disconnect ボタンを押し、残留メディアが掃除されること
- 既存 e2e（sendonly / recvonly / sendrecv）の connect → disconnect が regress しないこと
- **ユニットテストの限界**: テスト環境は jsdom（`vite.config.ts`）で `MediaStream` / `AudioContext` を提供しない。`RemoteClient` は `mediaStream: MediaStream` を必須とするため、`remoteClients` に要素を積んだ状態を実 `MediaStream` なしに作れない。モック禁止（AGENTS.md）の下では `cleanupSoraMediaState` 全体のユニットテストは成立しない。検証は次に限定する:
  - `removeAllRemoteClients()` 単体で `remoteClients` が空配列になること（signals.ts のテスト）
  - `localMediaStream` が `null` の状態で `cleanupSoraMediaState()` を呼んでも例外なく完了すること（track.stop を経由しない経路）

## 解決方法

### 実装内容

`src/app/actions.ts` に以下のヘルパー関数を新規追加:

- `trackEndedListeners` Map: connectionId をキーに track と ended リスナーのペアを管理する
- `registerTrackEndedListener(connectionId, track)`: track の ended イベントにリスナーを登録。同一 track の重複登録を防止する
- `unregisterTrackEndedListeners(connectionId)`: 登録済み ended リスナーを一括解除する
- `removeRemoteClientCleanup(connectionId)`: track.stop() + リスナー解除 + `signals.removeRemoteClient()` を実行する
- `clearRemoteMediaClients()`: 全リモートクライアントに対して `removeRemoteClientCleanup` を呼び signal を空にする
- `cleanupSoraMediaState()`: リモート掃除 (`clearRemoteMediaClients`) + ローカル掃除（video processor 停止、fire-and-forget の `stopLocalVideoTrack`、`stopLocalAudioTrack`、fakeContents worker 停止、`closeFakeContentsAudio`、`setLocalMediaStream(null)`）を実行する。同期関数として実装し呼び出し元は `await` 不要

各経路からの呼び出し:

- disconnect ハンドラ: 掃除ロジックを `cleanupSoraMediaState()` 呼出に置換
- `disconnectSora`: `cleanupSoraMediaState()` + `stopStatsReportTimer()` を早期 return 前に常時呼出
- `connectSora` 冒頭: `clearRemoteMediaClients()` を `soraValue.disconnect()` 前に呼出
- `connectSora` catch: `cleanupMediaStreamOnError` 後に `cleanupSoraMediaState()` を呼出（remoteClients と localMediaStream を掃除）
- `reconnectSora` 冒頭: `clearRemoteMediaClients()` を呼出
- `reconnectSora`: `createMediaStream` 失敗時と `attemptReconnection` 全失敗時に `cleanupSoraMediaState()` を呼出

その他の変更:

- `connection.destroyed` notify: `removeRemoteClientCleanup` でリモートクライアント削除
- `removetrack` ハンドラ: `signals.removeRemoteClient` → `removeRemoteClientCleanup` に置換
- `track` ハンドラ: 新規・既存クライアントに関わらず全 track に ended リスナー登録
- `ConnectButton.tsx`: disabled 条件に `preparing` を追加して二重押下を防止

### 変更ファイル

- `src/app/actions.ts`: メディア掃除関数の新規追加と各経路への呼び出し追加
- `src/components/DevtoolsPane/ConnectButton.tsx`: preparing 中の connect ボタン無効化

### テスト

- 既存 93 テスト全通過を確認（新規ロジックは下記制約によりテスト未追加）
- テスト環境は jsdom であり MediaStream/AudioContext が利用不可のため、track.stop() や ended リスナーを含む経路の単体テストはモック禁止制約下で成立しない。`removeRemoteClient` / `removeAllRemoteClients` の signal 操作も `RemoteClient` の `mediaStream` が `MediaStream` 必須で要素を積めないため、テストは追加せず手動確認・e2e で検証する
