import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { SimulcastQuality } from "sora-js-sdk";

import { changeSimulcastQuality } from "@/api";
import { setErrorMessage, SoraDemoState } from "@/slice";

type Props = {
  quality: SimulcastQuality;
  streamId: string;
};
const ChangeSimulcastQualityByStreamId: React.FC<Props> = (props) => {
  const { soraContents, channelId } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onClick = async (): Promise<void> => {
    if (!soraContents.sora?.connectionId) {
      return;
    }
    try {
      await changeSimulcastQuality(channelId, soraContents.sora.connectionId, props.quality, props.streamId);
    } catch (error) {
      dispatch(setErrorMessage(error.message));
    }
  };
  return (
    <input
      className="btn btn-secondary btn-sm mb-1 mx-1"
      type="button"
      name={`changeSimulcastQualityTo${props.quality.charAt(0).toUpperCase() + props.quality.slice(1)}`}
      defaultValue={`${props.quality} quality`}
      onClick={onClick}
    />
  );
};

export default ChangeSimulcastQualityByStreamId;
