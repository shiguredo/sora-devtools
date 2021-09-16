import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { SimulcastRid } from "sora-js-sdk";

import { requestRtpStream } from "@/api";
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage, SoraDemoState } from "@/app/slice";

type Props = {
  rid: SimulcastRid;
  sendConnectionId: string;
};
export const RequestRtpStreamBySendConnectionId: React.FC<Props> = (props) => {
  const { soraContents, channelId } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onClick = async (): Promise<void> => {
    if (!soraContents.sora?.connectionId) {
      return;
    }
    try {
      const response = await requestRtpStream(
        channelId,
        soraContents.sora.connectionId,
        props.rid,
        props.sendConnectionId
      );
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
