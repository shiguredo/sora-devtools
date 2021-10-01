import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setFrameRate } from "@/app/slice";
import { FRAME_RATES } from "@/constants";
import { isFrameRate } from "@/utils";

export const FormFrameRate: React.FC = () => {
  const frameRate = useAppSelector((state) => state.frameRate);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isFrameRate(event.target.value)) {
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
