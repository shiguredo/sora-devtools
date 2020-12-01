import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import ButtonRequestRtpStreamBySendConnectionId from "@/components/Button/RequestRtpStreamBySendConnectionId";
import ButtonResetRtpStreamBySendConnectionId from "@/components/Button/ResetRtpStreamBySendConnectionId";
import ConnectionStatusBar from "@/components/ConnectionStatusBar";
import { SoraDemoState } from "@/slice";
import { CustomHTMLVideoElement, getVideoSizeByResolution } from "@/utils";

import VolumeVisualizer from "./VolumeVisualizer";

type VideoElementProps = {
  stream: MediaStream;
  setHeight: Dispatch<SetStateAction<number>>;
  mute: boolean;
  audioOutput: string;
  displayResolution: SoraDemoState["displayResolution"];
};
const VideoElement: React.FC<VideoElementProps> = (props) => {
  const { stream, setHeight, mute, audioOutput, displayResolution } = props;
  const videoRef = useRef<CustomHTMLVideoElement>(null);
  const videoSize = getVideoSizeByResolution(displayResolution);
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });
    if (videoRef.current) {
      if (mute) {
        videoRef.current.muted = true;
      }
      videoRef.current.srcObject = stream;
      resizeObserver.observe(videoRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (audioOutput && videoRef.current?.setSinkId && stream && stream.getAudioTracks().length > 0) {
    videoRef.current.setSinkId(audioOutput);
  }
  return (
    <video
      autoPlay
      playsInline
      controls
      ref={videoRef}
      width={0 < videoSize.width ? videoSize.width : undefined}
      height={0 < videoSize.height ? videoSize.height : undefined}
    />
  );
};

const VideoElementMemo = React.memo((props: VideoElementProps) => {
  return <VideoElement {...props} />;
});

type RemoteVideoProps = {
  stream: MediaStream;
  multistream: boolean;
  simulcast: boolean;
  spotlight: boolean;
};
const RemoteVideo: React.FC<RemoteVideoProps> = (props) => {
  const [height, setHeight] = useState<number>(0);
  const { audioOutput, displayResolution, mute, spotlightConnectionIds } = useSelector((state: SoraDemoState) => state);
  return (
    <div className="col-auto">
      <div className="video-status mb-1">
        {/** spotlight legacy の場合とそれ以外で表示方法を変える **/}
        {props.stream.id in spotlightConnectionIds ? (
          <ConnectionStatusBar
            connectionId={spotlightConnectionIds[props.stream.id]}
            clientId={null}
            spotlightId={props.stream.id}
          />
        ) : (
          <ConnectionStatusBar connectionId={spotlightConnectionIds[props.stream.id]} />
        )}
        {!props.spotlight && props.multistream && props.simulcast ? (
          <>
            <ButtonRequestRtpStreamBySendConnectionId rid="r0" sendConnectionId={props.stream.id} />
            <ButtonRequestRtpStreamBySendConnectionId rid="r1" sendConnectionId={props.stream.id} />
            <ButtonRequestRtpStreamBySendConnectionId rid="r2" sendConnectionId={props.stream.id} />
          </>
        ) : null}
        {props.spotlight && props.multistream && props.simulcast ? (
          <>
            <ButtonRequestRtpStreamBySendConnectionId rid={"r0"} sendConnectionId={props.stream.id} />
            <ButtonRequestRtpStreamBySendConnectionId rid={"r1"} sendConnectionId={props.stream.id} />
            <ButtonRequestRtpStreamBySendConnectionId rid={"r2"} sendConnectionId={props.stream.id} />
            <ButtonResetRtpStreamBySendConnectionId sendConnectionId={props.stream.id} />
          </>
        ) : null}
      </div>
      <div className="d-flex align-items-start">
        <VideoElementMemo
          stream={props.stream}
          setHeight={setHeight}
          mute={mute}
          audioOutput={audioOutput}
          displayResolution={displayResolution}
        />
        <VolumeVisualizer stream={props.stream} height={height} />
      </div>
    </div>
  );
};

type RemoteVideosProps = {
  multistream: boolean;
  simulcast: boolean;
  spotlight: boolean;
};
const RemoteVideos: React.FC<RemoteVideosProps> = (props) => {
  const { soraContents } = useSelector((state: SoraDemoState) => state);
  const { remoteMediaStreams } = soraContents;
  return (
    <div className="row mt-2">
      {remoteMediaStreams.map((mediaStream) => {
        return (
          <RemoteVideo
            key={mediaStream.id}
            stream={mediaStream}
            multistream={props.multistream}
            simulcast={props.simulcast}
            spotlight={props.spotlight}
          />
        );
      })}
    </div>
  );
};

export default RemoteVideos;
