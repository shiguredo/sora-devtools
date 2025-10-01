import type React from 'react'

import { setResizeMode } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { RESIZE_MODE_TYPES } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const ResizeModeForm: React.FC = () => {
  const resizeMode = useSoraDevtoolsStore((state) => state.resizeMode)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, RESIZE_MODE_TYPES)) {
      setResizeMode(event.target.value)
    }
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="resizeMode">resizeMode:</TooltipFormLabel>
      <select
        name="resizeMode"
        value={resizeMode}
        onChange={onChange}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
