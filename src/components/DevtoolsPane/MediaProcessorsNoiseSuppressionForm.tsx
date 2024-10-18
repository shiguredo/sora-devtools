import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setMediaProcessorsNoiseSuppression } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const MediaProcessorsNoiseSuppressionForm: React.FC = () => {
  const mediaProcessorsNoiseSuppression = useAppSelector(
    (state) => state.mediaProcessorsNoiseSuppression,
  )
  const mediaType = useAppSelector((state) => state.mediaType)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setMediaProcessorsNoiseSuppression(event.target.checked))
  }
  const disabled = mediaType !== 'getUserMedia'
  return (
    <FormGroup className="form-inline" controlId="mediaProcessorsNoiseSuppression">
      <TooltipFormCheck
        kind="mediaProcessorsNoiseSuppression"
        checked={mediaProcessorsNoiseSuppression}
        onChange={onChange}
        disabled={disabled}
      >
        mediaProcessorsNoiseSuppression
      </TooltipFormCheck>
    </FormGroup>
  )
}
