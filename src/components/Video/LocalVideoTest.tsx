import React, { useState } from 'react';

import { useAppSelector } from '@/app/hooks';

import { Video } from './Video';
import { VolumeVisualizer } from './VolumeVisualizer';

const VideoBox: React.FC = () => {
  const [height, setHeight] = useState<number>(0);
  const audio = useAppSelector((state) => state.audio);
  const video = useAppSelector((state) => state.video);
  const audioOutput = useAppSelector((state) => state.audioOutput);
  const displayResolution = useAppSelector((state) => state.displayResolution);
  const localTestMediaStream = useAppSelector((state) => state.localTestMediaStream);
  const micDevice = useAppSelector((state) => state.micDevice);
  if (audio === false && video === false) {
    return null;
  }
  return (
    <>
      <div className="d-flex">
        <div className="d-flex flex-nowrap align-items-start video-wrapper">
          <Video
            stream={localTestMediaStream}
            setHeight={setHeight}
            audioOutput={audioOutput}
            displayResolution={displayResolution}
            localVideo
            mute
          />
          {localTestMediaStream !== null ? (
            <VolumeVisualizer micDevice={micDevice} stream={localTestMediaStream} height={height} />
          ) : null}
        </div>
      </div>
    </>
  );
};

export const LocalVideoTest: React.FC = () => {
  const localMediaStream = useAppSelector((state) => state.localTestMediaStream);
  return (
    <div className="row my-1">
      <div className="col-auto">{localMediaStream !== null && <VideoBox />}</div>
    </div>
  );
};
