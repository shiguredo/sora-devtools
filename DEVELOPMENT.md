# 開発

**この資料は sora-devtools 開発者向けです**

## corepack

```
$ brew uninstall pnpm npm yarn
$ brew install corepack
$ corepack enable pnpm npm yarn
$ corepack prepare pnpm@latest-8 --activate
```

## 開発環境

- pnpm
  - 最新版
  - package.json でバージョンを確認すること
- pnpm install
  - これで事前に利用するライブラリをインストールする

## 開発準備

- `pnpm install` を実行

## 開発

- `pnpm run dev` でローカルサーバを起動する

## パッケージ更新

sora-devtools の package 更新

- `pnpm up` を実行する

## sora-js-sdk の動作確認を行いたい場合

- ローカルに sora-js-sdk を clone しておく
- sora-js-sdk のトップディレクトリで `pnpm link` を実行する
- sora-devtools のトップディレクトリで `pnpm link "sora-js-sdk"` を実行する(`readlink node_modules/sora-js-sdk` で sora-js-sdk がシンボリックリンクになっていることが確認できれば成功)
