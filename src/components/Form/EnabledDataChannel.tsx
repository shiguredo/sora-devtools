import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setEnabledDataChannel, SoraDemoState } from "@/slice";

const EnabledDataChannel: React.FC = () => {
  const { enabledDataChannel } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledDataChannel(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <div className="form-check">
        <input
          id="enabledDataChannel"
          name="enabledDataChannel"
          className="form-check-input"
          type="checkbox"
          checked={enabledDataChannel}
          onChange={onChange}
        />
        <label className="form-check-label" htmlFor="enabledDataChannel">
          dataChannel
        </label>
      </div>
    </div>
  );
};

export default EnabledDataChannel;
