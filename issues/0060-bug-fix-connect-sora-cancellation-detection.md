# 0060-bug-fix-connect-sora-cancellation-detection

- Priority: Medium
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-connect-sora-cancellation-detection
- Polished: {YYYY-MM-DD}

## 目的

`connectSora` (`src/app/actions.ts:1484-1564`) が `preparing` / `connecting` 状態の途中でユーザーから Disconnect を押された場合、`disconnectSora` は `soraValue == null` で SDK 切断をスキップし `setSoraConnectionStatus("disconnected")` を立てるが、並列で動いている `connectSora` が `setSoraConnectionStatus("connecting")` で上書きし、最終的に `setSoraConnectionStatus("connected")` で接続が確立してしまう経路がある。ユーザーは Disconnect を押したのに接続される UX バグ。`connectSora` 内の各 `await` 前後で `connectionStatus.value === "disconnected"` を検知して接続を放棄する仕組みを追加する。

## 優先度根拠

- 即時のクラッシュではないため High ではない。
- ユーザーが Disconnect を押したのに接続される UX バグで、不安定な操作（接続ボタンを押した直後の Disconnect）で踏みやすい。Low ではない。
- 修正は `connectSora` 内の各 `await` ポイントへのキャンセル検知の追加で、影響範囲は `src/app/actions.ts` の 1 関数。
- Medium で確定する。

## 現状の問題

`connectSora` (`src/app/actions.ts:1484-1564`) のフロー:

1. `setSoraConnectionStatus("preparing")` (1486)
2. `await soraValue.disconnect()` （既存接続あり時）
3. `await createMediaStream(state)` （sendrecv / sendonly）
4. `setSoraConnectionStatus("connecting")` (1530)
5. `setSora(soraConnection)` (1532)
6. `await soraConnection.connect(mediaStream)` (1533)
7. 成功時: `setSoraConnectionStatus("connected")` (1562)

各 `await` の間にユーザーが Disconnect を押すと:

- `disconnectSora` は `soraValue == null` で `if (soraValue && ...)` 条件を満たさず、SDK 切断をスキップ。
- `setSoraConnectionStatus("disconnected")` (1707) で signal だけ立つ。
- 並列で `connectSora` が処理を継続し、`setSoraConnectionStatus("connecting")` で上書き、最終的に `connected` に。

結果: ユーザーは Disconnect を押したのに接続される。

## 設計方針

- `connectSora` の各 `await` の **直後** に `signals.connectionStatus.value === "disconnected"` を検知し、true なら処理を放棄する。
- 放棄時はローカル変数として持っている `mediaStream` の全 track を stop し、`soraConnection` が生成済みなら `void soraConnection.disconnect()` を呼ぶ。`setSora(null)` を呼んで signal を整理する。
- closed/0007 の「`preparing` / `connecting` 中の Disconnect を意図的にサポート」設計を維持する。本 issue は「Disconnect を意図したユーザー操作を `connectSora` 側で確実に観測する」変更で、closed/0007 の設計を補完する。
- 詳細（before/after コード、エッジケース一覧、テスト戦略、検証手順、CHANGES.md エントリ、スコープ外）は本 issue 着手時の polish で確定する。

## 関連 issue

- [[closed/0055-bug-fix-disconnect-button-preparing]]: 本 issue の「真のバグ」を抽出した close 済 issue。closed/0055 は「`DisconnectButton` の `disabled` に `preparing` を追加」案だったが closed/0007 と矛盾するため close され、本 issue が真の対処として起票された。
- [[closed/0007-fix-disconnect-during-connecting]]: 「`preparing` / `connecting` 中の Disconnect を意図的にサポート」設計を確立した過去 issue。本 issue はその設計を維持しつつ、`connectSora` 側でキャンセル検知を実装する。
- [[0048-bug-fix-reconnect-double-launch]]: `reconnectSora` の in-flight ガード。本 issue の `connectSora` キャンセル検知とは別観点だが、同関数群の防御強化として整合する。

## 完了条件

- `connectSora` の `preparing` / `connecting` 中にユーザーが Disconnect を押した場合、`connectSora` が接続を完了させずに放棄すること。
- 放棄時に取得済みの `mediaStream` の track が確実に stop されること。
- 放棄時に生成済みの `soraConnection` が `disconnect()` され `setSora(null)` で整理されること。
- closed/0007 の「`preparing` 中の Disconnect も意図的にサポート」設計が維持されていること（`DisconnectButton` の `disabled` に `preparing` を追加するアプローチは採用しない）。
- 既存テストおよび既存 Playwright e2e が pass すること。
- 詳細は本 issue 着手時の polish で確定する。
