import type React from 'react'

import { setAudioContentHint } from '@/app/actions'
import { $audioContentHint } from '@/app/store'
import { AUDIO_CONTENT_HINTS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AudioContentHintForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, AUDIO_CONTENT_HINTS)) {
      setAudioContentHint(event.target.value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="audioContentHint">audioContentHint:</TooltipFormLabel>
      <select
        className="form-select"
        name="audioContentHint"
        value={$audioContentHint.value}
        onChange={onChange}
      >
        {AUDIO_CONTENT_HINTS.map((value) => {
          return (
            <option key={value} value={value}>
              {value === '' ? '未指定' : value}
            </option>
          )
        })}
      </select>
    </div>
  )
}
