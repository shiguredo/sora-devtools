import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/app/slice";
import { RequestRtpStreamBySendConnectionId } from "@/components/Button/RequestRtpStreamBySendConnectionId";
import { ResetRtpStreamBySendConnectionId } from "@/components/Button/ResetRtpStreamBySendConnectionId";
import { ExpansionRTCMediaStreamTrackStats } from "@/utils";

import { ConnectionStatusBar } from "./ConnectionStatusBar";
import { JitterButter } from "./JitterBuffer";
import { Video } from "./Video";
import { VolumeVisualizer } from "./VolumeVisualizer";

function mediaStreamStatsReportFilter(
  statsReport: RTCStats[],
  mediaStream: MediaStream | null
): RTCMediaStreamTrackStats[] {
  if (mediaStream === null) {
    return [];
  }
  const trackIds = mediaStream.getTracks().map((t) => {
    return t.id;
  });
  return statsReport.filter((stats) => {
    if (stats.id && !stats.id.match(/^RTCMediaStreamTrack/)) {
      return false;
    }
    if ("trackIdentifier" in stats) {
      const mediaStreamStats = stats as RTCMediaStreamTrackStats;
      return mediaStreamStats.trackIdentifier && trackIds.includes(mediaStreamStats.trackIdentifier);
    }
    return false;
  });
}

const MediaStreamStatsReport: React.FC<{ stream: MediaStream }> = (props) => {
  const showStats = useSelector((state: SoraDemoState) => state.showStats);
  const statsReport = useSelector((state: SoraDemoState) => state.soraContents.statsReport);
  const prevStatsReport = useSelector((state: SoraDemoState) => state.soraContents.prevStatsReport);
  if (!showStats) {
    return null;
  }
  const currentMediaStreamTrackStatsReport = mediaStreamStatsReportFilter(
    statsReport,
    props.stream
  ) as ExpansionRTCMediaStreamTrackStats[];
  const prevMediaStreamTrackStatsReport = mediaStreamStatsReportFilter(
    prevStatsReport,
    props.stream
  ) as ExpansionRTCMediaStreamTrackStats[];
  return (
    <>
      {currentMediaStreamTrackStatsReport.map((s) => {
        let jitterBufferDelay = 0;
        let jitterBufferEmittedCount = 0;
        const prevStats = prevMediaStreamTrackStatsReport.find((p) => s.id === p.id);
        if (prevStats) {
          jitterBufferDelay = s.jitterBufferDelay - prevStats.jitterBufferDelay;
          jitterBufferEmittedCount = s.jitterBufferEmittedCount - prevStats.jitterBufferEmittedCount;
        }
        return (
          <div key={s.id}>
            <ul className="mediastream-stats-report">
              {Object.entries(s).map(([key, value]) => {
                return (
                  <li key={key}>
                    <strong>{key}:</strong> {value}
                  </li>
                );
              })}
              <li>
                <strong>[jitterBufferDelay/jitterBufferEmittedCount_in_ms]</strong>{" "}
                {Math.floor((jitterBufferDelay / jitterBufferEmittedCount) * 1000)}
              </li>
            </ul>
          </div>
        );
      })}
    </>
  );
};

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
  const focusedSpotlightConnectionIds = useSelector((state: SoraDemoState) => state.focusedSpotlightConnectionIds);
  const focused = props.stream.id && focusedSpotlightConnectionIds[props.stream.id];
  return (
    <div className="col-auto">
      <div className="video-status">
        <ConnectionStatusBar connectionId={props.stream.id} />
        <div className="d-flex align-items-center mb-1 video-status-inner">
          <JitterButter type="audio" stream={props.stream} />
          <JitterButter type="video" stream={props.stream} />
          {!props.spotlight && props.multistream && props.simulcast ? (
            <>
              <RequestRtpStreamBySendConnectionId rid="r0" sendConnectionId={props.stream.id} />
              <RequestRtpStreamBySendConnectionId rid="r1" sendConnectionId={props.stream.id} />
              <RequestRtpStreamBySendConnectionId rid="r2" sendConnectionId={props.stream.id} />
            </>
          ) : null}
          {props.spotlight && props.multistream && props.simulcast ? (
            <>
              <RequestRtpStreamBySendConnectionId rid={"r0"} sendConnectionId={props.stream.id} />
              <RequestRtpStreamBySendConnectionId rid={"r1"} sendConnectionId={props.stream.id} />
              <RequestRtpStreamBySendConnectionId rid={"r2"} sendConnectionId={props.stream.id} />
              <ResetRtpStreamBySendConnectionId sendConnectionId={props.stream.id} />
            </>
          ) : null}
        </div>
      </div>
      <div className="d-flex flex-wrap align-items-start">
        <div className={"d-flex flex-nowrap align-items-start video-wrapper" + (focused ? " spotlight-focused" : "")}>
          <Video
            stream={props.stream}
            setHeight={setHeight}
            mute={mute}
            audioOutput={audioOutput}
            displayResolution={displayResolution}
          />
          <VolumeVisualizer micDevice stream={props.stream} height={height} />
        </div>
        <MediaStreamStatsReport stream={props.stream} />
      </div>
    </div>
  );
};

type RemoteVideosProps = {
  multistream: boolean;
  simulcast: boolean;
  spotlight: boolean;
};
export const RemoteVideos: React.FC<RemoteVideosProps> = (props) => {
  const remoteMediaStreams = useSelector((state: SoraDemoState) => state.soraContents.remoteMediaStreams);
  return (
    <div className="row my-2">
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
