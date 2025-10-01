import type React from 'react'
import { useState } from 'react'

import { INSTRUCTIONS } from '@/constants'

type Props = {
  kind: string
  children: React.ReactNode
  checked: boolean
  disabled: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}
export const TooltipFormCheck: React.FC<Props> = (props) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const { children, kind, checked, onChange, disabled } = props
  const instruction = INSTRUCTIONS[kind]

  if (!instruction) {
    return <label className="block text-base font-medium text-gray-700">{children}</label>
  }

  return (
    <>
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="w-8 h-4 bg-gray-200 rounded-full appearance-none cursor-pointer transition-colors
                     checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                     relative before:content-[''] before:absolute before:w-3 before:h-3 before:rounded-full
                     before:bg-white before:top-0.5 before:left-0.5 before:transition-transform
                     checked:before:translate-x-4"
        />
      </div>
      <div className="relative inline-block">
        <label
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="block text-base font-medium text-gray-700 cursor-help ml-2"
        >
          {children}
        </label>
        {showTooltip && (
          <div className="absolute z-50 bottom-full left-0 mb-2 p-3 bg-white border border-gray-300 rounded shadow-lg max-w-[350px] whitespace-pre-wrap">
            {instruction.description}
          </div>
        )}
      </div>
    </>
  )
}
