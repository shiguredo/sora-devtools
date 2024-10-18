import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setSpotlight } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { SPOTLIGHT } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const SpotlightForm: React.FC = () => {
  const spotlight = useAppSelector((state) => state.spotlight)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, SPOTLIGHT)) {
      dispatch(setSpotlight(event.target.value))
    }
  }
  return (
    <FormGroup className="form-inline" controlId="spotlight">
      <TooltipFormLabel kind="spotlight">spotlight:</TooltipFormLabel>
      <FormSelect name="spotlight" value={spotlight} onChange={onChange} disabled={disabled}>
        {SPOTLIGHT.map((value) => {
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
