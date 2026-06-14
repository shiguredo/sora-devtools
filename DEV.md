# 開発

**この資料は sora-devtools 開発者向けです**

## 開発環境

- nodejs
  - package.json でバージョンを確認すること
- pnpm
  - package.json の `packageManager` フィールドでバージョンが固定されている
- pnpm install
  - これで事前に利用するライブラリをインストールする

## 開発準備

- `pnpm install` を実行

## .env ファイルのコピー

ローカル開発時に仮想背景処理を利用する時に .env ファイルをコピーする手順が必要になります

- `cp .env.template .env` を実行
  - 必要に応じて内容を変更してください

## 開発サーバー

- `vp dev` でローカルサーバーを起動する

## パッケージ更新

sora-devtools の package 更新

- `pnpm up` を実行する

## sora-js-sdk の動作確認を行いたい場合

- ローカルに sora-js-sdk を clone しておく
  - sora-js-sdk のトップディレクトリで `pnpm i` と `pnpm run build` を実行しておく
- sora-js-sdk のトップディレクトリで `pnpm link --global` を実行する
- sora-devtools のトップディレクトリで `pnpm link --global sora-js-sdk` を実行する
- sora-devtools の package.json 内で `"sora-js-sdk": "link:..."` と表示されていれば成功
  - sora-devtools のトップディレクトリで `pnpm i` `vp dev` を実行するとローカルの sora-js-sdk が利用される
