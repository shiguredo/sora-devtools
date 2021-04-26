import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { IGNORE_DISCONNECT_WEBSOCKET } from "@/constants";
import { setIgnoreDisconnectWebSocket, SoraDemoState } from "@/slice";
import { isIgnoreDisconnectWebSocket } from "@/utils";

const IgnoreDisconnectWebSocket: React.FC = () => {
  const ignoreDisconnectWebSocket = useSelector((state: SoraDemoState) => state.ignoreDisconnectWebSocket);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isIgnoreDisconnectWebSocket(event.target.value)) {
      dispatch(setIgnoreDisconnectWebSocket(event.target.value));
    }
  };
  return (
    <div className="col-auto form-inline flex-nowrap mb-1">
      <label className="mr-1" htmlFor="ignoreDisconnectWebSocket">
        IgnoreDisconnectWebSocket:
      </label>
      <select
        id="ignoreDisconnectWebSocket"
        name="ignoreDisconnectWebSocket"
        className="custom-select"
        value={ignoreDisconnectWebSocket}
        onChange={onChange}
      >
        {IGNORE_DISCONNECT_WEBSOCKET.map((value) => {
          return (
            <option key={value} value={value}>
              {value === "" ? "未指定" : value}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default IgnoreDisconnectWebSocket;
