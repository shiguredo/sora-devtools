# 開発

**この資料は sora-devtools 開発者向けです**

## 開発環境

- npm
    - v6.9.0 以上
- yarn
    - v1.16.0 以上
- yarn install
    - これで事前に利用するライブラリをインストールする

## 開発準備

- `yarn install` を実行

## 開発
- `yarn start` でローカルサーバを起動する

## パッケージ更新
sora-devtools の package 更新
- `yarn upgrade` を実行する

## sora-js-sdk の動作確認を行いたい場合
- ローカルに sora-js-sdk を clone しておく
- sora-js-sdk のトップディレクトリで `yarn link` を実行する
- sora-devtools のトップディレクトリで `yarn link "sora-js-sdk"` を実行する(`readlink node_modules/sora-js-sdk` で sora-js-sdk がシンボリックリンクになっていることが確認できれば成功)
