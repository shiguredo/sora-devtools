import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setVideoTrack } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoTrackForm: React.FC = () => {
  const videoTrack = useSoraDevtoolsStore((state) => state.videoTrack)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setVideoTrack(event.target.checked)
  }
  return (
    <FormGroup className="form-inline" controlId="videoTrack">
      <TooltipFormCheck kind="videoTrack" checked={videoTrack} onChange={onChange} disabled={false}>
        Enable video track
      </TooltipFormCheck>
    </FormGroup>
  )
}
