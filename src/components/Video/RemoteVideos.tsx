import type React from 'react'
import { useState } from 'react'

import { useAppSelector } from '@/app/hooks'
import type { RTCMediaStreamTrackStats, RemoteClient } from '@/types'

import { ConnectionStatusBar } from './ConnectionStatusBar.tsx'
import { JitterButter } from './JitterBuffer.tsx'
import { RemoteVideoCapabilities } from './RemoteVideoCapabilities.tsx'
import { RequestRtpStreamBySendConnectionIdButton } from './RequestRtpStreamBySendConnectionIdButton.tsx'
import { RequestSpotlightRidBySendConnectionIdButton } from './RequestSpotlightRidBySendConnectionIdButton.tsx'
import { ResetRtpStreamBySendConnectionIdButton } from './ResetRtpStreamBySendConnectionIdButton.tsx'
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

const MediaStreamStatsReport: React.FC<{ stream: MediaStream }> = (props) => {
  const showStats = useAppSelector((state) => state.showStats)
  const statsReport = useAppSelector((state) => state.soraContents.statsReport)
  const prevStatsReport = useAppSelector((state) => state.soraContents.prevStatsReport)
  if (!showStats) {
    return null
  }
  const currentMediaStreamTrackStatsReport = mediaStreamStatsReportFilter(
    statsReport,
    props.stream,
  ) as RTCMediaStreamTrackStats[]
  const prevMediaStreamTrackStatsReport = mediaStreamStatsReportFilter(
    prevStatsReport,
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
}

const RemoteVideo: React.FC<{ client: RemoteClient }> = ({ client }) => {
  const { mediaStream, connectionId, clientId } = client
  const [height, setHeight] = useState<number>(0)
  const audioOutput = useAppSelector((state) => state.audioOutput)
  const displayResolution = useAppSelector((state) => state.displayResolution)
  const focusedSpotlightConnectionIds = useAppSelector(
    (state) => state.focusedSpotlightConnectionIds,
  )
  const multistream = useAppSelector((state) => state.multistream)
  const mute = useAppSelector((state) => state.mute)
  const simulcast = useAppSelector((state) => state.simulcast)
  const spotlight = useAppSelector((state) => state.spotlight)
  const focused = connectionId && focusedSpotlightConnectionIds[connectionId]
  const mediaStats = useAppSelector((state) => state.mediaStats)
  return (
    <div className="col-auto">
      <div className="video-status">
        <div className="d-flex align-items-center mb-1 video-status-inner">
          <ConnectionStatusBar connectionId={connectionId} clientId={clientId} />
          <JitterButter type="audio" stream={mediaStream} />
          <JitterButter type="video" stream={mediaStream} />
        </div>
        <div className="d-flex align-items-center mb-1 video-status-inner">
          {spotlight !== 'true' && multistream === 'true' && simulcast === 'true' ? (
            <>
              <RequestRtpStreamBySendConnectionIdButton rid="r0" sendConnectionId={connectionId} />
              <RequestRtpStreamBySendConnectionIdButton rid="r1" sendConnectionId={connectionId} />
              <RequestRtpStreamBySendConnectionIdButton rid="r2" sendConnectionId={connectionId} />
              <ResetRtpStreamBySendConnectionIdButton sendConnectionId={connectionId} />
            </>
          ) : null}
          {spotlight === 'true' && multistream === 'true' && simulcast === 'true' ? (
            <>
              <RequestSpotlightRidBySendConnectionIdButton sendConnectionId={connectionId} />
              <ResetSpotlightRidBySendConnectionIdButton sendConnectionId={connectionId} />
            </>
          ) : null}
        </div>
      </div>
      <div className="d-flex flex-wrap align-items-start overflow-y-hidden">
        {/* オーバーレイするため position-relative を付けておくこと */}
        <div
          className={`position-relative d-flex flex-nowrap align-items-start video-wrapper${
            focused ? ' spotlight-focused' : ''
          }`}
        >
          {mediaStats && mediaStream.getVideoTracks().length > 0 && (
            <RemoteVideoCapabilities stream={mediaStream} />
          )}
          <Video
            stream={mediaStream}
            setHeight={setHeight}
            mute={mute}
            audioOutput={audioOutput}
            displayResolution={displayResolution}
          />
          <VolumeVisualizer micDevice={true} stream={mediaStream} height={height} />
        </div>
        <MediaStreamStatsReport stream={mediaStream} />
      </div>
    </div>
  )
}

export const RemoteVideos: React.FC = () => {
  const remoteClients = useAppSelector((state) => state.soraContents.remoteClients)
  return (
    <div className="row my-2">
      {remoteClients.map((client) => {
        return <RemoteVideo key={client.connectionId} client={client} />
      })}
    </div>
  )
}
