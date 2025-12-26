import { FormGroup, FormSelect } from "react-bootstrap";

import { setSpotlight } from "@/app/actions";
import { isFormDisabled, spotlight } from "@/app/signals";
import { SPOTLIGHT } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function SpotlightForm() {
  const disabled = isFormDisabled.value;
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, SPOTLIGHT)) {
      setSpotlight(target.value);
    }
  };
  return (
    <FormGroup className="form-inline" controlId="spotlight">
      <TooltipFormLabel kind="spotlight">spotlight:</TooltipFormLabel>
      <FormSelect name="spotlight" value={spotlight.value} onChange={onChange} disabled={disabled}>
        {SPOTLIGHT.map((value) => {
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
