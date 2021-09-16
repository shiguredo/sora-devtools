import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setNoiseSuppression, SoraDemoState } from "@/app/slice";

export const NoiseSuppression: React.FC = () => {
  const { noiseSuppression } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setNoiseSuppression(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <div className="form-check">
        <input
          id="noiseSuppression"
          name="noiseSuppression"
          className="form-check-input"
          type="checkbox"
          checked={noiseSuppression}
          onChange={onChange}
        />
        <label className="form-check-label" htmlFor="noiseSuppression">
          noiseSuppression
        </label>
      </div>
    </div>
  );
};
