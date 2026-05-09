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

### 前提

分割は以下の issue が完了した後に行う（分割前のファイルに対する同時編集の衝突を避けるため）:

- #0015（死にコード削除）— 分割前に不要コードを除去
- #0017（signals ボイラープレート削減）— import パス変更の競合回避
- #0018（actions 重複解消）— 同上

### utils.ts 分割手順

1. 新規ディレクトリ `src/utils/` を作成する（現在は単一ファイル）
2. 以下のファイルに分割する（import パスは `@/utils/<name>` を使用可能にする）:

| 新規ファイル                      | 含める関数                                                                                                                                                         | テストファイル                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `src/utils/query-string.ts`       | `parseQueryString`                                                                                                                                                 | `src/utils/query-string.prop.ts` (PBT 移行) |
| `src/utils/media-constraints.ts`  | `createAudioConstraints`, `createVideoConstraints`, `createFakeMediaConstraints`, `createGetDisplayMediaAudioConstraints`, `createGetDisplayMediaVideoConstraints` | `src/utils/media-constraints.ct.ts`         |
| `src/utils/fake-media.ts`         | `createFakeMediaStream`                                                                                                                                            | `src/utils/fake-media.ct.ts`                |
| `src/utils/connection-options.ts` | `createConnectOptions` + 6 ヘルパー（`applyAudioCodecOptions` 等）                                                                                                 | `src/utils/connection-options.ct.ts`        |
| `src/utils/signaling-url.ts`      | `createSignalingURL`                                                                                                                                               | `src/utils/signaling-url.ct.ts`             |
| `src/utils/clipboard.ts`          | `copyToClipboard`                                                                                                                                                  | `src/utils/clipboard.ct.ts`                 |
| `src/utils/format.ts`             | `formatUnixtime`, `parseBooleanString`, `parseMetadata`                                                                                                            | `src/utils/format.prop.ts`                  |
| `src/utils/video.ts`              | `getVideoSizeByResolution`, `testVideoResolutionPattern`, `getValueByAspectRatio`, `getBlurRadiusNumber`                                                           | `src/utils/video.prop.ts`                   |
| `src/utils/devices.ts`            | `getDevices`, `getMediaStreamTrackProperties`, `getDefaultVideoCodecType`, `checkFormValue`, `isFormDisabled`                                                      | `src/utils/devices.ct.ts`                   |

3. `src/utils.ts` を削除し、全 import を新しいパスに変更する
4. `vite.config.ts` の `test.include` を新しいテストファイルパスに更新する

### types.ts 分割手順

1. 新規ディレクトリ `src/types/` を作成する
2. 以下のファイルに分割（`CustomHTMLCanvasElement` は #0015 で削除済みのため含めない）:

| 新規ファイル                | 含める型                                                                                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types/state.ts`        | `SoraDevtoolsState`, `QueryStringParameters`, `ConnectionOptionsState`, `DownloadReportParameters`                                                                |
| `src/types/browser.ts`      | `CustomHTMLVideoElement`, `SoraDevtoolsMediaTrackConstraints`                                                                                                     |
| `src/types/webrtc-stats.ts` | `RTCMediaStreamTrackStats`, `RTCInboundRtpStreamStats`, `RTCStatsCodec`, `RTCIceLocalCandidateStats`                                                              |
| `src/types/messages.ts`     | `AlertMessage`, `TimelineMessage`, `LogMessage`, `SoraNotifyMessage`, `NotifyMessage`, `SoraPushMessage`, `PushMessage`, `SignalingMessage`, `DataChannelMessage` |
| `src/types/rpc-api.ts`      | `RpcObject`, `ApiObject`, `DebugType`                                                                                                                             |
| `src/types/report.ts`       | `DownloadReport`                                                                                                                                                  |
| `src/types/common.ts`       | `Json`, `RemoteClient`（複数ファイルから参照される共通型）                                                                                                        |

3. `src/types.ts` を削除し、全 import を新しいパスに変更する

### テスト戦略

- 分割前後で `vp check` と `vp test run` が pass すること
- import パス変更は TypeScript の型チェックで検出されるため、`vp check` の pass で網羅できる
- 分割後に各新規ファイルのテストを #0016 の方針に従って追加する
