import type React from 'react'

import { setVideoTrack } from '@/app/actions'
import { $videoTrack } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoTrackForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setVideoTrack(event.target.checked)
  }
  return (
    <div className="form-inline form-switch">
      <TooltipFormCheck
        kind="videoTrack"
        checked={$videoTrack.value}
        onChange={onChange}
        disabled={false}
      >
        Enable video track
      </TooltipFormCheck>
    </div>
  )
}
