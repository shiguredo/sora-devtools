import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setAudio } from "@/app/actions";
import { $audio, $connectionStatus } from "@/app/store";
import { FormRow } from "@/components/Form";
import { isFormDisabled } from "@/utils";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const AudioForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setAudio(event.currentTarget.checked);
  };
  return (
    <FormRow>
      <TooltipFormCheck kind="audio" checked={$audio.value} onChange={onChange} disabled={disabled}>
        audio
      </TooltipFormCheck>
    </FormRow>
  );
};
