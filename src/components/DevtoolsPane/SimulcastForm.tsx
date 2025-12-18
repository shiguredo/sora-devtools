import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setSimulcast } from "@/app/actions";
import { $connectionStatus, $simulcast } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { SIMULCAST } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const SimulcastForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, SIMULCAST)) {
      setSimulcast(event.currentTarget.value);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="simulcast">simulcast:</TooltipFormLabel>
      <FormSelect value={$simulcast.value} onChange={onChange} disabled={disabled}>
        {SIMULCAST.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
