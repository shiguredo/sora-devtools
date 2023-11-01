import React from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import { setDebugType } from '@/app/actions';
import { useAppDispatch, useAppSelector } from '@/app/hooks';

import { CapabilitiesCodec } from './CapabilitiesCodec';
import { DataChannelMessagingMessages } from './DataChannelMessagingMessages';
import { DebugFilter } from './Filter';
import { LogMessages } from './LogMessages';
import { NotifyMessages } from './NotifyMessages';
import { PushMessages } from './PushMessages';
import { SendDataChannelMessagingMessage } from './SendDataChannelMessagingMessage';
import { SignalingMessages } from './SignalingMessages';
import { Stats } from './Stats';
import { TimelineMessages } from './TimelineMessages';

export const DebugPane: React.FC = () => {
  const debug = useAppSelector((state) => state.debug);
  const debugType = useAppSelector((state) => state.debugType);
  const dispatch = useAppDispatch();
  if (!debug) {
    return null;
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
      key === 'codec'
    ) {
      dispatch(setDebugType(key));
    }
  };
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
        <Tab eventKey="codec" title="Codec">
          <DebugFilter />
          <CapabilitiesCodec />
        </Tab>
      </Tabs>
    </div>
  );
};
