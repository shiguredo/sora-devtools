import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setSimulcast } from '@/app/actions'
import { $connectionStatus, $simulcast } from '@/app/store'
import { SIMULCAST } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const SimulcastForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, SIMULCAST)) {
      setSimulcast(event.target.value)
    }
  }
  return (
    <FormGroup className="form-inline" controlId="simulcast">
      <TooltipFormLabel kind="simulcast">simulcast:</TooltipFormLabel>
      <FormSelect name="simulcast" value={$simulcast.value} onChange={onChange} disabled={disabled}>
        {SIMULCAST.map((value) => {
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
