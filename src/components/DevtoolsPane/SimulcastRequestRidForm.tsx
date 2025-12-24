import type React from "react";
import { FormGroup, FormSelect } from "react-bootstrap";

import { setSimulcastRequestRid } from "@/app/actions";
import { useSoraDevtoolsStore } from "@/app/store";
import { SIMULCAST_REQUEST_RID } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const SimulcastRequestRidForm: React.FC = () => {
  const simulcastRequestRid = useSoraDevtoolsStore((state) => state.simulcastRequestRid);
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, SIMULCAST_REQUEST_RID)) {
      setSimulcastRequestRid(event.target.value);
    }
  };
  return (
    <FormGroup className="form-inline" controlId="simulcastRequestRid">
      <TooltipFormLabel kind="simulcastRequestRid">simulcastRequestRid:</TooltipFormLabel>
      <FormSelect
        name="simulcastRequestRid"
        value={simulcastRequestRid}
        onChange={onChange}
        disabled={disabled}
      >
        {SIMULCAST_REQUEST_RID.map((value) => {
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
