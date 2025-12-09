import React from 'react'

import { ClipboardIcon } from '@/components/ClipboardIcon'
import { copy2clipboard } from '@/utils'

type Props = {
  text: string
  disabled?: boolean
}
export const CopyLogButton = React.memo<Props>((props) => {
  const onClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    copy2clipboard(props.text)
    event.currentTarget.blur()
  }
  if (props.disabled) {
    return <div style={{ height: '31px' }} />
  }
  return (
    <button type="button" className="btn btn-sm btn-dark" onClick={onClick}>
      <ClipboardIcon />
    </button>
  )
})
