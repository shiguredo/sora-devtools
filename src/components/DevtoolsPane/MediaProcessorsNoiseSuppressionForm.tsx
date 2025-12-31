import { FormGroup } from "@/components/ui";

import {
  mediaProcessorsNoiseSuppression,
  mediaType,
  setMediaProcessorsNoiseSuppression,
} from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function MediaProcessorsNoiseSuppressionForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setMediaProcessorsNoiseSuppression(target.checked);
  };
  const disabled = mediaType.value !== "getUserMedia";
  return (
    <FormGroup className="flex items-center gap-2" controlId="mediaProcessorsNoiseSuppression">
      <TooltipFormCheck
        kind="mediaProcessorsNoiseSuppression"
        checked={mediaProcessorsNoiseSuppression.value}
        onChange={onChange}
        disabled={disabled}
      >
        mediaProcessorsNoiseSuppression
      </TooltipFormCheck>
    </FormGroup>
  );
}
