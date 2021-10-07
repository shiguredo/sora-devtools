import React from "react";
import { FormCheck, FormGroup } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setAutoGainControl } from "@/app/slice";

export const FormAutoGainControl: React.FC = () => {
  const autoGainControl = useAppSelector((state) => state.autoGainControl);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setAutoGainControl(event.target.checked));
  };
  return (
    <FormGroup className="form-inline" controlId="autoGainControl">
      <FormCheck
        type="switch"
        name="autoGainControl"
        label="autoGainControl"
        checked={autoGainControl}
        onChange={onChange}
      />
    </FormGroup>
  );
};
