import React from "react";
import { useDispatch } from "react-redux";

import { recvonlyConnectSora, sendonlyConnectSora, sendrecvConnectSora } from "@/slice";

type Props = {
  connectType: "sendonly" | "sendrecv" | "recvonly";
  multistream: boolean;
  spotlight: boolean;
  simulcast: boolean;
};
const Connect: React.FC<Props> = (props) => {
  const dispatch = useDispatch();
  const connect = (): void => {
    const connectOptions = {
      multistream: props.multistream,
      spotlight: props.spotlight,
      simulcast: props.simulcast,
    };
    if (props.connectType === "sendonly") {
      dispatch(sendonlyConnectSora(connectOptions));
    } else if (props.connectType === "recvonly") {
      dispatch(recvonlyConnectSora(connectOptions));
    } else if (props.connectType === "sendrecv") {
      dispatch(sendrecvConnectSora(connectOptions));
    }
  };
  return (
    <div className="col-auto mb-1">
      <input className="btn btn-secondary" type="button" name="connect" defaultValue="connect" onClick={connect} />
    </div>
  );
};

export default Connect;
