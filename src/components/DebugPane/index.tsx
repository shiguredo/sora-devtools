import type React from 'react'

import { setDebugType } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

import { CapabilitiesCodec } from './CapabilitiesCodec.tsx'
import { DataChannelMessagingMessages } from './DataChannelMessagingMessages.tsx'
import { DebugFilter } from './Filter.tsx'
import { LogMessages } from './LogMessages.tsx'
import { NotifyMessages } from './NotifyMessages.tsx'
import { PushMessages } from './PushMessages.tsx'
import { SendDataChannelMessagingMessage } from './SendDataChannelMessagingMessage.tsx'
import { SignalingMessages } from './SignalingMessages.tsx'
import { Stats } from './Stats.tsx'
import { TimelineMessages } from './TimelineMessages.tsx'

type TabItem = {
  key: string
  title: string
  content: React.ReactNode
}

export const DebugPane: React.FC = () => {
  const debug = useSoraDevtoolsStore((state) => state.debug)
  const debugType = useSoraDevtoolsStore((state) => state.debugType)

  if (!debug) {
    return null
  }

  const tabs: TabItem[] = [
    {
      key: 'timeline',
      title: 'Timeline',
      content: (
        <>
          <DebugFilter />
          <TimelineMessages />
        </>
      ),
    },
    {
      key: 'signaling',
      title: 'Signaling',
      content: (
        <>
          <DebugFilter />
          <SignalingMessages />
        </>
      ),
    },
    {
      key: 'notify',
      title: 'Notfiy',
      content: (
        <>
          <DebugFilter />
          <NotifyMessages />
        </>
      ),
    },
    {
      key: 'push',
      title: 'Push',
      content: (
        <>
          <DebugFilter />
          <PushMessages />
        </>
      ),
    },
    {
      key: 'stats',
      title: 'Stats',
      content: (
        <>
          <DebugFilter />
          <Stats />
        </>
      ),
    },
    {
      key: 'log',
      title: 'Log',
      content: (
        <>
          <DebugFilter />
          <LogMessages />
        </>
      ),
    },
    {
      key: 'messaging',
      title: 'Messaging',
      content: (
        <>
          <SendDataChannelMessagingMessage />
          <DataChannelMessagingMessages />
        </>
      ),
    },
    {
      key: 'codec',
      title: 'Codec',
      content: <CapabilitiesCodec />,
    },
  ]

  const handleTabClick = (key: string): void => {
    if (
      key === 'log' ||
      key === 'notify' ||
      key === 'push' ||
      key === 'stats' ||
      key === 'timeline' ||
      key === 'signaling' ||
      key === 'messaging' ||
      key === 'codec'
    ) {
      setDebugType(key)
    }
  }

  return (
    <div className="col-debug col-6">
      <ul className="nav nav-tabs">
        {tabs.map((tab) => (
          <li key={tab.key} className="nav-item">
            <button
              type="button"
              onClick={() => handleTabClick(tab.key)}
              className={`nav-link ${debugType === tab.key ? 'active' : ''}`}
            >
              {tab.title}
            </button>
          </li>
        ))}
      </ul>
      <div className="tab-content">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`tab-pane ${debugType === tab.key ? 'active' : ''}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}
