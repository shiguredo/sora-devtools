import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setDebug, SoraDemoState } from "@/slice";

const FormDebug: React.FC = () => {
  const { debug } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setDebug(event.target.checked));
  };
  return (
    <div className="custom-control custom-checkbox">
      <input
        id="debug"
        className="custom-control-input"
        type="checkbox"
        name="debug"
        checked={debug}
        onChange={onChange}
      />
      <label className="mb-0 ml-1 custom-control-label" htmlFor="debug">
        debug
      </label>
    </div>
  );
};

export default FormDebug;
