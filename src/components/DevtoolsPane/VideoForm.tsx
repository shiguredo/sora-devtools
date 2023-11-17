import React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setVideo } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck'

export const VideoForm: React.FC = () => {
  const video = useAppSelector((state) => state.video)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setVideo(event.target.checked))
  }
  return (
    <FormGroup className="form-inline" controlId="video">
      <TooltipFormCheck kind="video" checked={video} onChange={onChange} disabled={disabled}>
        video
      </TooltipFormCheck>
    </FormGroup>
  )
}
