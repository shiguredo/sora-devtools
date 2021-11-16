import React from "react";

import { resetSpotlightRid } from "@/api";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage } from "@/app/slice";

type Props = {
  sendConnectionId: string;
};
export const ResetSpotlightRidBySendConnectionId: React.FC<Props> = (props) => {
  const sora = useAppSelector((state) => state.soraContents.sora);
  const channelId = useAppSelector((state) => state.channelId);
  const dispatch = useAppDispatch();
  const onClick = async (): Promise<void> => {
    if (!sora?.connectionId) {
      return;
    }
    try {
      const response = await resetSpotlightRid(channelId, sora.connectionId, props.sendConnectionId);
      dispatch(setAPIInfoAlertMessage(`POST successed. response: ${JSON.stringify(response)}`));
    } catch (error) {
      if (error instanceof Error) {
        dispatch(setAPIErrorAlertMessage(error.message));
      }
    }
  };
  return (
    <input
      className="btn btn-secondary mx-1"
      type="button"
      name="resetSpotlightRid"
      defaultValue="resetSpotlightRid"
      onClick={onClick}
    />
  );
};
