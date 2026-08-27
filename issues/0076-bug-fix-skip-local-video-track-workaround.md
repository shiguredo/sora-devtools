# LocalVideo に映像トラックの無効化ワークアラウンドを適用しない

- Created: 2026-08-25
- Completed: 2026-08-27
- Branch: feature/fix-skip-local-video-track-workaround
- Polished: 2026-08-26

## 目的

LocalVideo の表示処理が送信に使用している映像トラックを一時的に無効化すると、Chrome の H.265 HWA 使用時に映像送信が停止する可能性がある。LocalVideo では映像トラックの `enabled` を変更せず、映像送信への影響をなくす。

## 現状

`develop` の `src/components/Video/Video.tsx` にある `VideoElement` の stream 設定用 `useEffect` は、LocalVideo と RemoteVideo の区別なく次のワークアラウンドを適用している。

- `stream.getVideoTracks()` を走査し、各 `track.enabled` を読み取って `track.enabled = false` にする。読み取った値は単一の `originalEnabled` に保持されるため、複数トラックの場合は最後に読み取った値が保持される
- `loadedmetadata` イベントで `stream.getVideoTracks()` の各トラックを `originalEnabled` の値へ戻す
- cleanup でも `stream.getVideoTracks()` の各トラックを `originalEnabled` の値へ戻す

`develop` の `src/components/Video/LocalVideo.tsx` は `localVideo` を指定して `Video` を呼び出しているが、`VideoElement` の effect はこの値をワークアラウンドの適用判定に利用していない。そのため、ローカルプレビューの表示処理が Sora へ送信中の `localMediaStream` の映像トラックを操作する。

一方、`develop` の `src/components/Video/RemoteVideos.tsx` は `localVideo` を指定せずに `Video` を呼び出している。この場合の `props.localVideo` は `false` ではなく `undefined` であるため、`false` と `undefined` を区別して判定すると RemoteVideo の既存ワークアラウンドまでスキップするおそれがある。

起票時の H.265 HWA 送信試験では、この処理を含む DevTools で `framesEncoded` が 0 または 2 で停止し、`framesSent` も増加しないケースが発生したと報告されている。一方、同じ送信処理からローカル映像表示時の `track.enabled` 操作を除いた最小再現コードでは映像を送信できた。リポジトリにはこの試験の生ログや詳細な再現条件がないため、観測条件と数値は手動確認で再検証する。

## 設計方針

- `props.localVideo` が `true` の場合だけ、映像トラックの `enabled` 操作、`loadedmetadata` のワークアラウンド用リスナー登録、cleanup でのトラック復元を行わない
- `props.localVideo` が `false` または `undefined` の場合は、RemoteVideo として既存のワークアラウンドを維持する
- stream 設定用 `useEffect` の依存配列に `props.localVideo` を含め、値が変化した場合も前の effect の cleanup と新しい適用判定を実行する
- `srcObject` の設定、音声出力先の設定、`src/app/signals.ts` の `setVideoTrack` による明示的なトラック制御は本 issue の対象外とする
- pending の 0043 が `VideoElement` の stream 設定用 `useEffect` を変更する場合も、`props.localVideo` の判定と依存配列を維持する。0043 の擬似コードをそのまま適用して LocalVideo に `track.enabled = false` を実行してはならない

## 完了条件

- LocalVideo の `VideoElement` がマウント、`srcObject` 設定、`loadedmetadata` 発生、cleanup の各契機で、表示処理として映像トラックの `enabled` を変更しないこと
- RemoteVideo では既存の `track.enabled = false` から `loadedmetadata` 復元までのワークアラウンドが維持されること
- H.265 HWA に対応した Chrome で `role=sendrecv` および `videoCodecType=H265` の接続を行い、LocalVideo を表示しても `webrtc-internals` の outbound-rtp かつ `kind=video` の同じ `id` の行にある `framesEncoded` と `framesSent` が、1 秒間隔で少なくとも 3 回確認した初回値から最終値まで増加すること
- `vp check`、`vp build`、`vp test run`、`vp test run --config vitest.ct.config.ts` が成功すること
- `E2E_TEST_SORA_SIGNALING_URL` を設定し、必要に応じて `E2E_TEST_SORA_CHANNEL_ID_PREFIX` と `E2E_TEST_ACCESS_TOKEN` を設定した環境で `vp exec playwright test --project=chromium` が成功すること

## 解決方法

`develop` の `VideoElement` にある stream 設定用 `useEffect` に `props.localVideo` の判定を追加し、LocalVideo ではワークアラウンドを適用せず、RemoteVideo では従来どおり適用する。

1. stream 設定用 `useEffect` の依存配列に `props.localVideo` を含め、`props.localVideo` が `true` の場合はワークアラウンドのトラック操作と `loadedmetadata` リスナー登録をスキップする
2. cleanup でも `props.localVideo` が `true` の場合は、リスナー削除とトラック復元をスキップする。`props.localVideo` が `false` または `undefined` の場合は従来どおり cleanup を実行する
3. `LocalVideo.tsx` は `localVideo` を指定し、`RemoteVideos.tsx` は指定しないことで、`props.localVideo` が `true` の LocalVideo と、それ以外の RemoteVideo の適用範囲を分ける
4. H.265 HWA の sendrecv 接続で映像を送信し、`webrtc-internals` の outbound-rtp かつ `kind=video` の同じ `id` の行について、1 秒間隔で少なくとも 3 回確認した `framesEncoded` と `framesSent` が初回値から最終値まで増加することを確認する。併せて、`#local-video` の `srcObject.getVideoTracks()` から取得した同じ映像トラックの参照と `enabled` の値を LocalVideo のアンマウント前に保持し、`loadedmetadata` 前後、stream 差し替え時の cleanup 後、および接続切断など LocalVideo をアンマウントする操作の後に、その参照の `enabled` が表示処理によって変更されないことを確認する
5. `vp check`、`vp build`、`vp test run`、`vp test run --config vitest.ct.config.ts`、`vp exec playwright test --project=chromium` を実行する

既存の `tests/sendrecv.test.ts`、`tests/sendonly.test.ts`、`tests/recvonly.test.ts` は接続後に待機して切断するテストであり、現在は VP9 接続を使用している。H.265 HWA のフレームカウンターと `track.enabled` の確認はこれらの既存テストでは直接検証しないため、上記のブラウザー確認を必須とする。E2E の環境変数は `tests/helpers/env.ts` の定義に従い、`E2E_TEST_SORA_SIGNALING_URL` のみ必須で、他 2 つは未設定時に空文字となる。

### 検証結果

- 実施日: 2026-08-26
- 環境: Windows Chrome 152.0.7977.54、H.265 NVIDIA HEVC Encoder MFT
- 接続条件: `role=sendrecv`、`videoCodecType=H265`
- `framesEncoded` と `framesSent` が継続して増加することを確認した
- 他の接続中の devtools で映像が受信できることを 10 回確認した
- PR #707 を `develop` にマージした

## 関連 issue

- 0043: `audioOutput` 変更時の stream 設定 effect 再実行と `setSinkId` エラー処理を扱う。LocalVideo の H.265 HWA 送信停止とは目的が異なるが、同じ `VideoElement` の effect を変更するため、実装時は本 issue の `props.localVideo` ガードと依存配列を維持する
