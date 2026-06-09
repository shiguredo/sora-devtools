# 0041-bug-fix-track-event-streams-null-check

- Priority: Medium
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-track-event-streams-null-check
- Polished: 2026-06-09

## 目的

`soraConnection.on("track", ...)` ハンドラは `event.streams[0]` を 6 箇所で参照しているが、空配列チェックが一切ない。現行 `sora-js-sdk` 2025.2.0 は publisher 系の `ontrack` で空配列を SDK 内で弾いており、subscriber 系では空配列の場合に SDK 側で先に throw するため、現状アプリ層には実害は到達しない。ただし SDK の防御が変わったときに即座に画面が壊れる経路を残さないよう、アプリ層にも明示的な早期 return を追加して防御層を二重化する。

## 優先度根拠

現行 SDK との組み合わせで実害は観測されないため Medium。SDK ソース (`node_modules/sora-js-sdk/dist/sora.mjs` の publisher 系 `ontrack`) で `const o = t.streams[0]; if (!o) return;` の空配列ガードが入っていることを確認し、現実害がない予防修正と判定。

## 現状の問題

`src/app/actions.ts` の `setSoraCallbacks` 内 `soraConnection.on("track", ...)` ハンドラは Polished 時点 (2026-06-09) で 1112-1137 行付近にある。実装時に行番号がずれている可能性があるため、関数名 `setSoraCallbacks` 内の `"track"` リスナーを基準に特定すること。`event.streams[0]` の参照は以下の 6 箇所で、いずれも空配列チェックが無い。

| 行（Polished 時点） | 参照                           | 用途                                     |
| ------------------- | ------------------------------ | ---------------------------------------- |
| 1116                | `event.streams[0].id`          | `remoteClientsValue.find` の検索キー     |
| 1119                | `event.streams[0].getTracks()` | 新規時の timeline ログ生成ループ         |
| 1128                | `event.streams[0]`             | `setRemoteClient.mediaStream` の値       |
| 1129                | `event.streams[0].id`          | `setRemoteClient.connectionId` の値      |
| 1134                | `event.streams[0].getTracks()` | 無条件の ended リスナー登録ループ        |
| 1135                | `event.streams[0].id`          | `registerTrackEndedListener` の第 1 引数 |

1134 / 1135 は新規・既存どちらの分岐でも実行される無条件参照のため、早期 return が無いと空配列到達時に必ず `TypeError`。標準の `addEventListener` 系は単発例外でハンドラを解除しないため、ハンドラ全体が機能停止する事は無いが、その回のイベント分の `remoteClient` 追加・ended リスナー登録が取りこぼされ、後段のメディア表示が壊れる。

`removetrack` ハンドラ内（1141 行付近）に「sora-js-sdk の "track" イベントは常に RTCTrackEvent を渡すため event は non-null」という古いコメントが紛れ込んでいるが、本 issue とは別の話なのでスコープ外（コメント整理は別途）。

`tsconfig.json` には `noUncheckedIndexedAccess` が設定されていないことを確認済み。`event.streams[0]` の参照は型上 `MediaStream` として扱われる。

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

  既存の timeline type は `event-on-{SDK イベント名}` の 1 トークン形式（`event-on-track` / `event-on-removetrack` / `event-on-disconnect` 等）で統一されている。新規 type は作らず既存 `event-on-track` を流用し、空配列ケースは `createSoraDevtoolsTimelineMessage(type, data?)` の `data` で識別する（`actions.ts:700, 734, 865` ほかで既に 2 引数呼び出しが使われている先例に揃える）。

- 既存の `event.streams[0]` 参照（6 箇所）は **そのまま残す**。`length === 0` ガード追加以外の書き換え（分解代入・`?.` 化・ローカル定数化など）は行わない。`tsconfig.json` の `noUncheckedIndexedAccess` 未設定を確認済みのため、型エラーも起きない。
- 1119 / 1134 で `event.streams[0].getTracks()` を 2 回回している既存構造（1119 は新規 remoteClient のときだけ timeline ログ、1134 は新規/既存どちらでも ended リスナー登録）は意図的なものとしてスコープ外、リファクタしない。
- `removetrack` ハンドラは本 issue のスコープ外。
- 同じ `setSoraCallbacks` 内の `"disconnect"` ハンドラを触る [[0047-bug-fix-disconnect-listener-self-check]] と修正範囲が物理的に近接するため、両者を並行で進める場合はマージ衝突に注意する。

- `CHANGES.md` の `## develop` の `[FIX]` セクションは既に存在する。`[FIX]` セクション末尾（Polished 時点で 200 行台付近、`## 26.1.0` の手前まで）に以下を追記する。担当者行を忘れないこと。

  ```
  - [FIX] `track` イベントで `event.streams` が空配列のときの防御を追加する
    - @voluntas
  ```

## 検証手順

`src/app/actions.test.ts` に空配列ケースの観察テストを追加する。先例 `cleanupSoraMediaState` (`actions.ts:1056-1082`, `actions.test.ts:48-57`) に倣い、`signals` モジュールを直接読み書きする「非純粋な切り出し」とする（モック禁止規約と両立させるため）。

1. `setSoraCallbacks` の `"track"` リスナー本体を `handleTrackEvent(event: RTCTrackEvent): void` として `actions.ts` のトップレベルに切り出し `export` する。`event` のみ受け取り、内部では `signals.*` と `registerTrackEndedListener` を `actions.ts` のモジュールスコープから直接参照する（純粋関数化はしない）。
2. 現在 module-local const の `registerTrackEndedListener` (`actions.ts:1004` 付近) も同じ方針でテスト到達可能にするため `export` する。
3. `setSoraCallbacks` 側は `soraConnection.on("track", handleTrackEvent)` に差し替える。
4. テストでは事前に `signals.remoteClients.value = []` のように signal を初期化してから `handleTrackEvent({ streams: [], track: { id: "t1", kind: "audio" } } as unknown as RTCTrackEvent)` で呼び、signal の変化を観察する。
5. 正常系（`streams[0]` が `MediaStream` を含むケース）のテストは追加しない。jsdom 29.x は `MediaStream` クラスを提供しないため、モック禁止規約と両立する形では正常系を `vp test` で書けない。正常系は既存の Playwright e2e (`tests/sendrecv.test.ts` 等) でカバーされる。
6. 追加するテストケース（テストメッセージは日本語、`test` / `assert` を使う）:
   - 「`handleTrackEvent` は `streams` が空配列のとき例外を投げない」
   - 「`handleTrackEvent` は `streams` が空配列のとき `remoteClients` を変更しない」
   - 「`handleTrackEvent` は `streams` が空配列のとき `event-on-track` の timeline メッセージを 2 件（無条件 1 件 + ガード 1 件）追加する」

## 完了条件

- 上記 3 テストが `vp test` で pass すること。
- 空配列イベント到達時に `TypeError` が発生せず、`remoteClients` も書き換えられないこと（テストで確認）。
- `CHANGES.md` の `## develop` の `[FIX]` セクション末尾に上記エントリが追記され、担当者行が付いていること。
- 既存テスト (`vp test`) および既存 Playwright e2e が通ること。
