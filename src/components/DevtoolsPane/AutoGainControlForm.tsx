import { FormGroup, FormSelect } from "@/components/ui";

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
    <FormGroup className="flex items-center gap-2" controlId="autoGainControl">
      <TooltipFormLabel kind="autoGainControl">autoGainControl:</TooltipFormLabel>
      <FormSelect name="autoGainControl" value={autoGainControl.value} onChange={onChange}>
        {AUTO_GAIN_CONTROLS.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormGroup>
  );
}
