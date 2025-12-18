import type React from 'react'

import { setSpotlightUnfocusRid } from '@/app/actions'
import { $connectionStatus, $spotlightUnfocusRid } from '@/app/store'
import { SPOTLIGHT_FOCUS_RIDS } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const SpotlightUnfocusRidForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, SPOTLIGHT_FOCUS_RIDS)) {
      setSpotlightUnfocusRid(event.target.value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="spotlightUnfocusRid">spotlightUnfocusRid:</TooltipFormLabel>
      <select
        className="form-select"
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
