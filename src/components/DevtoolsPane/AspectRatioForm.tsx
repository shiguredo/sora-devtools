import { FormGroup, FormSelect } from "react-bootstrap";

import { aspectRatio, setAspectRatio } from "@/app/signals";
import { ASPECT_RATIO_TYPES } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function AspectRatioForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, ASPECT_RATIO_TYPES)) {
      setAspectRatio(target.value);
    }
  };
  return (
    <FormGroup className="form-inline" controlId="aspectRatio">
      <TooltipFormLabel kind="aspectRatio">aspectRatio:</TooltipFormLabel>
      <FormSelect name="aspectRatio" value={aspectRatio.value} onChange={onChange}>
        {ASPECT_RATIO_TYPES.map((value) => {
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
