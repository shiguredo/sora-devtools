# 0041-bug-fix-track-event-streams-null-check

- Priority: Medium
- Created: 2026-06-09
- Completed: 2026-06-16
- Model: Opus 4.7
- Branch: feature/fix-track-event-streams-null-check
- Polished: 2026-06-16

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

### `isCurrent` クロージャとの関係

現状の `"track"` リスナーは冒頭で `if (!isCurrent()) return;` (`actions.ts` L1132-1134) を実行している。これは closed/0047 (`setSoraCallbacks の各リスナーに自己同一性チェックを追加する`) で導入された防御層で、`reconnectSora` で旧接続のリスナーが残り続けるとき、旧接続から飛んできた track イベントが新セッションの `remoteClients` を破壊することを防ぐ。本 issue ではこの `isCurrent` チェックを失わせない。

### `handleTrackEvent` の切り出し方針

現在 `setSoraCallbacks` 内のクロージャに置かれている `"track"` リスナー本体のうち、`isCurrent` 判定を通過した後の処理を、`actions.ts` のトップレベル `export const handleTrackEvent = (event: RTCTrackEvent): void => { ... }` として切り出す。 `actions.ts` の既存 export はすべて `export const ... = (...) => ...` の arrow 形式 (`isConnectionDestroyedNotify` / `cleanupSoraMediaState` / `requestMedia` / `connectSora` 等) であり、それに合わせる。

`setSoraCallbacks` 側は以下のような薄いラッパで `isCurrent` を維持したまま `handleTrackEvent` を呼ぶ。

```ts
soraConnection.on("track", (event: RTCTrackEvent) => {
  // 旧接続からの track が新セッションの remoteClients に混入するのを防ぐため
  // timeline 記録も含めて完全に skip する (closed/0047 と同方針)
  if (!isCurrent()) {
    return;
  }
  handleTrackEvent(event);
});
```

`handleTrackEvent` は `event` のみ受け取り、内部では `signals.*` と `registerTrackEndedListener` を `actions.ts` のモジュールスコープから直接参照する。 `registerTrackEndedListener` 自体は本 issue では export しない。 `isCurrent` 判定は `handleTrackEvent` には含めず、 `setSoraCallbacks` 側のラッパが担う (テスト時に `signals.sora.value` を設定する必要が無くなる)。

この切り出しは「テスト到達のための構造変更」であり、CLAUDE.md「モックやスタブは絶対に利用しないこと」を守りつつ単体テストを書くために必要な前提。先例として closed/0033 で `cleanupSoraMediaState` が同じ理由 (テスト到達) で `export` 化されたパターンに揃える。

### `handleTrackEvent` の冒頭ロジック

`handleTrackEvent` 本体の冒頭は以下の順とする (現状の `isCurrent` チェック後のロジックと同じ順序で、その直後に空配列ガードを追加する形)。

```ts
export const handleTrackEvent = (event: RTCTrackEvent): void => {
  signals.setTimelineMessage(createSoraDevtoolsTimelineMessage("event-on-track"));
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
  // 既存の 6 箇所の event.streams[0] 参照は以降そのまま残す
  // ...
};
```

新規 type は作らず既存 `event-on-track` を流用し、空配列ケースは `createSoraDevtoolsTimelineMessage(type, data?)` の `data` で識別する (同モジュール内に 2 引数呼び出しの先例が複数あり、それに揃える)。`event-on-track` を流用する判断根拠は、本 timeline メッセージはデバッグペインで表示される開発者向けデバッグ情報であり、 `data.emptyStreams` を表示側で特別扱いしなくても運用上問題ないため (表示側の `TimelineMessages.tsx` 等は本 issue では変更しない)。新規 type を追加すると別 issue で表示側のラベルも追加する必要が生じる。

### 既存参照の維持

既存の `event.streams[0]` 参照 (6 箇所) は **そのまま残す**。`length === 0` ガード追加以外の書き換え (分解代入・ローカル定数化など) は行わない。レビューでの差分を最小化して本 issue の主旨 (防御層追加) から外れる変更を入れないため。

空配列イベントの場合、`event.track` 単独でリモートクライアントを生成・保持する経路は無く、`removeRemoteClientCleanup` / `clearRemoteMediaClients` が参照する `connectionId` キーも `streams[0].id` 由来のため、早期 return で迷子 state は発生しない。

### CHANGES.md

`CHANGES.md` の `## develop` 内 `[FIX]` セクション末尾 (`### misc` セクションの直前) に以下を追記する。担当者行を忘れないこと。

```
- [FIX] `track` イベントで `event.streams` が空配列のときの防御を追加する
  - @voluntas
```

## 検証手順

`src/app/actions.test.ts` に空配列ケースの観察テストを追加する。 `handleTrackEvent` は `isCurrent` 判定を含まない本体処理のみを受け持つため、テストで `signals.sora.value` を設定する必要は無い。

1. `actions.test.ts` の named import に `handleTrackEvent` を `./actions.ts` から、`timelineMessages` を `./signals.ts` から追加する (既存テストの中括弧付き import スタイルに揃える)。
2. テスト本体では事前に以下の signal を初期化する。signal への直接代入は既存テストおよび `signals.ts` の `resetMessagesState` 内パターンに倣う。
   - `remoteClients.value = []`
   - `timelineMessages.value = []`
   - `signals.sora.value` は触らない (`handleTrackEvent` は `isCurrent` 判定を含まないため未設定で問題ない)
3. 入力は `handleTrackEvent({ streams: [], track: { id: "t1", kind: "audio" } } as unknown as RTCTrackEvent)` のリテラル。 `RTCTrackEvent` は jsdom に存在しないコンストラクタなので、必須プロパティのみを持つリテラルを型キャストして渡す。空配列ガードのコード経路でのみ `event.track.id` / `event.track.kind` を参照するため最小プロパティのみで足りる ( `event.track.*` の他プロパティを参照するパッチが将来入った場合は本テストの入力リテラルも追従させる)。
4. 正常系 ( `streams[0]` が `MediaStream` を含むケース) は追加しない。 jsdom には `MediaStream` のコンストラクタが無く `new MediaStream()` が実行できないため、本リポジトリの規約と両立する形では書けない。
5. 追加するテストケース (テストメッセージは日本語、 `test` / `assert` を使う):
   - 「`handleTrackEvent` は `streams` が空配列のとき例外を投げない」
   - 「`handleTrackEvent` は `streams` が空配列のとき `remoteClients` を変更しない」
   - 「`handleTrackEvent` は `streams` が空配列のとき `event-on-track` の timeline メッセージを 2 件 (冒頭の無条件 1 件 + 空配列ガード 1 件) 追加する」
     - 呼び出し前後の `timelineMessages.value` を比較し、差分 2 件であることを確認する (既存メッセージの長さに依存しない)。
     - 1 件目: `type === "event-on-track"` かつ `data === undefined`
     - 2 件目: `type === "event-on-track"` かつ `data` がオブジェクトで、 `data.emptyStreams === true` かつ `data.trackId === "t1"` かつ `data.kind === "audio"`
     - `TimelineMessage.data` は `Record<string, unknown> | undefined` 型なので、 2 件目の `data` 内プロパティをアサートする前に `assert(typeof data === "object" && data !== null)` で narrow してから個別キーを `assert.equal` で確認する。

## 完了条件

- 上記 3 テストおよび既存テストが `pnpm test` で全件 pass すること。
- 空配列イベント到達時に `TypeError` が発生せず、`remoteClients` も書き換えられないこと（テストで確認）。
- `CHANGES.md` の `## develop` の `[FIX]` セクション末尾に上記エントリが追記され、担当者行が付いていること。
- 既存 Playwright e2e（`pnpm test:e2e`）が通ること。

## 解決方法

- `src/app/actions.ts` の `setSoraCallbacks` 内 `"track"` リスナー本体を `handleTrackEvent` として export 関数に切り出した。`isCurrent()` 判定は `setSoraCallbacks` 側のラッパに残し、`handleTrackEvent` 本体はテスト時に `signals.sora.value` の設定を要しない形にした。
- `handleTrackEvent` 冒頭に `event.streams.length === 0` の早期 return を追加した。空配列のときは `remoteClients` を変更せず、`event-on-track` の timeline メッセージを 2 件（無条件 + `emptyStreams / trackId / kind` 付き）追加して return する。既存の `event.streams[0]` 参照 6 箇所はそのまま残した。
- `src/app/actions.test.ts` に `handleTrackEvent` の空配列ガードのテスト 3 件を追加した。`assert.doesNotThrow` で例外を投げない契約を表明し、`remoteClients` が変更されないこと、timeline メッセージが 2 件追加されることを検証する。
- `CHANGES.md` の `## develop` の `[FIX]` セクション末尾にエントリを追加した。
