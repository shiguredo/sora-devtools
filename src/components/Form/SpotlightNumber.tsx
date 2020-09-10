import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setSpotlightNumber, SoraDemoState } from "@/slice";
import { isSpotlightNumber } from "@/utils";

const SpotlightNumber: React.FC = () => {
  const { spotlightNumber } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isSpotlightNumber(event.target.value)) {
      dispatch(setSpotlightNumber(event.target.value));
    }
  };
  return (
    <div className="col-auto form-inline flex-nowrap mb-1">
      <label className="mr-1" htmlFor="spotlightNumber">
        spotlightNumber:
      </label>
      <select
        id="spotlightNumber"
        name="spotlightNumber"
        className="custom-select"
        value={spotlightNumber}
        onChange={onChange}
      >
        <option value="">未指定</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
        <option value="7">7</option>
        <option value="8">8</option>
      </select>
    </div>
  );
};

export default SpotlightNumber;
