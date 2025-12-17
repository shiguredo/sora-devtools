import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setNoiseSuppression } from '@/app/actions'
import { $noiseSuppression } from '@/app/store'
import { NOISE_SUPPRESSIONS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const NoiseSuppressionForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, NOISE_SUPPRESSIONS)) {
      setNoiseSuppression(event.target.value)
    }
  }
  return (
    <FormGroup className="form-inline" controlId="noiseSuppression">
      <TooltipFormLabel kind="noiseSuppression">noiseSuppression:</TooltipFormLabel>
      <FormSelect name="noiseSuppression" value={$noiseSuppression.value} onChange={onChange}>
        {NOISE_SUPPRESSIONS.map((value) => {
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
