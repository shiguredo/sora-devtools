import type React from 'react'

import { setAspectRatio } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { ASPECT_RATIO_TYPES } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AspectRatioForm: React.FC = () => {
  const aspectRatio = useSoraDevtoolsStore((state) => state.aspectRatio)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, ASPECT_RATIO_TYPES)) {
      setAspectRatio(event.target.value)
    }
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="aspectRatio">aspectRatio:</TooltipFormLabel>
      <select
        name="aspectRatio"
        value={aspectRatio}
        onChange={onChange}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {ASPECT_RATIO_TYPES.map((value) => {
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
