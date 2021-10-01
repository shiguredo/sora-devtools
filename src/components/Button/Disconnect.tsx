import React from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { disconnectSora } from "@/app/slice";

export const Disconnect: React.FC = () => {
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const dispatch = useAppDispatch();
  const disconnect = (): void => {
    dispatch(disconnectSora());
  };
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-secondary"
        type="button"
        name="disconnect"
        defaultValue="disconnect"
        onClick={disconnect}
        disabled={connectionStatus === "disconnecting" || connectionStatus === "connecting"}
      />
    </div>
  );
};
