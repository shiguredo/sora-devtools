import { FormGroup, FormSelect } from "react-bootstrap";

import { setSimulcast } from "@/app/actions";
import { isFormDisabled, simulcast } from "@/app/signals";
import { SIMULCAST } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function SimulcastForm() {
  const disabled = isFormDisabled.value;
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, SIMULCAST)) {
      setSimulcast(target.value);
    }
  };
  return (
    <FormGroup className="form-inline" controlId="simulcast">
      <TooltipFormLabel kind="simulcast">simulcast:</TooltipFormLabel>
      <FormSelect name="simulcast" value={simulcast.value} onChange={onChange} disabled={disabled}>
        {SIMULCAST.map((value) => {
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
