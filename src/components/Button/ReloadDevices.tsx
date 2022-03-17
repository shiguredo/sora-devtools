import React from "react";

import { setMediaDevices } from "@/app/actions";
import { useAppDispatch } from "@/app/hooks";

export const ReloadDevices: React.FC = () => {
  const dispatch = useAppDispatch();
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
