import { useSignal } from '@preact/signals'
import type { FunctionComponent } from 'preact'
import { memo } from 'preact/compat'

import {
  $audioOutput,
  $displayResolution,
  $focusedSpotlightConnectionIds,
  $mediaStats,
  $mute,
  $prevStatsReport,
  $remoteClients,
  $showStats,
  $simulcast,
  $spotlight,
  $statsReport,
} from '@/app/store'
import type { RemoteClient, RTCMediaStreamTrackStats } from '@/types'

import { ConnectionStatusBar } from './ConnectionStatusBar.tsx'
import { JitterButter } from './JitterBuffer.tsx'
import { RemoteVideoCapabilities } from './RemoteVideoCapabilities.tsx'
import { RequestSimulcastRidButton } from './RequestSimulcastRidButton.tsx'
import { RequestSpotlightRidBySendConnectionIdButton } from './RequestSpotlightRidBySendConnectionIdButton.tsx'
import { ResetSpotlightRidBySendConnectionIdButton } from './ResetSpotlightRidBySendConnectionIdButton.tsx'
import { Video } from './Video.tsx'
import { VolumeVisualizer } from './VolumeVisualizer.tsx'

const rtcMediaStreamTrackRegex = /^RTCMediaStreamTrack/

function mediaStreamStatsReportFilter(
  statsReport: RTCStats[],
  mediaStream: MediaStream | null,
): RTCMediaStreamTrackStats[] {
  if (mediaStream === null) {
    return []
  }
  const trackIds = mediaStream.getTracks().map((t) => {
    return t.id
  })
  const result: RTCMediaStreamTrackStats[] = []
  for (const stats of statsReport) {
    if (stats.id && !rtcMediaStreamTrackRegex.test(stats.id)) {
      continue
    }
    if ('trackIdentifier' in stats) {
      const mediaStreamStats = stats as RTCMediaStreamTrackStats
      if (mediaStreamStats.trackIdentifier && trackIds.includes(mediaStreamStats.trackIdentifier)) {
        result.push(mediaStreamStats)
      }
    }
  }
  return result
}

const MediaStreamStatsReport = memo<{ stream: MediaStream }>((props) => {
  if (!$showStats.value) {
    return null
  }
  const currentMediaStreamTrackStatsReport = mediaStreamStatsReportFilter(
    $statsReport.value,
    props.stream,
  ) as RTCMediaStreamTrackStats[]
  const prevMediaStreamTrackStatsReport = mediaStreamStatsReportFilter(
    $prevStatsReport.value,
    props.stream,
  ) as RTCMediaStreamTrackStats[]
  return (
    <>
      {currentMediaStreamTrackStatsReport.map((s) => {
        let jitterBufferDelay = 0
        let jitterBufferEmittedCount = 0
        const prevStats = prevMediaStreamTrackStatsReport.find((p) => s.id === p.id)
        if (prevStats) {
          jitterBufferDelay = s.jitterBufferDelay - prevStats.jitterBufferDelay
          jitterBufferEmittedCount = s.jitterBufferEmittedCount - prevStats.jitterBufferEmittedCount
        }
        return (
          <div key={s.id}>
            <ul className="mediastream-stats-report">
              {Object.entries(s).map(([key, value]) => {
                return (
                  <li key={key}>
                    <strong>{key}:</strong> {value}
                  </li>
                )
              })}
              <li>
                <strong>[jitterBufferDelay/jitterBufferEmittedCount_in_ms]</strong>{' '}
                {Math.floor((jitterBufferDelay / jitterBufferEmittedCount) * 1000)}
              </li>
            </ul>
          </div>
        )
      })}
    </>
  )
})

const RemoteVideo = memo<{ client: RemoteClient }>(({ client }) => {
  const { mediaStream, connectionId, clientId } = client
  const height = useSignal(0)
  const focused = connectionId && $focusedSpotlightConnectionIds.value[connectionId]
  return (
    <div className="flex-none">
      <div className="video-status">
        <div className="flex items-center mb-1 video-status-inner">
          <ConnectionStatusBar connectionId={connectionId} clientId={clientId} />
          <JitterButter type="audio" stream={mediaStream} />
          <JitterButter type="video" stream={mediaStream} />
        </div>
        <div className="flex items-center mb-1 video-status-inner">
          {$spotlight.value !== 'true' && $simulcast.value === 'true' ? (
            <>
              <RequestSimulcastRidButton rid="none" sendConnectionId={connectionId} />
              <RequestSimulcastRidButton rid="r0" sendConnectionId={connectionId} />
              <RequestSimulcastRidButton rid="r1" sendConnectionId={connectionId} />
              <RequestSimulcastRidButton rid="r2" sendConnectionId={connectionId} />
            </>
          ) : null}
          {$spotlight.value === 'true' && $simulcast.value === 'true' ? (
            <>
              <RequestSpotlightRidBySendConnectionIdButton sendConnectionId={connectionId} />
              <ResetSpotlightRidBySendConnectionIdButton sendConnectionId={connectionId} />
            </>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap items-start overflow-y-hidden">
        {/* オーバーレイするため position-relative を付けておくこと */}
        <div
          className={`relative flex flex-nowrap items-start video-wrapper${
            focused ? ' spotlight-focused' : ''
          }`}
        >
          {$mediaStats.value && mediaStream.getVideoTracks().length > 0 && (
            <RemoteVideoCapabilities stream={mediaStream} />
          )}
          <Video
            stream={mediaStream}
            height={height}
            mute={$mute.value}
            audioOutput={$audioOutput.value}
            displayResolution={$displayResolution.value}
          />
          <VolumeVisualizer micDevice={true} stream={mediaStream} height={height} />
        </div>
        <MediaStreamStatsReport stream={mediaStream} />
      </div>
    </div>
  )
})

export const RemoteVideos: FunctionComponent = () => {
  return (
    <div className="flex flex-wrap my-2">
      {$remoteClients.value.map((client) => {
        return <RemoteVideo key={client.connectionId} client={client} />
      })}
    </div>
  )
}
