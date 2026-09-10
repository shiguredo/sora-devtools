# show media stats で自分の映像の解像度が変換後の値になる問題を修正する

- Created: 2026-09-10
- Completed: {YYYY-MM-DD}
- Branch: feature/fix-local-video-resolution
- Polished: {YYYY-MM-DD}
- Reporter: @voluntas

## 目的

show media stats で表示される自分の映像の解像度を、エンコード（変換）後の値ではなく、キャプチャ元（media-source）の解像度で確認できるようにする。

解像度の表示はカメラ・フェイク映像・画面共有などの入力が意図どおりかを確認するために使う。変換後の値が表示されると、入力解像度を正しく判定できない。

## 現状

- `src/components/Video/LocalVideoCapabilities.tsx` の `useLocalVideoTrackStats` は `statsReport` から `type === "outbound-rtp"` かつ `kind === "video"` の stats を集め、 `frameWidth` / `frameHeight` を `resolution` として表示する
- `outbound-rtp` の `frameWidth` / `frameHeight` はエンコード後の値である。スケーリング (`scaleResolutionDownBy`) やサイマルキャストの rid ごとの解像度、エンコード時の丸めが反映されるため、入力解像度と一致しない
- サイマルキャスト時は rid ごとの stats を並べ、未選択時は `frameWidth` が最大のものを選ぶ
- `src/app/actions.ts` の `setStatsReportInternal` は `soraConnection.pc.getStats()` の全 stats を `statsReport` signal に設定している。 `media-source` の stats も含まれる
- WebRTC の `media-source` stats (`RTCVideoSourceStats`) には、 `kind: "video"` と `trackIdentifier` (送信中の `MediaStreamTrack.id`)、キャプチャ元の `width` / `height` が含まれる
- TypeScript 7 の `lib.dom.d.ts` には `RTCVideoSourceStats` の型定義がないため、実装時は型を定義するかキャストが必要になる
- 受信側の `src/components/Video/RemoteVideoCapabilities.tsx` は受信トラックの `getSettings()` から解像度を取っており、本 issue の対象外

## 設計方針

- `media-source` の stats から `width` / `height` を取得し、自分の映像の解像度として表示する
- 送信トラックとの紐付けは `trackIdentifier` と `MediaStreamTrack.id` の一致、または `kind === "video"` で行う。実機で確認して決める
- サイマルキャスト時の rid ごとの情報（エンコード後解像度・fps・encoder）は壊さず、入力解像度とエンコード後解像度を区別して表示する
- `media-source` の stats が取得できないブラウザでは従来どおりの表示へフォールバックする
- getUserMedia / getDisplayMedia / fakeMedia / mp4Media で `media-source` の `width` / `height` が取得できるか実機で確認する
- 受信側 (`RemoteVideoCapabilities`) の表示は変更しない

## 完了条件

- show media stats の自分の映像の解像度がキャプチャ元の解像度で表示される
- スケーリングやサイマルキャストでエンコード後の解像度が入力と異なっても、入力解像度が表示される
- サイマルキャスト時の rid ごとの表示と選択が壊れない
- `media-source` の stats が取得できない場合は従来どおりの表示になる
- 新しいテストを追加する
- 既存の単体テスト、型チェック、lint、ビルドが成功する

## 解決方法

- `src/components/Video/LocalVideoCapabilities.tsx` の `useLocalVideoTrackStats` で `type === "media-source"` かつ `kind === "video"` の stats を探し、 `width` / `height` を解像度の表示に使う
- `RTCVideoSourceStats` 相当の型を `src/types.ts` などに定義する
- `media-source` から取得できなかった場合のフォールバックを実装する
- 入力解像度とエンコード後解像度の表示方法を実装時に確定し、テストを追加する

## 関連

- [RTCVideoSourceStats - MDN](https://developer.mozilla.org/en-US/docs/Web/API/RTCVideoSourceStats)
- [RTCOutboundRtpStreamStats - MDN](https://developer.mozilla.org/en-US/docs/Web/API/RTCOutboundRtpStreamStats)
- [Identifiers for WebRTC's Statistics API](https://w3c.github.io/webrtc-stats/#dom-rtcvideosourcestats)
