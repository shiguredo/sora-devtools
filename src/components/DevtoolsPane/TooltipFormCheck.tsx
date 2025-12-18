import type React from 'react'

import { INSTRUCTIONS } from '@/constants'

type Props = {
  kind: string
  children: React.ReactNode
  checked: boolean
  disabled: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}
export const TooltipFormCheck: React.FC<Props> = (props) => {
  const { children, kind, checked, onChange, disabled } = props
  const instruction = INSTRUCTIONS[kind]
  const inputId = `switch-${kind}`
  if (!instruction) {
    return (
      <span className="form-label" id={inputId}>
        {children}
      </span>
    )
  }
  return (
    <>
      <div className="form-check form-switch">
        <input
          id={inputId}
          className="form-check-input"
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-checked={checked}
        />
      </div>
      <span
        className="form-label tooltip-label"
        data-tooltip={instruction.description}
      >
        {children}
      </span>
    </>
  )
}
