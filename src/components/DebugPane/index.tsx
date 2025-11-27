import type React from 'react'
import { Tab, Tabs } from 'react-bootstrap'

import { setDebugType } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

import { Api } from './Api.tsx'
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

export const DebugPane: React.FC = () => {
  const debug = useSoraDevtoolsStore((state) => state.debug)
  const debugType = useSoraDevtoolsStore((state) => state.debugType)
  if (!debug) {
    return null
  }
  const onSelect = (key: string | null): void => {
    if (
      key === 'log' ||
      key === 'notify' ||
      key === 'push' ||
      key === 'stats' ||
      key === 'timeline' ||
      key === 'signaling' ||
      key === 'messaging' ||
      key === 'api' ||
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
  return (
    <div className="col-debug col-6">
      <Tabs id="debug-tab" activeKey={debugType} defaultActiveKey={'timeline'} onSelect={onSelect}>
        <Tab eventKey="timeline" title="Timeline">
          <DebugFilter />
          <TimelineMessages />
        </Tab>
        <Tab eventKey="signaling" title="Signaling">
          <DebugFilter />
          <SignalingMessages />
        </Tab>
        <Tab eventKey="notify" title="Notfiy">
          <DebugFilter />
          <NotifyMessages />
        </Tab>
        <Tab eventKey="push" title="Push">
          <DebugFilter />
          <PushMessages />
        </Tab>
        <Tab eventKey="stats" title="Stats">
          <DebugFilter />
          <Stats />
        </Tab>
        <Tab eventKey="log" title="Log">
          <DebugFilter />
          <LogMessages />
        </Tab>
        <Tab eventKey="messaging" title="Messaging">
          <SendDataChannelMessagingMessage />
          <DataChannelMessagingMessages />
        </Tab>
        <Tab eventKey="api" title="API">
          <Api />
        </Tab>
        <Tab eventKey="rpc" title="RPC">
          <Rpc />
        </Tab>
        <Tab eventKey="codec" title="Codec">
          <CapabilitiesCodec />
        </Tab>
      </Tabs>
    </div>
  )
}
