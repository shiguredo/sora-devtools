# 0019 utils.ts と types.ts の関心事を分離する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

`src/utils.ts` (877行) と `src/types.ts` (447行) に複数の関心事が混在している。

## utils.ts の問題

以下の関心事が 1 ファイルに混在:

| 関心事                             | 行数   | 該当箇所                                                                                                                                                           |
| ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| クエリ文字列パース                 | ~170行 | `parseQueryString` + 内部関数                                                                                                                                      |
| シグナリング URL 生成              | ~15行  | `createSignalingURL`                                                                                                                                               |
| 解像度・アスペクト比ユーティリティ | ~55行  | `getVideoSizeByResolution`, `getValueByAspectRatio`, `getBlurRadiusNumber`                                                                                         |
| MediaConstraints 生成              | ~185行 | `createAudioConstraints`, `createVideoConstraints`, `createFakeMediaConstraints`, `createGetDisplayMediaAudioConstraints`, `createGetDisplayMediaVideoConstraints` |
| FakeMedia 生成                     | ~42行  | `createFakeMediaStream`                                                                                                                                            |
| URL クリップボードコピー           | ~5行   | `copy2clipboard`                                                                                                                                                   |
| 型解析ユーティリティ               | ~40行  | `parseBooleanString`, `parseMetadata`, `getDefaultVideoCodecType`, `getDevices`, `checkFormValue`, `isFormDisabled`                                                |
| MediaStreamTrack プロパティ取得    | ~15行  | `getMediaStreamTrackProperties`                                                                                                                                    |
| 接続オプション生成                 | ~170行 | `createConnectOptions` + 6 ヘルパー                                                                                                                                |
| 時刻フォーマット                   | ~10行  | `formatUnixtime`                                                                                                                                                   |

## types.ts の問題

| 関心事                     | 該当箇所                                                                                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| アプリケーション状態型     | `SoraDevtoolsState` (114 フィールド)                                                                                                                              |
| 部分型導出                 | `QueryStringParameters`, `ConnectionOptionsState`, `DownloadReportParameters`                                                                                     |
| ブラウザ API 型拡張        | `CustomHTMLCanvasElement`, `CustomHTMLVideoElement`                                                                                                               |
| WebRTC Stats 型拡張        | `RTCMediaStreamTrackStats`, `RTCInboundRtpStreamStats`, `RTCStatsCodec`, `RTCIceLocalCandidateStats`                                                              |
| MediaTrackConstraints 拡張 | `SoraDevtoolsMediaTrackConstraints`                                                                                                                               |
| メッセージ型               | `AlertMessage`, `TimelineMessage`, `LogMessage`, `SoraNotifyMessage`, `NotifyMessage`, `SoraPushMessage`, `PushMessage`, `SignalingMessage`, `DataChannelMessage` |
| RPC/API 型                 | `RpcObject`, `ApiObject`                                                                                                                                          |
| ダウンロードレポート型     | `DownloadReport`, `DownloadReportParameters`                                                                                                                      |

## 修正方針

### utils.ts 分割案

- `src/utils/query-string.ts` — `parseQueryString`, 関連ヘルパー
- `src/utils/media-constraints.ts` — 各種 constraints 生成関数（audio/video/fake/display）
- `src/utils/fake-media.ts` — `createFakeMediaStream`, `createFakeMediaConstraints`
- `src/utils/connection-options.ts` — `createConnectOptions` + 6 ヘルパー
- `src/utils/signaling-url.ts` — `createSignalingURL`
- `src/utils/clipboard.ts` — `copyToClipboard`
- `src/utils/format.ts` — `formatUnixtime`, `parseBooleanString`, `parseMetadata`, `checkFormValue`, `isFormDisabled`
- `src/utils/video.ts` — `getVideoSizeByResolution`, `getValueByAspectRatio`, `getBlurRadiusNumber`
- `src/utils/devices.ts` — `getDevices`, `getMediaStreamTrackProperties`, `getDefaultVideoCodecType`

### types.ts 分割案

- `src/types/state.ts` — `SoraDevtoolsState` + 部分型導出
- `src/types/browser.ts` — `CustomHTMLCanvasElement`, `CustomHTMLVideoElement`, `SoraDevtoolsMediaTrackConstraints`
- `src/types/webrtc-stats.ts` — WebRTC Stats 型拡張
- `src/types/messages.ts` — 各種メッセージ型
- `src/types/rpc-api.ts` — `RpcObject`, `ApiObject`
- `src/types/report.ts` — `DownloadReport`, `DownloadReportParameters`
