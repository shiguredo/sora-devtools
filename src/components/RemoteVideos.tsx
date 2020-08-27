import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/slice";

import VolumeVisualizer from "./VolumeVisualizer";

type VideoElementProps = {
  stream: MediaStream;
  setHeight: Dispatch<SetStateAction<number>>;
  mute: boolean;
};
const VideoElement: React.FC<VideoElementProps> = (props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        props.setHeight(entry.contentRect.height);
      }
    });
    if (videoRef.current) {
      if (props.mute) {
        videoRef.current.muted = true;
      }
      videoRef.current.srcObject = props.stream;
      resizeObserver.observe(videoRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <video autoPlay playsInline controls ref={videoRef} />;
};

const VideoElementMemo = React.memo((props: VideoElementProps) => {
  return <VideoElement {...props} />;
});

const RemoteVideos: React.FC = () => {
  const [height, setHeight] = useState<number>(0);
  const { immutable, mute, spotlightConnectionIds } = useSelector((state: SoraDemoState) => state);
  const { remoteMediaStreams } = immutable;
  return (
    <div className="row mt-2">
      {remoteMediaStreams.map((mediaStream) => {
        return (
          <div key={mediaStream.id} className="col-auto">
            <p className="mb-1">
              {mediaStream.id}
              {mediaStream.id in spotlightConnectionIds ? ` [${spotlightConnectionIds[mediaStream.id]}]` : ""}
            </p>
            <VideoElementMemo stream={mediaStream} setHeight={setHeight} mute={mute} />
            <VolumeVisualizer stream={mediaStream} height={height} />
          </div>
        );
      })}
    </div>
  );
};

export default RemoteVideos;
