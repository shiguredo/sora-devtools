import type { FunctionComponent } from 'preact'

import { INSTRUCTIONS } from '@/constants'

type Props = {
  kind: string
  children: React.ReactNode
}
export const TooltipFormLabel: FunctionComponent<Props> = (props) => {
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
