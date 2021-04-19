import React from "react";
import { useSelector } from "react-redux";

import Message from "@/components/Debug/Message";
import { SoraDemoState } from "@/slice";

interface RTCStatsWithIndexSignature extends RTCStats {
  [x: string]: string | number;
}

const Collapse: React.FC<RTCStatsWithIndexSignature> = (props) => {
  return <Message title={`${props.id}(${props.type})`} timestamp={null} description={props} />;
};

const Log = React.memo((props: RTCStatsWithIndexSignature) => {
  return <Collapse {...props} />;
});

const DebugGetStats: React.FC = () => {
  const { statsReport } = useSelector((state: SoraDemoState) => state.soraContents);
  return (
    <>
      {statsReport.map((stats) => {
        return <Log key={stats.id} {...(stats as RTCStatsWithIndexSignature)} />;
      })}
    </>
  );
};

export default DebugGetStats;
