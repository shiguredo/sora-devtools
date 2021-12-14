import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setSimulcastRid } from "@/app/slice";
import { SIMULCAST_RID } from "@/constants";
import { isFormDisabled, isSimulcastRid } from "@/utils";

export const FormSimulcastRid: React.FC = () => {
  const simulcastRid = useAppSelector((state) => state.simulcastRid);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isSimulcastRid(event.target.value)) {
      dispatch(setSimulcastRid(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="simulcastRid">
      <FormLabel>simulcastRid:</FormLabel>
      <FormSelect name="simulcastRid" value={simulcastRid} onChange={onChange} disabled={disabled}>
        {SIMULCAST_RID.map((value) => {
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
