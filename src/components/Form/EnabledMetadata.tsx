import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setEnabledMetadata, SoraDemoState } from "@/app/slice";

const EnabledMetadata: React.FC = () => {
  const { enabledMetadata } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledMetadata(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <div className="form-check">
        <input
          id="enabledMetadata"
          name="enabledMetadata"
          className="form-check-input"
          type="checkbox"
          checked={enabledMetadata}
          onChange={onChange}
        />
        <label className="form-check-label" htmlFor="enabledMetadata">
          metadata
        </label>
      </div>
    </div>
  );
};

export default EnabledMetadata;
