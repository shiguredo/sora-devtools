import type React from 'react'

import { setAspectRatio } from '@/app/actions'
import { $aspectRatio } from '@/app/store'
import { ASPECT_RATIO_TYPES } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AspectRatioForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, ASPECT_RATIO_TYPES)) {
      setAspectRatio(event.target.value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="aspectRatio">aspectRatio:</TooltipFormLabel>
      <select
        className="form-select"
        name="aspectRatio"
        value={$aspectRatio.value}
        onChange={onChange}
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
