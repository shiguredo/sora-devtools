import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setMediaProcessorsNoiseSuppression } from '@/app/actions'
import { $mediaProcessorsNoiseSuppression, $mediaType } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const MediaProcessorsNoiseSuppressionForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMediaProcessorsNoiseSuppression(event.target.checked)
  }
  const disabled = $mediaType.value !== 'getUserMedia'
  return (
    <FormGroup className="form-inline" controlId="mediaProcessorsNoiseSuppression">
      <TooltipFormCheck
        kind="mediaProcessorsNoiseSuppression"
        checked={$mediaProcessorsNoiseSuppression.value}
        onChange={onChange}
        disabled={disabled}
      >
        mediaProcessorsNoiseSuppression
      </TooltipFormCheck>
    </FormGroup>
  )
}
