import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setMediaProcessorsNoiseSuppression } from "@/app/actions";
import { $mediaProcessorsNoiseSuppression, $mediaType } from "@/app/store";
import { FormRow } from "@/components/Form";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const MediaProcessorsNoiseSuppressionForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setMediaProcessorsNoiseSuppression(event.currentTarget.checked);
  };
  const disabled = $mediaType.value !== "getUserMedia";
  return (
    <FormRow>
      <TooltipFormCheck
        kind="mediaProcessorsNoiseSuppression"
        checked={$mediaProcessorsNoiseSuppression.value}
        onChange={onChange}
        disabled={disabled}
      >
        mediaProcessorsNoiseSuppression
      </TooltipFormCheck>
    </FormRow>
  );
};
