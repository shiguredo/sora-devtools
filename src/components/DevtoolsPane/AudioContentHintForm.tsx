import { FormGroup, FormSelect } from "react-bootstrap";

import { setAudioContentHint } from "@/app/actions";
import { audioContentHint } from "@/app/signals";
import { AUDIO_CONTENT_HINTS } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function AudioContentHintForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, AUDIO_CONTENT_HINTS)) {
      setAudioContentHint(target.value);
    }
  };
  return (
    <FormGroup className="form-inline" controlId="audioContentHint">
      <TooltipFormLabel kind="audioContentHint">audioContentHint:</TooltipFormLabel>
      <FormSelect name="audioContentHint" value={audioContentHint.value} onChange={onChange}>
        {AUDIO_CONTENT_HINTS.map((value) => {
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
