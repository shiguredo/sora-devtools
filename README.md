# WebRTC SFU Sora デモ機能

[![GitHub tag (latest SemVer)](https://img.shields.io/github/tag/shiguredo/sora-demo.svg)](https://github.com/shiguredo/sora-demo)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## About Support

We check PRs or Issues only when written in JAPANESE.
In other languages, we won't be able to deal with them. Thank you for your understanding.

## 時雨堂のオープンソースソフトウェアについて

利用前に https://github.com/shiguredo/oss をお読みください。

## 概要

これは WebRTC SFU Sora に組み込まれている WebRTC Sora JS SDK を利用したデモ機能です。

Sora の配信、視聴機能が一通り確認できるようになっています。
また何か問題あった場合の切り分けのための調査にも利用できるよう、レポート機能やデバッグ機能を搭載しています。

## スクリーンショット

[![Image from Gyazo](https://i.gyazo.com/433fb2be3b46d4f59f59e94ef0096945.png)](https://gyazo.com/433fb2be3b46d4f59f59e94ef0096945)

## 利用技術

- Sora JavaScript SDK
    - [shiguredo/sora\-js\-sdk: WebRTC SFU Sora JavaScript SDK](https://github.com/shiguredo/sora-js-sdk)
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

## 特徴

### レポート機能

現在のクライアントのログ、通知、統計などをファイル化してダウンロードできます。

### デバッグ機能

デバッグを有効にすると、ログ、通知、統計のタブが有効になります。

### コピー URL 機能

現在の設定を URL パラメーターに反映した状態の URL をクリップボードに保存します。

例えば multi_sendrecv で設定を弄らなかった場合は以下のような値になります。

```
https://example.com/multi_sendrecv.html?audio=true&audioBitRate=&audioCodecType=OPUS&audioInput=&audioOutput=&autoGainControl=true&channelId=sora&echoCancellation=true&echoCancellationType=&frameRate=&mediaType=getUserMedia&noiseSuppression=true&resolution=&video=true&videoBitRate=1000&videoCodecType=VP9&videoInput=&debug=true
```

## 用語集

- 送受信
    - 自分の音声や映像を配信し、視聴も行う仕組みです
- 送信のみ
    - 自分の音声や映像をのみを配信し、視聴を行わない仕組みです
- 受信のみ
    - 自分の音声や映像を配信せず、視聴だけを行う仕組みです
- 片方向
    - 配信か視聴のどちらかだけを行う仕組みです
- 双方向
    - 配信と視聴の両方を行う仕組みです
- サイマルキャスト
    - 配信時に複数の画質を同時に配信を行う仕組みです
- スポットライト
    - 直近で発話した N 人にスポットライトを当てるような仕組みです

## デモ一覧

以下の最新のブラウザで動作します。

- Google Chrome
- Mozilla Firefox
- Apple Safari
- Microsoft Edge

ただし一部の機能は特定のブラウザでのみ動作します。

### 片方向

音声と映像を配信したり視聴する仕組みです。

- 片方向送信のみ
    - sendonly.html
- 片方向受信のみ
    - recvonly.html

### 双方向

音声と映像を双方向でやり取りする仕組みです。

- 双方向送受信
    - multi_sendrecv.html
- 双方向送信のみ
    - multi_sendonly.html
- 双方向受信のみ
    - multi_recvonly.html

### 片方向サイマルキャスト

音声と映像を片方向で配信したり視聴する仕組みです。

配信側は複数の画質を同時に配信し、視聴側は画質を選択して視聴します。

**送信は Chrome と Edge のみで動作します**

- サイマルキャスト送信のみ
    - simulcast_sendonly.html
- サイマルキャスト受信のみ
    - simulcast_recvonly.html

### 双方向マルチキャスト

音声と映像を双方向でやり取りする仕組みです。

配信側は複数の画質を同時に配信し、視聴側は画質を選択して視聴します。

**送信は Chrome と Edge のみで動作します**

- 双方向サイマルキャスト送受信
    - multi_simulcast_sendrecv.html
- 双方向サイマルキャスト送信のみ
    - multi_simulcast_sendonly.html
- 双方向サイマルキャスト受信のみ
    - multi_simulcast_recvonly.html

### スポットライト

直近で発話した N 人は高画質で配信され、それ以外は低画質で音声なしで配信される仕組みです。

**Chrome と Edge のみで動作します**

- スポットライト送受信
    - spotlight_sendrecv.html
- スポットライト送信のみ
    - spotlight_sendonly.html
- スポットライト受信のみ
    - spotlight_recvonly.html

### スポットライトレガシー

*2020.1 までにスポットライトとして存在していた機能です*

直近で発話した N 人のみの音声と映像を配信する仕組みです。

- スポットライトレガシー送受信
    - spotlight_legacy_sendrecv.html
- スポットライトレガシー送信のみ
    - spotlight_legacy_sendonly.html
- スポットライトレガシー受信のみ
    - spotlight_legacy_recvonly.html

## ライセンス

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)

```
Copyright 2020, Shiguredo Inc.

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

このリポジトリに含まれる `favicon.ico` のライセンスは [CC BY\-ND 3\.0](https://creativecommons.org/licenses/by-nd/3.0/deed.ja) です。
