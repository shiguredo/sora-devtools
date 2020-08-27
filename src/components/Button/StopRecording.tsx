import React from "react";
import { useSelector } from "react-redux";

import { stopRec } from "@/api";
import { SoraDemoState } from "@/slice";

const StopRecording: React.FC = () => {
  const { channelId } = useSelector((state: SoraDemoState) => state);
  const onClick = (): void => {
    stopRec(channelId);
  };
  return (
    <div className="col-auto mb-1">
      <input className="btn btn-secondary" type="button" name="stopRec" defaultValue="stop rec" onClick={onClick} />
    </div>
  );
};

export default StopRecording;
