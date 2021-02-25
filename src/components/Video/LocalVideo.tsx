import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setFakeVolume, SoraDemoState } from "@/slice";
import { ConnectType } from "@/utils";

import ConnectionStatusBar from "./ConnectionStatusBar";
import Video from "./Video";
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

const VideoBox: React.FC = () => {
  const [height, setHeight] = useState<number>(0);
  const mediaType = useSelector((state: SoraDemoState) => state.mediaType);
  const audioOutput = useSelector((state: SoraDemoState) => state.audioOutput);
  const displayResolution = useSelector((state: SoraDemoState) => state.displayResolution);
  const focusedSpotlightConnectionIds = useSelector((state: SoraDemoState) => state.focusedSpotlightConnectionIds);
  const connectionId = useSelector((state: SoraDemoState) => state.soraContents.connectionId);
  const localMediaStream = useSelector((state: SoraDemoState) => state.soraContents.localMediaStream);
  const focused = connectionId && focusedSpotlightConnectionIds[connectionId];
  return (
    <>
      <div className={"d-flex" + (focused ? " spotlight-focused" : "")}>
        <Video
          stream={localMediaStream}
          setHeight={setHeight}
          audioOutput={audioOutput}
          displayResolution={displayResolution}
          mute
        />
        {localMediaStream !== null ? <VolumeVisualizer stream={localMediaStream} height={height} /> : null}
      </div>
      {mediaType === "fakeMedia" ? <VolumeRange /> : null}
    </>
  );
};

type LocalVideoProps = {
  connectType: ConnectType;
};
const LocalVideo: React.FC<LocalVideoProps> = (props) => {
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

export default LocalVideo;
