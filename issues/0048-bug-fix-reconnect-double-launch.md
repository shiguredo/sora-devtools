# 0048-bug-fix-reconnect-double-launch

- Priority: High
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-reconnect-double-launch
- Polished: 2026-06-09

## 目的

`<Reconnect />` コンポーネントは `useEffect(() => { void reconnectSora(); }, [])` で mount 時に `reconnectSora` を起動する。Toast を `<Toast delay={5000} onClose={onClose}>` で表示しているが `autohide` 指定が無いため自然 close はせず、ユーザー手動クローズで `setSoraReconnecting(false)` → unmount。その後 abend が再度起きると `setSoraReconnecting(true)` で再 mount し `reconnectSora` の二度目が走り始める。`reconnectSora` 自体に in-flight ガードがなく、先発と後発が `signals.sora` / `signals.setSoraConnectionStatus` を取り合い、片方の失敗 catch (`setSora(null)`) が他方の成功した接続を破壊する。

mount トリガそのものを撲滅するため `<Reconnect />` の `useEffect` を撤去して reconnect 起動を呼び出し側（abend ハンドラ）に集約し、加えて `reconnectSora` 自体に in-flight ガードを追加して二重防御する。

## 優先度根拠

- abend 経由の再接続中に Toast を閉じて再 abend が起きると確実に踏む経路。不安定な接続環境で再接続を繰り返す場面では実害頻度が高い。
- `signals.setSora` は signals.ts 内で `soraDataChannels` を空にする副作用も持つため、二重起動の失敗側 catch で `setSora(null)` が走ると DataChannel 経路が完全に壊れる。
- 関連 issue (0047 の `isCurrent()` ガード) で旧接続イベントによる `setSoraReconnecting(true)` の遅延発火は防がれるが、本 issue は「`<Reconnect />` の mount トリガ自体が二回走る経路」を扱うため独立に必要。

## 現状の問題

`src/components/AlertMessages.tsx` の `Reconnect` は Polished 時点 (2026-06-09) で 9-26 行付近、`reconnectSora` は `src/app/actions.ts` で 1618-1681 行付近にある。実装時に行番号がずれている可能性があるため、コンポーネント名 `Reconnect` と関数名 `reconnectSora` を基準に特定すること。

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
- StrictMode は本プロジェクトでは未採用（`src/main.tsx:11` の `render(<App />, rootElement)` 直叩き、`grep StrictMode` 0 件）。StrictMode 由来の意図的 double-invoke 経路は **存在しない**。

二重起動が起きる現実的経路:

1. abend が発生 → `actions.ts:1181` 付近の disconnect ハンドラが `setSoraReconnecting(true)` を立てる。
2. `<Reconnect />` が mount → `useEffect` で `void reconnectSora()` （先発）が起動。
3. 先発が `attemptReconnection` ループ中（`actions.ts:1576-1614` 付近）に、ユーザーが Toast を手動クローズ → `setSoraReconnecting(false)`。
4. `<Reconnect />` が unmount（先発の Promise は走り続ける）。
5. 不安定な回線で次の abend イベントが発生 → 再度 `setSoraReconnecting(true)`。
6. `<Reconnect />` が再 mount → `useEffect` で `void reconnectSora()` （後発）が起動。
7. 先発と後発が並走する。
   - 後発が `signals.setSoraConnectionStatus("connecting")` で先発の状態を上書き（`actions.ts:1620` 付近）。
   - 後発の `attemptReconnection` が `signals.setSora(soraConnection_B)` を立てる（`actions.ts:1593` 付近）。
   - 先発の catch が `setSora(null)` を呼ぶ（`actions.ts:1601` 付近）と、後発の `sora_B` が消える。`soraDataChannels` も連鎖クリアされる。

## 設計方針

mount トリガそのものを撲滅する案と in-flight ガードを **両方** 採用する。両方採用する理由は、片方ずつでは別経路の二重起動を防げないため:

- mount トリガ撲滅のみ: 将来 `reconnectSora` を別経路から呼ぶ追加開発が入った場合に再発する。
- in-flight ガードのみ: 先発の `reconnectSora` が `setSoraReconnecting(false)` を呼ぶ前に後発が起動すると、in-flight Promise が同じものを共有するため一見動くが、`<Reconnect />` の mount/unmount 回数が増えてレンダリングコストが上がる。

### 1. `<Reconnect />` の `useEffect` 廃止

`<Reconnect />` を表示専用に変える。`useEffect` を削除して `reconnectSora` の起動責務を呼び出し側に移す。

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

### 2. `reconnectSora` 起動を `setSoraReconnecting(true)` の呼び出し元に集約

`setSoraReconnecting(true)` の呼び出しは `src/app/actions.ts:1181` 付近の disconnect ハンドラ（abend 経路）の 1 箇所のみ（grep 確認）。ここで `setSoraReconnecting(true)` の直後に `void reconnectSora()` を呼ぶ形に変える。

```ts
// actions.ts の disconnect ハンドラ内（abend かつ reconnect 有効時）
if (event.type === "abend" && reconnectValue) {
  signals.setSoraReconnecting(true);
  void reconnectSora();
}
```

[[0047-bug-fix-disconnect-listener-self-check]] の `isCurrent()` ガード適用後は、古い接続からの `setSoraReconnecting(true) + void reconnectSora()` 自体が起動しないため、本変更と整合する。

### 3. `reconnectSora` に in-flight ガード（防御の二重化）

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
  // 既存の reconnectSora の本体（1618-1681）をここに移植
  ...
};
```

**ポイント**:

- in-flight ガードは **関数の冒頭** で評価する。`signals.setSoraConnectionStatus("connecting")` 等の signal 副作用を二回起こさせない。
- in-flight Promise を返すことで、`<Reconnect />` 廃止後の caller（abend ハンドラ）が `void reconnectSora()` で起動した場合も同じ。将来 `await reconnectSora()` を別 caller が書いた場合に in-flight に追従できる。

### 4. テスト戦略

`reconnectSoraImpl` は `navigator.mediaDevices.getUserMedia` と Sora 接続を含むため jsdom + モック禁止規約で単体テストは不可能。一方、in-flight ガード wrapper は副作用なしの薄い関数なので、`reconnectSoraImpl` を関数注入できる形に小リファクタすれば単体テスト可能。

ただし本 issue では新規ユニットテストは追加しない。理由:

- `reconnectSoraImpl` を export しない設計を維持したい（モジュール内部 API）。
- in-flight wrapper のテストは「同じ Promise インスタンスが返るか」「`finally` でクリアされるか」のみで、`actions.test.ts` を変更するコスト対効果が低い。
- 手動確認 + 既存 Playwright e2e でカバー。

### 5. 関連 issue と依存

- [[0044-bug-fix-cleanup-sora-media-state-async]]: `cleanupSoraMediaState` の async 化。本 issue の `reconnectSoraImpl` 内で `await cleanupSoraMediaState()` を使うため、**0044 を先に着手し、本 issue はその上に rebase する**。0044 マージ前なら同期版でも動作するが、最終形は async。
- [[0046-bug-fix-reconnect-failure-media-leak]]: `reconnectSora` 失敗パスでのローカル変数解放。本 issue の `reconnectSoraImpl` 内に移植されるロジックの一部。**0046 を先に着手し、本 issue で `reconnectSoraImpl` に移植する** 推奨順。
- [[0047-bug-fix-disconnect-listener-self-check]]: disconnect ハンドラの `isCurrent()` ガード。本 issue の「設計方針 2」で abend ハンドラに `void reconnectSora()` を直書きする変更と整合（古い接続からは `isCurrent()` で skip され、`setSoraReconnecting(true)` も `void reconnectSora()` も走らない）。**0047 を先または並行で着手**。
- 全体としての推奨マージ順: 0044 → 0046 → 0047 → 0048。

### 6. CHANGES.md エントリ

`CHANGES.md` の `## develop` の `[FIX]` セクション末尾（`### misc` サブセクションの直前）に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `reconnectSora` の二重起動を防止する
  - `<Reconnect />` の `useEffect` 起動を撤廃し、abend ハンドラから直接 `reconnectSora` を呼び出すように集約する
  - `reconnectSora` 自体にもモジュールローカルな in-flight Promise によるガードを追加する
  - @voluntas
```

### 7. スコープ外

- SDK 側の二重 connect 検出機構の追加要望（SDK チームへ別途）。
- Toast の `autohide` 自動 close 化（UX 変更で本 issue とは別軸）。
- `connectSora` 側の同種 in-flight ガード追加（別 issue で扱う）。
- `disconnectSora` で進行中の `reconnectSora` を強制キャンセルする機能（別 issue で扱う）。

## 検証手順

### A. 手動再現と修正後挙動

1. `vp dev` で起動し、`role=sendrecv` で接続する。
2. devtools console で `void (await fetch("/some-signal")).abort()` 相当の WebSocket 強制断、もしくは Sora signaling サーバを意図的に停止する。
3. abend が発火し Reconnect Toast が表示される。
4. Toast の close ボタンを手動クリックして閉じる（`setSoraReconnecting(false)` 発火）。
5. 再度 abend を起こす（手順 2 と同様）。
6. Toast が再表示される。修正前は内部で `reconnectSora` の二度目の起動が走り、devtools console で `signals.setSora` が二回 called されることが観測される（先発・後発両方）。
7. 修正後: devtools console で `signals.setSora` が 1 セッションごとに 1 回しか呼ばれないこと（後発が in-flight Promise を共有）。`<Reconnect />` の `useEffect` 撤去により mount/unmount のたびに起動しないこと。

### B. abend → 再接続成功の正常パス

8. 接続後に弱いネットワーク劣化（一時的な切断）を起こし、abend 後の自動 reconnect が成功する状況を作る。
9. UI 上で再接続が成功し、ローカル映像 / 音声が継続表示されることを確認する。
10. devtools console で `reconnectSora` の起動回数が 1 回であることを確認する（in-flight ガードが効いている前提で、abend ハンドラから 1 度だけ呼ばれる）。

### C. ユーザー操作によるキャンセル経路

11. abend 後の Reconnect 中に Toast を手動クローズして、`signals.reconnecting.value = false` の状態にする。
12. `attemptReconnection` のループ内 `if (!signals.reconnecting.value) break;` で break して `setSoraReconnecting(false)` が呼ばれる経路を辿る（既存挙動）。
13. その後すぐに abend が起きても、in-flight Promise が `finally` で null にクリアされているため、後発が独立した新しい Promise を作って起動できる（in-flight ガードがハングしない）。

## 完了条件

- 検証手順 A の 7 で `signals.setSora` が 1 セッションごとに 1 回しか呼ばれないこと。
- 検証手順 B の 10 で `reconnectSora` 起動回数が 1 回であること。
- 検証手順 C の 13 でキャンセル → 次の abend 経路で in-flight がハングしないこと。
- 正常な再接続シーケンスで UI のメディア表示が連続性を保つこと（既存 Playwright e2e で確認）。
- `CHANGES.md` の `## develop` の `[FIX]` 末尾に上記エントリが追記され、担当者行が付いていること。
- 既存テスト (`vp test`) および既存 Playwright e2e が通ること。
- 新規ユニットテストは追加しない（理由は設計方針 4 に記載）。
