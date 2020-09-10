import React from "react";
import { useSelector } from "react-redux";

import { resetSimulcastQuality } from "@/api";
import { SoraDemoState } from "@/slice";

type Props = {
  streamId: string;
};
const ResetSimulcastQualityByStreamId: React.FC<Props> = (props) => {
  const { immutable, channelId } = useSelector((state: SoraDemoState) => state);
  const onClick = (): void => {
    if (immutable.sora?.connectionId) {
      resetSimulcastQuality(channelId, immutable.sora.connectionId, props.streamId);
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

export default ResetSimulcastQualityByStreamId;
