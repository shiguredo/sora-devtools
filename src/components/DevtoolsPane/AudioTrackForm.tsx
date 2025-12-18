import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setAudioTrack } from '@/app/actions'
import { $audioTrack } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const AudioTrackForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setAudioTrack(event.currentTarget.checked)
  }
  return (
    <div className="form-inline form-switch">
      <TooltipFormCheck
        kind="audioTrack"
        checked={$audioTrack.value}
        onChange={onChange}
        disabled={false}
      >
        Enable audio track
      </TooltipFormCheck>
    </div>
  )
}
