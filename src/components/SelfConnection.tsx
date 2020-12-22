import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import ConnectionStatusBar from "@/components/ConnectionStatusBar";
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

const VideoBox: React.FC = () => {
  const [height, setHeight] = useState<number>(0);
  const mediaType = useSelector((state: SoraDemoState) => state.mediaType);
  const audioOutput = useSelector((state: SoraDemoState) => state.audioOutput);
  const displayResolution = useSelector((state: SoraDemoState) => state.displayResolution);
  const focusedSpotlightConnectionIds = useSelector((state: SoraDemoState) => state.focusedSpotlightConnectionIds);
  const connectionId = useSelector((state: SoraDemoState) => state.soraContents.connectionId);
  const localMediaStream = useSelector((state: SoraDemoState) => state.soraContents.localMediaStream);
  const focused = connectionId && focusedSpotlightConnectionIds.includes(connectionId);
  return (
    <>
      <div className={"d-flex" + (focused ? " spotlight-focused" : "")}>
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
  );
};

type SelfConnectionProps = {
  connectType: ConnectType;
};
const SelfConnection: React.FC<SelfConnectionProps> = (props) => {
  const connectionId = useSelector((state: SoraDemoState) => state.soraContents.connectionId);
  const clientId = useSelector((state: SoraDemoState) => state.soraContents.clientId);
  return (
    <div className="row mt-2">
      <div className="col-auto">
        <div className="video-status mb-1">
          {connectionId !== null || clientId !== null ? (
            <ConnectionStatusBar
              connectionId={connectionId}
              clientId={clientId}
              showMediaButton={props.connectType !== "recvonly"}
            />
          ) : null}
        </div>
        {props.connectType !== "recvonly" ? <VideoBox /> : null}
      </div>
    </div>
  );
};

export default SelfConnection;
