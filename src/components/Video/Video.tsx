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
  const abortControllerRef = useRef<AbortController | null>(null)

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

    // 新しい処理を開始する前に、前の非同期処理をキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current

    // フォールバック処理を別関数に分離
    const fallbackToDefaultDevice = async (_originalError: Error) => {
      // キャンセルされた場合は処理を中断
      if (signal.aborted) return
      
      try {
        await videoElement.setSinkId('')
        // フォールバック成功時も previousAudioOutputRef を更新
        if (!signal.aborted) {
          previousAudioOutputRef.current = ''
        }
        // フォールバックは成功したが、元のデバイスは使用できなかったことを通知
        const warningError = new Error('音声出力デバイスの設定に失敗しました')
        if (onAudioOutputError && !signal.aborted) {
          onAudioOutputError(warningError)
        }
      } catch (_fallbackError) {
        // 元エラーとフォールバックエラーを統合
        // const fallbackErrorObject = toError(fallbackError) // 現在使用していない
        const combinedError = new Error('音声出力デバイスの設定に失敗しました')
        if (onAudioOutputError && !signal.aborted) {
          onAudioOutputError(combinedError)
        }
      }
    }

    // setSinkId は非同期処理なので適切にハンドリング
    const updateAudioOutput = async () => {
      // キャンセルされた場合は早期リターン
      if (signal.aborted) return
      
      try {
        await videoElement.setSinkId(audioOutput)
        // 成功時のみ previousAudioOutputRef を更新
        if (!signal.aborted) {
          previousAudioOutputRef.current = audioOutput
        }
      } catch (error) {
        // キャンセルされた場合は処理を中断
        if (signal.aborted) return
        
        const errorObject = toError(error)
        
        // 親コンポーネントにエラーを通知
        if (onAudioOutputError) {
          onAudioOutputError(errorObject)
        }
        
        // エラー時の処理: デフォルトデバイスに戻す
        await fallbackToDefaultDevice(errorObject)
      }
    }

    // メタデータがロードされていることを確認してから実行
    if (videoElement.readyState >= 1) {
      // 直接呼び出す場合もエラーハンドリングを一貫させる
      updateAudioOutput().catch(() => {
        // エラーは updateAudioOutput 内で完全に処理される
      })
    } else {
      const handleLoadedMetadata = () => {
        updateAudioOutput().catch(() => {
          // エラーは updateAudioOutput 内で完全に処理される
        })
      }
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
      // クロージャで videoElement を保持して、同じオブジェクトからリスナーを削除
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
        // アンマウント時に非同期処理をキャンセル
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
          abortControllerRef.current = null
        }
      }
    }

    // クリーンアップ関数
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
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
