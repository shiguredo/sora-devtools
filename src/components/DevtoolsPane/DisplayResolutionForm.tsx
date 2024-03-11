import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setDisplayResolution } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { DISPLAY_RESOLUTIONS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel'

export const DisplayResolutionForm: React.FC = () => {
  const displayResolution = useAppSelector((state) => state.displayResolution)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, DISPLAY_RESOLUTIONS)) {
      dispatch(setDisplayResolution(event.target.value))
    }
  }
  return (
    <FormGroup className="form-inline" controlId="displayResolution">
      <TooltipFormLabel kind="displayResolution">displayResolution:</TooltipFormLabel>
      <FormSelect name="displayResolution" value={displayResolution} onChange={onChange}>
        {DISPLAY_RESOLUTIONS.map((value) => {
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
