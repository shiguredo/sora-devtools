import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { setE2EE, SoraDemoState } from "@/slice";

const E2EE: React.FC = () => {
  const [displaySpinner, setDisplaySpinner] = useState(false);
  const { e2ee } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.checked) {
      setDisplaySpinner(true);
    }
    dispatch(setE2EE(event.target.checked));
  };
  useEffect(() => {
    if (e2ee) {
      setDisplaySpinner(false);
    }
  }, [e2ee]);
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <div className="form-check">
        <input id="e2ee" name="e2ee" className="form-check-input" type="checkbox" checked={e2ee} onChange={onChange} />
        <label className="form-check-label" htmlFor="e2ee">
          e2ee
        </label>
        {displaySpinner ? (
          <Spinner className="spinner-status" variant="primary" animation="border" role="status" />
        ) : null}
      </div>
    </div>
  );
};

export default E2EE;
