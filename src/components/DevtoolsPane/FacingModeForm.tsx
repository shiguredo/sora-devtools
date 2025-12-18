import type React from 'react'

import { setFacingMode } from '@/app/actions'
import { $facingMode, $mediaType } from '@/app/store'
import { FACING_MODES } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const FacingModeForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, FACING_MODES)) {
      setFacingMode(event.target.value)
    }
  }
  const disabled = $mediaType.value !== 'getUserMedia'
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="facingMode">facingMode:</TooltipFormLabel>
      <select
        className="form-select"
        name="facingMode"
        value={$facingMode.value}
        onChange={onChange}
        disabled={disabled}
      >
        {FACING_MODES.map((value) => {
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
