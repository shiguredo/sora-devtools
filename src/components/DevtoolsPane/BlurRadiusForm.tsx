import type { FunctionComponent } from 'preact'

import { setBlurRadius } from '@/app/actions'
import { $blurRadius, $mediaType } from '@/app/store'
import { BLUR_RADIUS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const BlurRadiusForm: FunctionComponent = () => {
  const onChange = (event: Event): void => {
    const value = (event.target as HTMLSelectElement).value
    if (checkFormValue(value, BLUR_RADIUS)) {
      setBlurRadius(value as (typeof BLUR_RADIUS)[number])
    }
  }
  const disabled = $mediaType.value !== 'getUserMedia'
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="blurRadius">blurRadius:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        value={$blurRadius.value}
        onChange={onChange}
        disabled={disabled}
      >
        {BLUR_RADIUS.map((value) => {
          return (
            <option key={value} value={value}>
              {value === '' || disabled ? '未指定' : value}
            </option>
          )
        })}
      </select>
    </div>
  )
}
