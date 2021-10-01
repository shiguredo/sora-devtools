import React, { useState } from "react";

import { useAppSelector } from "@/app/hooks";
import { ConnectType } from "@/utils";

import { ConnectionStatusBar } from "./ConnectionStatusBar";
import { Video } from "./Video";
import { VolumeVisualizer } from "./VolumeVisualizer";

const VideoBox: React.FC = () => {
  const [height, setHeight] = useState<number>(0);
  const audioOutput = useAppSelector((state) => state.audioOutput);
  const displayResolution = useAppSelector((state) => state.displayResolution);
  const focusedSpotlightConnectionIds = useAppSelector((state) => state.focusedSpotlightConnectionIds);
  const connectionId = useAppSelector((state) => state.soraContents.connectionId);
  const localMediaStream = useAppSelector((state) => state.soraContents.localMediaStream);
  const micDevice = useAppSelector((state) => state.micDevice);
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
          {localMediaStream !== null ? (
            <VolumeVisualizer micDevice={micDevice} stream={localMediaStream} height={height} />
          ) : null}
        </div>
      </div>
    </>
  );
};

type LocalVideoProps = {
  connectType: ConnectType;
};
export const LocalVideo: React.FC<LocalVideoProps> = (props) => {
  const connectionId = useAppSelector((state) => state.soraContents.connectionId);
  const clientId = useAppSelector((state) => state.soraContents.clientId);
  return (
    <div className="row my-1">
      <div className="col-auto">
        <div className="video-status mb-1">
          {connectionId !== null || clientId !== null ? (
            <ConnectionStatusBar connectionId={connectionId} clientId={clientId} />
          ) : null}
        </div>
        {props.connectType !== "recvonly" ? <VideoBox /> : null}
      </div>
    </div>
  );
};
