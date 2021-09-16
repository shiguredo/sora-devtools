import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setEnabledSignalingNotifyMetadata, SoraDemoState } from "@/app/slice";

export const EnabledSignalingNotifyMetadata: React.FC = () => {
  const { enabledSignalingNotifyMetadata } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledSignalingNotifyMetadata(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <div className="form-check">
        <input
          id="enabledSignalingNotifyMetadata"
          name="enabledSignalingNotifyMetadata"
          className="form-check-input"
          type="checkbox"
          checked={enabledSignalingNotifyMetadata}
          onChange={onChange}
        />
        <label className="form-check-label" htmlFor="enabledSignalingNotifyMetadata">
          signalingNotifyMetadata
        </label>
      </div>
    </div>
  );
};
