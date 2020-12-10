import React from "react";
import { useSelector } from "react-redux";

import Message from "@/components/Debug/Message";
import { SoraDemoState } from "@/slice";

interface RTCStatsWithIndexSignature extends RTCStats {
  [x: string]: string | number;
}

const CollapseStats: React.FC<{ stats: RTCStatsWithIndexSignature }> = (props) => {
  const { stats } = props;
  return <Message title={`${stats.id}(${stats.type})`} timestamp={null} description={stats} />;
};

const DebugGetStats: React.FC = () => {
  const { statsReport } = useSelector((state: SoraDemoState) => state.soraContents);
  return (
    <>
      {statsReport.map((stats) => {
        return <CollapseStats key={stats.id} stats={stats as RTCStatsWithIndexSignature} />;
      })}
    </>
  );
};

export default DebugGetStats;
