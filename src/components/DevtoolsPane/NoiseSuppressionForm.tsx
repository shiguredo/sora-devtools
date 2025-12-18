import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setNoiseSuppression } from "@/app/actions";
import { $noiseSuppression } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { NOISE_SUPPRESSIONS } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const NoiseSuppressionForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    const value = event.currentTarget.value;
    if (checkFormValue(value, NOISE_SUPPRESSIONS)) {
      setNoiseSuppression(value);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="noiseSuppression">noiseSuppression:</TooltipFormLabel>
      <FormSelect value={$noiseSuppression.value} onChange={onChange}>
        {NOISE_SUPPRESSIONS.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
