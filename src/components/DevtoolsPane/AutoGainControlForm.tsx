import type { FunctionComponent } from 'preact'

import { setAutoGainControl } from '@/app/actions'
import { $autoGainControl } from '@/app/store'
import { AUTO_GAIN_CONTROLS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AutoGainControlForm: FunctionComponent = () => {
  const onChange = (event: Event): void => {
    const value = (event.target as HTMLSelectElement).value
    if (checkFormValue(value, AUTO_GAIN_CONTROLS)) {
      setAutoGainControl(value as (typeof AUTO_GAIN_CONTROLS)[number])
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="autoGainControl">autoGainControl:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        name="autoGainControl"
        value={$autoGainControl.value}
        onChange={onChange}
      >
        {AUTO_GAIN_CONTROLS.map((value) => {
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
