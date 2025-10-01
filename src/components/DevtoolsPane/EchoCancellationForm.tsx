import type React from 'react'

import { setEchoCancellation } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { ECHO_CANCELLATIONS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const EchoCancellationForm: React.FC = () => {
  const echoCancellation = useSoraDevtoolsStore((state) => state.echoCancellation)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, ECHO_CANCELLATIONS)) {
      setEchoCancellation(event.target.value)
    }
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="echoCancellation">echoCancellation:</TooltipFormLabel>
      <select
        name="echoCancellation"
        value={echoCancellation}
        onChange={onChange}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
