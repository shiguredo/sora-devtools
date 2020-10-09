import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { resetSpotlightQuality } from "@/api";
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage, SoraDemoState } from "@/slice";

const ResetSpotlightQuality: React.FC = () => {
  const { soraContents, channelId } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onClick = async (): Promise<void> => {
    if (!soraContents.sora?.connectionId) {
      return;
    }
    try {
      const response = await resetSpotlightQuality(channelId, soraContents.sora.connectionId);
      dispatch(setAPIInfoAlertMessage(`POST successed. response: ${JSON.stringify(response)}`));
    } catch (error) {
      dispatch(setAPIErrorAlertMessage(error.message));
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
