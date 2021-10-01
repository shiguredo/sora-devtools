import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setEchoCancellation, SoraDemoState } from "@/app/slice";

const EchoCancellation: React.FC = () => {
  const { echoCancellation } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEchoCancellation(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <div className="form-check">
        <input
          id="echoCancellation"
          name="echoCancellation"
          className="form-check-input"
          type="checkbox"
          checked={echoCancellation}
          onChange={onChange}
        />
        <label className="form-check-label" htmlFor="echoCancellation">
          echoCancellation
        </label>
      </div>
    </div>
  );
};

export default EchoCancellation;
