import React from "react";
import { useSelector } from "react-redux";

import { resetSpotlightQuality } from "@/api";
import { SoraDemoState } from "@/slice";

type Props = {
  streamId: string;
};
const ResetSpotlightQualityByStreamId: React.FC<Props> = (props) => {
  const { soraContents, channelId } = useSelector((state: SoraDemoState) => state);
  const onClick = (): void => {
    if (soraContents.sora?.connectionId) {
      resetSpotlightQuality(channelId, soraContents.sora.connectionId, props.streamId);
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
