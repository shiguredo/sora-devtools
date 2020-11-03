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

- [UPDATE] package を更新
    - next: 9.5.4 -> 10.0.0
    - @voluntas
- [UPDATE] sora-js-sdk のバージョンを 2020.3.0 に更新
    - @voluntas


## 2020.3.0

- [UPDATE] package を更新
    - next: 9.5.3 -> 9.5.4
    - query-string: 6.13.4 -> 6.13.5
    - @yuitowest
- [UPDATE] Toasts 表示の追加
    - API の成功/失敗をトーストを使って表示
    - 全体のエラーハンドリング時の出力先をトーストに変更
    - @yuitowest

## 2020.2.0

- [UPDATE] sora-js-sdk のバージョンを 2020.3.0 に更新
    - Safari の Simulcast 対応
    - @yuitowest
- [ADD] Form から metadata を指定できる機能を追加
    - @yuitowest
- [UPDATE] PeerConnection getStats のレポートを componet 内から Redux state へ移動
    - Download Report から出力される json に最後に取得した PeerConnection getStats のレポートを記載
    - @yuitowest
- [ADD] Debug カラムに push message を表示するタブを追加
    - @yuitowest

## 2020.1.0

**祝リリース**
