import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setEchoCancellation } from "@/app/actions";
import { $echoCancellation } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { ECHO_CANCELLATIONS } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const EchoCancellationForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, ECHO_CANCELLATIONS)) {
      setEchoCancellation(event.currentTarget.value as (typeof ECHO_CANCELLATIONS)[number]);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="echoCancellation">echoCancellation:</TooltipFormLabel>
      <FormSelect value={$echoCancellation.value} onChange={onChange}>
        {ECHO_CANCELLATIONS.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
