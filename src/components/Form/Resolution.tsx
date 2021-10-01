import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setResolution } from "@/app/slice";
import { RESOLUTIONS } from "@/constants";
import { isResolution } from "@/utils";

export const FormResolution: React.FC = () => {
  const resolution = useAppSelector((state) => state.resolution);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isResolution(event.target.value)) {
      dispatch(setResolution(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="resolution">
      <FormLabel>resolution:</FormLabel>
      <FormSelect name="resolution" value={resolution} onChange={onChange}>
        {RESOLUTIONS.map((value) => {
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
