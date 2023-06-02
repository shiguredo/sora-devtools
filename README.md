# Sora DevTools

[![GitHub tag (latest SemVer)](https://img.shields.io/github/tag/shiguredo/sora-devtools.svg)](https://github.com/shiguredo/sora-devtools)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## About Support

We will not respond to PRs or issues that have not been discussed on Discord. Also, Discord is only available in Japanese.

Please read https://github.com/shiguredo/oss/blob/master/README.en.md before use.

## 時雨堂のオープンソースソフトウェアについて

利用前に https://github.com/shiguredo/oss をお読みください。

## 概要

これは WebRTC SFU Sora に開発者ツールとして組み込まれている機能のオープンソース版です。

Sora の配信、視聴機能が一通り確認できるようになっています。
また何か問題あった場合の切り分けのための調査にも利用できるよう、レポート機能やデバッグ機能を搭載しています。

## デモサイト

**このサイトだけでは WebRTC SFU を試すことはできません。WebRTC SFU Sora を別途用意してください**

https://sora-devtools.shiguredo.jp/

## スクリーンショット

[![Image from Gyazo](https://i.gyazo.com/cbf507d3708083adb21a8947149bf3e2.png)](https://gyazo.com/cbf507d3708083adb21a8947149bf3e2)

## 利用技術

- Sora JavaScript SDK
    - [WebRTC SFU Sora JavaScript SDK](https://github.com/shiguredo/sora-js-sdk)
- TypeScript
    - [TypeScript: Typed JavaScript at Any Scale\.](https://www.typescriptlang.org/)
- React
    - [React – A JavaScript library for building user interfaces](https://reactjs.org/)
- Redux
    - [Redux \- A predictable state container for JavaScript apps\. \| Redux](https://redux.js.org/)
- Next.js
    - [Next\.js by Vercel \- The React Framework](https://nextjs.org/)
- Redux Toolkit
    - [Redux Toolkit \| Redux Toolkit](https://redux-toolkit.js.org/)
- Bootstrap
    - [Bootstrap · The most popular HTML, CSS, and JS library in the world\.](https://getbootstrap.com/)
- Media Processors
    - [@shiguredo/virtual\-background \- npm](https://www.npmjs.com/package/@shiguredo/virtual-background)
    - [@shiguredo/noise\-suppression \- npm](https://www.npmjs.com/package/@shiguredo/noise-suppression)

## 特徴

### フェイクメディア機能

getUserMedia や getDisplayMedia ではなく Canvas を利用したフェイクメディアを有効にできます。
この機能を使うことでカメラやマイクがなくても検証が可能です。

[![Image from Gyazo](https://i.gyazo.com/266b2f6869dc44ad66ca5e54fcb21784.jpg)](https://gyazo.com/266b2f6869dc44ad66ca5e54fcb21784)

### レポート機能

現在のクライアントのクライアントのログ、Sora からの通知、クライアント統計情報などをファイル化してダウンロードできます。

[![Image from Gyazo](https://i.gyazo.com/2b246030142149c95a424576e360e959.jpg)](https://gyazo.com/2b246030142149c95a424576e360e959)

### デバッグ機能

デバッグを有効にすると、ログ、通知、統計が有効になります。

[![Image from Gyazo](https://i.gyazo.com/3f7fe3e011d99dfb87181ea6b252247d.png)](https://gyazo.com/3f7fe3e011d99dfb87181ea6b252247d)

### コピー URL 機能

現在の設定を URL パラメーターに反映した状態の URL をクリップボードに保存します。

[![Image from Gyazo](https://i.gyazo.com/2d0ddb0eb1f7006f249baf15bf072009.jpg)](https://gyazo.com/2d0ddb0eb1f7006f249baf15bf072009)

例えば multi_sendrecv で設定を弄らなかった場合は以下のような値になります。

```
https://example.com/devtools?multistream=true&role=sendrecv
```

## 用語集

- 送受信
    - 自分の音声や映像を配信し、視聴も行う仕組みです
- 送信のみ
    - 自分の音声や映像をのみを配信し、視聴を行わない仕組みです
- 受信のみ
    - 自分の音声や映像を配信せず、視聴だけを行う仕組みです
- マルチストリーム
    - 配信と視聴の両方を行う仕組みです
- サイマルキャスト
    - 配信時に複数の画質を同時に配信を行う仕組みです
- スポットライト
    - 直近で発話した N 人にスポットライトを当てるような仕組みです
- データチャネルメッセージング
    - WebRTC の機能を利用してデータの送受信を行う仕組みです

## 機能一覧

以下の最新のブラウザで動作します。

- Google Chrome
- Mozilla Firefox
- Apple Safari
- Microsoft Edge

ただし一部の機能は特定のブラウザでのみ動作します。

### マルチストリーム

音声と映像を双方向でやり取りする仕組みです。

- マルチストリーム送受信
- マルチストリーム送信のみ
- マルチストリーム受信のみ

### マルチストリームマルチキャスト

音声と映像を双方向でやり取りする仕組みです。

配信側は複数の画質を同時に配信し、視聴側は画質を選択して視聴します。

**Chrome と Edge と Safari のみで動作します**

- マルチストリーム送受信 (サイマルキャスト有効)
- マルチストリーム送信のみ (サイマルキャスト有効)
- マルチストリーム受信のみ (サイマルキャスト有効)

### スポットライト

直近で発話した N 人は高画質で配信され、それ以外は低画質で音声なしで配信される仕組みです。

**Chrome と Edge と Safari のみで動作します**

- スポットライト送受信
- スポットライト送信のみ
- スポットライト受信のみ

### スポットライト (サイマルキャスト無効)

配信時に複数の画質を配信しないため、発話をしていない時も画質の変更は行われません。
サイマルキャストに対応していないブラウザも利用することができます。

- スポットライト送受信 (サイマルキャスト無効)
- スポットライト送信のみ (サイマルキャスト無効)
- スポットライト受信のみ (サイマルキャスト無効)

### データチャネルメッセージング

音声と映像の送受信は行わず、データチャネルメッセージングのみを利用します。

## ライセンス

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)

```
Copyright 2017-2023, Shiguredo Inc.
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

