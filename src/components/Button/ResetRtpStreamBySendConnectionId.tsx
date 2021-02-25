import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { resetRtpStream } from "@/api";
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage, SoraDemoState } from "@/slice";

type Props = {
  sendConnectionId: string;
};
const ResetRtpStreamBySendConnectionId: React.FC<Props> = (props) => {
  const { soraContents, channelId } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onClick = async (): Promise<void> => {
    if (!soraContents.sora?.connectionId) {
      return;
    }
    try {
      const response = await resetRtpStream(channelId, soraContents.sora.connectionId, props.sendConnectionId);
      dispatch(setAPIInfoAlertMessage(`POST successed. response: ${JSON.stringify(response)}`));
    } catch (error) {
      dispatch(setAPIErrorAlertMessage(error.message));
    }
  };
  return (
    <input
      className="btn btn-secondary btn-sm mx-1"
      type="button"
      name="resetRtpStream"
      defaultValue="reset rid"
      onClick={onClick}
    />
  );
};

export default ResetRtpStreamBySendConnectionId;
