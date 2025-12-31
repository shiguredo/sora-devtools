import { FormGroup, FormSelect } from "@/components/ui";

import { resizeMode, setResizeMode } from "@/app/signals";
import { RESIZE_MODE_TYPES } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function ResizeModeForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, RESIZE_MODE_TYPES)) {
      setResizeMode(target.value);
    }
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="resizeMode">
      <TooltipFormLabel kind="resizeMode">resizeMode:</TooltipFormLabel>
      <FormSelect name="resizeMode" value={resizeMode.value} onChange={onChange}>
        {RESIZE_MODE_TYPES.map((value) => {
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
