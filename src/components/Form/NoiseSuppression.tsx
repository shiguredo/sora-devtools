import React from "react";
import { FormCheck, FormGroup } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setNoiseSuppression } from "@/app/slice";

export const FormNoiseSuppression: React.FC = () => {
  const noiseSuppression = useAppSelector((state) => state.noiseSuppression);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setNoiseSuppression(event.target.checked));
  };
  return (
    <FormGroup className="form-inline" controlId="noiseSuppression">
      <FormCheck
        type="switch"
        name="noiseSuppression"
        label="noiseSuppression"
        checked={noiseSuppression}
        onChange={onChange}
      />
    </FormGroup>
  );
};
