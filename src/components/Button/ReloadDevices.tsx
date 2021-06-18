import React from "react";
import { useDispatch } from "react-redux";

import { setMediaDevices } from "@/slice";

const ReloadDevices: React.FC = () => {
  const dispatch = useDispatch();
  const onClick = (): void => {
    dispatch(setMediaDevices());
  };
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-outline-secondary"
        type="button"
        name="update-devices"
        defaultValue="update-devices"
        onClick={onClick}
      />
    </div>
  );
};

export default ReloadDevices;
