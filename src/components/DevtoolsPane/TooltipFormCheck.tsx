import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { INSTRUCTIONS } from '@/constants'

type Props = {
  kind: string
  children: React.ReactNode
  checked: boolean
  disabled: boolean
  onChange: (event: TargetedEvent<HTMLInputElement>) => void
}
export const TooltipFormCheck: FunctionComponent<Props> = (props) => {
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
      <label
        htmlFor={inputId}
        className="form-check-label tooltip-label"
        data-tooltip={instruction.description}
      >
        {children}
      </label>
    </>
  )
}
