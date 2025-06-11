import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setSpotlightFocusRid } from '@/app/actions'
import { useAppSelector } from '@/app/hooks'
import { SPOTLIGHT_FOCUS_RIDS } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const SpotlightFocusRidForm: React.FC = () => {
  const spotlightFocusRid = useAppSelector((state) => state.spotlightFocusRid)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
    const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, SPOTLIGHT_FOCUS_RIDS)) {
      setSpotlightFocusRid(event.target.value)
    }
  }
  return (
    <FormGroup className="form-inline" controlId="spotlightFocusRid">
      <TooltipFormLabel kind="spotlightFocusRid">spotlightFocusRid:</TooltipFormLabel>
      <FormSelect value={spotlightFocusRid} onChange={onChange} disabled={disabled}>
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
