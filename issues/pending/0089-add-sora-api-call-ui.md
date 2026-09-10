# ブラウザから Sora API を叩ける仕組みを追加する

- Created: 2026-09-10
- Completed: {YYYY-MM-DD}
- Branch: feature/add-sora-api-call-ui
- Polished: {YYYY-MM-DD}
- Reporter: @voluntas

## pending 理由 (2026-09-10)

- UI が未定である。起票時点で「まだ UI も思いついていない」状態であり、どの画面からどのように API を実行するかが決まっていない
- 過去に debug ペインへ API タブを追加したが、 2026.1.0 で未使用として削除された経緯がある。同じ UI を復活させるだけでは同じ結果になる可能性が高く、用途を絞った設計をやり直す必要がある
- ブラウザから Sora API を叩くには、ベース URL と認証 (API キーなど) の扱い、 CORS の可否、叩く対象の API の範囲を決める必要がある。特に CORS 非対応の場合の回避策は devtools のスコープ外の判断を含む
- 対象 API を録画 API に絞るか、シグナリング・セッション系も含めるかで UI と実装量が大きく変わる
- 上記の設計判断が固まるまで実装に着手できないため `issues/pending/` に置く

## 目的

ブラウザで動く sora-devtools から Sora API (録画 API、シグナリング API、セッション API など) を直接実行できるようにする。

Sora の検証時に curl や CLI を別途使わずにブラウザだけで API を叩けるようにし、接続中の channel_id / session_id / connection_id を使った操作を簡単にする。

## 現状

- `src/api.json` に Sora API のテンプレートが残っている。録画 API の `Sora_20231220.StartRecording` / `Sora_20231220.StopRecording` のほか、 Disconnect / Push / Stats / Spotlight / AudioStreaming / ForwardingFilter / Session / RequestSimulcastRid などが含まれる
- `src/constants.ts` の `API_TEMPLATES` 、 `src/app/signals.ts` の `apiObjects` と `setApiObject` / `clearApiObjects` 、 `src/types.ts` の `ApiObject` は、かつての API タブ用の実装の残骸で現在はどこからも使われていない
- 2025.2.0 で debug ペインに API タブが追加され、録画開始/停止ボタンは API タブに置き換えられた (CHANGES.md)
- 2026.1.0 で API タブは削除された。 `DEBUG_TYPES` から `api` が削除され、 `Api.tsx` も削除された。経緯は `issues/closed/0013-fix-debug-pane-typo-and-comment-out.md` にある
- 現在、ブラウザから Sora API を直接叩く UI はない。 RPC タブは sora-js-sdk の RPC (DataChannel 経由) を実行するもので、 HTTP の Sora API とは別経路
- `src/app/signals.ts` の `apiUrl` は URL パラメータとして読み書きされるだけで、現在はどの UI からも使われていない。 `src/app/actions.ts` の `copyURL` は `apiUrl` を URL に含める

## 設計方針

- 過去の API タブをそのまま復活させず、目的を絞った UI を設計する
- 叩く対象の範囲を決める。録画 API を最小構成とし、シグナリング・セッション系をどこまで含めるかは実装時に決める
- API のベース URL と認証情報の扱い (入力方法、 URL パラメータへの反映有無、保存の有無) を決める
- ブラウザからの cross-origin リクエストになるため、 CORS の可否を確認する。 CORS 非対応の場合はプロキシの利用や対象外とする判断も含めて整理する
- 実行結果の表示 (ステータス、ヘッダー、ボディ、エラー種別) と再利用の方法を決める
- UI の形式 (専用タブ、モーダル、既存タブ内のボタン) を決める
- 未使用になっている `API_TEMPLATES` / `apiObjects` / `ApiObject` / `setApiObject` / `clearApiObjects` / `apiUrl` を再利用するか削除するかを、設計に合わせて決める

## 完了条件

- ブラウザから対象の Sora API を実行でき、結果を確認できる
- 録画 API の開始/停止が実行できる
- 接続中の channel_id / session_id / connection_id をリクエストに反映できる
- CORS や認証の制約がある場合は、そのことが UI またはドキュメントから分かる
- 新しいテストを追加する
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

pending のため未定。設計が固まったら `issues/` に戻して実装する。

## 関連

- `issues/closed/0013-fix-debug-pane-typo-and-comment-out.md`: API タブのコメントアウトを整理し、 API タブと `Api.tsx` を削除した経緯
- `src/components/DebugPane/Rpc.tsx`: sora-js-sdk の RPC を実行する既存 UI
- CHANGES.md の 2025.2.0 (API タブ追加) と 2026.1.0 (API タブ削除)
