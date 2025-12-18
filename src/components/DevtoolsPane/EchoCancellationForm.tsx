import type { FunctionComponent } from 'preact'

import { setEchoCancellation } from '@/app/actions'
import { $echoCancellation } from '@/app/store'
import { ECHO_CANCELLATIONS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const EchoCancellationForm: FunctionComponent = () => {
  const onChange = (event: Event): void => {
    const value = (event.target as HTMLSelectElement).value
    if (checkFormValue(value, ECHO_CANCELLATIONS)) {
      setEchoCancellation(value as (typeof ECHO_CANCELLATIONS)[number])
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="echoCancellation">echoCancellation:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        name="echoCancellation"
        value={$echoCancellation.value}
        onChange={onChange}
      >
        {ECHO_CANCELLATIONS.map((value) => {
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
