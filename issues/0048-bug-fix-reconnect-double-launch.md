# 0048-bug-fix-reconnect-double-launch

- Priority: High
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-reconnect-double-launch
- Polished: 2026-06-15

## 目的

`<Reconnect />` コンポーネントは `useEffect(() => { void reconnectSora(); }, [])` で mount 時に `reconnectSora` を起動する。Toast を `<Toast delay={5000} onClose={onClose}>` で表示しているが `autohide` 指定が無いため自然 close はせず、ユーザー手動クローズで `setSoraReconnecting(false)` → unmount。その後 abend が再度起きると `setSoraReconnecting(true)` で再 mount し `reconnectSora` の二度目が走り始める。`reconnectSora` 自体に in-flight ガードがなく、先発と後発が `signals.sora` / `signals.setSoraConnectionStatus` を取り合い、片方の失敗 catch (`setSora(null)`) が他方の成功した接続を破壊する。

mount トリガそのものを撲滅するため `<Reconnect />` の `useEffect` を撤去して reconnect 起動を呼び出し側（abend ハンドラ）に集約し、加えて `reconnectSora` 自体に in-flight ガードを追加して二重防御する。

## 優先度根拠

- abend 経由の再接続中に Toast を閉じて再 abend が起きると確実に踏む経路。不安定な接続環境で再接続を繰り返す場面では実害頻度が高い。
- `signals.setSora` は signals.ts 内で `soraDataChannels` を空にする副作用も持つため、二重起動の失敗側 catch で `setSora(null)` が走ると DataChannel 経路が完全に壊れる。
- 関連 issue ([[0047-bug-fix-disconnect-listener-self-check]] の `isCurrent()` ガード) で旧接続イベントによる `setSoraReconnecting(true)` の遅延発火は防がれるが、本 issue は「`<Reconnect />` の mount トリガ自体が二回走る経路」を扱うため独立に必要。

## 現状の問題

`src/components/AlertMessages.tsx` の `Reconnect` コンポーネントと `src/app/actions.ts` の `reconnectSora` を、それぞれ名前で特定する（行番号は陳腐化するため記載しない）。

```tsx
function Reconnect() {
  const onClose = (): void => {
    setSoraReconnecting(false);
  };
  useEffect(() => {
    void reconnectSora();
  }, []);
  return (
    <Toast delay={5000} onClose={onClose}>
      {/* ... ヘッダ・本文 ... */}
    </Toast>
  );
}
```

- `Toast` には `autohide` が無いため、Toast は自然非表示にならない。`onClose` は **ユーザー手動クローズ** でのみ呼ばれる。
- `<Reconnect />` は `reconnecting.value` が true のときだけ条件付きでレンダリングされる。
- StrictMode は本プロジェクトでは未採用（`src/main.tsx` で `render(<App />, rootElement)` 直叩き、`grep StrictMode` 0 件）。StrictMode 由来の意図的 double-invoke 経路は **存在しない**。

二重起動が起きる現実的経路:

1. abend が発生 → disconnect ハンドラの abend 経路が `setSoraReconnecting(true)` を立てる。
2. `<Reconnect />` が mount → `useEffect` で `void reconnectSora()` （先発）が起動。
3. 先発が `attemptReconnection` ループ中に、ユーザーが Toast を手動クローズ → `setSoraReconnecting(false)`。
4. `<Reconnect />` が unmount（先発の Promise は走り続ける）。
5. 不安定な回線で次の abend イベントが発生 → 再度 `setSoraReconnecting(true)`。
6. `<Reconnect />` が再 mount → `useEffect` で `void reconnectSora()` （後発）が起動。
7. 先発と後発が並走する。
   - 後発が `signals.setSoraConnectionStatus("connecting")` で先発の状態を上書き。
   - 後発の `attemptReconnection` が `signals.setSora(soraConnection_B)` を立てる。
   - 先発の catch が `setSora(null)` を呼ぶと、後発の `sora_B` が消える。`soraDataChannels` も連鎖クリアされる。

## 設計方針

mount トリガそのものを撲滅する案と in-flight ガードを **両方** 採用する。両方採用する理由は、片方ずつでは別経路の二重起動を防げないため:

- mount トリガ撲滅のみ: 将来 `reconnectSora` を別経路から呼ぶ追加開発が入った場合に再発する。
- in-flight ガードのみ: 先発の `reconnectSora` が `setSoraReconnecting(false)` を呼ぶ前に後発が起動すると、in-flight Promise が同じものを共有するため一見動くが、`<Reconnect />` の mount/unmount 回数が増えてレンダリングコストが上がる。

### `<Reconnect />` の `useEffect` 廃止

`<Reconnect />` を表示専用に変える。`useEffect` を削除して `reconnectSora` の起動責務を呼び出し側に移す。あわせて `AlertMessages.tsx` の import から `reconnectSora` と `useEffect` を取り除く。

```tsx
function Reconnect() {
  const onClose = (): void => {
    setSoraReconnecting(false);
  };
  return (
    <Toast delay={5000} onClose={onClose}>
      {/* ... 既存のヘッダ・本文 ... */}
    </Toast>
  );
}
```

### `reconnectSora` 起動を `setSoraReconnecting(true)` の呼び出し元に集約

`setSoraReconnecting(true)` の呼び出しは `src/app/actions.ts` の `setSoraCallbacks` 内 disconnect ハンドラ（abend 経路）の 1 箇所のみ（grep 確認）。ここで `setSoraReconnecting(true)` の直後に `void reconnectSora()` を呼ぶ形に変える。

```ts
// actions.ts の disconnect ハンドラ内（abend かつ reconnect 有効時）
if (event.type === "abend" && reconnectValue) {
  signals.setSoraReconnecting(true);
  void reconnectSora();
}
```

[[0047-bug-fix-disconnect-listener-self-check]] 適用後はこの分岐全体が `isCurrent()` の true 経路にだけ実行されるため、古い接続からの `setSoraReconnecting(true) + void reconnectSora()` 自体が起動しない。本変更は 0047 の `isCurrent()` ガードの **下** に書く（記録 1 → `isCurrent()` → 本処理（abend 分岐含む）→ 記録 2 → cleanup の順を維持）。

### `reconnectSora` に in-flight ガード（防御の二重化）

`reconnectSora` を `reconnectSoraImpl` と `reconnectSora` (wrapper) に分け、wrapper 側で in-flight Promise を保持する。後発呼び出しは **既存の in-flight Promise を返す**（no-op で undefined を返す形ではなく、caller が `await` できる形を維持）。クリアは `try/finally` で確実に行う。

```ts
let reconnectInFlight: Promise<void> | null = null;

export const reconnectSora = (): Promise<void> => {
  if (reconnectInFlight) {
    return reconnectInFlight;
  }
  reconnectInFlight = (async () => {
    try {
      await reconnectSoraImpl();
    } finally {
      reconnectInFlight = null;
    }
  })();
  return reconnectInFlight;
};

const reconnectSoraImpl = async (): Promise<void> => {
  // 既存の reconnectSora 本体をここに移植する
  ...
};
```

**ポイント**:

- in-flight ガードは **関数の冒頭** で評価する。`signals.setSoraConnectionStatus("connecting")` 等の signal 副作用を二回起こさせない。
- in-flight Promise を返すことで、`useEffect` 撤去後の caller（abend ハンドラ）が `void reconnectSora()` で起動した場合も同じ。将来 `await reconnectSora()` を別 caller が書いた場合に in-flight に追従できる。
- `reconnectSoraImpl` は `actions.ts` モジュール内部 API としておく（`export` しない）。

## テスト戦略

`reconnectSoraImpl` は `navigator.mediaDevices.getUserMedia` と Sora 接続を含むため jsdom + モック禁止規約で単体テストは不可能。in-flight ガード wrapper のテストは「同じ Promise インスタンスが返るか」「`finally` でクリアされるか」のみで、`reconnectSoraImpl` を関数注入できる形に小リファクタすれば書けるが、`reconnectSoraImpl` を export しない設計を維持したいため本 issue では新規ユニットテストは追加しない。手動確認 + 既存 Playwright e2e でカバーする。

## 関連 issue

- [[0046-bug-fix-reconnect-failure-media-leak]]: `reconnectSora` 失敗パスでのローカル変数解放。本 issue の `reconnectSoraImpl` 内に移植されるロジックの一部。0046 を先に着手し、本 issue で `reconnectSoraImpl` に移植する想定。
- [[0047-bug-fix-disconnect-listener-self-check]]: disconnect ハンドラの `isCurrent()` ガード。本 issue の「呼び出し元集約」と整合（古い接続からは `isCurrent()` で skip され、`setSoraReconnecting(true)` も `void reconnectSora()` も走らない）。0047 を先または並行で着手する想定。
- [[closed/0044-bug-fix-cleanup-sora-media-state-async]]: 既に closed。本 issue の `reconnectSoraImpl` 内で `await cleanupSoraMediaState()` を使う形（実体は 0044 マージ済みで `async` 化されている）。
- 推奨マージ順: 0046 → 0047 → 0048（0044 は完了済み）。

## CHANGES.md エントリ

`CHANGES.md` の `## develop` 内 `[FIX]` セクション末尾（`### misc` セクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `reconnectSora` の二重起動を防止する
  - `<Reconnect />` の `useEffect` 起動を撤廃し、abend ハンドラから直接 `reconnectSora` を呼び出すように集約する
  - `reconnectSora` 自体にもモジュールローカルな in-flight Promise によるガードを追加する
  - @voluntas
```

## スコープ外

- SDK 側の二重 connect 検出機構の追加要望（SDK チームへ別途）。
- Toast の `autohide` 自動 close 化（UX 変更で本 issue とは別軸）。
- `connectSora` 側の同種 in-flight ガード追加（別 issue で扱う）。
- `disconnectSora` で進行中の `reconnectSora` を強制キャンセルする機能（別 issue で扱う）。

## 検証手順

### A. 手動再現と修正後挙動

1. `pnpm dev` で起動し、`role=sendrecv` で接続する。
2. 意図的に abend を起こす（Sora signaling サーバを停止する、または DevTools の Network を Offline にする）。
3. abend が発火し Reconnect Toast が表示される。
4. Toast の close ボタンを手動クリックして閉じる（`setSoraReconnecting(false)` 発火）。
5. 再度 abend を起こす（手順 2 と同様）。
6. Toast が再表示される。修正後は in-flight Promise が共有されることで、後発の `reconnectSora` は wrapper 側で即 return し `reconnectSoraImpl` には到達しない。DebugPane の Timeline タブで `start-reconnect` エントリ（`reconnectSoraImpl` 冒頭で `setTimelineMessage("start-reconnect")` を呼ぶ既存挙動）が 1 セッションあたり 1 件しか追加されないことを確認する。

### B. abend → 再接続成功の正常パス

7. 接続後に弱いネットワーク劣化（一時的な切断）を起こし、abend 後の自動 reconnect が成功する状況を作る。
8. UI 上で再接続が成功し、ローカル映像 / 音声が継続表示されることを確認する。
9. DebugPane の Timeline タブで `start-reconnect` エントリが 1 件（abend ハンドラから 1 度だけ `reconnectSoraImpl` まで到達する）であることを確認する。

### C. ユーザー操作によるキャンセル経路

10. abend 後の Reconnect 中に Toast を手動クローズして、`signals.reconnecting.value = false` の状態にする。
11. `attemptReconnection` のループ内 `if (!signals.reconnecting.value) break;` で break して `setSoraReconnecting(false)` が呼ばれる経路を辿る（既存挙動）。
12. その後すぐに abend が起きても、in-flight Promise が `finally` で null にクリアされているため、後発が独立した新しい Promise を作って起動できる（in-flight ガードがハングしない）。

## 完了条件

- 検証手順 A の 6 で 1 セッションあたり `start-reconnect` エントリが 1 件しか追加されないこと（後発が in-flight ガードで `reconnectSoraImpl` まで到達しないこと）。
- 検証手順 B の 9 で `start-reconnect` エントリが 1 件であること。
- 検証手順 C の 12 でキャンセル → 次の abend 経路で in-flight がハングしないこと。
- 正常な再接続シーケンスで UI のメディア表示が連続性を保つこと（既存 Playwright e2e で確認）。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 既存テスト（`pnpm test`）および既存 Playwright e2e（`pnpm test:e2e`）が通ること。
