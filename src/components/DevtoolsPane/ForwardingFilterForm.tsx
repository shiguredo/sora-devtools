import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setEnabledForwardingFilter, setForwardingFilter } from "@/app/actions";
import { $connectionStatus, $enabledForwardingFilter, $forwardingFilter } from "@/app/store";
import { FormRow } from "@/components/Form";
import { isFormDisabled } from "@/utils";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const ForwardingFilterForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledForwardingFilter(event.currentTarget.checked);
  };
  return (
    <>
      <FormRow>
        <TooltipFormCheck
          kind="forwardingFilter"
          checked={$enabledForwardingFilter.value}
          onChange={onChangeSwitch}
          disabled={disabled}
        >
          forwardingFilter
        </TooltipFormCheck>
      </FormRow>
      {$enabledForwardingFilter.value ? (
        <JSONInputField
          controlId="forwardingFilter"
          placeholder="forwardingFilterを指定"
          value={$forwardingFilter.value}
          setValue={(value) => setForwardingFilter(value)}
          disabled={disabled}
        />
      ) : null}
    </>
  );
};
