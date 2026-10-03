import { FormGroup } from "@/components/ui";

import { forceStereoOutput, isFormDisabled, setForceStereoOutput } from "@/app/signals";

import styles from "./ForceStereoOutputForm.module.css";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function ForceStereoOutputForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setForceStereoOutput(target.checked);
  };
  return (
    <div className={styles.root}>
      <div className={styles.autoWidth}>
        <FormGroup controlId="forceStereoOutput">
          <TooltipFormCheck
            kind="forceStereoOutput"
            checked={forceStereoOutput.value}
            onChange={onChangeSwitch}
            disabled={disabled}
          >
            forceStereoOutput
          </TooltipFormCheck>
        </FormGroup>
      </div>
    </div>
  );
}
