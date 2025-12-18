import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setSpotlightUnfocusRid } from '@/app/actions'
import { $connectionStatus, $spotlightUnfocusRid } from '@/app/store'
import { SPOTLIGHT_FOCUS_RIDS } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const SpotlightUnfocusRidForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    const value = event.currentTarget.value
    if (checkFormValue(value, SPOTLIGHT_FOCUS_RIDS)) {
      setSpotlightUnfocusRid(value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="spotlightUnfocusRid">spotlightUnfocusRid:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        value={$spotlightUnfocusRid.value}
        onChange={onChange}
        disabled={disabled}
      >
        {SPOTLIGHT_FOCUS_RIDS.map((value) => {
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
