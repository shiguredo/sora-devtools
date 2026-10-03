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

- モックやスタブは絶対に利用しないこと
- Vitest の Chai API である test / assert を利用すること
- Jest API は利用しないこと
  - it / describe / expect は利用しないこと

### fast-check

- `*.prop.ts` というファイル名にすること

## Preact

### Components

- CSS Modules を利用すること
- グローバルな CSS（App.css など）にコンポーネント固有のスタイルを書かないこと
- スタイルの適用方法:
  1. コンポーネントと同じディレクトリに `ComponentName.module.css` を作成し、意味的なクラス名で定義する
  2. 色・フォントは `src/styles/tokens.css` の CSS カスタムプロパティを利用する
     - Tailwind パレット由来の色は `--color-gray-*` / `--color-blue-*` / `--color-red-*` を使う
     - 汎用色は `--color-white` / `--color-black` / `--color-shadow` を使う
     - ブランド色は `--color-bs-*` / `--color-sora` を使う
     - 特定コンポーネント専用の状態色や単独で使う固有値は直接記述してよい
  3. 複数コンポーネントで共有するレイアウト（row / col-auto / col-6 / col-12 / form-row など）は `src/App.css` のクラスを利用する
- ユーティリティクラス（Tailwind 由来の px-2 / flex など）を新規に追加しないこと
- hover スタイルは `@media (hover: hover)` の中に書くこと（タッチデバイスでの張り付きを防ぐ）
- ボタンのテキストが状態によって変わる場合（例: "copy URL" → "copied!"）、ボタンの幅を固定して変わらないようにすること
