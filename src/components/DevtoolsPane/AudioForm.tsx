import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { useAppSelector } from '@/app/hooks'
import { useStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const AudioForm: React.FC = () => {
  const { audio, setAudio } = useStore()
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
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
