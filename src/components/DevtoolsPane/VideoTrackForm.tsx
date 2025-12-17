import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setVideoTrack } from '@/app/actions'
import { $videoTrack } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoTrackForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setVideoTrack(event.target.checked)
  }
  return (
    <FormGroup className="form-inline" controlId="videoTrack">
      <TooltipFormCheck
        kind="videoTrack"
        checked={$videoTrack.value}
        onChange={onChange}
        disabled={false}
      >
        Enable video track
      </TooltipFormCheck>
    </FormGroup>
  )
}
