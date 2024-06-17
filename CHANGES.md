# 変更履歴

- CHANGE
  - 下位互換のない変更
- UPDATE
  - 下位互換がある変更
- ADD
  - 下位互換がある追加
- FIX
  - バグ修正

## develop

- [FIX] LocalVideo のスポットライトフォーカス時の表示を修正する
  - CSS クラスの指定が正しくなかった
  - @tnamao

## 2024.1.1

**2024-06-10**

- [FIX] サイマルキャスト時の Media Stats の表示ができない問題を修正する
  - rid 毎に切り替え可能にする
  - @tnamao

## 2024.1.0

**2024-06-07**

- [UPDATE] sora-js-sdk のバージョンを 2024.1.0 に上げる
  - @voluntas
- [CHANGE] ヘッダーの接続先 URL の表示の初期値を変更する
  - `未接続` を `Signaling URL` `TURN URL` に変更する
  - @tnamao
- [ADD] ヘッダーに接続中の TURN URL を表示する
  - `local-candidate` の RTCStats に `url` が含まれる場合に表示する
  - `local-candidate` が複数存在する場合は、最初に取得できる `url` を表示する
  - `url` が取得できない場合は `不明` と表示する
  - @tnamao
- [CHANGE] `.env.example` を `.env.template` に揃える
  - @voluntas
- [CHANGE] `resolution` `displayResolution` `frameRate` を任意の値を入力できるようにする
  - 元々のプルダウンで指定できた値は Dropdown ボタンのメニューから選択可能になります
  - `resolution` と `displayResolution` はこの修正前後で保持するパラメータの互換性が無くなり、破壊的変更になります
  - 解像度が `{width}x{height}` ではない形式や数字を期待する箇所に数字以外が入った場合は、`未指定` と同じ扱いになります
  - frameRate に数値以外が設定された場合は、`未指定` と同じ扱いになります
  - @tnamao
- [ADD] `resolution` と `displayResolution` のプルダウンに `540p (960x540)` を追加する
  - @tnamao
- [CHANGE] index ページのリンクに指定していた `multistream` パラメータを全て削除する
  - multistream はデフォルト有効になり、明示的な指定は不要となったため
  - @tnamao
- [ADD] 映像のコーデックなどの情報を映像にオーバーレイ表示する `Show media stats` のトグルを追加する
  - Firefox での制限
    - 複数の RemoteVideo を受信しているときに RTCPeerConnection の getStats から取得できるコーデック情報がおかしくなってしまうため、正しい動画のコーデック情報を表示できません
    - Firefox では RemoteVideo の MediaStreamTrack から解像度や FPS の取得できないため、項目の値の表示は `undefined` になります
  - @tnamao
- [ADD] 受信している接続のクライアント ID の表示に対応する
  - `notify` で受け取ったクライアント ID を表示に使用するため、state の `soraContents.remoteMediaStream` を `soraContents.remoteClient` に変更し、MediaStream の他に `connectionId` と `client_id` を保持できる型に変更する
  - この変更に伴ってリモートの `MediaStream` を使用した関数、変数の名前を `Client` に変更する
  - @tnamao
- [CHANGE] `Session ID` と自身の `Connection ID` `Client ID` の表示を `type: notify` の `connection.created` を受け取ったタイミングでの表示に変更する
  - この変更に伴い、Sora Devtools の Sora 接続状態の確認は state の `soraContents.connectionStatus` の値の確認も追加する
  - @tnamao
- [CHANGE] オーディオコーデック `LYRA` の設定を削除する
  - 関連するコードと `service-worker.js` の削除
  - next.config.js から不要な設定の削除
  - @tnamao
- [CHANGE] `multistream` の初期値を `未指定` に変更する
  - querystring にパラメータが存在しない場合に `true` になるのを防ぐため
  - @tnamao
- [CHANGE] `getDisplayMedia` 使用時の MediaConstraints に audio も含めるようにする
  - gDM に渡す MediaConstraint の `audio` パラメータは audio のトグルの状態や `Media options` の設定と連動している
  - @tnamao
- [CHANGE] role が `sendonly` の時に `Audio Output` のフォームを非表示にする
  - @tnamao
- [ADD] LocalVideo でサイマルキャストの rid を変更するボタンにラベルとツールチップを追加する
  - @tnamao
- [ADD] Playwright を利用した E2E テストを追加する
  - @voluntas

## 2023.2.0

- [FIX] `audioStreamingLanguageCode` のトグルを有効に設定した時に `Advanced signaling options` が強調されない問題を修正する
  - @tnamao
- [ADD] `h265_params` のフォームを追加する
  - @tnamao
- [ADD] コネクション ID とクライアント ID の表示にラベルを追加する
  - @tnamao
- [ADD] Sora 接続後にセッション ID の表示を追加する
  - Sora 2023.2.0 以降は sora-js-sdk が `type: offer` から取得したセッション ID を表示に使用する
  - それ以外の場合は notify の `connection.created` イベントで取得したセッション ID を表示に使用する
  - @tnamao
- [FIX] `audio` `video` がともに無効な状態で Sora への接続時に getUserMedia を呼び出してしまう問題を修正する
  - @tnamao
- [ADD] `dataChannels` のフォームにテンプレート読み込みボタンを追加する
  - テキストエリアに挿入されるテンプレートは placeholder の内容と同じ
  - @tnamao
- [UPDATE] `signalingUrlCandidates` の placeholder に設定例を追加する
  - @tnamao
- [CHANGE] fmt / lint を biome に変更する
  - @voluntas
- [CHANGE] 録画 API のバージョンを `20231220` に変更する
  - @voluntas
- [ADD] Debug Pane に `Codec` のタブを追加する
  - RTCRtpSender と RTCRtpReceiver の RTCRtpCapabilities の codec 一覧を表示する
  - @tnamao
- [CHANGE] mic / camera の gUM 呼び出しを 1 回で済むように処理を変更する
  - Chrome のみ gUM の呼び出しが連続すると許可ダイアログの表示に時間がかかるため、まとめて許可を取るようにポリシーを変更する
  - @tnamao
- [CHANGE] videoAV1Params の表示位置をを変更し、`videoVP9Params` の下に表示する
  - @tnamao
- [CHANGE] videoCodecType の `AV1` の表示順を変更し、`VP9` の下に表示する
  - @tnamao
- [FIX] `request media` `connect` を実行した後に、`Enable mic device` `Enable camera device` のトグルでデバイスを無効化した時に Media Processor が保持している Track の停止漏れを修正する
  - トグル切替でマイクやカメラのデバイスを無効化してもカメラ等のデバイスが使用中の状態のままになってしまっていた
  - @tnamao
- [ADD] Sora とは接続せず Audio / Video デバイスの表示確認と停止を行う `request media` `dispose media` 機能を追加する
  - 現状の設定項目を利用するため、`request media` の実行中は `role` や `mediaType` を disabled にする
  - @tnamao
- [CHANGE] `request media` 機能で取得した MediaStream をそのまま Sora の接続に利用できるようにしたため、新たに `preparing` の状態を追加する
  - `connecting` の状態は MediaStream を取得後、実際に Sora との接続処理を行う時の状態として意味を変更する
  - @tnamao
- [CHANGE] mediaType が getUserMedia 以外の場合は audioInput / videoInput のフォームを表示しないように修正する
  - @tnamao
- [CHANGE] mediaType が getUserMedia 以外の場合は、copy URL をクリックした時にクリップボードにコピーする URL のパラメータに audioInput / videoInput を含めないように修正する
  - @tnamao
- [CHANGE] Node.js 16 系を落とす
  - @voluntas
- [CHANGE] GA の main.yml を ci.yml に変更する
  - @voluntas
- [CHANGE] 一時的に ; ありにする
  - @voluntas
- [UPDATE] sora-js-sdk のバージョンを 2023.2.0-canary.15 に上げる
  - @voluntas
- [UPDATE] @shiguredo/virtual-background のバージョンを 2023.2.0 に上げる
  - @sile
- [CHANGE] vitest へ切り替える
  - jest をやめる
  - @voluntas
- [FIX] テストを実行できるようにする
  - @voluntas
- [FIX] index ページの受信のみのリンクから、ビデオコーデック関連のパラメータを削除する
  - 受信時に `videoCodecType` `videoBitRate` は不要なため
  - @tnamao

## 2023.1.0

- [UPDATE] sora-js-sdk を 2023.1.0 に更新する
  - @voluntas
- [CHANGE] `Advanced options` を `Advanced signaling options` に変更する
  - @tnamao
- [CHANGE] `videoCodecType` の初期値をブラウザから自動判別した値から `未指定` に変更する
  - @tnamao
- [CHANGE] index ページのマルチストリームのリンクに `videoCodecType=VP9` を追加する
  - 初期値変更に伴う URL パラメータの追加
  - @tnamao
- [CHANGE] ローカル開発用と本番用で成果物の主力先を分ける
  - `process.env.NODE_ENV` が `production` のときは `dist` に、それ以外は `dev` に出力する
  - @voluntas
- [CHANGE] `lyraParamsBitrate` を `audioLyraParamsBitrate` に変更
  - querystring 上のパラメータ名も変わるので注意
  - @tnamao
- [ADD] シグナリング時のビデオコーデックパラメータ `videoVP9Params` `videoH264Params` `videoAV1Params` を追加
  - 項目は Advanced options 内に追加
  - @tnamao
- [UPDATE] sora-js-sdk を 2023.1.0-canary.6 に更新
  - @tnamao
- [CHANGE] eslint に `"@typescript-eslint/no-extra-semi": "off"` を追加
  - @voluntas
- [ADD] .prettierignore を追加
  - @voluntas
- [CHANGE] .prettierrc を変更する
  - `"singleQuote": true`
  - `"semi": false`
  - `"trailingComma": "all"`
  - `"tabWidth": 2`
  - `"printWidth": 100`
  - @voluntas
- [CHANGE] next export が廃止されたので next.config.js に設定を追加
  - `output: "export"`
  - `distDir: 'dist'`
    - 出力を out から dist に変更する
- [CHANGE] pnpm 化
  - GitHub Actions に pnpm/action-setup を追加
  - devDependencies に以下を追加
    - rimraf
    - @types/jest
  - dependencies に以下を追加
    - redux
    - redux-thunk
  - packageManager に pnpm を指定
  - engines に node `>=16.20.0` を指定
  - @voluntas
- [CHANGE] Node 14 対応を終了する
  - @voluntas
- [CHANGE] Node 20 対応を追加する
  - @voluntas
- [CHANGE] tsconfig の moduleResolution を bundler にする
  - [TypeScript で"moduleResolution": "Node"は使わないほうがいい](https://blog.s2n.tech/articles/dont-use-moduleresolution-node)
  - @voluntas
- [ADD] Media options にライト調整機能用の lightAdjustment 設定を追加する
  - 値は「未設定」、「weak」、「medium」、「strong」の中から選択
  - @sile
- [ADD] @shiguredo/light-adjustment (2023.2.0) を依存パッケージに追加する
  - @sile
- [UPDATE] @shiguredo/virtual-background を 2023.1.0 に上げる
  - @sile
- [UPDATE] TypeScript を 5 系に上げる
  - @voluntas
- [UPDATE] シグナリング時に転送フィルターを指定できるようにする
  - @sile
- [UPDATE] sora-js-sdk を 2023.1.0-canary.5 に更新
  - @sile
- [UPDATE] sora-js-sdk を 2023.1.0-canary.1 に更新
  - SDP 再利用対応の取り込み
  - @sile
- [UPDATE] sora-js-sdk を 2023.1.0-canary.0 に更新
  - Lyra 音声コーデックの Safari 対応の取り込み
  - @sile
- [FIX] sora_demo を sora_devtools に修正する
  - @voluntas

### role が recvonly かつ multistream 利用時の表示と挙動の変更

- [CHANGE] video/audio のコーデックとビットレートの項目を表示しない
  - @tnamao
- [CHANGE] `Advanced signaling options` の表示をしない
  - @tnamao
- [CHANGE] シグナリング時のパラメータから次のパラメータを含めず接続する
  - `audioBitRate`
  - `audioCodecType`
  - `videoBitRate`
  - `videoCodecType`
  - `audioStreamingLanguageCode`
  - `audioLyraParamsBitrate`
  - `videoVP9Params`
  - `videoH264Params`
  - `videoAV1params`
  - @tnamao
- [CHANGE] `copy URL` でコピーする URL に次のパラメータを含めない
  - `audioBitRate`
  - `audioCodecType`
  - `videoBitRate`
  - `videoCodecType`
  - `audioStreamingLanguageCode`
  - `audioLyraParamsBitrate`
  - `videoVP9Params`
  - `videoH264Params`
  - `videoAV1params`
  - @tnamao

## 2022.5.3

- [UPDATE] sora-js-sdk を 2022.3.2 に更新する
  - @voluntas
- [FIX] Enable camera device と Enable audio track を false に設定しても "copy URL" に反映されない問題を修正
  - @torikizi
- [FIX] lyraParamsBitrate を設定しても Advanced options が bold にならなかったのを修正
  - @torikizi
- [FIX] "copy URL" ボタンを押しても lyraParamsBitrate の値が URL に反映されない問題を修正
  - @sile
- [FIX] 接続中には「lyraParamsBitrate」設定を変更不可にする
  - @sile

## 2022.5.2

- [FIX] dist/ 以下の生成物が更新されていなかったのを修正
  - @sile

## 2022.5.1

- [UPDATE] sora-js-sdk を 2022.3.1 に更新する
  - @sile

## 2022.5.0

- [UPDATE] sora-js-sdk を 2022.3.0 に更新する
  - @sile
- [CHANGE] E2EE の Wasm ダウンロード URL を変更する
  - @voluntas

## 2022.4.0

- [ADD] /devtools ページ読み込み時に service worker を登録
  - Lyra で SharedArrayBuffer を使っているので、それを有効にするために COOP および COEP ヘッダを設定している
  - @sile
- [ADD] Advanced options に lyraParamsBitrate リストボックスを追加
  - @sile
- [ADD] audioCodecType の選択肢に LYRA を追加
  - @sile
- [ADD] audioStreamingLanguageCode を入力できるようにする
  - @melpon
- [FIX] jitter が動作していなかったのを修正
  - @melpon

## 2022.3.0

- [UPDATE] media-processors/virtual-background を 2022.6.1 に更新する
  - <https://github.com/shiguredo/media-processors/releases/tag/virtual-background-2022.6.1>
  - @sile
- [UPDATE] メディアオプションに facingMode を追加する
  - @yuitowest

## 2022.2.0

- [UPDATE] media-processors/virtual-background を 2022.6.0 に更新する
  - Safari での仮想背景処理に対応
  - @yuitowest

## 2022.1.0

- [UPDATE] copy URL クリック時にブラウザの URL バーも同一の URL に変更するように修正する
  - @yuitowest
- [UPDATE] パラメーターのラベルをマウスオーバー時に説明文を表示するように修正する
  - @yuitowest
- [UPDATE] 接続オプションに bundleId を追加する
  - @yuitowest
- [CHANGE] ページの統合
  - index.html, devtools.html の 2 ページのみにする
  - role / multistream / simulcast / spotlight フラグをページ内で選択可能にする
  - role / multistream / simulcast / spotlight フラグを URL パラメーターから指定可能にする
  - role / multistream / simulcast / spotlight フラグを URL パラメーターから指定可能にする
  - devtools.html の初期値を role: sendrecv, multistream: true にする
- [UPDATE] スポットライトページで simulcast フラグを選択可能にする
  - @yuitowest
- [UPDATE] audioInput, audioOutput, videoInput に未指定のオプションを追加する
  - @yuitowest
- [UPDATE] package を更新する
  - @reduxjs/toolkit: 1.6.2, -> 1.7.2
  - query-string: 7.0.1 -> 7.1.1
  - react-bootstrap: 2.0.3 -> 2.1.2
  - next: 12.0.10 -> 12.1.0
  - @yuitowest
- [UPDATE] media-processors を追加する
  - @shiguredo/noise-suppression パッケージを使用した mediaProcessorsNoiseSuppression を設定項目に追加する
  - @shiguredo/virtual-background パッケージを使用した blurRadius を設定項目に追加する
  - @yuitowest
- [UPDATE] fakeVolume の step を 0.1 から 0.25 に変更する
  - @yuitowest
- [UPDATE] MediaStream オプションに aspectRatio と resizeMode を追加する
  - @yuitowest
- [UPDATE] mediaType getDisplayMedia 時に width, height, frameRate を指定できるようにする

## 2021.2.5

- [FIX] sora-js-sdk のバージョンを 2021.2.3 に更新する
  - <https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.2.3>
  - @yuitowest

## 2021.2.4

- [FIX] replace track 後に volume visualizer が動作しない問題を修正する
  - @yuitowest

## 2021.2.3

- [FIX] sora-js-sdk のバージョンを 2021.2.2 に更新する
  - <https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.2.2>
  - @yuitowest

## 2021.2.2

- [FIX] sora-js-sdk のバージョンを 2021.2.1 に更新する
  - <https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.2.1>
  - @yuitowest

## 2021.2.1

- [FIX] サーバからの正常切断時に devtools の connectionStatate が 'disconnect' にならない場合がある問題を修正する
  - @yuitowest

## 2021.2.0

- [ADD] Debug モードに messaging タブを追加する
  - @yuitowest
- [CHANGE] 再接続処理を実装する
  - @yuitowest
- [CHANGE] sora-demo を sora-devtools へ変更する
  - @voluntas
- [ADD] MediaStreamTrack Content Hints 実装を追加する
  - @yuitowest
- [ADD] DataChannel Messaging only ページを作成する
  - @yuitowest
- [ADD] Debug モードにフィルター機能を追加する
  - @yuitowest
- [UPDATE] package を更新する
  - Debug モード切り替えボタンをモバイルとデスクトップで表示位置を変える
  - ダウンロードレポートのレポート内容を修正する
  - @yuitowest
- [UPDATE] package を更新する
  - react-bootstrap: 1.6.1, -> 2.0.0-beta.6
  - bootstrap: 4.5.3 -> 5.1.1
  - typescript: 4.3.5 -> 4.4.3
  - @yuitowest
- [UPDATE] モバイル表示でも画面タイトルが表示されるように修正する
  - @yuitowest
- [ADD] 複数シグナリング URL 対応を追加する
  - signalingUrlCandidates を設定できるようにする
  - 現在接続中のシグナリング URL をヘッダーに表示する機能を追加する
  - @yuitowest
- [UPDATE] navigator.mediaDevices が undefined の場合の例外メッセージをわかりやすくする
  - @yuitowest
- [UPDATE] Debug 関連の UI/UX を変更する
  - header の debug checkbox を削除して右下に常駐のボタンを設置する
  - width がモバイルサイズの場合、通常表示とデバッグ表示はトグル切り替えになるように修正する
  - @yuitowest
- [CHANGE] spotlight_legacy を削除する
  - @yuitowest

## 2021.1.6

- [FIX] sora-js-sdk のバージョンを 2021.1.6 に更新する
  - <https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.1.6>
  - @yuitowest

## 2021.1.5

- [FIX] sora-js-sdk のバージョンを 2021.1.5 に更新する
  - <https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.1.5>
  - @yuitowest

## 2021.1.4

- [FIX] sora-js-sdk のバージョンを 2021.1.4 に更新する
  - <https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.1.4>
  - @yuitowest

## 2021.1.3

- [FIX] sora-js-sdk のバージョンを 2021.1.3 に更新する
  - <https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.1.2>
  - <https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.1.3>
  - @yuitowest

## 2021.1.2

- [FIX] "videoTrack on/off" を off の状態で connect した場合に videoTrack が off にならない問題を修正する
  - @yuitowest

## 2021.1.1

- [FIX] sora-js-sdk のバージョンを 2021.1.1 に更新する
  - <https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.1.1>
  - @yuitowest

## 2021.1.0

- [FIX] http で recvonly を使用した場合に正常に動かなかった問題を修正する
  - @yuitowest
- [CHANGE] spotlight_legacy_sendonly を削除する
  - @yuitowest
- [CHANGE] Video component に渡される stream が null の場合は videoElement.srcObject に null をセットする
  - @yuitowest
- [UPDATE] Debug mode のコピーボタンを押した時のテキストの扱いを修正する
  - @yuitowest
- [ADD] Debug Mode 時の DataChannel タブを Timeline タブに変更する
  - @yuitowest
- [CHANGE] デバイス一覧を更新するボタンを作成する
  - @yuitowest
- [CHANGE] 接続/切断の最中には connect / disconnect ボタンを押せないようにする
  - @yuitowest
- [UPDATE] Debug log 表示で詳細が存在しない場合は折りたたみを表示しないように修正する
  - @yuitowest
- [UPDATE] GitHub Actions で利用する Node.js バージョン 10 を落とす
- [UPDATE] GitHub Actions で利用する Node.js バージョン 16 を追加する
- [UPDATE] Spotlight 関連のデザイン修正をする
  - Spotlight focused の枠が表示された場合に Vidoe box 全体のサイズが変わらないようにする
  - Fake volume meter の位置を Form MediaType の横に移動する
  - @yuitowest
- [ADD] DataChannel 対応を追加する
  - Debug Mode 時に Signaling タブと DataChannel タブを追加する
  - dataChannelSignaling / ignoreDisconnectWebSocket を from から指定できるようにする
  - @yuitowest
- [ADD] spotlight_focus_rid / spotlight_unfocus_rid を form から指定できるようにする
  - @yuitowest
- [UPDATE] package を更新する
  - next: 10.0.2 -> 10.0.9
- [ADD] 映像枠の width/height 固定機能を全ページに追加する
  - @yuitowest
- [ADD] jitter buffer delay を画面上に表示する機能を追加する
  - @yuitowest
- [ADD] stream の stats report を映像の横に表示する機能を追加する
  - @yuitowest
- [FIX] 存在しないデバイス ID を URL パラメーターから渡した場合に getUserMedia が失敗する問題を修正する
  - @yuitowest
- [UPDATE] AV1 を有効にする
  - @yuitowest
- [UPDATE] videoCodecType の初期値をブラウザに応じて変更するように修正する
  - @yuitowest
- [UPDATE] Debug で表示されるログの文字列をダブルクォートで囲むようにする
  - @yuitowest
- [UPDATE] spotlight focused / spotlight unfocused 時に映像枠を表示する
  - @yuitowest
- [UPDATE] camera/mic の on/off を Sora helpers を使うように修正する
  - @yuitowest

## 2020.6.3

- [FIX] audioOutput に設定したデバイスが使用されない問題を修正する
  - @yuitowest

## 2020.6.2

- [FIX] sora-js-sdk のバージョンを 2020.6.2 に更新する
  - @yuitowest

## 2020.6.1

- [FIX] sora-js-sdk のバージョンを 2020.6.1 に更新する
  - @yuitowest

## 2020.6.0

- [FIX] Sora connect 時のエラーメッセージが "{}" になる場合があるので対応する
  - @yuitowest

## 2020.5.0

- [UPDATE] E2EE wasm URL 読み込み処理を修正する
  - NEXT_PUBLIC_E2EE_WASM_URL に URL を設定する
  - E2EE checkbox に wasm 読み込み時表示される Spinner を追加する
  - @yuitowest

## 2020.4.0

- [UPDATE] sora-js-sdk のバージョンを 2020.6.0 に更新する
  - @yuitowest
- [ADD] 各ページに footer を追加する
  - @yuitowest
- [ADD] client_id を form から指定できるようにする
  - @yuitowest
- [ADD] metadata checkbox にチェックがない場合は sora metadata に undefined を渡すように修正する
  - @yuitowest
- [ADD] 映像枠の width/height 固定機能を spotlight page に追加する
  - @yuitowest
- [ADD] connection id コピーボタンを追加する
  - @yuitowest
- [ADD] log コピーボタンを追加する
  - @yuitowest
- [ADD] signaling_notify_metadata を form から指定できるようにする
  - @yuitowest
- [UPDATE] ダウンロードレポートに sora-demo のバージョンと sora-js-sdk のバージョンを入れる
  - @yuitowest
- [CHANGE] .env.local.example を .env.example に変更する
  - @yuitowest
- [ADD] e2ee フラグを追加する
  - @yuitowest
- [CHANGE] simulcast quality を simulcast rid に変更する
  - changeSimulcastQuality, resetSpotlightQuality API を requestRtpStream, resetRtpStream API に変更する
  - simulcastQuality を simulcastRid に変更する
  - low / middle / high を r0 /r1 / r2 に変更する
  - @voluntas
- [UPDATE] package を更新する
  - bootstrap: 4.5.2 -> 4.5.3
  - query-string: 6.13.5 -> 6.13.7
  - react: 16.13.1 -> 17.0.1
  - react-bootstrap: 1.3.0 -> 1.4.0
  - react-dom: 16.13.1 -> 17.0.1
  - react-redux: 7.2.1 -> 7.2.2
  - next: 10.0.0 -> 10.0.2
  - typescript: 4.0.3 -> 4.1.2
  - @yuitowest
- [UPDATE] next を 10.0.0 に更新する
  - @voluntas
- [UPDATE] sora-js-sdk のバージョンを 2020.3.0 に更新する
  - @voluntas

## 2020.3.0

- [UPDATE] package を更新する
  - next: 9.5.3 -> 9.5.4
  - query-string: 6.13.4 -> 6.13.5
  - @yuitowest
- [UPDATE] Toasts 表示の追加する
  - API の成功/失敗をトーストを使って表示
  - 全体のエラーハンドリング時の出力先をトーストに変更
  - @yuitowest

## 2020.2.0

- [UPDATE] sora-js-sdk のバージョンを 2020.3.0 に更新する
  - Safari の Simulcast 対応
  - @yuitowest
- [ADD] Form から metadata を指定できる機能を追加する
  - @yuitowest
- [UPDATE] PeerConnection getStats のレポートを componet 内から Redux state へ移動する
  - Download Report から出力される json に最後に取得した PeerConnection getStats のレポートを記載
  - @yuitowest
- [ADD] Debug カラムに push message を表示するタブを追加する
  - @yuitowest

## 2020.1.0

**祝リリース**
