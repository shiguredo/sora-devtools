import type React from 'react'

import { setEchoCancellationType } from '@/app/actions'
import { $echoCancellationType } from '@/app/store'
import { ECHO_CANCELLATION_TYPES } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const EchoCancellationTypeForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, ECHO_CANCELLATION_TYPES)) {
      setEchoCancellationType(event.target.value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="echoCancellationType">echoCancellationType:</TooltipFormLabel>
      <select
        className="form-select"
        name="echoCancellationType"
        value={$echoCancellationType.value}
        onChange={onChange}
      >
        {ECHO_CANCELLATION_TYPES.map((value) => {
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
