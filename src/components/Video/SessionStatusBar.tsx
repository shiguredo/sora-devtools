import type { FunctionComponent } from 'preact'

import { ClipboardIcon } from '@/components/ClipboardIcon'
import { copy2clipboard } from '@/utils'

type TextBoxProps = {
  id?: string
  text: string
}
const TextBox: FunctionComponent<TextBoxProps> = (props) => {
  const onClick = (event: MouseEvent): void => {
    copy2clipboard(props.text)
    ;(event.currentTarget as HTMLButtonElement).blur()
  }
  return (
    <div className="flex items-center">
      <p>sessionID:</p>
      <div className="flex items-center border border-gray-500 rounded mx-1">
        <p id={props.id} className="mx-2 p-1">
          {props.text}
        </p>
        <div className="border-l border-gray-500">
          <button
            type="button"
            className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded"
            onClick={onClick}
          >
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
export const SessionStatusBar: FunctionComponent<Props> = (props) => {
  const { sessionId } = props
  return <TextBox id="session-id" text={sessionId} />
}
