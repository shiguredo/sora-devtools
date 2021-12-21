import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setAspectRatio } from "@/app/slice";
import { ASPECT_RATIO_TYPES } from "@/constants";
import { isAspectRatio } from "@/utils";

export const FormAspectRatio: React.FC = () => {
  const aspectRatio = useAppSelector((state) => state.aspectRatio);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isAspectRatio(event.target.value)) {
      dispatch(setAspectRatio(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="aspectRatio">
      <FormLabel>aspectRatio:</FormLabel>
      <FormSelect name="aspectRatio" value={aspectRatio} onChange={onChange}>
        {ASPECT_RATIO_TYPES.map((value) => {
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
