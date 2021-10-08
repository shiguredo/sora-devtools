import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setNoiseSuppression } from "@/app/slice";
import { NOISE_SUPPRESSIONS } from "@/constants";
import { isNoiseSuppression } from "@/utils";

export const FormNoiseSuppression: React.FC = () => {
  const noiseSuppression = useAppSelector((state) => state.noiseSuppression);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isNoiseSuppression(event.target.value)) {
      dispatch(setNoiseSuppression(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="noiseSuppression">
      <FormLabel>noiseSuppression:</FormLabel>
      <FormSelect name="noiseSuppression" value={noiseSuppression} onChange={onChange}>
        {NOISE_SUPPRESSIONS.map((value) => {
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
