import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { startRec } from "@/api";
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage, SoraDemoState } from "@/app/slice";

export const StartRecording: React.FC = () => {
  const { channelId } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
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
