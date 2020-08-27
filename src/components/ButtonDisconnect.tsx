import React from "react";
import { useDispatch } from "react-redux";

import { disconnectSora } from "@/slice";

const ButtonDisconnect: React.FC = () => {
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
      />
    </div>
  );
};

export default ButtonDisconnect;
