import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setAutoGainControl } from "@/app/slice";
import { AUTO_GAIN_CONTROLS } from "@/constants";
import { isAutoGainControl } from "@/utils";

export const FormAutoGainControl: React.FC = () => {
  const autoGainControl = useAppSelector((state) => state.autoGainControl);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isAutoGainControl(event.target.value)) {
      dispatch(setAutoGainControl(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="autoGainControl">
      <FormLabel>autoGainControl:</FormLabel>
      <FormSelect name="autoGainControl" value={autoGainControl} onChange={onChange}>
        {AUTO_GAIN_CONTROLS.map((value) => {
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
