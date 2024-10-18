import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setAudio } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const AudioForm: React.FC = () => {
  const audio = useAppSelector((state) => state.audio)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setAudio(event.target.checked))
  }
  return (
    <FormGroup className="form-inline" controlId="audio">
      <TooltipFormCheck kind="audio" checked={audio} onChange={onChange} disabled={disabled}>
        audio
      </TooltipFormCheck>
    </FormGroup>
  )
}
