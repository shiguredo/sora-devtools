import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setMicDevice, SoraDemoState } from "@/app/slice";

const MicDevice: React.FC = () => {
  const micDevice = useSelector((state: SoraDemoState) => state.micDevice);
  const sora = useSelector((state: SoraDemoState) => state.soraContents.sora);
  const audio = useSelector((state: SoraDemoState) => state.audio);
  const disabled = !(sora ? sora.audio : audio);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setMicDevice(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <div className="custom-control custom-switch">
        <input
          type="checkbox"
          className="custom-control-input"
          id="micDevice"
          checked={micDevice}
          onChange={onChange}
          disabled={disabled}
        />
        <label className="custom-control-label" htmlFor="micDevice">
          micDevice on/off
        </label>
      </div>
    </div>
  );
};

export default MicDevice;
