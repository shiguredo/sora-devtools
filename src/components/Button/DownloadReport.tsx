import React, { useRef } from "react";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/slice";

type Stats = {
  id: string;
  type: string;
  [x: string]: string;
};

const DownloadReport: React.FC = () => {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const { immutable, logMessages, notifyMessages } = useSelector((state: SoraDemoState) => state);
  const { sora } = immutable;
  const onClick = async (): Promise<void> => {
    const statsReport: Stats[] = [];
    if (sora && sora.pc && sora.pc.iceConnectionState !== "closed") {
      const stats = await sora.pc.getStats();
      stats.forEach((s) => {
        statsReport.push(s);
      });
    }
    const report = {
      log: logMessages,
      notify: notifyMessages,
      stats: statsReport,
    };
    const data = JSON.stringify(report);
    const blob = new Blob([data], { type: "text/plain" });
    window.URL = window.URL || window.webkitURL;
    if (anchorRef.current) {
      anchorRef.current.download = "report.json";
      anchorRef.current.href = window.URL.createObjectURL(blob);
      anchorRef.current.click();
    }
  };
  return (
    <>
      <input
        className="btn btn-light btn-sm ml-1"
        type="button"
        name="downloadReport"
        defaultValue="Download report"
        onClick={onClick}
      />
      <a ref={anchorRef} style={{ display: "none" }} />
    </>
  );
};

export default DownloadReport;
