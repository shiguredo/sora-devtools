import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setBlurRadius } from "@/app/actions";
import { $blurRadius, $mediaType } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { BLUR_RADIUS } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const BlurRadiusForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, BLUR_RADIUS)) {
      setBlurRadius(event.currentTarget.value as (typeof BLUR_RADIUS)[number]);
    }
  };
  const disabled = $mediaType.value !== "getUserMedia";
  return (
    <FormRow>
      <TooltipFormLabel kind="blurRadius">blurRadius:</TooltipFormLabel>
      <FormSelect value={$blurRadius.value} onChange={onChange} disabled={disabled}>
        {BLUR_RADIUS.map((value) => (
          <option key={value} value={value}>
            {value === "" || disabled ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
