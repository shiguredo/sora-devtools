# 0017 signals.ts のボイラープレートセッターを削減する

Created: 2026-05-09
Model: deepseek-v4-pro

## 概要

`src/app/signals.ts:214-704` に 60 以上のセッター関数が定義されているが、大半は単なる `signal.value = value` のラッパーであり、ファイルを 885 行に肥大化させている。

```typescript
export const setAudio = (value: boolean): void => {
  audio.value = value;
};
export const setAudioBitRate = (value: string): void => {
  audioBitRate.value = value;
};
// ... 同様のパターンが 50 以上続く
```

## 問題点

- Preact signals は直接 `.value` 代入が可能であり、ラッパー関数は不要
- 副作用を持つ一部のセッター（`setAudioContentHint` 等）と単純セッターの区別がない
- コードレビュー時にどれが副作用を持つか判別しづらい
- ファイルの約 50% がボイラープレート

## 修正方針

### 1. 削除するセッター（副作用なし・単なる `.value` 代入）

以下のセッターは全て `signal.value = newValue` で直接代入可能なため削除する:

`setAudio`, `setAudioBitRate`, `setAudioCodecType`, `setAudioInput`, `setAudioOutput`, `setAutoGainControl`, `setChannelId`, `setClientId`, `setDataChannelSignaling`, `setDataChannels`, `setDebug`, `setDebugApiUrl`, `setDebugFilterText`, `setDisplayResolution`, `setEchoCancellation`, `setEchoCancellationType`, `setEnabledBundleId`, `setEnabledClientId`, `setEnabledDataChannel`, `setEnabledDataChannels`, `setEnabledForwardingFilters`, `setEnabledMetadata`, `setEnabledSignalingNotifyMetadata`, `setEnabledSignalingUrlCandidates`, `setEnabledVideoVP9Params`, `setEnabledVideoH264Params`, `setEnabledVideoH265Params`, `setEnabledVideoAV1Params`, `setAudioStreamingLanguageCode`, `setEnabledAudioStreamingLanguageCode`, `setFacingMode`, `setForceStereoOutput`, `setFrameRate`, `setIgnoreDisconnectWebSocket`, `setMediaProcessorsNoiseSuppression`, `setMediaStats`, `setMediaType`, `setMetadata`, `setMp4MediaStream`, `setNoiseSuppression`, `setReconnect`, `setResizeMode`, `setRole`, `setResolution`, `setSignalingNotifyMetadata`, `setSignalingUrlCandidates`, `setForwardingFilters`, `setSimulcast`, `setSimulcastRid`, `setSimulcastRequestRid`, `setSpotlight`, `setSpotlightFocusRid`, `setSpotlightNumber`, `setSpotlightUnfocusRid`, `setVideo`, `setVideoBitRate`, `setVideoCodecType`, `setVideoInput`, `setVideoTrack`, `setVideoVP9Params`, `setVideoH264Params`, `setVideoH265Params`, `setVideoAV1Params`, `setMute`, `setShowStats`, `setCameraDevice`, `setMicDevice`, `setAspectRatio`, `setBundleId`

### 2. 維持するセッター（副作用あり）

| セッター                                   | 副作用                                                           |
| ------------------------------------------ | ---------------------------------------------------------------- |
| `setAudioContentHint`                      | `localMediaStream` の AudioTrack に `contentHint` を反映         |
| `setVideoContentHint`                      | `localMediaStream` の VideoTrack に `contentHint` を反映         |
| `setAudioTrack`                            | `localMediaStream` の AudioTrack に `enabled` を反映             |
| `setVideoTrack`                            | `localMediaStream` の VideoTrack に `enabled` を反映             |
| `setFakeVolume`                            | `fakeContents.value.gainNode` の `gain.setValueAtTime` を呼ぶ    |
| `setFakeContentsGainNode`                  | `fakeContents` をスプレッド更新                                  |
| `setFakeVideoShowChannelId`                | Worker に `setShowInfo` メッセージを送信                         |
| `setInitialFakeContents`                   | Worker を new して `fakeContents` に設定                         |
| `setSora`                                  | `soraDataChannels` のリセット                                    |
| `setSoraSessionId` / `setSoraConnectionId` | Worker に `setMetadata` メッセージを送信                         |
| `setSoraReconnecting`                      | `reconnectingTrials` のリセット                                  |
| `setSoraReconnectingTrials`                | 値と型が異なる（number をセット）                                |
| `setBlurRadius`                            | `VirtualBackgroundProcessor` の初期化                            |
| `setLocalMediaStream`                      | 旧 track の stop                                                 |
| `setRpcObject` / `setApiObject`            | 先頭追加（`[...array, newItem]` ではなく `[newItem, ...array]`） |
| `setNotifyMessages`                        | `maxNotifyMessages` によるトリミング                             |
| `setMaxNotifyMessages`                     | トリミング + 既存メッセージの切り詰め                            |
| アラート系セッター                         | `setAlertMessagesAndLogMessages` 経由のログ出力                  |

### 3. コンポーネント側の import 変更

削除したセッターを使っている全コンポーネントの import を、セッター関数から signal 本体の import に変更する:

```typescript
// Before
import { setAudio, audio } from "@/app/actions";
setAudio(true);

// After
import { audio } from "@/app/signals";
audio.value = true;
```

### 4. #0015 との連携

セッター削除後、`src/app/actions.ts:1811-1901` の再エクスポートブロックから該当するセッターを削除する。最終的に再エクスポートブロック全体の削除につなげる。

### 5. テスト戦略

- 維持するセッター（副作用あり）のテストを追加する。特に `setFakeVolume`、`setAudioTrack`、`setVideoTrack` は副作用の確認が重要
- 削除するセッターについては、削除後に `vp check`（typecheck）が pass すれば型安全は担保される
