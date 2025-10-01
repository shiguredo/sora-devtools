import type React from 'react'

import { setVideoTrack } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoTrackForm: React.FC = () => {
  const videoTrack = useSoraDevtoolsStore((state) => state.videoTrack)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setVideoTrack(event.target.checked)
  }
  return (
    <div className="flex items-center">
      <TooltipFormCheck kind="videoTrack" checked={videoTrack} onChange={onChange} disabled={false}>
        Enable video track
      </TooltipFormCheck>
    </div>
  )
}
