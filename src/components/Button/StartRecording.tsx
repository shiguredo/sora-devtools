import React from "react";
import { useSelector } from "react-redux";

import { startRec } from "@/api";
import { SoraDemoState } from "@/slice";

const StartRecording: React.FC = () => {
  const { channelId } = useSelector((state: SoraDemoState) => state);
  const onClick = (): void => {
    startRec(channelId);
  };
  return (
    <div className="col-auto mb-1">
      <input className="btn btn-secondary" type="button" name="startRec" defaultValue="start rec" onClick={onClick} />
    </div>
  );
};

export default StartRecording;
