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
    - https://github.com/shiguredo/media-processors/releases/tag/virtual-background-2022.6.1
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
    - index.html, devtools.html の2ページのみにする
    - role / multistream / simulcast / spotlight フラグをページ内で選択可能にする
    - role / multistream / simulcast / spotlight フラグをURLパラメーターから指定可能にする
    - role / multistream / simulcast / spotlight フラグをURLパラメーターから指定可能にする
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
    - https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.2.3
    - @yuitowest

## 2021.2.4

- [FIX] replace track 後に volume visualizer が動作しない問題を修正する
    - @yuitowest

## 2021.2.3

- [FIX] sora-js-sdk のバージョンを 2021.2.2 に更新する
    - https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.2.2
    - @yuitowest

## 2021.2.2

- [FIX] sora-js-sdk のバージョンを 2021.2.1 に更新する
    - https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.2.1
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
    - https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.1.6
    - @yuitowest

## 2021.1.5

- [FIX] sora-js-sdk のバージョンを 2021.1.5 に更新する
    - https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.1.5
    - @yuitowest

## 2021.1.4

- [FIX] sora-js-sdk のバージョンを 2021.1.4 に更新する
    - https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.1.4
    - @yuitowest

## 2021.1.3

- [FIX] sora-js-sdk のバージョンを 2021.1.3 に更新する
    - https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.1.2
    - https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.1.3
    - @yuitowest

## 2021.1.2

- [FIX] "videoTrack on/off" を off の状態で connect した場合に videoTrack が off にならない問題を修正する
    - @yuitowest

## 2021.1.1

- [FIX] sora-js-sdk のバージョンを 2021.1.1 に更新する
    - https://github.com/shiguredo/sora-js-sdk/releases/tag/2021.1.1
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
- [FIX] 存在しないデバイスIDをURLパラメーターから渡した場合にgetUserMediaが失敗する問題を修正する
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
