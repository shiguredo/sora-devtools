import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setFacingMode } from "@/app/actions";
import { $facingMode, $mediaType } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { FACING_MODES } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const FacingModeForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, FACING_MODES)) {
      setFacingMode(event.currentTarget.value as (typeof FACING_MODES)[number]);
    }
  };
  const disabled = $mediaType.value !== "getUserMedia";
  return (
    <FormRow>
      <TooltipFormLabel kind="facingMode">facingMode:</TooltipFormLabel>
      <FormSelect value={$facingMode.value} onChange={onChange} disabled={disabled}>
        {FACING_MODES.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
