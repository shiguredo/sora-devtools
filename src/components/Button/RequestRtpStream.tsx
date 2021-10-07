import React from "react";
import { SimulcastRid } from "sora-js-sdk";

import { requestRtpStream } from "@/api";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage } from "@/app/slice";

type Props = {
  rid: SimulcastRid;
};
export const RequestRtpStream: React.FC<Props> = (props) => {
  const sora = useAppSelector((state) => state.soraContents.sora);
  const channelId = useAppSelector((state) => state.channelId);
  const dispatch = useAppDispatch();
  const onClick = async (): Promise<void> => {
    if (!sora?.connectionId) {
      return;
    }
    try {
      const response = await requestRtpStream(channelId, sora.connectionId, props.rid);
      dispatch(setAPIInfoAlertMessage(`POST successed. response: ${JSON.stringify(response)}`));
    } catch (error) {
      if (error instanceof Error) {
        dispatch(setAPIErrorAlertMessage(error.message));
      }
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
