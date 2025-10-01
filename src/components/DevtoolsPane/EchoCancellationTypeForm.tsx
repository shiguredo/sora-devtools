import type React from 'react'

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
    <div className="flex items-center">
      <TooltipFormLabel kind="echoCancellationType">echoCancellationType:</TooltipFormLabel>
      <select
        name="echoCancellationType"
        value={echoCancellationType}
        onChange={onChange}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
