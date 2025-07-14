import type React from 'react'
import { useState } from 'react'

import { useSoraDevtoolsStore } from '@/app/store'

import { TooltipFormLabel } from '../DevtoolsPane/TooltipFormLabel.tsx'
import { ConnectionStatusBar } from './ConnectionStatusBar.tsx'
import { LocalVideoCapabilities } from './LocalVideoCapabilities.tsx'
import { RequestRtpStreamButton } from './RequestRtpStreamButton.tsx'
import { RequestSpotlightRidButton } from './RequestSpotlightRidButton.tsx'
import { ResetRtpStreamButton } from './ResetRtpStreamButton.tsx'
import { ResetSpotlightRidButton } from './ResetSpotlightRidButton.tsx'
import { SessionStatusBar } from './SessionStatusBar.tsx'
import { Video } from './Video.tsx'
import { VolumeVisualizer } from './VolumeVisualizer.tsx'

const VideoBox: React.FC = () => {
  const [height, setHeight] = useState<number>(0)
  const audio = useSoraDevtoolsStore((state) => state.audio)
  const video = useSoraDevtoolsStore((state) => state.video)
  const audioOutput = useSoraDevtoolsStore((state) => state.audioOutput)
  const displayResolution = useSoraDevtoolsStore((state) => state.displayResolution)
  const focusedSpotlightConnectionIds = useSoraDevtoolsStore(
    (state) => state.focusedSpotlightConnectionIds,
  )
  const connectionId = useSoraDevtoolsStore((state) => state.soraContents.connectionId)
  const localMediaStream = useSoraDevtoolsStore((state) => state.soraContents.localMediaStream)
  const micDevice = useSoraDevtoolsStore((state) => state.micDevice)
  const focused = connectionId && focusedSpotlightConnectionIds[connectionId]
  const mediaStats = useSoraDevtoolsStore((state) => state.mediaStats)
  if (audio === false && video === false) {
    return null
  }
  return (
    <>
      <div className="d-flex">
        <div
          className={`position-relative d-flex flex-nowrap align-items-start video-wrapper overflow-y-hidden${
            focused ? ' spotlight-focused' : ''
          }`}
        >
          {mediaStats && localMediaStream && localMediaStream.getVideoTracks().length > 0 && (
            <LocalVideoCapabilities stream={localMediaStream} />
          )}
          <Video
            stream={localMediaStream}
            setHeight={setHeight}
            audioOutput={audioOutput}
            displayResolution={displayResolution}
            localVideo={true}
            mute={true}
          />
          {localMediaStream !== null ? (
            <VolumeVisualizer micDevice={micDevice} stream={localMediaStream} height={height} />
          ) : null}
        </div>
      </div>
    </>
  )
}

export const LocalVideo: React.FC = () => {
  const connectionId = useSoraDevtoolsStore((state) => state.soraContents.connectionId)
  const clientId = useSoraDevtoolsStore((state) => state.soraContents.clientId)
  const sessionId = useSoraDevtoolsStore((state) => state.soraContents.sessionId)
  const simulcast = useSoraDevtoolsStore((state) => state.simulcast)
  const spotlight = useSoraDevtoolsStore((state) => state.spotlight)
  const role = useSoraDevtoolsStore((state) => state.role)
  const localMediaStream = useSoraDevtoolsStore((state) => state.soraContents.localMediaStream)
  return (
    <div className="row my-1">
      <div className="col-auto">
        <div className="video-status mb-1">
          {sessionId !== null ? (
            <div className="d-flex align-items-center mb-1 video-status-inner">
              <SessionStatusBar sessionId={sessionId} />
            </div>
          ) : null}
          {connectionId !== null || clientId !== null ? (
            <div className="d-flex align-items-center mb-1 video-status-inner">
              <ConnectionStatusBar
                connectionId={connectionId}
                clientId={clientId}
                localVideo={true}
              />
            </div>
          ) : null}
          {connectionId !== null &&
          spotlight !== 'true' &&
          simulcast === 'true' &&
          role !== 'sendonly' ? (
            <div className="d-flex align-items-center mb-1 video-status-inner">
              <TooltipFormLabel kind="changeAllRecvStream">change all:</TooltipFormLabel>
              <RequestRtpStreamButton rid={'r0'} />
              <RequestRtpStreamButton rid={'r1'} />
              <RequestRtpStreamButton rid={'r2'} />
              <ResetRtpStreamButton />
            </div>
          ) : null}
          {connectionId !== null && spotlight === 'true' ? (
            <div className="d-flex align-items-center mb-1 video-status-inner">
              <RequestSpotlightRidButton />
              <ResetSpotlightRidButton />
            </div>
          ) : null}
        </div>
        {localMediaStream !== null && role !== 'recvonly' ? <VideoBox /> : null}
      </div>
    </div>
  )
}
