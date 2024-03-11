import type React from 'react'
import { useState } from 'react'

import { useAppSelector } from '@/app/hooks'

import { TooltipFormLabel } from '../DevtoolsPane/TooltipFormLabel'
import { ConnectionStatusBar } from './ConnectionStatusBar'
import { RequestRtpStreamButton } from './RequestRtpStreamButton'
import { RequestSpotlightRidButton } from './RequestSpotlightRidButton'
import { ResetRtpStreamButton } from './ResetRtpStreamButton'
import { ResetSpotlightRidButton } from './ResetSpotlightRidButton'
import { SessionStatusBar } from './SessionStatusBar'
import { Video } from './Video'
import { VolumeVisualizer } from './VolumeVisualizer'

const VideoBox: React.FC = () => {
  const [height, setHeight] = useState<number>(0)
  const audio = useAppSelector((state) => state.audio)
  const video = useAppSelector((state) => state.video)
  const audioOutput = useAppSelector((state) => state.audioOutput)
  const displayResolution = useAppSelector((state) => state.displayResolution)
  const focusedSpotlightConnectionIds = useAppSelector(
    (state) => state.focusedSpotlightConnectionIds,
  )
  const connectionId = useAppSelector((state) => state.soraContents.connectionId)
  const localMediaStream = useAppSelector((state) => state.soraContents.localMediaStream)
  const micDevice = useAppSelector((state) => state.micDevice)
  const focused = connectionId && focusedSpotlightConnectionIds[connectionId]
  if (audio === false && video === false) {
    return null
  }
  return (
    <>
      <div className="d-flex">
        <div
          className={`d-flex·flex-nowrap·align-items-start·video-wrapper${
            focused ? '·spotlight-focused' : ''
          }`}
        >
          <Video
            stream={localMediaStream}
            setHeight={setHeight}
            audioOutput={audioOutput}
            displayResolution={displayResolution}
            localVideo
            mute
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
  const connectionId = useAppSelector((state) => state.soraContents.connectionId)
  const clientId = useAppSelector((state) => state.soraContents.clientId)
  const sessionId = useAppSelector((state) => state.soraContents.sessionId)
  const simulcast = useAppSelector((state) => state.simulcast)
  const spotlight = useAppSelector((state) => state.spotlight)
  const role = useAppSelector((state) => state.role)
  const localMediaStream = useAppSelector((state) => state.soraContents.localMediaStream)
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
              <ConnectionStatusBar connectionId={connectionId} clientId={clientId} localVideo />
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
