import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setSpotlightNumber } from "@/app/slice";
import { SPOTLIGHT_NUMBERS } from "@/constants";
import { isFormDisabled, isSpotlightNumber } from "@/utils";

export const FormSpotlightNumber: React.FC = () => {
  const spotlightNumber = useAppSelector((state) => state.spotlightNumber);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isSpotlightNumber(event.target.value)) {
      dispatch(setSpotlightNumber(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="spotlightNumber">
      <FormLabel>spotlightNumber:</FormLabel>
      <FormSelect value={spotlightNumber} onChange={onChange} disabled={disabled}>
        {SPOTLIGHT_NUMBERS.map((value) => {
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
