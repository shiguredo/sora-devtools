# 開発

**この資料は sora-devtools 開発者向けです**

## 開発環境

- npm
    - v6.9.0 以上
- npm install
    - これで事前に利用するライブラリをインストールする

## 開発準備

- `npm install` を実行

## 開発
- `npm run dev` でローカルサーバを起動する

## パッケージ更新
sora-devtools の package 更新
- `npm update` を実行する

## sora-js-sdk の動作確認を行いたい場合
- ローカルに sora-js-sdk を clone しておく
- sora-js-sdk のトップディレクトリで `npm link` を実行する
- sora-devtools のトップディレクトリで `npm link "sora-js-sdk"` を実行する(`readlink node_modules/sora-js-sdk` で sora-js-sdk がシンボリックリンクになっていることが確認できれば成功)
