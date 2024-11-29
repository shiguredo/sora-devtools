import type React from 'react'
import { FormLabel, OverlayTrigger, Popover } from 'react-bootstrap'

import { INSTRUCTIONS } from '@/constants'

type Props = {
  kind: string
  children: React.ReactNode
}
export const TooltipFormLabel: React.FC<Props> = (props) => {
  const instruction = INSTRUCTIONS[props.kind]
  if (!instruction) {
    return <FormLabel>{props.children}</FormLabel>
  }
  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Popover id="popover-basic">
          <Popover.Body style={{ whiteSpace: 'pre-wrap' }}>{instruction.description}</Popover.Body>
        </Popover>
      }
    >
      <FormLabel>{props.children}</FormLabel>
    </OverlayTrigger>
  )
}
