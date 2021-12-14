import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setEchoCancellationType } from "@/app/slice";
import { ECHO_CANCELLATION_TYPES } from "@/constants";
import { isEchoCancellationType } from "@/utils";

export const FormEchoCancellationType: React.FC = () => {
  const echoCancellationType = useAppSelector((state) => state.echoCancellationType);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isEchoCancellationType(event.target.value)) {
      dispatch(setEchoCancellationType(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="echoCancellationType">
      <FormLabel>echoCancellationType:</FormLabel>
      <FormSelect name="echoCancellationType" value={echoCancellationType} onChange={onChange}>
        {ECHO_CANCELLATION_TYPES.map((value) => {
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
