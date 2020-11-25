import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setEnabledSignalingNotifyMetadata, SoraDemoState } from "@/slice";

const EnabledSignalingNotifyMetadata: React.FC = () => {
  const { enabledSignalingNotifyMetadata } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledSignalingNotifyMetadata(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap mb-1">
      <div className="form-check">
        <input
          id="enabledSignalingNotifyMetadata"
          name="enabledSignalingNotifyMetadata"
          className="form-check-input"
          type="checkbox"
          checked={enabledSignalingNotifyMetadata}
          onChange={onChange}
        />
        <label className="form-check-label mr-1" htmlFor="enabledSignalingNotifyMetadata">
          signalingNotifyMetadata
        </label>
      </div>
    </div>
  );
};

export default EnabledSignalingNotifyMetadata;
