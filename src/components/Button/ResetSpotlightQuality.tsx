import React from "react";
import { useSelector } from "react-redux";

import { resetSpotlightQuality } from "@/api";
import { SoraDemoState } from "@/slice";

const ResetSpotlightQuality: React.FC = () => {
  const { soraContents, channelId } = useSelector((state: SoraDemoState) => state);
  const onClick = (): void => {
    if (soraContents.sora?.connectionId) {
      resetSpotlightQuality(channelId, soraContents.sora.connectionId);
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

export default ResetSpotlightQuality;
