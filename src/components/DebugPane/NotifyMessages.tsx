import type { FunctionComponent } from 'preact'

import { $debugFilterText, $notifyMessages } from '@/app/store'
import type { NotifyMessage } from '@/types'

import { Message } from './Message.tsx'

const SIGNALING_COLORS: { [key: string]: string } = {
  websocket: '#00ff00',
  datachannel: '#ff00ff',
}

const Label: FunctionComponent<{ text: string }> = (props) => {
  const { text } = props
  const color = Object.keys(SIGNALING_COLORS).includes(text) ? SIGNALING_COLORS[text] : undefined
  return (
    <span className="me-1" style={color ? { color: color } : {}}>
      [{text}]
    </span>
  )
}

type CollapseNotifyProps = {
  notify: NotifyMessage
}
const CollapseNotify: FunctionComponent<CollapseNotifyProps> = (props) => {
  const { notify } = props
  const label = notify.transportType ? <Label text={notify.transportType} /> : null
  return (
    <Message
      title={notify.message.event_type}
      timestamp={notify.timestamp}
      description={notify.message}
      label={label}
    />
  )
}

const Log: FunctionComponent<CollapseNotifyProps> = (props) => {
  return <CollapseNotify {...props} />
}

export const NotifyMessages: FunctionComponent = () => {
  const filteredMessages = $notifyMessages.value.filter((message) => {
    return $debugFilterText.value.split(' ').every((filterText) => {
      if (filterText === '') {
        return true
      }
      return JSON.stringify(message).indexOf(filterText) >= 0
    })
  })
  return (
    <div className="debug-messages">
      {filteredMessages.map((notify) => {
        return <Log key={notify.message.type + notify.timestamp} notify={notify} />
      })}
    </div>
  )
}
