import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setVideoCodecType } from '@/app/actions'
import { $connectionStatus, $videoCodecType } from '@/app/store'
import { VIDEO_CODEC_TYPES } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const VideoCodecTypeForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, VIDEO_CODEC_TYPES)) {
      setVideoCodecType(event.target.value)
    }
  }
  return (
    <FormGroup className="form-inline" controlId="videoCodecType">
      <TooltipFormLabel kind="videoCodecType">videoCodecType:</TooltipFormLabel>
      <FormSelect
        name="videoCodecType"
        value={$videoCodecType.value}
        onChange={onChange}
        disabled={disabled}
      >
        {VIDEO_CODEC_TYPES.map((value) => {
          return (
            <option key={value} value={value}>
              {value === '' ? '未指定' : value}
            </option>
          )
        })}
      </FormSelect>
    </FormGroup>
  )
}
