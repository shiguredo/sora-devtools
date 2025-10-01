import type React from 'react'

import { setBlurRadius } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { BLUR_RADIUS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const BlurRadiusForm: React.FC = () => {
  const blurRadius = useSoraDevtoolsStore((state) => state.blurRadius)
  const mediaType = useSoraDevtoolsStore((state) => state.mediaType)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, BLUR_RADIUS)) {
      setBlurRadius(event.target.value)
    }
  }
  const disabled = mediaType !== 'getUserMedia'
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="blurRadius">blurRadius:</TooltipFormLabel>
      <select
        value={blurRadius}
        onChange={onChange}
        disabled={disabled}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
