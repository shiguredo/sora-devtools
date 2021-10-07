import React from "react";
import { FormCheck, FormGroup } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setEchoCancellation } from "@/app/slice";

export const FormEchoCancellation: React.FC = () => {
  const echoCancellation = useAppSelector((state) => state.echoCancellation);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEchoCancellation(event.target.checked));
  };
  return (
    <FormGroup className="form-inline" controlId="echoCancellation">
      <FormCheck
        type="switch"
        name="echoCancellation"
        label="echoCancellation"
        checked={echoCancellation}
        onChange={onChange}
      />
    </FormGroup>
  );
};
