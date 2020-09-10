import React from "react";
import { useSelector } from "react-redux";

import { resetSimulcastQuality } from "@/api";
import { SoraDemoState } from "@/slice";

const ResetSimulcastQuality: React.FC = () => {
  const { immutable, channelId } = useSelector((state: SoraDemoState) => state);
  const onClick = (): void => {
    if (immutable.sora?.connectionId) {
      resetSimulcastQuality(channelId, immutable.sora.connectionId);
    }
  };
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-secondary"
        type="button"
        name="resetAllSimulcastQuality"
        defaultValue="reset quality"
        onClick={onClick}
      />
    </div>
  );
};

export default ResetSimulcastQuality;
