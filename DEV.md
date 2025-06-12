# 開発

**この資料は sora-devtools 開発者向けです**

## corepack

```bash
brew uninstall pnpm npm yarn
brew install corepack
corepack enable pnpm
corepack prepare pnpm@latest --activate
```

## 開発環境

- nodejs
  - package.json でバージョンを確認すること
- pnpm
  - package.json でバージョンを確認すること
- pnpm install
  - これで事前に利用するライブラリをインストールする

## 開発準備

- `pnpm install` を実行

## .env ファイルのコピー

ローカル開発時に仮想背景処理を利用する時に .env ファイルをコピーする手順が必要になります

- `cp .env.example .env` を実行
  - 内容の変更は不要です

## 開発サーバー

- `pnpm run dev` でローカルサーバーを起動する

## パッケージ更新

sora-devtools の package 更新

- `pnpm up` を実行する

## sora-js-sdk の動作確認を行いたい場合

- ローカルに sora-js-sdk を clone しておく
  - sora-js-sdk のトップディレクトリで `pnpm i` と `pnpm run build` を実行しておく
- sora-js-sdk のトップディレクトリで `pnpm link --dir <devtools path>` を実行する
  - `<devtools path>` は sora-devtools を clone したディレクトリパスを指定する
- sora-devtools の package.json ファイル内で `"sora-js-sdk": "link:<sora-js-sdk path>"` と置き換えられていたら成功
  - sora-devtools のトップディレクトリで `pnpm i` `pnpm run dev` を実行するとローカルの sora-js-sdk が利用される
