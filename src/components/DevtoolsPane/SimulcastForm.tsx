import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setSimulcast } from '@/app/actions'
import { $connectionStatus, $simulcast } from '@/app/store'
import { SIMULCAST } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const SimulcastForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, SIMULCAST)) {
      setSimulcast(event.currentTarget.value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="simulcast">simulcast:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        name="simulcast"
        value={$simulcast.value}
        onChange={onChange}
        disabled={disabled}
      >
        {SIMULCAST.map((value) => {
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
