import { FormGroup, FormSelect } from "react-bootstrap";

import { setSimulcastRequestRid } from "@/app/actions";
import { isFormDisabled, simulcastRequestRid } from "@/app/signals";
import { SIMULCAST_REQUEST_RID } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function SimulcastRequestRidForm() {
  const disabled = isFormDisabled.value;
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, SIMULCAST_REQUEST_RID)) {
      setSimulcastRequestRid(target.value);
    }
  };
  return (
    <FormGroup className="form-inline" controlId="simulcastRequestRid">
      <TooltipFormLabel kind="simulcastRequestRid">simulcastRequestRid:</TooltipFormLabel>
      <FormSelect
        name="simulcastRequestRid"
        value={simulcastRequestRid.value}
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
}
