import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setE2EE, SoraDemoState } from "@/slice";

const E2EE: React.FC = () => {
  const { e2ee } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setE2EE(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap mb-1">
      <div className="form-check">
        <input id="e2ee" name="e2ee" className="form-check-input" type="checkbox" checked={e2ee} onChange={onChange} />
        <label className="form-check-label" htmlFor="e2ee">
          e2ee
        </label>
      </div>
    </div>
  );
};

export default E2EE;
