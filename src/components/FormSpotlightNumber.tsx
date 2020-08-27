import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { SPOTLIGHT_NUMBERS } from "@/constants";
import { setSpotlightNumber, SoraDemoState } from "@/slice";
import { isSpotlightNumber } from "@/utils";

const FormSpotlightNumber: React.FC = () => {
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
        className="custom-select"
        name="spotlightNumber"
        value={spotlightNumber}
        onChange={onChange}
      >
        {SPOTLIGHT_NUMBERS.map((spotlightNumber) => {
          return (
            <option key={spotlightNumber} value={spotlightNumber}>
              {spotlightNumber}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default FormSpotlightNumber;
