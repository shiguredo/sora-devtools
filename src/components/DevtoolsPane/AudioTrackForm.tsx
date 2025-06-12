import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setAudioTrack } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const AudioTrackForm: React.FC = () => {
  const audioTrack = useSoraDevtoolsStore((state) => state.audioTrack)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setAudioTrack(event.target.checked)
  }
  return (
    <FormGroup className="form-inline" controlId="audioTrack">
      <TooltipFormCheck kind="audioTrack" checked={audioTrack} onChange={onChange} disabled={false}>
        Enable audio track
      </TooltipFormCheck>
    </FormGroup>
  )
}
