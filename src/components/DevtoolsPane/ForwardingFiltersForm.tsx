import { setEnabledForwardingFilters, setForwardingFilters } from "@/app/actions";
import { enabledForwardingFilters, forwardingFilters, isFormDisabled } from "@/app/signals";
import { FormGroup } from "@/components/ui";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function ForwardingFiltersForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledForwardingFilters(target.checked);
  };
  return (
    <>
      <div className="form-row">
        <div className="col-auto">
          <FormGroup className="flex items-center gap-2" controlId="enabledForwardingFilters">
            <TooltipFormCheck
              kind="forwardingFilters"
              checked={enabledForwardingFilters.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              forwardingFilters
            </TooltipFormCheck>
          </FormGroup>
        </div>
      </div>
      {enabledForwardingFilters.value ? (
        <div className="form-row">
          <div className="col-auto">
            <JSONInputField
              controlId="forwardingFilters"
              placeholder="forwardingFiltersを指定"
              value={forwardingFilters.value}
              setValue={(value) => setForwardingFilters(value)}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
