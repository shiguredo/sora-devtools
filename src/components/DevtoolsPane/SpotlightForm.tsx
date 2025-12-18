import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setSpotlight } from "@/app/actions";
import { $connectionStatus, $spotlight } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { SPOTLIGHT } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const SpotlightForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, SPOTLIGHT)) {
      setSpotlight(event.currentTarget.value);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="spotlight">spotlight:</TooltipFormLabel>
      <FormSelect value={$spotlight.value} onChange={onChange} disabled={disabled}>
        {SPOTLIGHT.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
