# 0032 依存パッケージ更新を CHANGES.md に記載する

Created: 2026-06-03
Model: Opus 4.8
Branch: feature/fix-video-persists-after-disconnect
Polished: 2026-06-03

## 背景

コミット `c9ff3067`「依存パッケージを更新する」で `package.json` と `pnpm-lock.yaml` の依存を更新したが、`CHANGES.md` の `## develop` に対応するエントリが無い。更新した直接依存は後述の CHANGES.md エントリ案のとおりで、`pnpm-lock.yaml` 側では推移的依存も更新されている。

`vite` / `vite-plus` / `vitest`（vite-plus 0.1.20）は意図的に据え置かれており、更新対象に含まれない。

本 issue はコミット `c9ff3067` がこのブランチにあるため、0030 と同じ `feature/fix-video-persists-after-disconnect` ブランチ上で、この依存更新を `CHANGES.md` に追記する。

## 根拠

- CLAUDE.md「変更点とリリースノートの整合性を確認すること」。本プロジェクトは依存更新を `CHANGES.md` に記載する慣行がある。
- 影響評価: `tailwindcss` / `@tailwindcss/vite`（4.2 → 4.3）、`@playwright/test`（1.59 → 1.60）、`@types/node`（25.6 → 25.9）、`fast-check`（4.7 → 4.8）はマイナー更新で、他はパッチ。いずれもメジャーは据え置きのため後方互換破壊のリスクは低いが、利用者のビルドに影響する可能性があるため記載する価値がある。

## 内容

`CHANGES.md` の `## develop` 内の `### misc` サブセクションに `[UPDATE] package を更新する` エントリを追加する。

配置: `### misc` は機能に直接影響しない変更を置く場所（CLAUDE.md）であり、devtools のコードも機能も変えない依存のバージョン保守はこれに該当する。現行 develop の `### misc` 内にある `[UPDATE] oxlint v1.39.0 で追加されたルールを有効にする` の直後に挿入し、misc 先頭の `[CHANGE]` は動かさない（misc 内の既存の種別順序の乱れの是正は本 issue のスコープ外）。

追加する `CHANGES.md` エントリ案（バージョンは `c9ff3067` の `package.json` 差分と一致。表記は前例に倣い `旧 -> 新`。直接依存のみ記載し `pnpm-lock.yaml` の推移的依存は記載しない。担当者行はサブ項目と同じ 2 文字インデント）:

```
- [UPDATE] package を更新する
  - preact: 10.29.1 -> 10.29.2
  - @preact/signals: 2.9.0 -> 2.9.1
  - @preact/signals-agent-vite: 0.1.1 -> 0.1.2
  - @playwright/test: 1.59.1 -> 1.60.0
  - @tailwindcss/vite: 4.2.4 -> 4.3.0
  - tailwindcss: 4.2.4 -> 4.3.0
  - @types/node: 25.6.0 -> 25.9.1
  - @vitest/browser / @vitest/browser-playwright / @vitest/browser-preview: 4.1.5 -> 4.1.8
  - fast-check: 4.7.0 -> 4.8.0
  - @voluntas
```

## テスト

- `CHANGES.md` への追記のみで、コード・依存は変更しない（`package.json` は `c9ff3067` で更新済み）。テストは不要。

## 影響範囲

- `CHANGES.md`（`### misc` への 1 エントリ追加のみ）
