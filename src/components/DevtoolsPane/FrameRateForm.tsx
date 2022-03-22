import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { setFrameRate } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { FRAME_RATES } from "@/constants";
import { checkFormValue } from "@/utils";

export const FrameRateForm: React.FC = () => {
  const frameRate = useAppSelector((state) => state.frameRate);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, FRAME_RATES)) {
      dispatch(setFrameRate(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="frameRate">
      <FormLabel>frameRate:</FormLabel>
      <FormSelect name="frameRate" value={frameRate} onChange={onChange}>
        {FRAME_RATES.map((value) => {
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
