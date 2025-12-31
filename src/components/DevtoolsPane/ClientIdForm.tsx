import { FormGroup, FormInput } from "@/components/ui";

import { setClientId, setEnabledClientId } from "@/app/actions";
import { clientId, enabledClientId, isFormDisabled } from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function ClientIdForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledClientId(target.checked);
  };
  const onChangeText = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setClientId(target.value);
  };
  return (
    <>
      <div className="form-row">
        <div className="col-auto">
          <FormGroup className="flex items-center gap-2" controlId="enabledClientId">
            <TooltipFormCheck
              kind="clientId"
              checked={enabledClientId.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              clientId
            </TooltipFormCheck>
          </FormGroup>
        </div>
      </div>
      {enabledClientId.value ? (
        <div className="form-row">
          <div className="col-auto">
            <FormGroup className="flex items-center gap-2" controlId="clientId">
              <FormInput
                className="flex-fill w-500"
                type="text"
                placeholder="ClientIdを指定"
                value={clientId.value}
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
