import React from 'react'

import { useSoraDevtoolsStore } from '@/app/store'

import { Message } from './Message.tsx'

interface RTCStatsWithIndexSignature extends RTCStats {
  [x: string]: string | number | undefined
}

const Collapse: React.FC<RTCStatsWithIndexSignature> = (props) => {
  return <Message title={`${props.id}(${props.type})`} timestamp={null} description={props} />
}

const Log = React.memo((props: RTCStatsWithIndexSignature) => {
  return <Collapse {...props} />
})

export const Stats: React.FC = () => {
  const statsReport = useSoraDevtoolsStore((state) => state.soraContents.statsReport)
  const debugFilterText = useSoraDevtoolsStore((state) => state.debugFilterText)
  const filteredMessages = statsReport.filter((message) => {
    return debugFilterText.split(' ').every((filterText) => {
      if (filterText === '') {
        return true
      }
      return JSON.stringify(message).indexOf(filterText) >= 0
    })
  })
  return (
    <div className="debug-messages">
      {filteredMessages.map((stats) => {
        return <Log key={stats.id} {...(stats as RTCStatsWithIndexSignature)} />
      })}
    </div>
  )
}
