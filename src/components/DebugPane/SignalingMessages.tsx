import React from 'react'

import { $debugFilterText, $signalingMessages } from '@/app/store'
import type { SignalingMessage } from '@/types'

import { Message } from './Message.tsx'

const SIGNALING_COLORS: { [key: string]: string } = {
  websocket: '#00ff00',
  datachannel: '#ff00ff',
}

const Label = React.memo<{ text: string }>((props) => {
  const { text } = props
  const color = Object.keys(SIGNALING_COLORS).includes(text) ? SIGNALING_COLORS[text] : undefined
  return (
    <span className="me-1" style={color ? { color: color } : {}}>
      [{text}]
    </span>
  )
})

const Collapse = React.memo<SignalingMessage>((props) => {
  const { data, type, timestamp, transportType } = props
  const label = transportType ? <Label text={transportType} /> : null
  return <Message title={type} timestamp={timestamp} description={data} label={label} />
})

const Log = React.memo<SignalingMessage>((props) => {
  return <Collapse {...props} />
})

export const SignalingMessages: React.FC = () => {
  const filteredMessages = $signalingMessages.value.filter((message) => {
    return $debugFilterText.value.split(' ').every((filterText) => {
      if (filterText === '') {
        return true
      }
      return JSON.stringify(message).indexOf(filterText) >= 0
    })
  })
  return (
    <div className="debug-messages">
      {filteredMessages.map((message) => {
        const key = message.type + message.timestamp
        return <Log key={key} {...message} />
      })}
    </div>
  )
}
