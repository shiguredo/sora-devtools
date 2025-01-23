import { useStore } from '@/app/store2'
import { isFormDisabled } from '@/utils'
import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const AudioForm: React.FC = () => {
  const audio = useStore((state) => state.audio)
  const setAudio = useStore((state) => state.setAudio)
  const connectionStatus = useStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setAudio(event.target.checked)
  }
  return (
    <FormGroup className="form-inline" controlId="audio">
      <TooltipFormCheck kind="audio" checked={audio} onChange={onChange} disabled={disabled}>
        audio
      </TooltipFormCheck>
    </FormGroup>
  )
}
