import { FormGroup, FormSelect } from "@/components/ui";

import { setNoiseSuppression } from "@/app/actions";
import { noiseSuppression } from "@/app/signals";
import { NOISE_SUPPRESSIONS } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function NoiseSuppressionForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, NOISE_SUPPRESSIONS)) {
      setNoiseSuppression(target.value);
    }
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="noiseSuppression">
      <TooltipFormLabel kind="noiseSuppression">noiseSuppression:</TooltipFormLabel>
      <FormSelect name="noiseSuppression" value={noiseSuppression.value} onChange={onChange}>
        {NOISE_SUPPRESSIONS.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormGroup>
  );
}
