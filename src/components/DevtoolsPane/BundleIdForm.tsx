import { FormGroup, FormInput } from "@/components/ui";

import { setBundleId, setEnabledBundleId } from "@/app/actions";
import { bundleId, enabledBundleId, isFormDisabled } from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function BundleIdForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledBundleId(target.checked);
  };
  const onChangeText = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setBundleId(target.value);
  };
  return (
    <>
      <div className="form-row">
        <div className="col-auto">
          <FormGroup controlId="enabledBundleId">
            <TooltipFormCheck
              kind="bundleId"
              checked={enabledBundleId.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              bundleId
            </TooltipFormCheck>
          </FormGroup>
        </div>
      </div>
      {enabledBundleId.value ? (
        <div className="form-row">
          <div className="col-auto">
            <FormGroup controlId="bundleId">
              <FormInput
                className="input-wide"
                type="text"
                placeholder="bundleId を指定"
                value={bundleId.value}
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
