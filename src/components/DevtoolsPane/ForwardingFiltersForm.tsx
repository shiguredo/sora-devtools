import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setEnabledForwardingFilters, setForwardingFilters } from "@/app/actions";
import { $connectionStatus, $enabledForwardingFilters, $forwardingFilters } from "@/app/store";
import { FormRow } from "@/components/Form";
import { isFormDisabled } from "@/utils";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const ForwardingFiltersForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledForwardingFilters(event.currentTarget.checked);
  };
  return (
    <>
      <FormRow>
        <TooltipFormCheck
          kind="forwardingFilters"
          checked={$enabledForwardingFilters.value}
          onChange={onChangeSwitch}
          disabled={disabled}
        >
          forwardingFilters
        </TooltipFormCheck>
      </FormRow>
      {$enabledForwardingFilters.value ? (
        <JSONInputField
          controlId="forwardingFilters"
          placeholder="forwardingFiltersを指定"
          value={$forwardingFilters.value}
          setValue={(value) => setForwardingFilters(value)}
          disabled={disabled}
        />
      ) : null}
    </>
  );
};
