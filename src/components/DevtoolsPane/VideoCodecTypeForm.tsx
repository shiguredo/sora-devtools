import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setVideoCodecType } from '@/app/actions'
import { useAppSelector } from '@/app/hooks'
import { VIDEO_CODEC_TYPES } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const VideoCodecTypeForm: React.FC = () => {
  const videoCodecType = useAppSelector((state) => state.videoCodecType)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
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
        value={videoCodecType}
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
