import type React from 'react'

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
    <div className="form-inline">
      <TooltipFormLabel kind="resizeMode">resizeMode:</TooltipFormLabel>
      <select
        className="form-select"
        name="resizeMode"
        value={$resizeMode.value}
        onChange={onChange}
      >
        {RESIZE_MODE_TYPES.map((value) => {
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
