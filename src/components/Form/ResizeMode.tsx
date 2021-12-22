import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setResizeMode } from "@/app/slice";
import { RESIZE_MODE_TYPES } from "@/constants";
import { isResizeMode } from "@/utils";

export const FormResizeMode: React.FC = () => {
  const resizeMode = useAppSelector((state) => state.resizeMode);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isResizeMode(event.target.value)) {
      dispatch(setResizeMode(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="resizeMode">
      <FormLabel>resizeMode:</FormLabel>
      <FormSelect name="resizeMode" value={resizeMode} onChange={onChange}>
        {RESIZE_MODE_TYPES.map((value) => {
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
