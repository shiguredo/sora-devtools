import React from 'react'

import { ClipboardIcon } from '@/components/ClipboardIcon'
import { copy2clipboard } from '@/utils'

type TextBoxProps = {
  id?: string
  text: string
}
const TextBox: React.FC<TextBoxProps> = (props) => {
  const onClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    copy2clipboard(props.text)
    event.currentTarget.blur()
  }
  return (
    <div className="d-flex align-items-center">
      <p>sessionID:</p>
      <div className="d-flex align-items-center border border-secondary rounded mx-1">
        <p id={props.id} className="mx-2 p-1">
          {props.text}
        </p>
        <div className="border-left border-secondary">
          <button type="button" className="btn btn-sm btn-light" onClick={onClick}>
            <ClipboardIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

type Props = {
  sessionId: string
}
export const SessionStatusBar: React.FC<Props> = (props) => {
  const { sessionId } = props
  return <TextBox id="session-id" text={sessionId} />
}
