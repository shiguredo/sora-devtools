import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setEchoCancellationType } from '@/app/actions'
import { $echoCancellationType } from '@/app/store'
import { ECHO_CANCELLATION_TYPES } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const EchoCancellationTypeForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    const value = event.currentTarget.value
    if (checkFormValue(value, ECHO_CANCELLATION_TYPES)) {
      setEchoCancellationType(value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="echoCancellationType">echoCancellationType:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
