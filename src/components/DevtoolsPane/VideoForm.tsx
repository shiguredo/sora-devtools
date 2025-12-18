import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setVideo } from '@/app/actions'
import { $connectionStatus, $video } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setVideo(event.currentTarget.checked)
  }
  return (
    <div className="form-inline form-switch">
      <TooltipFormCheck kind="video" checked={$video.value} onChange={onChange} disabled={disabled}>
        video
      </TooltipFormCheck>
    </div>
  )
}
