import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setAudioContentHint } from "@/app/actions";
import { $audioContentHint } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { AUDIO_CONTENT_HINTS } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const AudioContentHintForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, AUDIO_CONTENT_HINTS)) {
      setAudioContentHint(event.currentTarget.value as (typeof AUDIO_CONTENT_HINTS)[number]);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="audioContentHint">audioContentHint:</TooltipFormLabel>
      <FormSelect value={$audioContentHint.value} onChange={onChange}>
        {AUDIO_CONTENT_HINTS.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
