import type React from 'react'

import { setBlurRadius } from '@/app/actions'
import { $blurRadius, $mediaType } from '@/app/store'
import { BLUR_RADIUS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const BlurRadiusForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, BLUR_RADIUS)) {
      setBlurRadius(event.target.value)
    }
  }
  const disabled = $mediaType.value !== 'getUserMedia'
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="blurRadius">blurRadius:</TooltipFormLabel>
      <select
        className="form-select"
        value={$blurRadius.value}
        onChange={onChange}
        disabled={disabled}
      >
        {BLUR_RADIUS.map((value) => {
          return (
            <option suppressHydrationWarning={true} key={value} value={value}>
              {value === '' || disabled ? '未指定' : value}
            </option>
          )
        })}
      </select>
    </div>
  )
}
