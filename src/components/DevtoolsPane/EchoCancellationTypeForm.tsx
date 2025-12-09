import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setEchoCancellationType } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { ECHO_CANCELLATION_TYPES } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const EchoCancellationTypeForm: React.FC = () => {
  const echoCancellationType = useSoraDevtoolsStore((state) => state.echoCancellationType)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, ECHO_CANCELLATION_TYPES)) {
      setEchoCancellationType(event.target.value)
    }
  }
  return (
    <FormGroup className="form-inline" controlId="echoCancellationType">
      <TooltipFormLabel kind="echoCancellationType">echoCancellationType:</TooltipFormLabel>
      <FormSelect name="echoCancellationType" value={echoCancellationType} onChange={onChange}>
        {ECHO_CANCELLATION_TYPES.map((value) => {
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
