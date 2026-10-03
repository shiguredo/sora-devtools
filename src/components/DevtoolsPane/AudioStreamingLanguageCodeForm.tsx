import { FormGroup, FormInput } from "@/components/ui";

import {
  audioStreamingLanguageCode,
  enabledAudioStreamingLanguageCode,
  isFormDisabled,
  setAudioStreamingLanguageCode,
  setEnabledAudioStreamingLanguageCode,
} from "@/app/signals";

import styles from "./AudioStreamingLanguageCodeForm.module.css";

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
      <div className={styles.row}>
        <div className={styles.autoWidth}>
          <FormGroup controlId="enabledAudioStreamingLanguageCode">
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
        <div className={styles.row}>
          <div className={styles.autoWidth}>
            <FormGroup controlId="audioStreamingLanguageCode">
              <FormInput
                className={styles.input}
                type="text"
                placeholder="audioStreamingLanguageCode を指定"
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
