import type React from 'react'

import { setDebugType } from '@/app/actions'
import { $debug, $debugType } from '@/app/store'

// import { Api } from './Api.tsx'
import { CapabilitiesCodec } from './CapabilitiesCodec.tsx'
import { DataChannelMessagingMessages } from './DataChannelMessagingMessages.tsx'
import { DebugFilter } from './Filter.tsx'
import { LogMessages } from './LogMessages.tsx'
import { NotifyMessages } from './NotifyMessages.tsx'
import { PushMessages } from './PushMessages.tsx'
import { Rpc } from './Rpc.tsx'
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
  if (!$debug.value) {
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
    // {
    //   key: 'api',
    //   title: 'API',
    //   content: <Api />,
    // },
    {
      key: 'rpc',
      title: 'RPC',
      content: <Rpc />,
    },
    {
      key: 'codec',
      title: 'Codec',
      content: <CapabilitiesCodec />,
    },
  ]

  const handleTabSelect = (key: string): void => {
    if (
      key === 'log' ||
      key === 'notify' ||
      key === 'push' ||
      key === 'stats' ||
      key === 'timeline' ||
      key === 'signaling' ||
      key === 'messaging' ||
      // key === 'api' ||
      key === 'rpc' ||
      key === 'codec'
    ) {
      setDebugType(key)
      // URL の query string を更新
      const searchParams = new URLSearchParams(location.search)
      searchParams.set('debugType', key)
      const newUrl = `${location.pathname}?${searchParams.toString()}`
      window.history.replaceState(null, '', newUrl)
    }
  }

  const activeKey = $debugType.value || 'timeline'

  return (
    <div className="col-debug col-6">
      <div className="nav nav-tabs" id="debug-tab" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            className={`nav-link${activeKey === tab.key ? ' active' : ''}`}
            id={`${tab.key}-tab`}
            aria-controls={`${tab.key}-pane`}
            aria-selected={activeKey === tab.key}
            onClick={() => handleTabSelect(tab.key)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div className="tab-content" id="debug-tab-content">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`tab-pane fade${activeKey === tab.key ? ' show active' : ''}`}
            id={`${tab.key}-pane`}
            role="tabpanel"
            aria-labelledby={`${tab.key}-tab`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}
