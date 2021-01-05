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
  // 映像のサイズが小さすぎる場合にサイズを固定するためのハック
  const [videoWidth, setVideoWidth] = useState<number>(videoSize.width);
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height);
        if (entry.contentRect.width < 10) {
          setVideoWidth(300);
        } else {
          setVideoWidth(0);
        }
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
      if (mute) {
        videoRef.current.muted = true;
      }
      // Chrome で first video frame まで音声が出力されない現象のワークアラウンド
      // 一旦 video tracks を disabled にしておき、 loadedmetadata イベントで有効にする
      // c.f. https://bugs.chromium.org/p/chromium/issues/detail?id=403710
      stream.getVideoTracks().forEach((track) => {
        track.enabled = false;
      });
      videoRef.current.onloadedmetadata = (_) => {
        stream.getVideoTracks().forEach((track) => {
          track.enabled = true;
        });
        if (videoRef.current && (videoRef.current.offsetWidth < 10 || videoRef.current.offsetHeight < 10)) {
          setVideoWidth(300);
        }
      };
      videoRef.current.srcObject = stream;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);
  if (audioOutput && videoRef.current?.setSinkId && stream && stream.getAudioTracks().length > 0) {
    videoRef.current.setSinkId(audioOutput);
  }
  return (
    <video
      autoPlay
      playsInline
      controls
      ref={videoRef}
      width={0 < videoWidth ? videoWidth : undefined}
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
  useEffect(() => {
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [height, setHeight] = useState<number>(0);
  const audioOutput = useSelector((state: SoraDemoState) => state.audioOutput);
  const displayResolution = useSelector((state: SoraDemoState) => state.displayResolution);
  const mute = useSelector((state: SoraDemoState) => state.mute);
  const spotlightConnectionIds = useSelector((state: SoraDemoState) => state.spotlightConnectionIds);
  const focusedSpotlightConnectionIds = useSelector((state: SoraDemoState) => state.focusedSpotlightConnectionIds);
  const focused = props.stream.id && focusedSpotlightConnectionIds.includes(props.stream.id);
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
          <ConnectionStatusBar connectionId={props.stream.id} />
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
      <div className={"d-flex align-items-start" + (focused ? " spotlight-focused" : "")}>
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
  const remoteMediaStreams = useSelector((state: SoraDemoState) => state.soraContents.remoteMediaStreams);
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
