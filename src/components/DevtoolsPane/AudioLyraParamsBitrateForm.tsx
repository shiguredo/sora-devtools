import React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setAudioLyraParamsBitrate } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { AUDIO_LYRA_PARAMS_BITRATES } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel'

export const AudioLyraParamsBitrateForm: React.FC = () => {
  const audioLyraParamsBitrate = useAppSelector((state) => state.audioLyraParamsBitrate)
  const dispatch = useAppDispatch()
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, AUDIO_LYRA_PARAMS_BITRATES)) {
      dispatch(setAudioLyraParamsBitrate(event.target.value))
    }
  }
  return (
    <FormGroup className="form-inline" controlId="audioLyraParamsBitrate">
      <TooltipFormLabel kind="audioLyraParamsBitrate">audioLyraParamsBitrate:</TooltipFormLabel>
      <FormSelect
        name="audioLyraParamsBitrate"
        value={audioLyraParamsBitrate}
        onChange={onChange}
        disabled={disabled}
      >
        {AUDIO_LYRA_PARAMS_BITRATES.map((value) => {
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
