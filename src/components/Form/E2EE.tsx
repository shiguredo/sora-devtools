import React, { useEffect, useState } from "react";
import { FormCheck, FormGroup, Spinner } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setE2EE } from "@/app/slice";

export const FormE2EE: React.FC = () => {
  const [displaySpinner, setDisplaySpinner] = useState(false);
  const e2ee = useAppSelector((state) => state.e2ee);
  const dispatch = useAppDispatch();
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
    <FormGroup className="form-inline" controlId="e2ee">
      <FormCheck type="switch" name="e2ee" label="e2ee" checked={e2ee} onChange={onChange} />
      {displaySpinner ? (
        <Spinner className="spinner-status" variant="primary" animation="border" role="status" />
      ) : null}
    </FormGroup>
  );
};
