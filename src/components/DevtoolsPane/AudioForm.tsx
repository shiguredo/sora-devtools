import { FormGroup } from "react-bootstrap";

import { setAudio } from "@/app/actions";
import { audio, isFormDisabled } from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function AudioForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setAudio(target.checked);
  };
  return (
    <FormGroup className="form-inline" controlId="audio">
      <TooltipFormCheck
        kind="audio"
        checked={audio.value}
        onChange={onChange}
        disabled={isFormDisabled.value}
      >
        audio
      </TooltipFormCheck>
    </FormGroup>
  );
}
