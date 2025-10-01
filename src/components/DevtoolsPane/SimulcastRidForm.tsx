import type React from 'react'

import { setSimulcastRid } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { SIMULCAST_RID } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const SimulcastRidForm: React.FC = () => {
  const simulcastRid = useSoraDevtoolsStore((state) => state.simulcastRid)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, SIMULCAST_RID)) {
      setSimulcastRid(event.target.value)
    }
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="simulcastRid">simulcastRid:</TooltipFormLabel>
      <select
        name="simulcastRid"
        value={simulcastRid}
        onChange={onChange}
        disabled={disabled}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {SIMULCAST_RID.map((value) => {
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
