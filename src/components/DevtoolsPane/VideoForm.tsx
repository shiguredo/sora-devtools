import type React from 'react'

import { setVideo } from '@/app/actions'
import { $video, $connectionStatus } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setVideo(event.target.checked)
  }
  return (
    <div className="form-inline">
      <TooltipFormCheck kind="video" checked={$video.value} onChange={onChange} disabled={disabled}>
        video
      </TooltipFormCheck>
    </div>
  )
}
