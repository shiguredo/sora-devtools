import React from "react";
import { SimulcastRid } from "sora-js-sdk";

import { requestRtpStream } from "@/api";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage } from "@/app/slice";

type Props = {
  rid: SimulcastRid;
  sendConnectionId: string;
};
export const RequestRtpStreamBySendConnectionId: React.FC<Props> = (props) => {
  const sora = useAppSelector((state) => state.soraContents.sora);
  const apiUrl = useAppSelector((state) => state.apiUrl);
  const channelId = useAppSelector((state) => state.channelId);
  const dispatch = useAppDispatch();
  const onClick = async (): Promise<void> => {
    if (!sora?.connectionId) {
      return;
    }
    try {
      const response = await requestRtpStream(apiUrl, channelId, sora.connectionId, props.rid, props.sendConnectionId);
      dispatch(setAPIInfoAlertMessage(`POST successed. response: ${JSON.stringify(response)}`));
    } catch (error) {
      if (error instanceof Error) {
        dispatch(setAPIErrorAlertMessage(error.message));
      }
    }
  };
  return (
    <input
      className="btn btn-secondary btn-sm mx-1"
      type="button"
      name={`requestSimulcastRidTo${props.rid.charAt(0).toUpperCase() + props.rid.slice(1)}`}
      defaultValue={`${props.rid} rid`}
      onClick={onClick}
    />
  );
};
