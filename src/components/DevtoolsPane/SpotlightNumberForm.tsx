import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setSpotlightNumber } from "@/app/actions";
import { $connectionStatus, $spotlightNumber } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { SPOTLIGHT_NUMBERS } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const SpotlightNumberForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    const value = event.currentTarget.value;
    if (checkFormValue(value, SPOTLIGHT_NUMBERS)) {
      setSpotlightNumber(value);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="spotlightNumber">spotlightNumber:</TooltipFormLabel>
      <FormSelect value={$spotlightNumber.value} onChange={onChange} disabled={disabled}>
        {SPOTLIGHT_NUMBERS.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
