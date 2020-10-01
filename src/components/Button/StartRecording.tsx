import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { startRec } from "@/api";
import { setErrorMessage, SoraDemoState } from "@/slice";

const StartRecording: React.FC = () => {
  const { channelId } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onClick = async (): Promise<void> => {
    try {
      await startRec(channelId);
    } catch (error) {
      dispatch(setErrorMessage(error.message));
    }
  };
  return (
    <div className="col-auto mb-1">
      <input className="btn btn-secondary" type="button" name="startRec" defaultValue="start rec" onClick={onClick} />
    </div>
  );
};

export default StartRecording;
