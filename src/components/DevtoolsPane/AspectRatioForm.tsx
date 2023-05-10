import React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setAspectRatio } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { ASPECT_RATIO_TYPES } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel'

export const AspectRatioForm: React.FC = () => {
  const aspectRatio = useAppSelector((state) => state.aspectRatio)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, ASPECT_RATIO_TYPES)) {
      dispatch(setAspectRatio(event.target.value))
    }
  }
  return (
    <FormGroup className="form-inline" controlId="aspectRatio">
      <TooltipFormLabel kind="aspectRatio">aspectRatio:</TooltipFormLabel>
      <FormSelect name="aspectRatio" value={aspectRatio} onChange={onChange}>
        {ASPECT_RATIO_TYPES.map((value) => {
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
