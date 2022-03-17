import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { setMultistream } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { MULTISTREAM } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

export const MultistreamForm: React.FC = () => {
  const multistream = useAppSelector((state) => state.multistream);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, MULTISTREAM)) {
      dispatch(setMultistream(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="multistream">
      <FormLabel>multistream:</FormLabel>
      <FormSelect name="multistream" value={multistream} onChange={onChange} disabled={disabled}>
        {MULTISTREAM.map((value) => {
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
