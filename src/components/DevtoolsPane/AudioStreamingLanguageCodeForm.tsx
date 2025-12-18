import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setAudioStreamingLanguageCode, setEnabledAudioStreamingLanguageCode } from "@/app/actions";
import {
  $audioStreamingLanguageCode,
  $connectionStatus,
  $enabledAudioStreamingLanguageCode,
} from "@/app/store";
import { FormRow, FormInput } from "@/components/Form";
import { isFormDisabled } from "@/utils";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const AudioStreamingLanguageCodeForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledAudioStreamingLanguageCode(event.currentTarget.checked);
  };
  const onChangeText = (event: TargetedEvent<HTMLInputElement>): void => {
    setAudioStreamingLanguageCode(event.currentTarget.value);
  };
  return (
    <>
      <FormRow>
        <TooltipFormCheck
          kind="audioStreamingLanguageCode"
          checked={$enabledAudioStreamingLanguageCode.value}
          onChange={onChangeSwitch}
          disabled={disabled}
        >
          audioStreamingLanguageCode
        </TooltipFormCheck>
      </FormRow>
      {$enabledAudioStreamingLanguageCode.value ? (
        <FormInput
          type="text"
          placeholder="audioStreamingLanguageCodeを指定"
          value={$audioStreamingLanguageCode.value}
          onChange={onChangeText}
          disabled={disabled}
          className="w-[500px]"
        />
      ) : null}
    </>
  );
};
