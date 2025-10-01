import type React from 'react'

import { setSpotlight } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { SPOTLIGHT } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const SpotlightForm: React.FC = () => {
  const spotlight = useSoraDevtoolsStore((state) => state.spotlight)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, SPOTLIGHT)) {
      setSpotlight(event.target.value)
    }
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="spotlight">spotlight:</TooltipFormLabel>
      <select
        name="spotlight"
        value={spotlight}
        onChange={onChange}
        disabled={disabled}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {SPOTLIGHT.map((value) => {
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
