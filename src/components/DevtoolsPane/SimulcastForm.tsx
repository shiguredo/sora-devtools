import type React from 'react'

import { setSimulcast } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { SIMULCAST } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const SimulcastForm: React.FC = () => {
  const simulcast = useSoraDevtoolsStore((state) => state.simulcast)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, SIMULCAST)) {
      setSimulcast(event.target.value)
    }
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="simulcast">simulcast:</TooltipFormLabel>
      <select name="simulcast" value={simulcast} onChange={onChange} disabled={disabled} className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
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
