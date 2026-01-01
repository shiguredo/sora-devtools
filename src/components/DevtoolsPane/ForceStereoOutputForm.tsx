import { FormGroup } from "@/components/ui";

import { forceStereoOutput, isFormDisabled, setForceStereoOutput } from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function ForceStereoOutputForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setForceStereoOutput(target.checked);
  };
  return (
    <div className="flex flex-wrap gap-2">
      <div className="w-auto">
        <FormGroup className="flex items-center gap-2" controlId="forceStereoOutput">
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
