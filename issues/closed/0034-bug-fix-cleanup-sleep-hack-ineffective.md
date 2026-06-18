# 0034 cleanupSoraMediaState の最終フレーム対策 sleep が setLocalMediaStream に追い越される問題

Created: 2026-06-03
Model: Opus 4.8
Branch: feature/fix-video-persists-after-disconnect
Polished: 2026-06-03
Completed: 2026-06-03

## 背景

`cleanupSoraMediaState`（`src/app/actions.ts`）は video track を fire-and-forget で停止する（`stopLocalVideoTrack` を `void (async () => ...)()` で起動。`stopLocalVideoTrack` は `track.enabled = false` → 100ms sleep → `track.stop()` の順）。この sleep は配信先にカメラの最後のコマが残るのを防ぐハックで、`stopLocalVideoTrack` のコメントに「Safari には効くが Firefox には残る」とある。

`cleanupSoraMediaState` は fire-and-forget を起動した直後、同期的に `setLocalMediaStream(null)` を呼ぶ。`setLocalMediaStream`（`src/app/signals.ts`）は `localMediaStream.value` の全 track を即 `stop()` する。JavaScript はシングルスレッドのため、100ms の setTimeout が明けるより先に `setLocalMediaStream(null)` の同期 stop が走る（仮想背景なし時、両者は同一 track オブジェクト）。`enabled = false` は sleep 前に当たるが、`stop()` は sleep を待たずに実行される。

closed 0030 はこの即 stop を意図的な安全網として設計し（0030 L112「track は確実に止まる。二重停止は冪等で無害」）、UI からの映像即時消去を優先して sleep を後追いに回した（0030 L101-112）。closed 0030 L156 は「Firefox 配信先の最終コマ残り」を明示的にスコープ外としており、本 issue はその継続として、0030 の設計トレードオフの結果 sleep ハックが機能しなくなる点を扱う。

## 仮想背景あり時の差異

仮想背景あり時、`localMediaStream` に入るのは `startProcessing` が返す processed track で、fire-and-forget が sleep する `stopVideoProcessors` の戻り値 originalTrack（生カメラ track）とは別オブジェクト。`setLocalMediaStream(null)` が即 stop するのは processed track 側で、`enabled = false` → sleep の手順は originalTrack 側にしか当たらない。配信されるのは processed track のため、仮想背景あり時は sleep ハックが配信側に構造的に当たらない。

## 手動確認（実害の切り分け）

`stop()` が早まること自体が即「最終コマ残り」を意味するとは限らず（実害はブラウザ挙動依存）、実害の有無を手動確認で切り分ける。

- 環境: Safari 最新（sleep が本来効くブラウザ。Firefox は元々効かない）。仮想背景あり / なしの両方。
- 手順: sendonly / sendrecv で配信 → 別タブ / 別端末で配信映像を受信表示 → 配信側で Disconnect → 受信側の `<video>` に最終コマ静止画が残らないことを確認する。
- 修正前後で「残る / 残らない」を記録し差分で判定する（元々残らないのか修正で直ったのか区別するため）。

## 修正方針（実害が確認された場合）

0030 の不変条件（signal を即 null にして UI から映像を即時消去、track は確実に停止）を壊さずに sleep を効かせる必要がある。単純な順序入れ替え（`setLocalMediaStream(null)` を sleep 後に回す）は UI 即時消去を遅らせるため不可。

video track を `localMediaStream` から `removeTrack` で外して fire-and-forget に停止を一任する素朴な案には、実装上 3 つの課題がある。

- `stopLocalVideoTrack`（`src/app/actions.ts`）の仮想背景なし経路は `localMediaStream.getVideoTracks()` から停止対象を取得するため、先に `removeTrack` すると track を取得できず停止できない（leak）。非仮想背景経路には停止対象 track を渡す引数が無いため新たな引数追加が要る（既存の `originalTrack` 引数は仮想背景の生カメラ track 用で流用できない）。
- 仮想背景あり時、`localMediaStream` 内は processed track だが `stopLocalVideoTrack` が sleep を当てるのは originalTrack。processed track を `removeTrack` で外すと `setLocalMediaStream(null)` でも `stopLocalVideoTrack` でも停止されず leak する。
- video track を `setLocalMediaStream(null)` の停止対象から外すと、0030 の二重停止フォールバック（fire-and-forget が例外で完走しなくても確実に止める。`stopLocalVideoTrack` の catch は stop しない）が失われ leak リスクが生じる。

実害が確認された場合、これら 3 課題を踏まえて設計を詰める。`setLocalMediaStream`（`src/app/signals.ts`）は `disposeMedia` 等の他経路からも呼ばれる公開関数のため、video 除外ロジックは `setLocalMediaStream` 自体ではなく呼び出し側に置く。`disposeMedia` は未接続プレビューの破棄で sleep 不要（0030 L118）のため変更しない。

## テスト

- このレースはタイミング依存かつ `MediaStream` を要するため、jsdom + モック禁止ではユニットテスト化できない。検証は上記の手動確認と、既存 e2e（sendonly / recvonly / sendrecv の connect → disconnect）が regress しないことに限定する。

## CHANGES.md

- 実害を確認して修正する場合、develop の `[FIX]` 群（0030 の FIX エントリの後）に `[FIX]` エントリを追加する。実害が無く修正しない場合は CHANGES 記載は不要。

## 影響範囲

- `src/app/actions.ts` の `cleanupSoraMediaState` および `stopLocalVideoTrack`（修正する場合）。`stopLocalVideoTrack` のシグネチャを変える場合は `setCameraDeviceAction` の呼び出し（`actions.ts` の `stopLocalVideoTrack` 呼び出し 2 箇所）にも波及する
- 受信側の最終コマ確認は配信中の切断（disconnect ハンドラ経由、または connected 状態での disconnectSora 経由）でのみ可能。disconnected 状態での Disconnect は配信していないため最終コマ確認の対象外で、ローカル掃除が regress しないことの確認に留める

## 解決方法

Safari で手動確認を実施した。sendonly / sendrecv で配信し、別タブ / 別端末の recvonly で受信表示した状態から配信側を Disconnect し、受信側の `<video>` を観察した。仮想背景 ON / OFF の両方で、受信側の映像は最終コマを残さず即座に消えた。

コード上は最終フレーム対策の sleep が `setLocalMediaStream(null)` の即 stop に追い越されているが、Safari は track の即停止で最終コマを残さないため実害は生じない。よって 0030 L112 の「即 stop を安全網とする」設計のまま修正不要と判断し、コード変更なしで close する。
