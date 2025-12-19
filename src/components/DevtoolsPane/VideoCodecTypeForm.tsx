import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setVideoCodecType } from "@/app/actions";
import { $connectionStatus, $videoCodecType } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { VIDEO_CODEC_TYPES } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const VideoCodecTypeForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, VIDEO_CODEC_TYPES)) {
      setVideoCodecType(event.currentTarget.value);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="videoCodecType">videoCodecType:</TooltipFormLabel>
      <FormSelect value={$videoCodecType.value} onChange={onChange} disabled={disabled}>
        {VIDEO_CODEC_TYPES.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
