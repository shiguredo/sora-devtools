import { FormGroup, FormInput } from "@/components/ui";

import {
  audioStreamingLanguageCode,
  enabledAudioStreamingLanguageCode,
  isFormDisabled,
  setAudioStreamingLanguageCode,
  setEnabledAudioStreamingLanguageCode,
} from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function AudioStreamingLanguageCodeForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledAudioStreamingLanguageCode(target.checked);
  };
  const onChangeText = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setAudioStreamingLanguageCode(target.value);
  };
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <div className="w-auto">
          <FormGroup
            className="flex items-center gap-2"
            controlId="enabledAudioStreamingLanguageCode"
          >
            <TooltipFormCheck
              kind="audioStreamingLanguageCode"
              checked={enabledAudioStreamingLanguageCode.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              audioStreamingLanguageCode
            </TooltipFormCheck>
          </FormGroup>
        </div>
      </div>
      {enabledAudioStreamingLanguageCode.value ? (
        <div className="flex flex-wrap gap-2">
          <div className="w-auto">
            <FormGroup className="flex items-center gap-2" controlId="audioStreamingLanguageCode">
              <FormInput
                className="flex-1 w-[500px]"
                type="text"
                placeholder="audioStreamingLanguageCodeを指定"
                value={audioStreamingLanguageCode.value}
                onChange={onChangeText}
                disabled={disabled}
              />
            </FormGroup>
          </div>
        </div>
      ) : null}
    </>
  );
}
