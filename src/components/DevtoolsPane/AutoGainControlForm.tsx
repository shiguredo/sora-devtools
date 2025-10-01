import type React from 'react'

import { setAutoGainControl } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { AUTO_GAIN_CONTROLS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AutoGainControlForm: React.FC = () => {
  const autoGainControl = useSoraDevtoolsStore((state) => state.autoGainControl)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, AUTO_GAIN_CONTROLS)) {
      setAutoGainControl(event.target.value)
    }
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="autoGainControl">autoGainControl:</TooltipFormLabel>
      <select
        name="autoGainControl"
        value={autoGainControl}
        onChange={onChange}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
