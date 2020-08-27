import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setSpotlight, SoraDemoState } from "@/slice";
import { isSpotlight } from "@/utils";

const FormSpotlight: React.FC = () => {
  const { spotlight } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isSpotlight(event.target.value)) {
      dispatch(setSpotlight(event.target.value));
    }
  };
  return (
    <div className="col-auto form-inline flex-nowrap mb-1">
      <label className="mr-1" htmlFor="spotlight">
        spotlight:
      </label>
      <select id="spotlight" className="custom-select" name="spotlight" value={spotlight} onChange={onChange}>
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

export default FormSpotlight;
