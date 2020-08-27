import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setFake, SoraDemoState } from "@/slice";

const FormFake: React.FC = () => {
  const { fake } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setFake(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap mb-1">
      <div className="form-check">
        <input id="fake" className="form-check-input" type="checkbox" checked={fake} onChange={onChange} />
        <label className="form-check-label" htmlFor="fake">
          fake
        </label>
      </div>
    </div>
  );
};

export default FormFake;
