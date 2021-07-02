# 変更履歴

- CHANGE
    - 下位互換のない変更
- UPDATE
    - 下位互換がある変更
- ADD
    - 下位互換がある追加
- FIX
    - バグ修正

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
