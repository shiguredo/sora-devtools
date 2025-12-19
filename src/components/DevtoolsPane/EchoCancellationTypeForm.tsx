import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setEchoCancellationType } from "@/app/actions";
import { $echoCancellationType } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { ECHO_CANCELLATION_TYPES } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const EchoCancellationTypeForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, ECHO_CANCELLATION_TYPES)) {
      setEchoCancellationType(event.currentTarget.value);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="echoCancellationType">echoCancellationType:</TooltipFormLabel>
      <FormSelect value={$echoCancellationType.value} onChange={onChange}>
        {ECHO_CANCELLATION_TYPES.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
