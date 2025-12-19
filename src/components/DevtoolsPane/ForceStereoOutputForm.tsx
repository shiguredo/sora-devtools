import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { $connectionStatus, $forceStereoOutput, setForceStereoOutput } from "@/app/store";
import { FormRow } from "@/components/Form";
import { isFormDisabled } from "@/utils";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const ForceStereoOutputForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setForceStereoOutput(event.currentTarget.checked);
  };
  return (
    <FormRow>
      <TooltipFormCheck
        kind="forceStereoOutput"
        checked={$forceStereoOutput.value}
        onChange={onChangeSwitch}
        disabled={disabled}
      >
        forceStereoOutput
      </TooltipFormCheck>
    </FormRow>
  );
};
