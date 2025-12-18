import type React from 'react'

import { setAudioCodecType } from '@/app/actions'
import { $audioCodecType, $connectionStatus } from '@/app/store'
import { AUDIO_CODEC_TYPES } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AudioCodecTypeForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, AUDIO_CODEC_TYPES)) {
      setAudioCodecType(event.target.value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="audioCodecType">audioCodecType:</TooltipFormLabel>
      <select
        className="form-select"
        name="audioCodecType"
        value={$audioCodecType.value}
        onChange={onChange}
        disabled={disabled}
      >
        {AUDIO_CODEC_TYPES.map((value) => {
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
