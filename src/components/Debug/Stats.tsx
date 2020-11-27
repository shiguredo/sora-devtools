import React, { useState } from "react";
import { Collapse } from "react-bootstrap";
import { useSelector } from "react-redux";

import ButtonCopyLog from "@/components/Button/CopyLog";
import { SoraDemoState } from "@/slice";

interface RTCStatsWithIndexSignature extends RTCStats {
  [x: string]: string | number;
}

const CollapseStats: React.FC<{ stats: RTCStatsWithIndexSignature }> = (props) => {
  const [show, setShow] = useState(false);
  const { stats } = props;
  return (
    <div className="border border-light rounded my-2">
      <div className="d-flex justify-content-between align-items-center">
        <a className="debug-title" onClick={() => setShow(!show)} aria-controls={stats.id} aria-expanded={show}>
          <i className={show ? "arrow-bottom" : "arrow-right"} /> {stats.id}({stats.type})
        </a>
        <div className="border-left">
          <ButtonCopyLog text={JSON.stringify(stats, null, 2)} />
        </div>
      </div>
      <Collapse in={show}>
        <div className="border-top pl-4 py-1">
          {Object.keys(stats).map((key) => {
            if (key === "id" || key === "type") {
              return;
            }
            return (
              <div key={key} className="debug-message">
                <div className="pl-0 col-sm-4">{key}:</div>
                <div className="col-sm-8">
                  <pre>{stats[key]}</pre>
                </div>
              </div>
            );
          })}
        </div>
      </Collapse>
    </div>
  );
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
