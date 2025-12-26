import { FormGroup, FormSelect } from "react-bootstrap";

import { setSpotlightNumber } from "@/app/actions";
import { isFormDisabled, spotlightNumber } from "@/app/signals";
import { SPOTLIGHT_NUMBERS } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function SpotlightNumberForm() {
  const disabled = isFormDisabled.value;
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, SPOTLIGHT_NUMBERS)) {
      setSpotlightNumber(target.value);
    }
  };
  return (
    <FormGroup className="form-inline" controlId="spotlightNumber">
      <TooltipFormLabel kind="spotlightNumber">spotlightNumber:</TooltipFormLabel>
      <FormSelect value={spotlightNumber.value} onChange={onChange} disabled={disabled}>
        {SPOTLIGHT_NUMBERS.map((value) => {
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
