import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setSpotlightFocusRid } from '@/app/actions'
import { $connectionStatus, $spotlightFocusRid } from '@/app/store'
import { SPOTLIGHT_FOCUS_RIDS } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const SpotlightFocusRidForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, SPOTLIGHT_FOCUS_RIDS)) {
      setSpotlightFocusRid(event.target.value)
    }
  }
  return (
    <FormGroup className="form-inline" controlId="spotlightFocusRid">
      <TooltipFormLabel kind="spotlightFocusRid">spotlightFocusRid:</TooltipFormLabel>
      <FormSelect value={$spotlightFocusRid.value} onChange={onChange} disabled={disabled}>
        {SPOTLIGHT_FOCUS_RIDS.map((value) => {
          return (
            <option key={value} value={value}>
              {value === '' ? '未指定' : value}
            </option>
          )
        })}
      </FormSelect>
    </FormGroup>
  )
}
