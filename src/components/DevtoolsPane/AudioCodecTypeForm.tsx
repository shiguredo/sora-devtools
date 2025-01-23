import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { useAppSelector } from '@/app/hooks'
import { useStore } from '@/app/store'
import { AUDIO_CODEC_TYPES } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AudioCodecTypeForm: React.FC = () => {
  const { audioCodecType, setAudioCodecType } = useStore()
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, AUDIO_CODEC_TYPES)) {
      setAudioCodecType(event.target.value)
    }
  }
  return (
    <FormGroup className="form-inline" controlId="audioCodecType">
      <TooltipFormLabel kind="audioCodecType">audioCodecType:</TooltipFormLabel>
      <FormSelect
        name="audioCodecType"
        value={audioCodecType}
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
      </FormSelect>
    </FormGroup>
  )
}
