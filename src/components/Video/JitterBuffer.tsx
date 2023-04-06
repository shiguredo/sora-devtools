import React from "react";

import { useAppSelector } from "@/app/hooks";
import type { RTCInboundRtpStreamStats } from "@/types";

function mediaStreamStatsReportFilter(
  statsReport: RTCStats[],
  mediaStream: MediaStream | null,
  type: "video" | "audio"
): RTCInboundRtpStreamStats | undefined {
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
    if (stats.type !== "inbound-rtp") {
      return false;
    }
    if (!("kind" in stats) || !("trackIdentifier" in stats)) {
      return false;
    }
    const inboundRtpStats = stats as RTCInboundRtpStreamStats;
    if (inboundRtpStats.kind !== type) {
      return false;
    }
    if (!trackIds.includes(inboundRtpStats.trackIdentifier)) {
      return false;
    }
    return true;
  });
  return targetStats as RTCInboundRtpStreamStats;
}

type Props = {
  stream: MediaStream;
  type: "video" | "audio";
};
export const JitterButter: React.FC<Props> = (props) => {
  const statsReport = useAppSelector((state) => state.soraContents.statsReport);
  const prevStatsReport = useAppSelector((state) => state.soraContents.prevStatsReport);
  const currentInboundRtpStreamStatsReport = mediaStreamStatsReportFilter(statsReport, props.stream, props.type);
  const prevInboundRtpStreamStatsReport = mediaStreamStatsReportFilter(prevStatsReport, props.stream, props.type);
  if (currentInboundRtpStreamStatsReport === undefined) {
    return null;
  }
  if (
    currentInboundRtpStreamStatsReport.jitterBufferDelay === undefined ||
    currentInboundRtpStreamStatsReport.jitterBufferEmittedCount === undefined
  ) {
    return null;
  }
  let jitterBufferDelay = currentInboundRtpStreamStatsReport.jitterBufferDelay;
  let jitterBufferEmittedCount = currentInboundRtpStreamStatsReport.jitterBufferEmittedCount;
  if (
    prevInboundRtpStreamStatsReport !== undefined &&
    prevInboundRtpStreamStatsReport.jitterBufferDelay !== undefined &&
    prevInboundRtpStreamStatsReport.jitterBufferEmittedCount !== undefined
  ) {
    jitterBufferDelay =
      currentInboundRtpStreamStatsReport.jitterBufferDelay - prevInboundRtpStreamStatsReport.jitterBufferDelay;
    jitterBufferEmittedCount =
      currentInboundRtpStreamStatsReport.jitterBufferEmittedCount -
      prevInboundRtpStreamStatsReport.jitterBufferEmittedCount;
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
