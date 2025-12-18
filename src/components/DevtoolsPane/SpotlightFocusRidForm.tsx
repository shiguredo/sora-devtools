import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setSpotlightFocusRid } from "@/app/actions";
import { $connectionStatus, $spotlightFocusRid } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { SPOTLIGHT_FOCUS_RIDS } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const SpotlightFocusRidForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, SPOTLIGHT_FOCUS_RIDS)) {
      setSpotlightFocusRid(event.currentTarget.value as (typeof SPOTLIGHT_FOCUS_RIDS)[number]);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="spotlightFocusRid">spotlightFocusRid:</TooltipFormLabel>
      <FormSelect value={$spotlightFocusRid.value} onChange={onChange} disabled={disabled}>
        {SPOTLIGHT_FOCUS_RIDS.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
