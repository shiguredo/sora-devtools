# sora-devtools

- 後方互換性は考慮しないこと
- 一時的な修正はしないこと
- 変数名を省略しないこと
- 何か変更をする場合はテストを先に修正すること
- エラーメッセージは英語にすること
  - 末尾にピリオドをつけないこと
  - 具体的な情報を含めること
  - 期待値と実際の値を示すこと
  - 技術的だが簡潔にすること
- コメントに末尾コメントを利用しないこと

## 依存ライブラリ

### `@duckdb/duckdb-wasm`

- バージョンは `1.32.0` に固定すること
- `1.33.1-dev34.0` 以降は `opfs://` への書き込みがメモリ上だけで終わり、再 open でテーブルが消える
- 原因は duckdb/duckdb-wasm#2192。修正が npm の `latest` に入るまで更新しないこと
- `pnpm-workspace.yaml` の `overrides` でも `1.32.0` を強制している。`package.json` だけ上げても lock は変わらない

## デバッグについて

- かならず timeout を指定する事
- timeout は最大でも 10 秒以内に収めること

## テスト

- モックやスタブは絶対にりようしないこと
- Vitest の Chai API である test / assert を利用すること
- Jest API は利用しないこと
  - it / describe / expect は利用しないこと

### fast-check

- `*.prop.ts` というファイル名にすること

## Preact

### Components

- Tailwind CSS v4 を利用すること
- グローバルな CSS（App.css など）にコンポーネント固有のスタイルを書かないこと
- スタイルの適用方法 (優先順):
  1. Tailwind のユーティリティクラス
  2. Arbitrary Values `[値]` や Arbitrary Properties `[プロパティ:値]`
     - CSS 変数は `(--変数名)` の省略記法も可
  3. 複雑な場合は CSS Modules (`ComponentName.module.css`)
- カスタムユーティリティを追加する場合は `@utility` を使用する
- ボタンのテキストが状態によって変わる場合（例: "copy URL" → "copied!"）、ボタンの幅を固定して変わらないようにすること
