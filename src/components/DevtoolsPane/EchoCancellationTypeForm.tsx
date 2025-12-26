import { FormGroup, FormSelect } from "react-bootstrap";

import { setEchoCancellationType } from "@/app/actions";
import { echoCancellationType } from "@/app/signals";
import { ECHO_CANCELLATION_TYPES } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function EchoCancellationTypeForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, ECHO_CANCELLATION_TYPES)) {
      setEchoCancellationType(target.value);
    }
  };
  return (
    <FormGroup className="form-inline" controlId="echoCancellationType">
      <TooltipFormLabel kind="echoCancellationType">echoCancellationType:</TooltipFormLabel>
      <FormSelect
        name="echoCancellationType"
        value={echoCancellationType.value}
        onChange={onChange}
      >
        {ECHO_CANCELLATION_TYPES.map((value) => {
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
