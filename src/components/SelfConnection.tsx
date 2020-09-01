import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import ButtonCamera from "@/components/Button/Camera";
import ButtonMic from "@/components/Button/Mic";
import IconCamera from "@/components/IconCamera";
import IconMic from "@/components/IconMic";
import { setFakeVolume, SoraDemoState } from "@/slice";
import { ConnectType, CustomHTMLVideoElement } from "@/utils";

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
        id="fakeVolume"
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
  audioOutput: string;
  setHeight: Dispatch<SetStateAction<number>>;
};
const VideoElement: React.FC<VideoElementProps> = (props) => {
  const { stream, audioOutput, setHeight } = props;
  const videoRef = useRef<CustomHTMLVideoElement>(null);
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  if (audioOutput && videoRef.current?.setSinkId && stream && stream.getAudioTracks().length > 0) {
    videoRef.current.setSinkId(audioOutput);
  }
  return <video id="local-video" autoPlay playsInline controls muted ref={videoRef} />;
};

const VideoElementMemo = React.memo((props: VideoElementProps) => {
  return <VideoElement {...props} />;
});

const StatusAudioVideo: React.FC = () => {
  const { enabledMic, enabledCamera } = useSelector((state: SoraDemoState) => state);
  return (
    <>
      <p id="audio-video-status" className="mx-1">
        <IconMic mute={!enabledMic} /> / <IconCamera mute={!enabledCamera} />
      </p>
      <ButtonMic />
      <ButtonCamera />
    </>
  );
};

type SelfConnectionProps = {
  connectType: ConnectType;
};
const SelfConnection: React.FC<SelfConnectionProps> = (props) => {
  const [height, setHeight] = useState<number>(0);
  const { immutable, fake, audioOutput } = useSelector((state: SoraDemoState) => state);
  const { sora, localMediaStream } = immutable;
  return (
    <div className="row mt-2">
      <div className="col-auto">
        <div className="video-status">
          {sora !== null && (
            <>
              <p id="client-id">self: {sora.clientId}</p>
              {props.connectType !== "recvonly" && <StatusAudioVideo />}
            </>
          )}
        </div>
        {props.connectType !== "recvonly" && (
          <>
            <div className="d-flex">
              <VideoElementMemo stream={localMediaStream} setHeight={setHeight} audioOutput={audioOutput} />
              {localMediaStream !== null && <VolumeVisualizer stream={localMediaStream} height={height} />}
            </div>
            {fake && <VolumeRange />}
          </>
        )}
      </div>
    </div>
  );
};

export default SelfConnection;
