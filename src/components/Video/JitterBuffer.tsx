import React from "react";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/slice";
import { ExpansionRTCMediaStreamTrackStats } from "@/utils";

function mediaStreamStatsReportFilter(
  statsReport: RTCStats[],
  mediaStream: MediaStream | null,
  type: "video" | "audio"
): RTCMediaStreamTrackStats | undefined {
  if (mediaStream === null) {
    return undefined;
  }
  let trackIds: string[] = [];
  if (type === "video") {
    trackIds = mediaStream.getVideoTracks().map((t) => {
      return t.id;
    });
  } else if (type === "audio") {
    trackIds = mediaStream.getAudioTracks().map((t) => {
      return t.id;
    });
  }
  return statsReport.find((stats) => {
    if (!stats.id.match(/^RTCMediaStreamTrack/)) {
      return false;
    }
    if ("trackIdentifier" in stats) {
      const mediaStreamStats = stats as RTCMediaStreamTrackStats;
      return mediaStreamStats.trackIdentifier && trackIds.includes(mediaStreamStats.trackIdentifier);
    }
    return false;
  });
}

type Props = {
  stream: MediaStream;
  type: "video" | "audio";
};
const JitterButter: React.FC<Props> = (props) => {
  const statsReport = useSelector((state: SoraDemoState) => state.soraContents.statsReport);
  const prevStatsReport = useSelector((state: SoraDemoState) => state.soraContents.prevStatsReport);
  const currentMediaStreamTrackStatsReport = mediaStreamStatsReportFilter(
    statsReport,
    props.stream,
    props.type
  ) as ExpansionRTCMediaStreamTrackStats;
  const prevMediaStreamTrackStatsReport = mediaStreamStatsReportFilter(
    prevStatsReport,
    props.stream,
    props.type
  ) as ExpansionRTCMediaStreamTrackStats;
  if (!currentMediaStreamTrackStatsReport) {
    return null;
  }
  let jitterBufferDelay = currentMediaStreamTrackStatsReport.jitterBufferDelay;
  let jitterBufferEmittedCount = currentMediaStreamTrackStatsReport.jitterBufferEmittedCount;
  if (prevMediaStreamTrackStatsReport) {
    jitterBufferDelay =
      currentMediaStreamTrackStatsReport.jitterBufferDelay - prevMediaStreamTrackStatsReport.jitterBufferDelay;
    jitterBufferEmittedCount =
      currentMediaStreamTrackStatsReport.jitterBufferEmittedCount -
      prevMediaStreamTrackStatsReport.jitterBufferEmittedCount;
  }
  const currentJitterBufferDelay = Math.floor((jitterBufferDelay / jitterBufferEmittedCount) * 1000);
  let borderClassName = "normal-jitter-buffer";
  if (500 < currentJitterBufferDelay) {
    borderClassName = "critical-jitter-buffer";
  } else if (300 < currentJitterBufferDelay) {
    borderClassName = "danger-jitter-buffer";
  } else if (100 < currentJitterBufferDelay) {
    borderClassName = "warning-jitter-buffer";
  }
  return (
    <div className={`btn btn-sm mx-1 ${borderClassName}`}>
      <span>
        {props.type}: {currentJitterBufferDelay}
      </span>
    </div>
  );
};

export default JitterButter;
