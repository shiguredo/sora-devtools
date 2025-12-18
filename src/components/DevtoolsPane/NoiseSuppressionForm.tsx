import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setNoiseSuppression } from '@/app/actions'
import { $noiseSuppression } from '@/app/store'
import { NOISE_SUPPRESSIONS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const NoiseSuppressionForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    const value = event.currentTarget.value
    if (checkFormValue(value, NOISE_SUPPRESSIONS)) {
      setNoiseSuppression(value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="noiseSuppression">noiseSuppression:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        name="noiseSuppression"
        value={$noiseSuppression.value}
        onChange={onChange}
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
