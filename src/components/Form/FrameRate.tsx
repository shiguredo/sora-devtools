import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setFrameRate, SoraDemoState } from "@/slice";
import { isFrameRate } from "@/utils";

const FrameRate: React.FC = () => {
  const { frameRate } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isFrameRate(event.target.value)) {
      dispatch(setFrameRate(event.target.value));
    }
  };
  return (
    <div className="col-auto form-inline flex-nowrap mb-1">
      <label className="mr-1" htmlFor="frameRate">
        frameRate:
      </label>
      <select id="frameRate" className="custom-select" name="frameRate" value={frameRate} onChange={onChange}>
        <option value="">未指定</option>
        <option value="60">60</option>
        <option value="30">30</option>
        <option value="24">24</option>
        <option value="20">20</option>
        <option value="15">15</option>
        <option value="10">10</option>
      </select>
    </div>
  );
};

export default FrameRate;
