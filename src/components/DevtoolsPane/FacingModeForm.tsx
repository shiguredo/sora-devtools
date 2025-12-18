import type { FunctionComponent } from 'preact'

import { setFacingMode } from '@/app/actions'
import { $facingMode, $mediaType } from '@/app/store'
import { FACING_MODES } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const FacingModeForm: FunctionComponent = () => {
  const onChange = (event: Event): void => {
    const value = (event.target as HTMLSelectElement).value
    if (checkFormValue(value, FACING_MODES)) {
      setFacingMode(value as (typeof FACING_MODES)[number])
    }
  }
  const disabled = $mediaType.value !== 'getUserMedia'
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="facingMode">facingMode:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
