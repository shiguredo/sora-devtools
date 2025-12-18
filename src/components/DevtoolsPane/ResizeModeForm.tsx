import type { FunctionComponent } from 'preact'

import { setResizeMode } from '@/app/actions'
import { $resizeMode } from '@/app/store'
import { RESIZE_MODE_TYPES } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const ResizeModeForm: FunctionComponent = () => {
  const onChange = (event: Event): void => {
    const value = (event.target as HTMLSelectElement).value
    if (checkFormValue(value, RESIZE_MODE_TYPES)) {
      setResizeMode(value as (typeof RESIZE_MODE_TYPES)[number])
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="resizeMode">resizeMode:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
