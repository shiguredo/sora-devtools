import React from "react";
import { FormCheck, FormGroup } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setSimulcast } from "@/app/slice";
import { isFormDisabled } from "@/utils";

export const FormSimulcast: React.FC = () => {
  const simulcast = useAppSelector((state) => state.simulcast);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setSimulcast(event.target.checked));
  };
  return (
    <FormGroup className="form-inline" controlId="simulcast">
      <FormCheck
        type="switch"
        name="simulcast"
        label="simulcast"
        checked={simulcast}
        onChange={onChange}
        disabled={disabled}
      />
    </FormGroup>
  );
};
