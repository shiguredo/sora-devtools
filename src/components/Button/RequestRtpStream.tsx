import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { SimulcastRid } from "sora-js-sdk";

import { requestRtpStream } from "@/api";
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage, SoraDemoState } from "@/slice";

type Props = {
  rid: SimulcastRid;
};
const RequestRtpStream: React.FC<Props> = (props) => {
  const { soraContents, channelId } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onClick = async (): Promise<void> => {
    if (!soraContents.sora?.connectionId) {
      return;
    }
    try {
      const response = await requestRtpStream(channelId, soraContents.sora.connectionId, props.rid);
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
        name={`requestSimulcastRidTo${props.rid.charAt(0).toUpperCase() + props.rid.slice(1)}`}
        defaultValue={`${props.rid} rid`}
        onClick={onClick}
      />
    </div>
  );
};

export default RequestRtpStream;
