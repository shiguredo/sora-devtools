import { FormGroup, FormSelect } from "react-bootstrap";

import { setAutoGainControl } from "@/app/actions";
import { autoGainControl } from "@/app/signals";
import { AUTO_GAIN_CONTROLS } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function AutoGainControlForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, AUTO_GAIN_CONTROLS)) {
      setAutoGainControl(target.value);
    }
  };
  return (
    <FormGroup className="form-inline" controlId="autoGainControl">
      <TooltipFormLabel kind="autoGainControl">autoGainControl:</TooltipFormLabel>
      <FormSelect name="autoGainControl" value={autoGainControl.value} onChange={onChange}>
        {AUTO_GAIN_CONTROLS.map((value) => {
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
