import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { setSpotlight } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { SPOTLIGHT } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

export const SpotlightForm: React.FC = () => {
  const spotlight = useAppSelector((state) => state.spotlight);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, SPOTLIGHT)) {
      dispatch(setSpotlight(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="spotlight">
      <FormLabel>spotlight:</FormLabel>
      <FormSelect name="spotlight" value={spotlight} onChange={onChange} disabled={disabled}>
        {SPOTLIGHT.map((value) => {
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
