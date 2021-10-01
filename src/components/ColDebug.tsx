import React from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { setDebugType, SoraDemoState } from "@/app/slice";
import DebugDataChannelMessages from "@/components/Debug/DataChannelMessages";
import DebugLogMessages from "@/components/Debug/LogMessages";
import DebugNotifyMessages from "@/components/Debug/NotifyMessages";
import DebugPushMessages from "@/components/Debug/PushMessages";
import DebugSignalingMessages from "@/components/Debug/SignalingMessages";
import DebugSignalingURL from "@/components/Debug/SignalingURL";
import DebugStats from "@/components/Debug/Stats";
import DebugTimelineMessages from "@/components/Debug/TimelineMessages";

const ColDebug: React.FC = () => {
  const { debug, debugType } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
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
      <DebugSignalingURL />
      <Tabs id="debug-tab" className="mt-2" defaultActiveKey={debugType} onSelect={onSelect}>
        <Tab eventKey="timeline" title="Timeline">
          <DebugTimelineMessages />
        </Tab>
        <Tab eventKey="signaling" title="Signaling">
          <DebugSignalingMessages />
        </Tab>
        <Tab eventKey="notify" title="Notfiy">
          <DebugNotifyMessages />
        </Tab>
        <Tab eventKey="push" title="Push">
          <DebugPushMessages />
        </Tab>
        <Tab eventKey="stats" title="Stats">
          <DebugStats />
        </Tab>
        <Tab eventKey="log" title="Log">
          <DebugLogMessages />
        </Tab>
        <Tab eventKey="messaging" title="Messaging">
          <DebugDataChannelMessages />
        </Tab>
      </Tabs>
    </div>
  );
};

export default ColDebug;
