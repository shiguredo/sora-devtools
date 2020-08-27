import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import IconCamera from "@/components/IconCamera";
import IconMic from "@/components/IconMic";
import { setFakeVolume, SoraDemoState } from "@/slice";

import ButtonCamera from "./ButtonCamera";
import ButtonMic from "./ButtonMic";
import VolumeVisualizer from "./VolumeVisualizer";

const VolumeRange: React.FC = () => {
  const { fakeVolume } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setFakeVolume(event.target.value));
  };
  return (
    <div>
      <input
        className="fake-volume-range"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={fakeVolume}
        onChange={onChange}
      />
    </div>
  );
};

type VideoElementProps = {
  stream: MediaStream | null;
  setHeight: Dispatch<SetStateAction<number>>;
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
      resizeObserver.observe(videoRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = props.stream;
    }
  }, [props.stream]);
  return <video id="local-video" autoPlay playsInline controls muted ref={videoRef} />;
};

const VideoElementMemo = React.memo((props: VideoElementProps) => {
  return <VideoElement {...props} />;
});

const LocalVideo: React.FC = () => {
  const [height, setHeight] = useState<number>(0);
  const { enabledMic, enabledCamera, immutable, fake } = useSelector((state: SoraDemoState) => state);
  const { sora, localMediaStream } = immutable;
  return (
    <div className="row mt-2">
      <div className="col-auto">
        {localMediaStream !== null && (
          <div className="video-status">
            <p id="client-id">{sora && sora.clientId}</p>
            <p id="audio-video-status" className="mx-1">
              <IconMic mute={!enabledMic} /> / <IconCamera mute={!enabledCamera} />
            </p>
            <ButtonMic />
            <ButtonCamera />
          </div>
        )}
        <VideoElementMemo stream={localMediaStream} setHeight={setHeight} />
        {localMediaStream !== null && <VolumeVisualizer stream={localMediaStream} height={height} />}
        {fake && <VolumeRange />}
      </div>
    </div>
  );
};

export default LocalVideo;
