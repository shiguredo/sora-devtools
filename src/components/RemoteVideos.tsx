import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import ChangeSimulcastQualityByStreamId from "@/components/Button/ChangeSimulcastQualityByStreamId";
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

type RemoteVideoProps = {
  stream: MediaStream;
};
const RemoteVideo: React.FC<RemoteVideoProps> = (props) => {
  const [height, setHeight] = useState<number>(0);
  const { mute, spotlightConnectionIds } = useSelector((state: SoraDemoState) => state);
  return (
    <div className="col-auto">
      <div className="video-status">
        <p>{props.stream.id}</p>
        <p className="mx-1">
          {props.stream.id in spotlightConnectionIds ? ` [${spotlightConnectionIds[props.stream.id]}]` : ""}
        </p>
        <ChangeSimulcastQualityByStreamId quality="low" streamId={props.stream.id} />
        <ChangeSimulcastQualityByStreamId quality="middle" streamId={props.stream.id} />
        <ChangeSimulcastQualityByStreamId quality="high" streamId={props.stream.id} />
      </div>
      <div className="d-flex align-items-start">
        <VideoElementMemo stream={props.stream} setHeight={setHeight} mute={mute} />
        <VolumeVisualizer stream={props.stream} height={height} />
      </div>
    </div>
  );
};

const RemoteVideos: React.FC = () => {
  const { immutable } = useSelector((state: SoraDemoState) => state);
  const { remoteMediaStreams } = immutable;
  return (
    <div className="row mt-2">
      {remoteMediaStreams.map((mediaStream) => {
        return <RemoteVideo key={mediaStream.id} stream={mediaStream} />;
      })}
    </div>
  );
};

export default RemoteVideos;
