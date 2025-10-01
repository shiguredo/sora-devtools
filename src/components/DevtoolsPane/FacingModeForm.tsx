import type React from 'react'

import { setFacingMode } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { FACING_MODES } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const FacingModeForm: React.FC = () => {
  const facingMode = useSoraDevtoolsStore((state) => state.facingMode)
  const mediaType = useSoraDevtoolsStore((state) => state.mediaType)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, FACING_MODES)) {
      setFacingMode(event.target.value)
    }
  }
  const disabled = mediaType !== 'getUserMedia'
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="facingMode">facingMode:</TooltipFormLabel>
      <select
        name="facingMode"
        value={facingMode}
        onChange={onChange}
        disabled={disabled}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
