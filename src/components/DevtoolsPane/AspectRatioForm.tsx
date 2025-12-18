import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setAspectRatio } from "@/app/actions";
import { $aspectRatio } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { ASPECT_RATIO_TYPES } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const AspectRatioForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, ASPECT_RATIO_TYPES)) {
      setAspectRatio(event.currentTarget.value as (typeof ASPECT_RATIO_TYPES)[number]);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="aspectRatio">aspectRatio:</TooltipFormLabel>
      <FormSelect value={$aspectRatio.value} onChange={onChange}>
        {ASPECT_RATIO_TYPES.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
