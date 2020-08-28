import React from "react";
import { useSelector } from "react-redux";
import { SimulcastQuality } from "sora-js-sdk";

import { changeSimulcastQuality } from "@/api";
import { SoraDemoState } from "@/slice";

type Props = {
  quality: SimulcastQuality;
};
const ChangeSimulcastQuality: React.FC<Props> = (props) => {
  const { immutable, channelId } = useSelector((state: SoraDemoState) => state);
  const onClick = (): void => {
    if (immutable.sora?.connectionId) {
      changeSimulcastQuality(channelId, immutable.sora.connectionId, props.quality);
    }
  };
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-secondary"
        type="button"
        name={`changeSimulcastQualityTo${props.quality.charAt(0).toUpperCase() + props.quality.slice(1)}`}
        defaultValue={`${props.quality} quality`}
        onClick={onClick}
      />
    </div>
  );
};

export default ChangeSimulcastQuality;
