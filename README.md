# Sora DevTools

![Static Badge](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)
[![GitHub tag (latest SemVer)](https://img.shields.io/github/tag/shiguredo/sora-devtools.svg)](https://github.com/shiguredo/sora-devtools)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## About Support

We will not respond to PRs or issues that have not been discussed on Discord. Also, Discord is only available in Japanese.

Please read <https://github.com/shiguredo/oss/blob/master/README.en.md> before use.

## 時雨堂のオープンソースソフトウェアについて

利用前に <https://github.com/shiguredo/oss> をお読みください。

## 概要

これは WebRTC SFU Sora に開発者ツールとして組み込まれている機能のオープンソース版です。

Sora の配信、視聴機能が一通り確認できるようになっています。
また何か問題あった場合の切り分けのための調査にも利用できるよう、レポート機能やデバッグ機能を搭載しています。

## オンラインサイト

**このサイトだけでは WebRTC SFU を試すことはできません。WebRTC SFU Sora を別途用意してください**

正式版 (master ブランチ) がデプロイされています。
<https://sora-devtools.shiguredo.app>

開発版 (develop ブランチ) がデプロイされています。
<https://canary.sora-devtools.shiguredo.app>

## スクリーンショット

[![Image from Gyazo](https://i.gyazo.com/e74879a751d32637a62a2a2a874e78cf.png)](https://gyazo.com/e74879a751d32637a62a2a2a874e78cf)

## 利用技術

- [WebRTC SFU Sora JavaScript SDK](https://github.com/shiguredo/sora-js-sdk)
- [Node\.js](https://nodejs.org/en)
- [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Bootstrap](https://getbootstrap.com/)
  - [React Bootstrap](https://react-bootstrap.github.io/)
- [Media Processors](https://github.com/shiguredo/media-processors)
  - [@shiguredo/virtual\-background \- npm](https://www.npmjs.com/package/@shiguredo/virtual-background)
  - [@shiguredo/noise\-suppression \- npm](https://www.npmjs.com/package/@shiguredo/noise-suppression)
  - [@shiguredo/mp4\-media\-stream \- npm](https://www.npmjs.com/package/@shiguredo/mp4-media-stream)
- [Playwright](https://playwright.dev/)
- [Vitest](https://vitest.dev/)
- [pnpm](https://pnpm.io/)
- [Biome](https://biomejs.dev/)

## 特徴

### フェイクメディア機能

getUserMedia や getDisplayMedia ではなく Canvas を利用したフェイクメディアを有効にできます。
この機能を使うことでカメラやマイクがなくても検証が可能です。

[![Image from Gyazo](https://i.gyazo.com/b76bdaeb6bc7eb1a44090a9180ee6d51.jpg)](https://gyazo.com/b76bdaeb6bc7eb1a44090a9180ee6d51)

### レポート機能

現在のクライアントのクライアントのログ、Sora からの通知、クライアント統計情報などをファイル化してダウンロードできます。

[![Image from Gyazo](https://i.gyazo.com/a6a21343c85b4854c99fb15eb3a2fccc.jpg)](https://gyazo.com/a6a21343c85b4854c99fb15eb3a2fccc)

### デバッグ機能

デバッグを有効にすると、ログ、通知、統計が有効になります。

[![Image from Gyazo](https://i.gyazo.com/c15b137e3d99d235845af5da0405ef4a.png)](https://gyazo.com/c15b137e3d99d235845af5da0405ef4a)

### コピー URL 機能

現在の設定を URL パラメーターに反映した状態の URL をクリップボードに保存します。既存の URL も変更されます

[![Image from Gyazo](https://i.gyazo.com/163e12ab790340fa7a83bc7b6aa5c456.jpg)](https://gyazo.com/163e12ab790340fa7a83bc7b6aa5c456)

初期状態の URL をコピーすると以下のような設定になります。

`https://sora-devtools.shiguredo.app/?channelId=sora&role=sendrecv&audio=true&video=true&debug=false`

## 用語集

- マルチストリーム
  - 1 接続で配信と視聴の両方を行う仕組みです
- サイマルキャスト
  - 配信時に複数の画質を同時に配信を行う仕組みです
- スポットライト
  - 直近で発話した N 人にスポットライトを当てるような仕組みです
- リアルタイムメッセージング
  - WebRTC のデータチャネルを利用してリアルタイムにメッセージの送受信を行う仕組みです
- 送受信
  - 自分の音声や映像を配信し、視聴も行う仕組みです
- 送信のみ
  - 自分の音声や映像をのみを配信し、視聴を行わない仕組みです
- 受信のみ
  - 自分の音声や映像を配信せず、視聴だけを行う仕組みです

## 機能一覧

以下の最新のブラウザで動作します。

- Google Chrome
- Mozilla Firefox
- Apple Safari
- Microsoft Edge

ただし一部の機能は特定のブラウザでのみ動作します。

### マルチストリーム

音声と映像を双方向、または片方向でやり取りする仕組みです。
Sora ではマルチストリームが標準機能となります。

### サイマルキャスト

配信側は複数の画質を同時に配信し、視聴側は画質を選択して視聴します。

**Chrome と Edge と Safari のみで動作します**

### スポットライト

直近で発話した N 人は高画質で配信され、それ以外は低画質で音声なしで配信される仕組みです。

**Chrome と Edge と Safari のみで動作します**

### スポットライト (サイマルキャスト無効)

配信時に複数の画質を配信しないため、発話をしていない時も画質の変更は行われません。
サイマルキャストに対応していないブラウザも利用することができます。

### リアルタイムメッセージング

音声と映像の送受信は行わず、データチャネルを利用したリアルタイムメッセージングが利用できます。

## ライセンス

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)

```text
Copyright 2017-2025, Shiguredo Inc.
Copyright 2017-2022, Yuki Ito (Original Author)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

このリポジトリに含まれる `favicon.ico` のライセンスは [CC BY\-ND 4\.0](https://creativecommons.org/licenses/by-nd/4.0/deed.ja) です。
