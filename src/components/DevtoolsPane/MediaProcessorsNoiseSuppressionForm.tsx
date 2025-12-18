import type { FunctionComponent } from 'preact'

import { setMediaProcessorsNoiseSuppression } from '@/app/actions'
import { $mediaProcessorsNoiseSuppression, $mediaType } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const MediaProcessorsNoiseSuppressionForm: FunctionComponent = () => {
  const onChange = (event: Event): void => {
    setMediaProcessorsNoiseSuppression((event.target as HTMLInputElement).checked)
  }
  const disabled = $mediaType.value !== 'getUserMedia'
  return (
    <div className="form-inline form-switch">
      <TooltipFormCheck
        kind="mediaProcessorsNoiseSuppression"
        checked={$mediaProcessorsNoiseSuppression.value}
        onChange={onChange}
        disabled={disabled}
      >
        mediaProcessorsNoiseSuppression
      </TooltipFormCheck>
    </div>
  )
}
