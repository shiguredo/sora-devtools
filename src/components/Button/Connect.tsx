import React from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { connectSora } from "@/app/slice";

export const Connect: React.FC = () => {
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const dispatch = useAppDispatch();
  const connect = (): void => {
    dispatch(connectSora());
  };
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-secondary"
        type="button"
        name="connect"
        defaultValue="connect"
        onClick={connect}
        disabled={connectionStatus === "disconnecting" || connectionStatus === "connecting"}
      />
    </div>
  );
};
