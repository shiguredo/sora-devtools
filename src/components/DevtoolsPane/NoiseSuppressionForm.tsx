import type React from 'react'

import { setNoiseSuppression } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { NOISE_SUPPRESSIONS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const NoiseSuppressionForm: React.FC = () => {
  const noiseSuppression = useSoraDevtoolsStore((state) => state.noiseSuppression)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, NOISE_SUPPRESSIONS)) {
      setNoiseSuppression(event.target.value)
    }
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="noiseSuppression">noiseSuppression:</TooltipFormLabel>
      <select
        name="noiseSuppression"
        value={noiseSuppression}
        onChange={onChange}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {NOISE_SUPPRESSIONS.map((value) => {
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
