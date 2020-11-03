import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { SimulcastQuality } from "sora-js-sdk";

import { requestRtpStream } from "@/api";
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage, SoraDemoState } from "@/slice";

type Props = {
  quality: SimulcastQuality;
};
const RequestRtpStream: React.FC<Props> = (props) => {
  const { soraContents, channelId } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onClick = async (): Promise<void> => {
    if (!soraContents.sora?.connectionId) {
      return;
    }
    try {
      const response = await requestRtpStream(channelId, soraContents.sora.connectionId, props.quality);
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
        name={`requestSimulcastRidTo${props.quality.charAt(0).toUpperCase() + props.rid.slice(1)}`}
        defaultValue={`${props.rid} quality`}
        onClick={onClick}
      />
    </div>
  );
};

export default RequestRtpStream;
