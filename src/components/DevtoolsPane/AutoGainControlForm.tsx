import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setAutoGainControl } from "@/app/actions";
import { $autoGainControl } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { AUTO_GAIN_CONTROLS } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const AutoGainControlForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, AUTO_GAIN_CONTROLS)) {
      setAutoGainControl(event.currentTarget.value as (typeof AUTO_GAIN_CONTROLS)[number]);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="autoGainControl">autoGainControl:</TooltipFormLabel>
      <FormSelect value={$autoGainControl.value} onChange={onChange}>
        {AUTO_GAIN_CONTROLS.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
