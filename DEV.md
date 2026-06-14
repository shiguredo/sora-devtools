# 開発

**この資料は sora-devtools 開発者向けです**

## 開発環境

- nodejs
  - package.json と `.node-version` でバージョンを確認すること
  - vp インストール後は `vp env install` でプロジェクトのバージョンをインストールできる
- vp
  - macOS / Linux: `curl -fsSL https://vite.plus | bash` を実行する
  - Windows: `irm https://vite.plus/ps1 | iex` を実行する、または `vp-setup.exe` をダウンロードして実行する
  - インストール後、新しいシェルを開いて `vp help` を実行する
  - `vp install` は `package.json` の `packageManager` フィールドからパッケージマネージャを自動検出し、必要に応じてダウンロードして利用するため、個別に pnpm をインストールする必要はない

## 開発準備

- `vp env install` を実行して Node.js をインストールする
- `vp install` を実行

## .env ファイルのコピー

ローカル開発時に .env ファイルをコピーする手順が必要になります

- `cp .env.template .env` を実行
  - 必要に応じて内容を変更してください

## 開発サーバー

- `vp dev` でローカルサーバーを起動する

## パッケージ更新

sora-devtools の package 更新

- `vp update` を実行する

## sora-js-sdk の動作確認を行いたい場合

- ローカルに sora-js-sdk を clone しておく
  - sora-js-sdk のトップディレクトリで `vp install` と `vp build` を実行しておく
- sora-js-sdk のトップディレクトリで `vp link` を実行する
- sora-devtools のトップディレクトリで `vp link sora-js-sdk` を実行する
- sora-devtools の package.json 内で `"sora-js-sdk": "link:..."` と表示されていれば成功
  - sora-devtools のトップディレクトリで `vp install` `vp dev` を実行するとローカルの sora-js-sdk が利用される
