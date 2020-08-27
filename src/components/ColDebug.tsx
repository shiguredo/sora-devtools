import React from "react";
import { useSelector } from "react-redux";

import DebugPane from "@/components/Debug/Pane";
import { SoraDemoState } from "@/slice";

const ColDebug: React.FC = () => {
  const { debug } = useSelector((state: SoraDemoState) => state);
  if (!debug) return null;
  return (
    <div className="col-debug col-6">
      <DebugPane />
    </div>
  );
};

export default ColDebug;
