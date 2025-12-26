import { FormGroup, FormSelect } from "react-bootstrap";

import { setAudioCodecType } from "@/app/actions";
import { audioCodecType, isFormDisabled } from "@/app/signals";
import { AUDIO_CODEC_TYPES } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function AudioCodecTypeForm() {
  const disabled = isFormDisabled.value;
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, AUDIO_CODEC_TYPES)) {
      setAudioCodecType(target.value);
    }
  };
  return (
    <FormGroup className="form-inline" controlId="audioCodecType">
      <TooltipFormLabel kind="audioCodecType">audioCodecType:</TooltipFormLabel>
      <FormSelect
        name="audioCodecType"
        value={audioCodecType.value}
        onChange={onChange}
        disabled={disabled}
      >
        {AUDIO_CODEC_TYPES.map((value) => {
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
