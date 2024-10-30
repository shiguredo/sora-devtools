import React from 'react'

import { useAppSelector } from '@/app/hooks'

import { Message } from './Message'

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
  const statsReport = useAppSelector((state) => state.soraContents.statsReport)
  const debugFilterText = useAppSelector((state) => state.debugFilterText)
  const filteredMessages = statsReport.filter((message) => {
    return debugFilterText.split(' ').every((filterText) => {
      if (filterText === '') {
        return true
      }
      return 0 <= JSON.stringify(message).indexOf(filterText)
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
