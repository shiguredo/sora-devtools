import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setEnabledClientId, SoraDemoState } from "@/app/slice";

const EnabledClientId: React.FC = () => {
  const { enabledClientId } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledClientId(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <div className="form-check">
        <input
          id="enabledClientId"
          name="enabledClientId"
          className="form-check-input"
          type="checkbox"
          checked={enabledClientId}
          onChange={onChange}
        />
        <label className="form-check-label" htmlFor="enabledClientId">
          clientId
        </label>
      </div>
    </div>
  );
};

export default EnabledClientId;
