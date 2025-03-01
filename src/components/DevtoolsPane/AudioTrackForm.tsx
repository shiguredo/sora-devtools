import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { useStore } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const AudioTrackForm: React.FC = () => {
  const audioTrack = useStore((state) => state.audioTrack)
  const setAudioTrack = useStore((state) => state.setAudioTrack)
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
