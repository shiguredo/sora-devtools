import type React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setResizeMode } from '@/app/actions'
import { $resizeMode } from '@/app/store'
import { RESIZE_MODE_TYPES } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const ResizeModeForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, RESIZE_MODE_TYPES)) {
      setResizeMode(event.target.value)
    }
  }
  return (
    <FormGroup className="form-inline" controlId="resizeMode">
      <TooltipFormLabel kind="resizeMode">resizeMode:</TooltipFormLabel>
      <FormSelect name="resizeMode" value={$resizeMode.value} onChange={onChange}>
        {RESIZE_MODE_TYPES.map((value) => {
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
