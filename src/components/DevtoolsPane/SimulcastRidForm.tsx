import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setSimulcastRid } from '@/app/actions'
import { $connectionStatus, $simulcastRid } from '@/app/store'
import { SIMULCAST_RID } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const SimulcastRidForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, SIMULCAST_RID)) {
      setSimulcastRid(event.currentTarget.value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="simulcastRid">simulcastRid:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        name="simulcastRid"
        value={$simulcastRid.value}
        onChange={onChange}
        disabled={disabled}
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
