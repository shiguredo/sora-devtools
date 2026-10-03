import { prevStatsReport, statsReport } from "@/app/signals";
import type { RTCInboundRtpStreamStats } from "@/types";

import styles from "./JitterBuffer.module.css";

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
  // ポーリング間隔の間に新規パケットが到着しなかった場合 (差分が 0)、
  // または受信開始直後で累計パケット数が 0 の場合はゼロ除算で NaN になるため描画しない
  if (jitterBufferEmittedCount === 0) {
    return null;
  }
  const currentJitterBufferDelay = Math.floor(
    (jitterBufferDelay / jitterBufferEmittedCount) * 1000,
  );
  // jitter buffer の遅延値バッジに使うスタイル
  const baseClassName = styles.base;
  let statusClassName = styles.normal;
  if (currentJitterBufferDelay > 500) {
    statusClassName = styles.danger;
  } else if (currentJitterBufferDelay > 300) {
    statusClassName = styles.warning;
  } else if (currentJitterBufferDelay > 100) {
    statusClassName = styles.caution;
  }
  return (
    <div className={`${baseClassName} ${statusClassName}`}>
      <span>
        {props.type}: {currentJitterBufferDelay}
      </span>
    </div>
  );
}
