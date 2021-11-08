import React from "react";
import { FormCheck, FormGroup } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setReconnect } from "@/app/slice";

export const FormReconnect: React.FC = () => {
  const reconnect = useAppSelector((state) => state.reconnect);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setReconnect(event.target.checked));
  };
  return (
    <FormGroup className="form-inline" controlId="reconnect">
      <FormCheck type="switch" name="reconnect" label="reconnect" checked={reconnect} onChange={onChange} />
    </FormGroup>
  );
};
