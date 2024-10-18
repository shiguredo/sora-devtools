import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setVideoTrack } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoTrackForm: React.FC = () => {
  const videoTrack = useAppSelector((state) => state.videoTrack)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setVideoTrack(event.target.checked))
  }
  return (
    <FormGroup className="form-inline" controlId="videoTrack">
      <TooltipFormCheck kind="videoTrack" checked={videoTrack} onChange={onChange} disabled={false}>
        Enable video track
      </TooltipFormCheck>
    </FormGroup>
  )
}
