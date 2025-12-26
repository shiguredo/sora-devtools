import { FormGroup, FormSelect } from "react-bootstrap";

import { setVideoCodecType } from "@/app/actions";
import { isFormDisabled, videoCodecType } from "@/app/signals";
import { VIDEO_CODEC_TYPES } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function VideoCodecTypeForm() {
  const disabled = isFormDisabled.value;
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, VIDEO_CODEC_TYPES)) {
      setVideoCodecType(target.value);
    }
  };
  return (
    <FormGroup className="form-inline" controlId="videoCodecType">
      <TooltipFormLabel kind="videoCodecType">videoCodecType:</TooltipFormLabel>
      <FormSelect
        name="videoCodecType"
        value={videoCodecType.value}
        onChange={onChange}
        disabled={disabled}
      >
        {VIDEO_CODEC_TYPES.map((value) => {
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
