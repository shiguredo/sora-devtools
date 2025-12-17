import React from 'react'

import { $debugFilterText, $logMessages } from '@/app/store'
import type { LogMessage } from '@/types'

import { Message } from './Message.tsx'

const Collapse = React.memo<LogMessage>((props) => {
  const { message, timestamp } = props
  return (
    <Message
      title={message.title}
      timestamp={timestamp}
      description={JSON.parse(message.description)}
    />
  )
})

const Log = React.memo<LogMessage>((props) => {
  return <Collapse {...props} />
})

export const LogMessages: React.FC = () => {
  const filteredMessages = $logMessages.value.filter((message) => {
    return $debugFilterText.value.split(' ').every((filterText) => {
      if (filterText === '') {
        return true
      }
      return JSON.stringify(message).indexOf(filterText) >= 0
    })
  })
  return (
    <div className="debug-messages">
      {filteredMessages.map((log, index) => {
        return <Log key={log.message.title + String(index) + log.timestamp} {...log} />
      })}
    </div>
  )
}
