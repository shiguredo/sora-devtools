import { prevStatsReport, statsReport } from "@/app/signals";
import type { RTCInboundRtpStreamStats } from "@/types";

function mediaStreamStatsReportFilter(
  statsReport: RTCStats[],
  mediaStream: MediaStream | null,
  type: "video" | "audio",
): RTCInboundRtpStreamStats | undefined {
  if (mediaStream === null) {
    return undefined;
  }
  // type が "video" 以外の場合の意図を明確にするため if/else を使用する
  let trackIds: string[];
  if (type === "video") {
    trackIds = mediaStream.getVideoTracks().map((t) => t.id);
  } else {
    trackIds = mediaStream.getAudioTracks().map((t) => t.id);
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

interface Props {
  stream: MediaStream;
  type: "video" | "audio";
}
export function JitterButter(props: Props) {
  const currentInboundRtpStreamStatsReport = mediaStreamStatsReportFilter(
    statsReport.value,
    props.stream,
    props.type,
  );
  const prevInboundRtpStreamStatsReport = mediaStreamStatsReportFilter(
    prevStatsReport.value,
    props.stream,
    props.type,
  );
  if (currentInboundRtpStreamStatsReport === undefined) {
    return null;
  }
  if (
    currentInboundRtpStreamStatsReport.jitterBufferDelay === undefined ||
    currentInboundRtpStreamStatsReport.jitterBufferEmittedCount === undefined
  ) {
    return null;
  }
  let { jitterBufferDelay } = currentInboundRtpStreamStatsReport;
  let { jitterBufferEmittedCount } = currentInboundRtpStreamStatsReport;
  if (
    prevInboundRtpStreamStatsReport?.jitterBufferDelay !== undefined &&
    prevInboundRtpStreamStatsReport.jitterBufferEmittedCount !== undefined
  ) {
    jitterBufferDelay =
      currentInboundRtpStreamStatsReport.jitterBufferDelay -
      prevInboundRtpStreamStatsReport.jitterBufferDelay;
    jitterBufferEmittedCount =
      currentInboundRtpStreamStatsReport.jitterBufferEmittedCount -
      prevInboundRtpStreamStatsReport.jitterBufferEmittedCount;
  }
  const currentJitterBufferDelay = Math.floor(
    (jitterBufferDelay / jitterBufferEmittedCount) * 1000,
  );
  // Tailwind classes for jitter buffer status
  const baseClasses = `
    inline-block font-normal leading-normal text-center
    px-2 py-1 text-sm rounded-md mx-1
    min-w-[90px] border-2 cursor-default
  `;
  let statusClasses = "border-bs-dark";
  if (currentJitterBufferDelay > 500) {
    statusClasses = "border-bs-red bg-bs-red text-bs-light";
  } else if (currentJitterBufferDelay > 300) {
    statusClasses = "border-bs-orange bg-bs-orange text-bs-light";
  } else if (currentJitterBufferDelay > 100) {
    statusClasses = "border-bs-yellow";
  }
  return (
    <div className={`${baseClasses} ${statusClasses}`}>
      <span>
        {props.type}: {currentJitterBufferDelay}
      </span>
    </div>
  );
}
