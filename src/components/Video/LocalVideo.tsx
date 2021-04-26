import React, { useState } from "react";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/slice";
import { ConnectType } from "@/utils";

import ConnectionStatusBar from "./ConnectionStatusBar";
import Video from "./Video";
import VolumeVisualizer from "./VolumeVisualizer";

const VideoBox: React.FC = () => {
  const [height, setHeight] = useState<number>(0);
  const audioOutput = useSelector((state: SoraDemoState) => state.audioOutput);
  const displayResolution = useSelector((state: SoraDemoState) => state.displayResolution);
  const focusedSpotlightConnectionIds = useSelector((state: SoraDemoState) => state.focusedSpotlightConnectionIds);
  const connectionId = useSelector((state: SoraDemoState) => state.soraContents.connectionId);
  const localMediaStream = useSelector((state: SoraDemoState) => state.soraContents.localMediaStream);
  const focused = connectionId && focusedSpotlightConnectionIds[connectionId];
  return (
    <>
      <div className="d-flex">
        <div className={"d-flex flex-nowrap align-items-start video-wrapper" + (focused ? " spotlight-focused" : "")}>
          <Video
            stream={localMediaStream}
            setHeight={setHeight}
            audioOutput={audioOutput}
            displayResolution={displayResolution}
            mute
          />
          {localMediaStream !== null ? <VolumeVisualizer stream={localMediaStream} height={height} /> : null}
        </div>
      </div>
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
    <div className="row my-1">
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
