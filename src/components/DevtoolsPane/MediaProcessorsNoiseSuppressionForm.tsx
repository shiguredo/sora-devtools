import { FormGroup } from "react-bootstrap";

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
    <FormGroup className="form-inline" controlId="mediaProcessorsNoiseSuppression">
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
