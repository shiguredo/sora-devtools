import type React from 'react'

import { setSpotlightNumber } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { SPOTLIGHT_NUMBERS } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const SpotlightNumberForm: React.FC = () => {
  const spotlightNumber = useSoraDevtoolsStore((state) => state.spotlightNumber)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, SPOTLIGHT_NUMBERS)) {
      setSpotlightNumber(event.target.value)
    }
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="spotlightNumber">spotlightNumber:</TooltipFormLabel>
      <select
        value={spotlightNumber}
        onChange={onChange}
        disabled={disabled}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {SPOTLIGHT_NUMBERS.map((value) => {
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
