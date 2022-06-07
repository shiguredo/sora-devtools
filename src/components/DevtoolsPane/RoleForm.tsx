import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { setRole } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { ROLES } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

export const RoleForm: React.FC = () => {
  const role = useAppSelector((state) => state.role);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, ROLES)) {
      dispatch(setRole(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="role">
      <FormLabel>role:</FormLabel>
      <FormSelect name="role" value={role} onChange={onChange} disabled={disabled}>
        {ROLES.map((value) => {
          return (
            <option key={value} value={value}>
              {value}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
};
