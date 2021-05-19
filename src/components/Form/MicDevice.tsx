import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setMicDevice, SoraDemoState } from "@/slice";

const MicDevice: React.FC = () => {
  const micDevice = useSelector((state: SoraDemoState) => state.micDevice);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setMicDevice(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <div className="custom-control custom-switch">
        <input type="checkbox" className="custom-control-input" id="micDevice" checked={micDevice} onChange={onChange} />
        <label className="custom-control-label" htmlFor="micDevice">micDevice on/off</label>
      </div>
    </div>
  );
};

export default MicDevice;
