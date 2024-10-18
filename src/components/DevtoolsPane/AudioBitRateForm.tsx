import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setAudioBitRate } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { AUDIO_BIT_RATES } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AudioBitRateForm: React.FC = () => {
  const audioBitRate = useAppSelector((state) => state.audioBitRate)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, AUDIO_BIT_RATES)) {
      dispatch(setAudioBitRate(event.target.value))
    }
  }
  return (
    <FormGroup className="form-inline" controlId="audioBitRate">
      <TooltipFormLabel kind="audioBitRate">audioBitRate:</TooltipFormLabel>
      <FormSelect name="audioBitRate" value={audioBitRate} onChange={onChange} disabled={disabled}>
        {AUDIO_BIT_RATES.map((value) => {
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
