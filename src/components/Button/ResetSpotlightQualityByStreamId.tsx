import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { resetSpotlightQuality } from "@/api";
import { setErrorMessage, SoraDemoState } from "@/slice";

type Props = {
  streamId: string;
};
const ResetSpotlightQualityByStreamId: React.FC<Props> = (props) => {
  const { soraContents, channelId } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onClick = async (): Promise<void> => {
    if (!soraContents.sora?.connectionId) {
      return;
    }
    try {
      await resetSpotlightQuality(channelId, soraContents.sora.connectionId, props.streamId);
    } catch (error) {
      dispatch(setErrorMessage(error.message));
    }
  };
  return (
    <input
      className="btn btn-secondary btn-sm mb-1 mx-1"
      type="button"
      name="resetSimulcastQuality"
      defaultValue="reset quality"
      onClick={onClick}
    />
  );
};

export default ResetSpotlightQualityByStreamId;
