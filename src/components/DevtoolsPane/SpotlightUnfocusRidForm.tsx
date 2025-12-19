import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setSpotlightUnfocusRid } from "@/app/actions";
import { $connectionStatus, $spotlightUnfocusRid } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { SPOTLIGHT_FOCUS_RIDS } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const SpotlightUnfocusRidForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, SPOTLIGHT_FOCUS_RIDS)) {
      setSpotlightUnfocusRid(event.currentTarget.value);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="spotlightUnfocusRid">spotlightUnfocusRid:</TooltipFormLabel>
      <FormSelect value={$spotlightUnfocusRid.value} onChange={onChange} disabled={disabled}>
        {SPOTLIGHT_FOCUS_RIDS.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
