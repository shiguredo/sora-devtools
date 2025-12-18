import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setResizeMode } from "@/app/actions";
import { $resizeMode } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { RESIZE_MODE_TYPES } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const ResizeModeForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, RESIZE_MODE_TYPES)) {
      setResizeMode(event.currentTarget.value as (typeof RESIZE_MODE_TYPES)[number]);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="resizeMode">resizeMode:</TooltipFormLabel>
      <FormSelect value={$resizeMode.value} onChange={onChange}>
        {RESIZE_MODE_TYPES.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
