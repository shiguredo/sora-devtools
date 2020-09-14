import React from "react";
import { useSelector } from "react-redux";
import { SimulcastQuality } from "sora-js-sdk";

import { requestSpotlightQuality } from "@/api";
import { SoraDemoState } from "@/slice";

type Props = {
  quality: SimulcastQuality;
};
const RequestSimulcastQuality: React.FC<Props> = (props) => {
  const { soraContents, channelId } = useSelector((state: SoraDemoState) => state);
  const onClick = (): void => {
    if (soraContents.sora?.connectionId) {
      requestSpotlightQuality(channelId, soraContents.sora.connectionId, props.quality);
    }
  };
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-secondary"
        type="button"
        name={`requestAllSimulcastQualityTo${props.quality.charAt(0).toUpperCase() + props.quality.slice(1)}`}
        defaultValue={`${props.quality} quality`}
        onClick={onClick}
      />
    </div>
  );
};

export default RequestSimulcastQuality;
