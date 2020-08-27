import React from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { setDebugType, SoraDemoState } from "@/slice";

import LogMessages from "./_LogMessages";
import NotifyMessages from "./_NotifyMessages";
import Stats from "./_Stats";

const Pane: React.FC = () => {
  const { debugType } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onSelect = (key: string | null): void => {
    if (key === "log" || key === "notify" || key === "stats") {
      dispatch(setDebugType(key));
    }
  };
  return (
    <Tabs id="debug-tab" defaultActiveKey={debugType} onSelect={onSelect}>
      <Tab eventKey="log" title="Log">
        <LogMessages />
      </Tab>
      <Tab eventKey="notify" title="Notfiy">
        <NotifyMessages />
      </Tab>
      <Tab eventKey="stats" title="Stats">
        <Stats />
      </Tab>
    </Tabs>
  );
};

export default Pane;
