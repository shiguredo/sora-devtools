import React from "react";
import { FormGroup, FormSelect } from "react-bootstrap";

import { setEchoCancellation } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { ECHO_CANCELLATIONS } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel";

export const EchoCancellationForm: React.FC = () => {
  const echoCancellation = useAppSelector((state) => state.echoCancellation);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, ECHO_CANCELLATIONS)) {
      dispatch(setEchoCancellation(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="echoCancellation">
      <TooltipFormLabel kind="echoCancellation">echoCancellation:</TooltipFormLabel>
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
