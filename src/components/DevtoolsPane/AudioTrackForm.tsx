import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setAudioTrack } from '@/app/actions'
import { $audioTrack } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const AudioTrackForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setAudioTrack(event.target.checked)
  }
  return (
    <FormGroup className="form-inline" controlId="audioTrack">
      <TooltipFormCheck
        kind="audioTrack"
        checked={$audioTrack.value}
        onChange={onChange}
        disabled={false}
      >
        Enable audio track
      </TooltipFormCheck>
    </FormGroup>
  )
}
