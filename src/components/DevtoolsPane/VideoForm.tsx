import type React from 'react'

import { setVideo } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoForm: React.FC = () => {
  const video = useSoraDevtoolsStore((state) => state.video)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setVideo(event.target.checked)
  }
  return (
    <div className="flex items-center">
      <TooltipFormCheck kind="video" checked={video} onChange={onChange} disabled={disabled}>
        video
      </TooltipFormCheck>
    </div>
  )
}
