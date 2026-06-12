# 0040-bug-fix-vite-env-node-env-key

- Priority: High
- Created: 2026-06-09
- Completed: 2026-06-12
- Model: Opus 4.7
- Branch: feature/fix-vite-env-node-env-key
- Polished: 2026-06-09

## 目的

`createSignalingURL()` の dev 用フォールバック分岐で参照している `import.meta.env.NODE_ENV` は Vite がクライアントに注入しないキーで、ランタイムでは常に `undefined`。結果として `.env` 経由の `VITE_SORA_SIGNALING_URL` 上書きが完全に死んでいる。`import.meta.env.DEV` に置き換えて、`.env` の値が dev 環境で反映される本来の挙動を取り戻す。

## 優先度根拠

`.env.template` に `VITE_SORA_SIGNALING_URL` の既定値が同梱されているため、`.env.template` を `.env` にコピーして dev 作業を始める全開発者が当該分岐を踏む。本番ビルドには波及しない（後述）ため影響は dev のみだが、dev 体験を直撃するため High。

## 現状の問題

`src/utils.ts:271-273` は以下のとおり。行番号は Polished 時点 (2026-06-09) のもの。実装時にずれている可能性があるので、関数名 `createSignalingURL` を基準に対象を特定すること。

```ts
if (import.meta.env.NODE_ENV === "development" && import.meta.env.VITE_SORA_SIGNALING_URL) {
  return import.meta.env.VITE_SORA_SIGNALING_URL;
}
```

本リポジトリは `vite` 別名 `@voidzero-dev/vite-plus-core@0.1.24` を依存に持つ（`package.json` 参照）。Vite 系の `import.meta.env` には `NODE_ENV` キーが注入されない（注入されるのは `VITE_` プレフィックス変数と組み込み `MODE` / `DEV` / `PROD` / `BASE_URL` / `SSR`）。ランタイムでは `undefined` を返すため `undefined === "development"` で恒真に `false` となり、直後のフォールバック (`wss://<location.hostname>:<location.port>/signaling`、`location.port` が空のときはコロンごと省略) に必ず落ちる。

`src/vite-env.d.ts:1` で `/// <reference types="vite/client" />` を宣言済みのため Vite の `ImportMetaEnv` 標準型はそのまま使える状態にある。ただし `vite/client` 側の `ImportMetaEnv` は文字列インデックスシグネチャ的なフォールバック型を含むため、`import.meta.env.NODE_ENV` の参照は TypeScript の型エラーにならず静的検出を逃した（再発防止メモ）。

ソースコード内の `import.meta.env.NODE_ENV` 参照は `src/utils.ts:271-272` の 2 箇所のみ（grep 確認、issue 自身の引用を除く）。

## 設計方針

- `import.meta.env.NODE_ENV === "development"` を **`import.meta.env.DEV`** に置き換える。Vite 標準のブール値で `vp build` 時に `false` へ静的置換され、dev 専用コードがツリーシェイクされて本番バンドルから完全に消える。
- `src/vite-env.d.ts` は変更しない。
- 本番影響: `import.meta.env.DEV` は production ビルドで `false` に静的置換されるため、修正後も常にフォールバック URL を返す。現状の挙動と一致するので後方互換の問題はない。
- テストは別 issue で扱う。`createSignalingURL` は `import.meta.env` を直接読む構造で、モック禁止規約と両立するには引数化リファクタが必要なため、本 issue の責務外。**本 issue では別 issue 起票も行わない**（必要なら別途 `/create-issue` で起票する）。
- `CHANGES.md` の `## develop` の `[FIX]` セクション末尾に以下を追記する。担当者行を忘れないこと。

```
- [FIX] dev 環境で `.env` の `VITE_SORA_SIGNALING_URL` が反映されなかった問題を修正する
  - @voluntas
```

## 検証手順

修正前後で同条件を踏むこと。

1. `.env` に `VITE_SORA_SIGNALING_URL=wss://example.invalid/signaling` を置く（`example.invalid` は RFC 6761 予約で DNS 解決失敗が保証される）。
2. `enabledSignalingUrlCandidates` が裏で true にならない状態にする。`SignalingUrlModal` の OPFS 永続化値や URL クエリ `signalingUrlCandidates` が残っていると本ケースの分岐に入らないため、必要に応じてモーダルから OPFS をクリアし、URL クエリも空で起動する。
3. `vp dev` で起動し接続を試行する。
4. DebugPane の Log タブで `title=SIGNALING_URL` のエントリの `description` を確認する（`SIGNALING_URL` は `setLogMessages` 経由なので Timeline タブには出ない）。
   - 修正前: `wss://<location.hostname>:<location.port>/signaling`
   - 修正後: `wss://example.invalid/signaling`
5. `vp build && vp preview` で本番ビルド経由の挙動を同手順 4 で確認する。
   - `wss://<location.hostname>:<location.port>/signaling` のまま（`.env.production` の値も含めて影響を受けない）であること。

## 完了条件

- 検証手順 4 / 5 の修正後・本番の期待挙動が両方とも観測できること。
- `import.meta.env.NODE_ENV` の参照がコードベースに残っていないこと（grep で 0 件）。
- `CHANGES.md` の `## develop` の `[FIX]` に上記エントリが追記され、担当者行が付いていること。
- 既存テスト (`vp test`) が通ること。

## 解決方法

`src/utils.ts` の `createSignalingURL` 関数内の dev 用フォールバック分岐の条件式を `import.meta.env.NODE_ENV === "development"` から `import.meta.env.DEV` に置き換えた。

- 変更ファイル: `src/utils.ts` 1 行 (271 行目)
- `import.meta.env.NODE_ENV` のコードベース参照は 0 件 (grep 確認)
- `src/vite-env.d.ts` は設計方針どおり変更なし
- `CHANGES.md` の `## develop` の `[FIX]` セクション末尾にエントリを追記
- `vp test` (114 件) と `vp check` (228 ファイル) が通過することを確認
