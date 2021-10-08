import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setEchoCancellation } from "@/app/slice";
import { ECHO_CANCELLATIONS } from "@/constants";
import { isEchoCancellation } from "@/utils";

export const FormEchoCancellation: React.FC = () => {
  const echoCancellation = useAppSelector((state) => state.echoCancellation);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isEchoCancellation(event.target.value)) {
      dispatch(setEchoCancellation(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="echoCancellation">
      <FormLabel>echoCancellation:</FormLabel>
      <FormSelect name="echoCancellation" value={echoCancellation} onChange={onChange}>
        {ECHO_CANCELLATIONS.map((value) => {
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
