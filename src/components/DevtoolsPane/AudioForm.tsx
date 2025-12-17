import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setAudio } from '@/app/actions'
import { $audio, $connectionStatus } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const AudioForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setAudio(event.target.checked)
  }
  return (
    <FormGroup className="form-inline" controlId="audio">
      <TooltipFormCheck kind="audio" checked={$audio.value} onChange={onChange} disabled={disabled}>
        audio
      </TooltipFormCheck>
    </FormGroup>
  )
}
