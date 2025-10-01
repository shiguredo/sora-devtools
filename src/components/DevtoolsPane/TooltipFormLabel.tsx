import type React from 'react'
import { useState } from 'react'

import { INSTRUCTIONS } from '@/constants'

type Props = {
  kind: string
  children: React.ReactNode
}
export const TooltipFormLabel: React.FC<Props> = (props) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const instruction = INSTRUCTIONS[props.kind]

  if (!instruction) {
    return <label className="block text-sm font-medium text-gray-700">{props.children}</label>
  }

  return (
    <div className="relative inline-block">
      <label
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="block text-sm font-medium text-gray-700 cursor-help mr-2"
      >
        {props.children}
      </label>
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-0 mb-2 p-3 bg-white border border-gray-300 rounded shadow-lg max-w-[350px] whitespace-pre-wrap">
          {instruction.description}
        </div>
      )}
    </div>
  )
}
