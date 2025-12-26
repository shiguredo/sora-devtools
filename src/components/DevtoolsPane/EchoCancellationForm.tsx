import { FormGroup, FormSelect } from "react-bootstrap";

import { setEchoCancellation } from "@/app/actions";
import { echoCancellation } from "@/app/signals";
import { ECHO_CANCELLATIONS } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function EchoCancellationForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, ECHO_CANCELLATIONS)) {
      setEchoCancellation(target.value);
    }
  };
  return (
    <FormGroup className="form-inline" controlId="echoCancellation">
      <TooltipFormLabel kind="echoCancellation">echoCancellation:</TooltipFormLabel>
      <FormSelect name="echoCancellation" value={echoCancellation.value} onChange={onChange}>
        {ECHO_CANCELLATIONS.map((value) => {
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
