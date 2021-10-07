import React from "react";

import { startRec } from "@/api";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage } from "@/app/slice";

export const StartRecording: React.FC = () => {
  const channelId = useAppSelector((state) => state.channelId);
  const dispatch = useAppDispatch();
  const onClick = async (): Promise<void> => {
    try {
      const response = await startRec(channelId);
      dispatch(setAPIInfoAlertMessage(`POST successed. response: ${JSON.stringify(response)}`));
    } catch (error) {
      if (error instanceof Error) {
        dispatch(setAPIErrorAlertMessage(error.message));
      }
    }
  };
  return (
    <div className="col-auto mb-1">
      <input className="btn btn-secondary" type="button" name="startRec" defaultValue="start rec" onClick={onClick} />
    </div>
  );
};
