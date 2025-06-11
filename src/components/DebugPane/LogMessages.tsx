import React from 'react'

import { useSoraDevtoolsStore } from '@/app/store'
import type { LogMessage } from '@/types'

import { Message } from './Message.tsx'

const Collapse: React.FC<LogMessage> = (props) => {
  const { message, timestamp } = props
  return (
    <Message
      title={message.title}
      timestamp={timestamp}
      description={JSON.parse(message.description)}
    />
  )
}

const Log = React.memo((props: LogMessage) => {
  return <Collapse {...props} />
})

export const LogMessages: React.FC = () => {
  const logMessages = useSoraDevtoolsStore((state) => state.logMessages)
  const debugFilterText = useSoraDevtoolsStore((state) => state.debugFilterText)
  const filteredMessages = logMessages.filter((message) => {
    return debugFilterText.split(' ').every((filterText) => {
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
