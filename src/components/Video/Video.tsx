import React, { type Dispatch, type SetStateAction, useEffect, useRef } from 'react'

import type { CustomHTMLVideoElement, SoraDevtoolsState } from '@/types'
import { getVideoSizeByResolution } from '@/utils'

type VideoProps = {
  localVideo?: boolean
  displayResolution: SoraDevtoolsState['displayResolution']
  stream: MediaStream | null
  mute: boolean
  audioOutput: string
  setHeight: Dispatch<SetStateAction<number>>
}
const VideoElement = React.memo<VideoProps>((props) => {
  const { displayResolution, stream, mute, audioOutput, setHeight } = props
  const videoRef = useRef<CustomHTMLVideoElement>(null)
  const videoSize = getVideoSizeByResolution(displayResolution)

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      entries.filter((entry) => {
        setHeight(entry.contentRect.height)
      })
    })
    if (videoRef.current) {
      resizeObserver.observe(videoRef.current)
    }
    return () => {
      resizeObserver.disconnect()
    }
  }, [setHeight])

  useEffect(() => {
    if (videoRef.current && mute) {
      videoRef.current.muted = true
    }
  }, [mute])

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) {
      return
    }

    if (stream === null) {
      // stream が null の場合は video 要素をリセットする
      videoElement.srcObject = null
    }

    if (stream) {
      // Chrome で first video frame まで音声が出力されない現象のワークアラウンド
      // 一旦 video tracks を disabled にしておき、 loadedmetadata イベントで有効にする
      // c.f. https://bugs.chromium.org/p/chromium/issues/detail?id=403710
      let originalEnabled: boolean | undefined
      for (const track of stream.getVideoTracks()) {
        originalEnabled = track.enabled
        track.enabled = false
      }
      videoElement.onloadedmetadata = (_) => {
        for (const track of stream.getVideoTracks()) {
          if (originalEnabled !== undefined) {
            track.enabled = originalEnabled
          }
        }
      }

      videoElement.srcObject = stream

      return () => {
        // onloadedmetadata が呼ばれない場合にアンマウントされた場合は track.enabled をオリジナルの状態に戻す
        for (const track of stream.getVideoTracks()) {
          if (originalEnabled !== undefined) {
            track.enabled = originalEnabled
          }
        }
      }
    }
  }, [stream])

  // audioOutput が変更された時のみ setSinkId を実行する
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement || !audioOutput || !stream || stream.getAudioTracks().length === 0) {
      return
    }

    // setSinkId は非同期処理なので適切にハンドリング
    const updateAudioOutput = async () => {
      try {
        await videoElement.setSinkId(audioOutput)
        console.log(`Audio output successfully changed to: ${audioOutput}`)
      } catch (error) {
        console.error('Failed to set audio output device:', error)
        // エラー時の処理: デフォルトデバイスに戻す
        try {
          await videoElement.setSinkId('')
          console.log('Fallback to default audio output device')
        } catch (fallbackError) {
          console.error('Failed to fallback to default device:', fallbackError)
        }
      }
    }

    // メタデータがロードされていることを確認してから実行
    if (videoElement.readyState >= 1) {
      updateAudioOutput()
    } else {
      const handleLoadedMetadata = () => {
        updateAudioOutput()
      }
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
    }
  }, [audioOutput, stream])

  return (
    <video
      id={props.localVideo ? 'local-video' : undefined}
      autoPlay={true}
      playsInline={true}
      controls={true}
      muted={mute}
      ref={videoRef}
      width={videoSize.width > 0 ? videoSize.width : undefined}
      height={videoSize.height > 0 ? videoSize.height : undefined}
    />
  )
})

export const Video = React.memo<VideoProps>((props) => {
  return <VideoElement {...props} />
})
