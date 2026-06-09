# 0055-bug-fix-disconnect-button-preparing

- Priority: Medium
- Created: 2026-06-09
- Completed: 2026-06-09
- Model: Opus 4.7
- Branch: feature/fix-disconnect-button-preparing
- Polished: 2026-06-09

## 目的（当初）

`DisconnectButton` の `disabled` 条件に `"preparing"` 状態が含まれていないため、`connectSora` の初期化途中（`preparing`）で Disconnect ボタンが押せて、両者の signal 更新が交差して状態が壊れる経路がある（具体的には `sora=null` のまま `connectionStatus="connected"` になる経路）。`disabled` 条件に `"preparing"` を追加して、この経路を UI レベルで塞ぐ提案だった。

## 解決方法

実装せずに close する。理由は以下の通り。

### 1. 過去の closed/0007 で「`preparing` 中の Disconnect を意図的に許可する」設計が確立している

[[closed/0007-fix-disconnect-during-connecting]]（2026-05-09 close、commit `d5f99d9b` 接続中・準備中の切断が無視される問題を修正する (#649)）は、当時「`preparing` / `connecting` 状態では Disconnect が無視される問題」を意図的に修正し、`disconnectSora` (`src/app/actions.ts:1697-1705`) が `connected` / `connecting` / `preparing` のいずれの状態でも切断するように設計を確立した:

```ts
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

closed/0007 のエッジケース定義（59-63 行）でも `preparing` 中のキャンセルを明示的にサポートしており、本 issue 0055 の「`DisconnectButton` の disabled に `preparing` を追加」はこの設計判断を直接巻き戻すことになる。本来「接続準備中にキャンセルしたい」という UX 上の正当なユースケースを潰すため、採用しない。

### 2. 真のバグは別経路にある

issue 0055 が指摘した「`sora=null` のまま `connected` になる」現象は実在するが、原因は `DisconnectButton` の disabled 条件ではなく、`connectSora` (`src/app/actions.ts:1484-1564`) 側のキャンセル検知不足にある:

- `connectSora` が `preparing` の段階（`soraValue` まだ null）でユーザーが Disconnect → `disconnectSora` は `soraValue == null` で SDK 側切断をスキップし `setSoraConnectionStatus("disconnected")` だけ立てる。
- 並列で動いている `connectSora` が `setSoraConnectionStatus("connecting")` で上書き → `await soraConnection.connect(mediaStream)` 成功 → `setSoraConnectionStatus("connected")`。
- 結果: ユーザーは Disconnect を押したのに最終的に `connected` になる。

これは `connectSora` 内の各 `await` 前後で `connectionStatus === "disconnected"` を検知して接続を放棄する仕組みが必要で、`DisconnectButton` の disabled 追加では解決しない（むしろ closed/0007 の設計を巻き戻すだけ）。

### 3. 別 issue として再起票する

真のバグへの対応は「`connectSora` 内のキャンセル検知」を主題とした別 issue として SEQUENCE を取得し起票する。`connectSora` の各 `await` 前後で signal を読んでキャンセル判定する設計案を含む issue として独立扱いする。本 issue 0055 を reopen するのではなく、新規 issue で `connectSora` の挙動修正を扱う方が clear。

### 4. 結論

実装せずに close する。本 issue は問題認識の入口としては正しいが、修正方針が過去の設計判断と矛盾するため採用しない。真の問題は別 issue で扱う。

## 関連

- [[closed/0007-fix-disconnect-during-connecting]]: `preparing` / `connecting` 中の Disconnect を意図的にサポートする設計を確立した過去 issue。本 issue とは設計方針が直接矛盾するため close 理由の根拠。
- [[0048-bug-fix-reconnect-double-launch]]: in-flight ガードの参考。`connectSora` の同種ガード追加は本 issue の対象外（別 issue で扱う）。
- [[0053-bug-fix-request-media-button-disabled]] / [[0054-bug-fix-update-media-stream-button-disabled]]: 同じ DevtoolsPane の disabled 整合性ファミリーだが、本 issue は close されたため整合性ファミリーから外れる。
