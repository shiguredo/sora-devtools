import type { FunctionComponent } from 'preact'

import { setSpotlightFocusRid } from '@/app/actions'
import { $connectionStatus, $spotlightFocusRid } from '@/app/store'
import { SPOTLIGHT_FOCUS_RIDS } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const SpotlightFocusRidForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: Event): void => {
    const value = (event.target as HTMLSelectElement).value
    if (checkFormValue(value, SPOTLIGHT_FOCUS_RIDS)) {
      setSpotlightFocusRid(value as (typeof SPOTLIGHT_FOCUS_RIDS)[number])
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="spotlightFocusRid">spotlightFocusRid:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        value={$spotlightFocusRid.value}
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
