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
- [UPDATE] sora-js-sdk のバージョンを 2020.5.0-canary.4 に更新する
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
