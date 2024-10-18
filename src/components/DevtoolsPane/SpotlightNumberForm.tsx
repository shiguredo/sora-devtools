import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setSpotlightNumber } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { SPOTLIGHT_NUMBERS } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const SpotlightNumberForm: React.FC = () => {
  const spotlightNumber = useAppSelector((state) => state.spotlightNumber)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, SPOTLIGHT_NUMBERS)) {
      dispatch(setSpotlightNumber(event.target.value))
    }
  }
  return (
    <FormGroup className="form-inline" controlId="spotlightNumber">
      <TooltipFormLabel kind="spotlightNumber">spotlightNumber:</TooltipFormLabel>
      <FormSelect value={spotlightNumber} onChange={onChange} disabled={disabled}>
        {SPOTLIGHT_NUMBERS.map((value) => {
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
