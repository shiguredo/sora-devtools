import React from "react";

import { connectSora } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";

export const ConnectButton: React.FC = () => {
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
        disabled={
          connectionStatus === "disconnecting" ||
          connectionStatus === "connecting" ||
          connectionStatus === "initializing"
        }
      />
    </div>
  );
};
