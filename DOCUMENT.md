# ドキュメント

## channelId

接続するチャネルの ID を指定します。
1-255 文字までの文字列を指定できます。

## role

クライアントの役割を指定します。

## multistream

マルチストリームを使用するかどうかを指定します。

## simulcast

サイマルキャストを使用するかどうかを指定します。

## simulcastRid

サイマルキャストで配信されている映像を受信する際のエンコードの初期値を指定します。
r0: 解像度(一辺)が1/4になるようにエンコード
r1: 解像度(一辺)が1/2になるようにエンコード
r2: 通常の解像度のままエンコード

## spotlight

スポットライトを使用するかどうかを指定します。

## spotlightNumber

スポットライトでフォーカスする配信数の最大値を指定します。
1-8 までの数字を指定できます。

## spotlightFocusRid

スポットライトででフォーカスした場合の映像を受信する際のエンコードの初期値を指定します。
r0: 解像度(一辺)が1/4になるようにエンコード
r1: 解像度(一辺)が1/2になるようにエンコード
r2: 通常の解像度のままエンコード

## spotlightUnfocusRid

スポットライトででフォーカスが外れた場合の映像を受信する際のエンコードの初期値を指定します。
r0: 解像度(一辺)が1/4になるようにエンコード
r1: 解像度(一辺)が1/2になるようにエンコード
r2: 通常の解像度のままエンコード

## audio

音声配信をするかどうかを指定します。

## audioCodecType

音声のコーデックタイプを指定します。

## audioBitRate

音声のビットレートを指定します。

## video

映像配信をするかどうかを指定します。

## videoCodecType

映像のコーデックタイプを指定します。

## videoBitRate

映像のビットレートを指定します。

## reconnect

切断時に再接続するかどうかを指定します。
一度接続に成功したあとに意図しない切断があった場合に再接続を試みる仕組みです。

## clientId

接続時に任意のクライアント ID を指定できます。

## metadata

認証するための判断材料としてのメタデータを指定します。

## bundleId

同一端末から複数接続する場合に、それぞれの接続で同一の bundle_id を指定すると、指定した接続からの音声や映像やメッセージングを受信しなくなります。

## signalingNotifyMetadata

クライアントが参加や離脱したときに送られるシグナリング通知に含まれるメタデータを指定します。

## signalingUrlCandidates

シグナリングをするURLを複数指定します。

## forwardingFilter

デフォルトの転送フィルターを指定します。

## dataChannels

メッセージング用の DataChannel を指定します。

## dataChannelSignaling

シグナリングを DataChannel 経由に切り替えるかどうかを指定します。

## ignoreDisconnectWebSocket

シグナリングを DataChannel 経由に切り替えた際に、 WebSocket が閉じても、接続が切断しないようにするかどうかを指定します。

## audioStreamingLanguageCode

音声解析用の言語コードを指定します。

## videoVP9Params

映像のコーデックタイプに VP9 を指定した場合の設定を指定します。

## videoH264Params

映像のコーデックタイプに H264 を指定した場合の設定を指定します。

## videoAV1Params

映像のコーデックタイプに AV1 を指定した場合の設定を指定します。

## mediaType

メディアタイプを指定します。
getUserMedia: デバイスに接続されているカメラ/マイクをメディアとして使用します。
getDisplayMedia: ディスプレイまたはその一部(ウィンドウ等)をメディアとして使用します。
fakeMedia: 生成した映像と音声をメディアとして使用します

## fakeVolume

mediaType に fakeMedia を選択した際の音量を指定します。

## audioContentHint

MediaStreamTrack audio の contentHint を指定します。

## autoGainControl

MediaTrackConstraints の autoGainControl を指定します。

## noiseSuppression

MediaTrackConstraints の noiseSuppression を指定します。

## echoCancellation

MediaTrackConstraints の echoCancellation を指定します。

## echoCancellationType

MediaTrackConstraints の echoCancellationType を指定します。

## mediaProcessorsNoiseSuppression

shiguredo Media Processors のノイズ抑制を使用するかどうか指定します。

## videoContentHint

MediaStreamTrack video の contentHint を指定します。

## resolution

解像度を指定します。

## frameRate

MediaTrackConstraints の frameRate を指定します。

## aspectRatio

MediaTrackConstraints の aspectRatio を指定します。

## resizeMode

MediaTrackConstraints の resizeMode を指定します。

## blurRadius

shiguredo Media Processors の背景ぼかしを使用するかどうか指定します。

## lightAdjustment

shiguredo Media Processors のライト調整を使用するかどうかを指定します。

## facingMode

モバイルカメラのフロント/バックを切り替えます。

## audioInput

音声入力を指定します。

## videoInput

映像入力を指定します。

## audioOutput

音声出力を指定します。

## displayResolution

画面に表示する際の解像度を指定します。

## micDevice

Audio MediaStreamTrack を生成するかどうかを切り替えます。

## cameraDevice

Video MediaStreamTrack を生成するかどうかを切り替えます。

## audioTrack

Audio MediaStreamTrack の enabled 属性を切り替えます。

## videoTrack

video MediaStreamTrack の enabled 属性を切り替えます。
