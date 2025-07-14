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
  onAudioOutputError?: (error: Error) => void
}
// エラーをError型に変換するヘルパー関数
const toError = (error: unknown): Error => {
  return error instanceof Error ? error : new Error(String(error))
}

const VideoElement = React.memo<VideoProps>((props) => {
  const { displayResolution, stream, mute, audioOutput, setHeight, onAudioOutputError } = props
  const videoRef = useRef<CustomHTMLVideoElement>(null)
  const videoSize = getVideoSizeByResolution(displayResolution)
  const previousAudioOutputRef = useRef<string>('')

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
    
    // audioOutput が変更されていない場合はスキップ
    if (previousAudioOutputRef.current === audioOutput) {
      return
    }

    // フォールバック処理を別関数に分離
    const fallbackToDefaultDevice = async () => {
      try {
        await videoElement.setSinkId('')
      } catch (fallbackError) {
        const fallbackErrorObject = toError(fallbackError)
        if (onAudioOutputError) {
          onAudioOutputError(fallbackErrorObject)
        }
      }
    }

    // setSinkId は非同期処理なので適切にハンドリング
    const updateAudioOutput = async () => {
      try {
        await videoElement.setSinkId(audioOutput)
        // 成功時のみ previousAudioOutputRef を更新
        previousAudioOutputRef.current = audioOutput
      } catch (error) {
        const errorObject = toError(error)
        
        // 親コンポーネントにエラーを通知
        if (onAudioOutputError) {
          onAudioOutputError(errorObject)
        }
        
        // エラー時の処理: デフォルトデバイスに戻す
        await fallbackToDefaultDevice()
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
      // クロージャで videoElement を保持して、同じオブジェクトからリスナーを削除
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
    }
  }, [audioOutput, stream, onAudioOutputError])

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
