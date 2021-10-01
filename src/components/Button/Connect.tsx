import React from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { recvonlyConnectSora, sendonlyConnectSora, sendrecvConnectSora } from "@/app/slice";

type Props = {
  multistream: boolean;
  spotlight: boolean;
  simulcast: boolean;
};
export const Connect: React.FC<Props> = (props) => {
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const role = useAppSelector((state) => state.role);
  const dispatch = useAppDispatch();
  const connect = (): void => {
    const connectOptions = {
      multistream: props.multistream,
      spotlight: props.spotlight,
      simulcast: props.simulcast,
    };
    if (role === "sendonly") {
      dispatch(sendonlyConnectSora(connectOptions));
    } else if (role === "recvonly") {
      dispatch(recvonlyConnectSora(connectOptions));
    } else if (role === "sendrecv") {
      dispatch(sendrecvConnectSora(connectOptions));
    }
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
