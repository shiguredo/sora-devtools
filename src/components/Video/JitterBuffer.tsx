import React from "react";

import { useAppSelector } from "@/app/hooks";
import type { RTCMediaStreamTrackStats } from "@/types";

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
  const targetStats = statsReport.find((stats) => {
    if (stats.id && !stats.id.match(/^RTCMediaStreamTrack/)) {
      return false;
    }
    if ("trackIdentifier" in stats) {
      const mediaStreamStats = stats as RTCMediaStreamTrackStats;
      return mediaStreamStats.trackIdentifier && trackIds.includes(mediaStreamStats.trackIdentifier);
    }
    return false;
  });
  return targetStats as RTCMediaStreamTrackStats;
}

type Props = {
  stream: MediaStream;
  type: "video" | "audio";
};
export const JitterButter: React.FC<Props> = (props) => {
  const statsReport = useAppSelector((state) => state.soraContents.statsReport);
  const prevStatsReport = useAppSelector((state) => state.soraContents.prevStatsReport);
  const currentMediaStreamTrackStatsReport = mediaStreamStatsReportFilter(
    statsReport,
    props.stream,
    props.type
  ) as RTCMediaStreamTrackStats;
  const prevMediaStreamTrackStatsReport = mediaStreamStatsReportFilter(
    prevStatsReport,
    props.stream,
    props.type
  ) as RTCMediaStreamTrackStats;
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
