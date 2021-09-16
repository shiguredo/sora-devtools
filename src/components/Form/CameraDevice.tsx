import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setCameraDevice, SoraDemoState } from "@/app/slice";

export const CameraDevice: React.FC = () => {
  const cameraDevice = useSelector((state: SoraDemoState) => state.cameraDevice);
  const sora = useSelector((state: SoraDemoState) => state.soraContents.sora);
  const video = useSelector((state: SoraDemoState) => state.video);
  const disabled = !(sora ? sora.video : video);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setCameraDevice(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <div className="custom-control custom-switch">
        <input
          type="checkbox"
          className="custom-control-input"
          id="cameraDevice"
          checked={cameraDevice}
          onChange={onChange}
          disabled={disabled}
        />
        <label className="custom-control-label" htmlFor="cameraDevice">
          cameraDevice on/off
        </label>
      </div>
    </div>
  );
};
