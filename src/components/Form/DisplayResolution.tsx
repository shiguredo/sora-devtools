import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setDisplayResolution, SoraDemoState } from "@/app/slice";
import { isDisplayResolution } from "@/utils";

const DisplayResolution: React.FC = () => {
  const { displayResolution } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isDisplayResolution(event.target.value)) {
      dispatch(setDisplayResolution(event.target.value));
    }
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <label className="mr-1" htmlFor="resolution">
        displayResolution:
      </label>
      <select
        id="displayResolution"
        name="displayResolution"
        className="custom-select"
        value={displayResolution}
        onChange={onChange}
      >
        <option value="">未指定</option>
        <option value="VGA">VGA</option>
        <option value="QVGA">QVGA</option>
      </select>
    </div>
  );
};

export default DisplayResolution;
