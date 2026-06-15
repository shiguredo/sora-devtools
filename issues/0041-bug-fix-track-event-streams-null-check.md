# 0041-bug-fix-track-event-streams-null-check

- Priority: Medium
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-track-event-streams-null-check
- Polished: 2026-06-15

## 目的

`soraConnection.on("track", ...)` ハンドラは `event.streams[0]` を計 6 箇所で参照しているが、空配列チェックが一切ない。現行 `sora-js-sdk` (`package.json` 上 `2026.1.0-canary.1`) では publisher 系 (sendrecv / sendonly を返す `ConnectionPublisher` クラス) の `ontrack` で空配列を明示ガードしており、subscriber 系 (recvonly を返す `ConnectionSubscriber` クラス) は明示ガードを持たないが空配列時は SDK 内で `streams[0].id` 参照により `TypeError` が発生してハンドラが抜けるため、結果として本アプリ層の `track` コールバックには空配列イベントが到達しない。アプリ層にも `length === 0` の早期 return を追加して、SDK の防御挙動が変わった場合に備える。

（ファイル名は `null-check` と表記しているが、本質は `event.streams.length === 0` の空配列ガードである。`RTCTrackEvent.streams` プロパティ自体は必ず存在するため、null/undefined チェックではなく要素数チェックで判定する。）

## 優先度根拠

現状アプリ層へ空配列イベントが到達する経路は確認できずユーザー影響を再現する手段がないため Medium。subscriber 側は明示防御ではなく SDK 内 throw による偶発的回避なので、SDK の比較順や `default` / `connectionId` 判定が変わると即座に空配列イベントが到達しうる。本 issue はその防御層を追加する。

## 現状の問題

`src/app/actions.ts` の `setSoraCallbacks` 内 `soraConnection.on("track", (event) => { ... })` ハンドラは `event.streams[0]` を以下の計 6 箇所で参照している（行番号は陳腐化するため記載しない。関数名と用途で特定する）。

- `remoteClientsValue.find` の検索キーとしての `event.streams[0].id`
- 新規 remoteClient 分岐内のループでの `event.streams[0].getTracks()`
- `signals.setRemoteClient` の `mediaStream` の値としての `event.streams[0]`
- `signals.setRemoteClient` の `connectionId` の値としての `event.streams[0].id`
- 末尾ループ（新規 / 既存どちらの分岐でも実行）での `event.streams[0].getTracks()`
- 同末尾ループ内 `registerTrackEndedListener` 第 1 引数の `event.streams[0].id`

末尾ループは無条件参照のため、早期 return が無いと空配列到達時に必ず `TypeError`。標準の `addEventListener` 系は単発例外でハンドラを解除しないため、その回のイベント分の `remoteClient` 追加・ended リスナー登録が取りこぼされる。

`tsconfig.json` に `noUncheckedIndexedAccess` は設定されていない。`event.streams[0]` の参照は型上 `MediaStream`（非 undefined）として扱われる。`RTCTrackEvent.streams` (lib.dom.d.ts 上 `ReadonlyArray<MediaStream>`) はプロパティ自体が必ず存在し空配列はあり得るため、`event.streams.length === 0` で判定できる。

## 設計方針

- ハンドラ冒頭の `signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-track"))` は維持。その直後に空配列ガードを入れる。

  ```ts
  if (event.streams.length === 0) {
    signals.setTimelineMessage(
      createSoraDevtoolsTimelineMessage("event-on-track", {
        emptyStreams: true,
        trackId: event.track.id,
        kind: event.track.kind,
      }),
    );
    return;
  }
  ```

  新規 type は作らず既存 `event-on-track` を流用し、空配列ケースは `createSoraDevtoolsTimelineMessage(type, data?)` の `data` で識別する（同モジュール内に 2 引数呼び出しの先例が複数あり、それに揃える）。

- 既存の `event.streams[0]` 参照（6 箇所）は **そのまま残す**。`length === 0` ガード追加以外の書き換え（分解代入・ローカル定数化など）は行わない。レビューでの差分を最小化して本 issue の主旨（防御層追加）から外れる変更を入れないため。

- 空配列イベントの場合、`event.track` 単独でリモートクライアントを生成・保持する経路は無く、`removeRemoteClientCleanup` / `clearRemoteMediaClients` が参照する `connectionId` キーも `streams[0].id` 由来のため、早期 return で迷子 state は発生しない。

- 現在 `setSoraCallbacks` 内のクロージャに置かれている `"track"` リスナー本体を、`actions.ts` のトップレベル `export const handleTrackEvent = (event: RTCTrackEvent): void => { ... }` として切り出す。`actions.ts` の既存 export はすべて `export const ... = (...) => ...` の arrow 形式（`isConnectionDestroyedNotify` / `cleanupSoraMediaState` / `requestMedia` / `connectSora` 等）であり、それに合わせる。`setSoraCallbacks` 側は `soraConnection.on("track", handleTrackEvent)` に差し替える。`handleTrackEvent` は `event` のみ受け取り、内部では `signals.*` と `registerTrackEndedListener` を `actions.ts` のモジュールスコープから直接参照する。`registerTrackEndedListener` 自体は本 issue では export しない。
  - 既存 `"track"` リスナー本体は `this` / `soraConnection` を参照しておらず、トップレベル化で挙動差は発生しない。
  - この切り出しは「テスト到達のための構造変更」であり、CLAUDE.md「モックやスタブは絶対に利用しないこと」を守りつつ単体テストを書くために必要な前提。先例として closed/0033 で `cleanupSoraMediaState` が同じ理由（テスト到達）で `export` 化されたパターンに揃える。

- `CHANGES.md` の `## develop` 内 `[FIX]` セクション末尾（`### misc` セクションの直前）に以下を追記する。担当者行を忘れないこと。

  ```
  - [FIX] `track` イベントで `event.streams` が空配列のときの防御を追加する
    - @voluntas
  ```

## 検証手順

`src/app/actions.test.ts` に空配列ケースの観察テストを追加する。

1. `actions.test.ts` の named import に `handleTrackEvent` を `./actions.ts` から、`timelineMessages` を `./signals.ts` から追加する（既存テストの中括弧付き import スタイルに揃える）。
2. テスト本体では事前に `remoteClients.value = []` と `timelineMessages.value = []` で関連 signal を初期化する。signal への直接代入は `actions.test.ts` の既存テストおよび `signals.ts` の `resetMessagesState` 内パターンに倣う。
3. 入力は `handleTrackEvent({ streams: [], track: { id: "t1", kind: "audio" } } as unknown as RTCTrackEvent)` のリテラル。`RTCTrackEvent` は jsdom に存在しないコンストラクタなので、必須プロパティのみを持つリテラルを型キャストして渡す。
4. 正常系（`streams[0]` が `MediaStream` を含むケース）は追加しない。jsdom には `MediaStream` のコンストラクタが無く `new MediaStream()` が実行できないため、本リポジトリの規約と両立する形では書けない。
5. 追加するテストケース（テストメッセージは日本語、`test` / `assert` を使う）:
   - 「`handleTrackEvent` は `streams` が空配列のとき例外を投げない」
   - 「`handleTrackEvent` は `streams` が空配列のとき `remoteClients` を変更しない」
   - 「`handleTrackEvent` は `streams` が空配列のとき `event-on-track` の timeline メッセージを 2 件（冒頭の無条件 1 件 + 空配列ガード 1 件）追加する」
     - 呼び出し前後の `timelineMessages.value` を比較し、差分 2 件であることを確認する（既存メッセージの長さに依存しない）。
     - 1 件目: `type === "event-on-track"` かつ `data === undefined`
     - 2 件目: `type === "event-on-track"` かつ `data` がオブジェクトで、`data.emptyStreams === true` かつ `data.trackId === "t1"` かつ `data.kind === "audio"`
     - `TimelineMessage.data` は `Record<string, unknown> | undefined` 型なので、2 件目の `data` 内プロパティをアサートする前に `assert(typeof data === "object" && data !== null)` で narrow してから個別キーを `assert.equal` で確認する。

## 完了条件

- 上記 3 テストおよび既存テストが `pnpm test` で全件 pass すること。
- 空配列イベント到達時に `TypeError` が発生せず、`remoteClients` も書き換えられないこと（テストで確認）。
- `CHANGES.md` の `## develop` の `[FIX]` セクション末尾に上記エントリが追記され、担当者行が付いていること。
- 既存 Playwright e2e（`pnpm test:e2e`）が通ること。
