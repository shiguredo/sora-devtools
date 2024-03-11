import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setResolution } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { RESOLUTIONS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel'

export const ResolutionForm: React.FC = () => {
  const resolution = useAppSelector((state) => state.resolution)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, RESOLUTIONS)) {
      dispatch(setResolution(event.target.value))
    }
  }
  return (
    <FormGroup className="form-inline" controlId="resolution">
      <TooltipFormLabel kind="resolution">resolution:</TooltipFormLabel>
      <FormSelect name="resolution" value={resolution} onChange={onChange}>
        {RESOLUTIONS.map((value) => {
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
