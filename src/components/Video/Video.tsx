import type React from 'react'
import { type Dispatch, type SetStateAction, useEffect, useRef } from 'react'

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
const VideoElement: React.FC<VideoProps> = (props) => {
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
      if (audioOutput && stream && stream.getAudioTracks().length > 0) {
        videoRef.current.setSinkId(audioOutput)
      }
      resizeObserver.observe(videoRef.current)
    }
    return () => {
      resizeObserver.disconnect()
    }
  }, [setHeight, audioOutput, stream])

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
      if (audioOutput && stream.getAudioTracks().length > 0) {
        videoElement.setSinkId(audioOutput)
      }

      return () => {
        // onloadedmetadata が呼ばれない場合にアンマウントされた場合は track.enabled をオリジナルの状態に戻す
        for (const track of stream.getVideoTracks()) {
          if (originalEnabled !== undefined) {
            track.enabled = originalEnabled
          }
        }
      }
    }
  }, [stream, audioOutput])

  if (audioOutput && videoRef.current?.setSinkId && stream && stream.getAudioTracks().length > 0) {
    videoRef.current.setSinkId(audioOutput)
  }
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
}

export const Video: React.FC<VideoProps> = (props) => {
  return <VideoElement {...props} />
}
