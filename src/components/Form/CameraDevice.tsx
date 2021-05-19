import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setCameraDevice, SoraDemoState } from "@/slice";

const CameraDevice: React.FC = () => {
  const cameraDevice = useSelector((state: SoraDemoState) => state.cameraDevice);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setCameraDevice(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <div className="custom-control custom-switch">
        <input type="checkbox" className="custom-control-input" id="cameraDevice" checked={cameraDevice} onChange={onChange} />
        <label className="custom-control-label" htmlFor="cameraDevice">cameraDevice on/off</label>
      </div>
    </div>
  );
};

export default CameraDevice;
