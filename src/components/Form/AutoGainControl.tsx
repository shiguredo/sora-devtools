import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setAutoGainControl, SoraDemoState } from "@/slice";

const AutoGainControl: React.FC = () => {
  const { autoGainControl } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setAutoGainControl(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap mb-1">
      <div className="form-check">
        <input
          id="autoGainControl"
          className="form-check-input"
          type="checkbox"
          checked={autoGainControl}
          onChange={onChange}
        />
        <label className="form-check-label" htmlFor="autoGainControl">
          autoGainControl
        </label>
      </div>
    </div>
  );
};

export default AutoGainControl;
