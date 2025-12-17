import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setSpotlight } from '@/app/actions'
import { $connectionStatus, $spotlight } from '@/app/store'
import { SPOTLIGHT } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const SpotlightForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, SPOTLIGHT)) {
      setSpotlight(event.target.value)
    }
  }
  return (
    <FormGroup className="form-inline" controlId="spotlight">
      <TooltipFormLabel kind="spotlight">spotlight:</TooltipFormLabel>
      <FormSelect name="spotlight" value={$spotlight.value} onChange={onChange} disabled={disabled}>
        {SPOTLIGHT.map((value) => {
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
