import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setAudio } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const AudioForm: React.FC = () => {
  const audio = useSoraDevtoolsStore((state) => state.audio)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
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
