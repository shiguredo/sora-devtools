import type React from 'react'

import { $statsReport, $prevStatsReport } from '@/app/store'
import type { RTCInboundRtpStreamStats } from '@/types'

function mediaStreamStatsReportFilter(
  statsReport: RTCStats[],
  mediaStream: MediaStream | null,
  type: 'video' | 'audio',
): RTCInboundRtpStreamStats | undefined {
  if (mediaStream === null) {
    return undefined
  }
  let trackIds: string[] = []
  if (type === 'video') {
    trackIds = mediaStream.getVideoTracks().map((t) => {
      return t.id
    })
  } else if (type === 'audio') {
    trackIds = mediaStream.getAudioTracks().map((t) => {
      return t.id
    })
  }
  const targetStats = statsReport.find((stats) => {
    if (stats.type !== 'inbound-rtp') {
      return false
    }
    if (!('kind' in stats) || !('trackIdentifier' in stats)) {
      return false
    }
    const inboundRtpStats = stats as RTCInboundRtpStreamStats
    if (inboundRtpStats.kind !== type) {
      return false
    }
    if (!trackIds.includes(inboundRtpStats.trackIdentifier)) {
      return false
    }
    return true
  })
  return targetStats as RTCInboundRtpStreamStats
}

type Props = {
  stream: MediaStream
  type: 'video' | 'audio'
}
export const JitterButter: React.FC<Props> = (props) => {
  const currentInboundRtpStreamStatsReport = mediaStreamStatsReportFilter(
    $statsReport.value,
    props.stream,
    props.type,
  )
  const prevInboundRtpStreamStatsReport = mediaStreamStatsReportFilter(
    $prevStatsReport.value,
    props.stream,
    props.type,
  )
  if (currentInboundRtpStreamStatsReport === undefined) {
    return null
  }
  if (
    currentInboundRtpStreamStatsReport.jitterBufferDelay === undefined ||
    currentInboundRtpStreamStatsReport.jitterBufferEmittedCount === undefined
  ) {
    return null
  }
  let jitterBufferDelay = currentInboundRtpStreamStatsReport.jitterBufferDelay
  let jitterBufferEmittedCount = currentInboundRtpStreamStatsReport.jitterBufferEmittedCount
  if (
    prevInboundRtpStreamStatsReport !== undefined &&
    prevInboundRtpStreamStatsReport.jitterBufferDelay !== undefined &&
    prevInboundRtpStreamStatsReport.jitterBufferEmittedCount !== undefined
  ) {
    jitterBufferDelay =
      currentInboundRtpStreamStatsReport.jitterBufferDelay -
      prevInboundRtpStreamStatsReport.jitterBufferDelay
    jitterBufferEmittedCount =
      currentInboundRtpStreamStatsReport.jitterBufferEmittedCount -
      prevInboundRtpStreamStatsReport.jitterBufferEmittedCount
  }
  const currentJitterBufferDelay = Math.floor((jitterBufferDelay / jitterBufferEmittedCount) * 1000)
  let borderClassName = 'normal-jitter-buffer'
  if (currentJitterBufferDelay > 500) {
    borderClassName = 'critical-jitter-buffer'
  } else if (currentJitterBufferDelay > 300) {
    borderClassName = 'danger-jitter-buffer'
  } else if (currentJitterBufferDelay > 100) {
    borderClassName = 'warning-jitter-buffer'
  }
  return (
    <div className={`btn btn-sm mx-1 ${borderClassName}`}>
      <span>
        {props.type}: {currentJitterBufferDelay}
      </span>
    </div>
  )
}
