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
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                debugType === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.title}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {tabs.map((tab) => (
          <div key={tab.key} className={debugType === tab.key ? 'block' : 'hidden'}>
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}
