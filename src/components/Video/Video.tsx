import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";

import { SoraDemoState } from "@/slice";
import { CustomHTMLVideoElement, getVideoSizeByResolution } from "@/utils";

type VideoProps = {
  displayResolution: SoraDemoState["displayResolution"];
  stream: MediaStream | null;
  mute: boolean;
  audioOutput: string;
  setHeight: Dispatch<SetStateAction<number>>;
};
const VideoElement: React.FC<VideoProps> = (props) => {
  const { displayResolution, stream, mute, audioOutput, setHeight } = props;
  const videoRef = useRef<CustomHTMLVideoElement>(null);
  const videoSize = getVideoSizeByResolution(displayResolution);
  // 映像のサイズが小さすぎる場合にサイズを固定するためのハック
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setHeight(entry.contentRect.height);
      });
    });
    if (videoRef.current) {
      resizeObserver.observe(videoRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (videoRef.current && mute) {
      videoRef.current.muted = true;
    }
  }, [mute]);

  useEffect(() => {
    if (videoRef.current && stream) {
      // Chrome で first video frame まで音声が出力されない現象のワークアラウンド
      // 一旦 video tracks を disabled にしておき、 loadedmetadata イベントで有効にする
      // c.f. https://bugs.chromium.org/p/chromium/issues/detail?id=403710
      stream.getVideoTracks().forEach((track) => {
        track.enabled = false;
      });
      videoRef.current.onloadedmetadata = (_) => {
        stream.getVideoTracks().forEach((track) => {
          track.enabled = true;
        });
      };

      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (audioOutput && videoRef.current?.setSinkId && stream && stream.getAudioTracks().length > 0) {
    videoRef.current.setSinkId(audioOutput);
  }
  return (
    <video
      id="local-video"
      autoPlay
      playsInline
      controls
      muted
      ref={videoRef}
      width={0 < videoSize.width ? videoSize.width : undefined}
      height={0 < videoSize.height ? videoSize.height : undefined}
    />
  );
};

const Video = React.memo((props: VideoProps) => {
  return <VideoElement {...props} />;
});

export default Video;
