import React from "react";

import { useAppSelector } from "@/app/hooks";
import { Message } from "@/components/Debug/Message";

interface RTCStatsWithIndexSignature extends RTCStats {
  [x: string]: string | number | undefined;
}

const Collapse: React.FC<RTCStatsWithIndexSignature> = (props) => {
  return <Message title={`${props.id}(${props.type})`} timestamp={null} description={props} />;
};

const Log = React.memo((props: RTCStatsWithIndexSignature) => {
  return <Collapse {...props} />;
});

export const Stats: React.FC = () => {
  const statsReport = useAppSelector((state) => state.soraContents.statsReport);
  return (
    <>
      {statsReport.map((stats) => {
        return <Log key={stats.id} {...(stats as RTCStatsWithIndexSignature)} />;
      })}
    </>
  );
};
