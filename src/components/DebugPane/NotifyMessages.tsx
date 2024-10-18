import React from 'react'

import { useAppSelector } from '@/app/hooks'
import type { NotifyMessage } from '@/types'

import { Message } from './Message.tsx'

const SIGNALING_COLORS: { [key: string]: string } = {
  websocket: '#00ff00',
  datachannel: '#ff00ff',
}

const Label: React.FC<{ text: string }> = (props) => {
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
const CollapseNotify: React.FC<CollapseNotifyProps> = (props) => {
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

const Log = React.memo((props: CollapseNotifyProps) => {
  return <CollapseNotify {...props} />
})

export const NotifyMessages: React.FC = () => {
  const notifyMessages = useAppSelector((state) => state.notifyMessages)
  const debugFilterText = useAppSelector((state) => state.debugFilterText)
  const filteredMessages = notifyMessages.filter((message) => {
    return debugFilterText.split(' ').every((filterText) => {
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
