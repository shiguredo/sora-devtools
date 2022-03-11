import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setSimulcast } from "@/app/slice";
import { SIMULCAST } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

export const SimulcastForm: React.FC = () => {
  const simulcast = useAppSelector((state) => state.simulcast);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, SIMULCAST)) {
      dispatch(setSimulcast(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="simulcast">
      <FormLabel>simulcast:</FormLabel>
      <FormSelect name="simulcast" value={simulcast} onChange={onChange} disabled={disabled}>
        {SIMULCAST.map((value) => {
          return (
            <option key={value} value={value}>
              {value === "" ? "未指定" : value}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
};
