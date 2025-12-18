import type React from 'react'

import { INSTRUCTIONS } from '@/constants'

type Props = {
  kind: string
  children: React.ReactNode
}
export const TooltipFormLabel: React.FC<Props> = (props) => {
  const instruction = INSTRUCTIONS[props.kind]
  if (!instruction) {
    return <span className="form-label">{props.children}</span>
  }
  return (
    <span className="form-label tooltip-label" data-tooltip={instruction.description}>
      {props.children}
    </span>
  )
}
