import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import ButtonCamera from "@/components/Button/Camera";
import ButtonMic from "@/components/Button/Mic";
import ConnectionId from "@/components/ConnectionId";
import { setFakeVolume, SoraDemoState } from "@/slice";
import { ConnectType, CustomHTMLVideoElement, getVideoSizeByResolution } from "@/utils";

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
  displayResolution: SoraDemoState["displayResolution"];
  stream: MediaStream | null;
  audioOutput: string;
  setHeight: Dispatch<SetStateAction<number>>;
};
const VideoElement: React.FC<VideoElementProps> = (props) => {
  const { displayResolution, stream, audioOutput, setHeight } = props;
  const videoRef = useRef<CustomHTMLVideoElement>(null);
  const videoSize = getVideoSizeByResolution(displayResolution);
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
    if (videoRef.current) {
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

const VideoElementMemo = React.memo((props: VideoElementProps) => {
  return <VideoElement {...props} />;
});

const StatusAudioVideo: React.FC = () => {
  return (
    <div className="ml-3">
      <ButtonMic />
      <ButtonCamera />
    </div>
  );
};

type SelfConnectionProps = {
  connectType: ConnectType;
};
const SelfConnection: React.FC<SelfConnectionProps> = (props) => {
  const [height, setHeight] = useState<number>(0);
  const { soraContents, mediaType, audioOutput, displayResolution } = useSelector((state: SoraDemoState) => state);
  const { sora, localMediaStream } = soraContents;
  return (
    <div className="row mt-2">
      <div className="col-auto">
        <div className="video-status mb-1">
          {sora !== null && sora.connectionId ? (
            <>
              <ConnectionId connectionId={sora.connectionId} />
              {props.connectType !== "recvonly" ? <StatusAudioVideo /> : null}
            </>
          ) : null}
        </div>
        {props.connectType !== "recvonly" ? (
          <>
            <div className="d-flex">
              <VideoElementMemo
                stream={localMediaStream}
                setHeight={setHeight}
                audioOutput={audioOutput}
                displayResolution={displayResolution}
              />
              {localMediaStream !== null ? <VolumeVisualizer stream={localMediaStream} height={height} /> : null}
            </div>
            {mediaType === "fakeMedia" ? <VolumeRange /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default SelfConnection;
