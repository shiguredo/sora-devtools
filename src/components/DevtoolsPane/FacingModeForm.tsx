import { FormGroup, FormSelect } from "react-bootstrap";

import { setFacingMode } from "@/app/signals";
import { facingMode, mediaType } from "@/app/signals";
import { FACING_MODES } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function FacingModeForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, FACING_MODES)) {
      setFacingMode(target.value);
    }
  };
  const disabled = mediaType.value !== "getUserMedia";
  return (
    <FormGroup className="form-inline" controlId="facingMode">
      <TooltipFormLabel kind="facingMode">facingMode:</TooltipFormLabel>
      <FormSelect
        name="facingMode"
        value={facingMode.value}
        onChange={onChange}
        disabled={disabled}
      >
        {FACING_MODES.map((value) => {
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
