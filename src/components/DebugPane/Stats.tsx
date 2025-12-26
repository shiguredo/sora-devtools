import { useMemo } from "react";

import { debugFilterText, prevStatsReport, statsReport } from "@/app/signals";

import { Message } from "./Message.tsx";

interface RTCStatsWithIndexSignature extends RTCStats {
  [x: string]: unknown;
}

type CollapseProps = {
  prevStats?: RTCStatsWithIndexSignature;
} & RTCStatsWithIndexSignature;

function Collapse(props: CollapseProps) {
  const { prevStats, ...stats } = props;
  return (
    <Message
      title={`${stats.id}(${stats.type})`}
      timestamp={null}
      description={stats}
      prevDescription={prevStats}
    />
  );
}

function Log(props: CollapseProps) {
  return <Collapse {...props} />;
}

export function Stats() {
  const statsReportValue = statsReport.value;
  const prevStatsReportValue = prevStatsReport.value;
  const debugFilterTextValue = debugFilterText.value;

  // prevStatsReport を Map 化して O(1) で参照できるようにする
  const prevStatsMap = useMemo(
    () => new Map(prevStatsReportValue.map((stats) => [stats.id, stats])),
    [prevStatsReportValue],
  );

  const filteredMessages = statsReportValue.filter((message) => {
    return debugFilterTextValue.split(" ").every((filterText) => {
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
}
