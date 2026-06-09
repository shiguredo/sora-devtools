# 0059-bug-fix-load-url-entries-element-validation

- Priority: Low
- Created: 2026-06-09
- Completed: {YYYY-MM-DD}
- Model: Opus 4.7
- Branch: feature/fix-load-url-entries-element-validation
- Polished: {YYYY-MM-DD}

## 目的

`loadUrlEntries` (`src/opfs.ts:18-41`) は `JSON.parse` 後に `Array.isArray(settings.urlEntries)` で配列性のみ確認し、要素 `{ url: string; enabled: boolean }` の構造を検証していない。ユーザーが DevTools の Application タブで OPFS の `signaling-url-candidates.json` を直接書き換えた場合や、将来のスキーマ変更で互換性が崩れた場合に、不正な要素が `setSignalingUrlCandidates` に届く経路がある。要素の型検証を追加する。

## 優先度根拠

- 即時のクラッシュではないため High ではない。
- ユーザーが直接 OPFS ファイルを編集する経路は限定的だが、将来の OPFS スキーマ変更で互換性が崩れる地雷になる。Low ではない。
- 本 issue は [[0052-bug-fix-signaling-url-candidates-validation]] の「OPFS 経路」スコープ外として明示的に切り出されたもの。
- 修正は数行で完結し、影響範囲は `src/opfs.ts` の 1 関数のみ。
- Low で確定する。

## 現状の問題

`src/opfs.ts:30-34`:

```ts
const settings = JSON.parse(text) as SignalingUrlCandidatesSettings;

if (Array.isArray(settings.urlEntries)) {
  return settings.urlEntries;
}
```

`Array.isArray` で配列性のみ検証。要素 `{ url: string; enabled: boolean }` の構造は未検証で、`[{ url: 42, enabled: "yes" }]` などの不正な要素が下流に流れる可能性がある。

## 設計方針

- `loadUrlEntries` の `Array.isArray` 後に `every((entry) => typeof entry?.url === "string" && typeof entry?.enabled === "boolean")` の要素検証を追加する。
- 検証に失敗した場合は空配列を返す（`catch` 経路と同じ挙動）。
- 詳細（before/after コード、テスト戦略、検証手順、CHANGES.md エントリ、スコープ外）は本 issue 着手時の polish で確定する。

## 関連 issue

- [[0052-bug-fix-signaling-url-candidates-validation]]: URL クエリ経路の要素型検証。本 issue は OPFS 経路を扱う。マージ順は不問。

## 完了条件

- `loadUrlEntries` の戻り値が `{ url: string; enabled: boolean }[]` であることを実行時保証すること。
- 不正な要素を含む場合は空配列を返すこと。
- 既存テストおよび既存 Playwright e2e が pass すること。
- 詳細は本 issue 着手時の polish で確定する。
