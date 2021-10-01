import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { disconnectSora, SoraDemoState } from "@/app/slice";

const Disconnect: React.FC = () => {
  const connectionStatus = useSelector((state: SoraDemoState) => state.soraContents.connectionStatus);
  const dispatch = useDispatch();
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

export default Disconnect;
