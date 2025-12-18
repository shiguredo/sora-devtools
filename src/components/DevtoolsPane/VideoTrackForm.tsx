import type { FunctionComponent } from 'preact'

import { setVideoTrack } from '@/app/actions'
import { $videoTrack } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoTrackForm: FunctionComponent = () => {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement
    setVideoTrack(target.checked)
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
