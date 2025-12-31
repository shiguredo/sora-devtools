import { FormGroup, FormSelect } from "@/components/ui";

import { setSpotlightFocusRid } from "@/app/actions";
import { isFormDisabled, spotlightFocusRid } from "@/app/signals";
import { SPOTLIGHT_FOCUS_RIDS } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function SpotlightFocusRidForm() {
  const disabled = isFormDisabled.value;
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, SPOTLIGHT_FOCUS_RIDS)) {
      setSpotlightFocusRid(target.value);
    }
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="spotlightFocusRid">
      <TooltipFormLabel kind="spotlightFocusRid">spotlightFocusRid:</TooltipFormLabel>
      <FormSelect value={spotlightFocusRid.value} onChange={onChange} disabled={disabled}>
        {SPOTLIGHT_FOCUS_RIDS.map((value) => {
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
