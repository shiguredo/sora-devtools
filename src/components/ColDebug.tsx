import React from "react";
import { Tab, Tabs } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setDebugType } from "@/app/slice";
import { DataChannelMessages } from "@/components/Debug/DataChannelMessages";
import { LogMessages } from "@/components/Debug/LogMessages";
import { NotifyMessages } from "@/components/Debug/NotifyMessages";
import { PushMessages } from "@/components/Debug/PushMessages";
import { SignalingMessages } from "@/components/Debug/SignalingMessages";
import { SignalingURL } from "@/components/Debug/SignalingURL";
import { Stats } from "@/components/Debug/Stats";
import { TimelineMessages } from "@/components/Debug/TimelineMessages";

export const ColDebug: React.FC = () => {
  const debug = useAppSelector((state) => state.debug);
  const debugType = useAppSelector((state) => state.debugType);
  const dispatch = useAppDispatch();
  if (!debug) {
    return null;
  }
  const onSelect = (key: string | null): void => {
    if (key === "log" || key === "notify" || key === "push" || key === "stats" || key === "timeline") {
      dispatch(setDebugType(key));
    }
  };
  return (
    <div className="col-debug col-6">
      <SignalingURL />
      <Tabs id="debug-tab" className="mt-2" defaultActiveKey={debugType} onSelect={onSelect}>
        <Tab eventKey="timeline" title="Timeline">
          <TimelineMessages />
        </Tab>
        <Tab eventKey="signaling" title="Signaling">
          <SignalingMessages />
        </Tab>
        <Tab eventKey="notify" title="Notfiy">
          <NotifyMessages />
        </Tab>
        <Tab eventKey="push" title="Push">
          <PushMessages />
        </Tab>
        <Tab eventKey="stats" title="Stats">
          <Stats />
        </Tab>
        <Tab eventKey="log" title="Log">
          <LogMessages />
        </Tab>
        <Tab eventKey="messaging" title="Messaging">
          <DataChannelMessages />
        </Tab>
      </Tabs>
    </div>
  );
};
