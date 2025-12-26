import { FormGroup, FormSelect } from "react-bootstrap";

import { setSimulcastRid } from "@/app/actions";
import { isFormDisabled, simulcastRid } from "@/app/signals";
import { SIMULCAST_RID } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function SimulcastRidForm() {
  const disabled = isFormDisabled.value;
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, SIMULCAST_RID)) {
      setSimulcastRid(target.value);
    }
  };
  return (
    <FormGroup className="form-inline" controlId="simulcastRid">
      <TooltipFormLabel kind="simulcastRid">simulcastRid:</TooltipFormLabel>
      <FormSelect
        name="simulcastRid"
        value={simulcastRid.value}
        onChange={onChange}
        disabled={disabled}
      >
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
}
