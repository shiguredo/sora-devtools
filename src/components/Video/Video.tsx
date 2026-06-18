import { useEffect, useRef } from "preact/hooks";

import type { CustomHTMLVideoElement, SoraDevtoolsState } from "@/types";
import { getVideoSizeByResolution } from "@/utils";

interface VideoProps {
  localVideo?: boolean;
  displayResolution: SoraDevtoolsState["displayResolution"];
  stream: MediaStream | null;
  mute: boolean;
  audioOutput: string;
  setHeight: (value: number) => void;
}

function VideoElement(props: VideoProps) {
  const { displayResolution, stream, mute, audioOutput, setHeight } = props;
  const videoRef = useRef<CustomHTMLVideoElement>(null);
  const videoSize = getVideoSizeByResolution(displayResolution);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });
    if (videoRef.current) {
      resizeObserver.observe(videoRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [setHeight]);

  useEffect(() => {
    if (videoRef.current && mute) {
      videoRef.current.muted = true;
    }
  }, [mute]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) {
      return;
    }

    if (stream === null) {
      // stream が null の場合は video 要素をリセットする
      videoElement.srcObject = null;
      return;
    }

    // Chrome で first video frame まで音声が出力されない現象のワークアラウンド
    // 一旦 video tracks を disabled にしておき、 loadedmetadata イベントで有効にする
    // 参照: https://bugs.chromium.org/p/chromium/issues/detail?id=403710
    let originalEnabled: boolean | undefined;
    for (const track of stream.getVideoTracks()) {
      originalEnabled = track.enabled;
      track.enabled = false;
    }
    const onLoadedMetadata = (): void => {
      for (const track of stream.getVideoTracks()) {
        if (originalEnabled !== undefined) {
          track.enabled = originalEnabled;
        }
      }
    };
    videoElement.addEventListener("loadedmetadata", onLoadedMetadata);

    videoElement.srcObject = stream;
    // 音声出力先の指定は srcObject 設定後のこの useEffect に集約する
    if (audioOutput && stream.getAudioTracks().length > 0) {
      void videoElement.setSinkId(audioOutput);
    }

    // stream 変更時にリスナーが蓄積するのを防ぐため cleanup で removeEventListener する
    return () => {
      videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
      // onloadedmetadata が呼ばれない場合にアンマウントされた場合は track.enabled をオリジナルの状態に戻す
      for (const track of stream.getVideoTracks()) {
        if (originalEnabled !== undefined) {
          track.enabled = originalEnabled;
        }
      }
    };
  }, [stream, audioOutput]);

  return (
    <video
      id={props.localVideo ? "local-video" : undefined}
      autoPlay
      playsInline
      controls
      muted={mute}
      ref={videoRef}
      width={videoSize.width > 0 ? videoSize.width : undefined}
      height={videoSize.height > 0 ? videoSize.height : undefined}
    />
  );
}

export function Video(props: VideoProps) {
  return <VideoElement {...props} />;
}
