import { FormGroup, FormSelect } from "react-bootstrap";

import { blurRadius, mediaType, setBlurRadius } from "@/app/signals";
import { BLUR_RADIUS } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function BlurRadiusForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, BLUR_RADIUS)) {
      setBlurRadius(target.value);
    }
  };
  const disabled = mediaType.value !== "getUserMedia";
  return (
    <FormGroup className="form-inline" controlId="blurRadius">
      <TooltipFormLabel kind="blurRadius">blurRadius:</TooltipFormLabel>
      <FormSelect value={blurRadius.value} onChange={onChange} disabled={disabled}>
        {BLUR_RADIUS.map((value) => {
          return (
            <option key={value} value={value}>
              {value === "" || disabled ? "未指定" : value}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
}
