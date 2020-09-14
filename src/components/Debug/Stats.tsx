import React, { useEffect, useRef, useState } from "react";
import { Collapse } from "react-bootstrap";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/slice";

type Stats = {
  id: string;
  type: string;
  [x: string]: string;
};

const CollapseStats: React.FC<{ stats: Stats }> = (props) => {
  const [show, setShow] = useState(false);
  const { stats } = props;
  return (
    <div>
      <a className="debug-title" onClick={() => setShow(!show)} aria-controls={stats.id} aria-expanded={show}>
        <i className={show ? "arrow-bottom" : "arrow-right"} /> {stats.id}({stats.type})
      </a>
      <Collapse in={show}>
        <div className="ml-4">
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
  const intervalRef = useRef<NodeJS.Timer | null>(null);
  const initialStatsReport: Stats[] = [];
  const [statsReport, setStatsReport] = useState(initialStatsReport);
  const { soraContents } = useSelector((state: SoraDemoState) => state);
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  useEffect(() => {
    if (soraContents.sora === null) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    const createStats = async (): Promise<Stats[]> => {
      const newStatsReport: Stats[] = [];
      if (soraContents.sora && soraContents.sora.pc && soraContents.sora.pc.iceConnectionState !== "closed") {
        const report = await soraContents.sora.pc.getStats();
        report.forEach((s) => {
          newStatsReport.push(s);
        });
      }
      return newStatsReport;
    };
    createStats().then((stats) => {
      setStatsReport(stats);
    });
    intervalRef.current = setInterval(async () => {
      if (soraContents.sora && soraContents.sora.pc && soraContents.sora.pc.iceConnectionState !== "closed") {
        const stats = await createStats();
        setStatsReport(stats);
      }
    }, 3000);
  }, [soraContents.sora]);
  return (
    <>
      {statsReport.map((stats) => {
        return <CollapseStats key={stats.id} stats={stats} />;
      })}
    </>
  );
};

export default DebugGetStats;
