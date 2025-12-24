import type React from "react";
import { useMemo } from "react";

import { useSoraDevtoolsStore } from "@/app/store";

import { Message } from "./Message.tsx";

interface RTCStatsWithIndexSignature extends RTCStats {
  [x: string]: unknown;
}

type CollapseProps = {
  prevStats?: RTCStatsWithIndexSignature;
} & RTCStatsWithIndexSignature;

const Collapse: React.FC<CollapseProps> = (props) => {
  const { prevStats, ...stats } = props;
  return (
    <Message
      title={`${stats.id}(${stats.type})`}
      timestamp={null}
      description={stats}
      prevDescription={prevStats}
    />
  );
};

const Log: React.FC<CollapseProps> = (props) => {
  return <Collapse {...props} />;
};

export const Stats: React.FC = () => {
  const statsReport = useSoraDevtoolsStore((state) => state.soraContents.statsReport);
  const prevStatsReport = useSoraDevtoolsStore((state) => state.soraContents.prevStatsReport);
  const debugFilterText = useSoraDevtoolsStore((state) => state.debugFilterText);

  // prevStatsReport を Map 化して O(1) で参照できるようにする
  const prevStatsMap = useMemo(
    () => new Map(prevStatsReport.map((stats) => [stats.id, stats])),
    [prevStatsReport],
  );

  const filteredMessages = statsReport.filter((message) => {
    return debugFilterText.split(" ").every((filterText) => {
      if (filterText === "") {
        return true;
      }
      return JSON.stringify(message).indexOf(filterText) >= 0;
    });
  });
  return (
    <div className="debug-messages">
      {filteredMessages.map((stats) => {
        // O(1) で前回の同じ id の stats を取得
        const prevStats = prevStatsMap.get(stats.id);
        return (
          <Log
            key={stats.id}
            {...(stats as RTCStatsWithIndexSignature)}
            prevStats={prevStats as RTCStatsWithIndexSignature | undefined}
          />
        );
      })}
    </div>
  );
};
