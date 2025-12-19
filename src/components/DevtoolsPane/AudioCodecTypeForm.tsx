import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setAudioCodecType } from "@/app/actions";
import { $audioCodecType, $connectionStatus } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { AUDIO_CODEC_TYPES } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const AudioCodecTypeForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, AUDIO_CODEC_TYPES)) {
      setAudioCodecType(event.currentTarget.value);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="audioCodecType">audioCodecType:</TooltipFormLabel>
      <FormSelect value={$audioCodecType.value} onChange={onChange} disabled={disabled}>
        {AUDIO_CODEC_TYPES.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
