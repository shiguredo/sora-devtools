import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setClientId, setEnabledClientId } from "@/app/actions";
import { $clientId, $connectionStatus, $enabledClientId } from "@/app/store";
import { FormRow, FormInput } from "@/components/Form";
import { isFormDisabled } from "@/utils";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const ClientIdForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledClientId(event.currentTarget.checked);
  };
  const onChangeText = (event: TargetedEvent<HTMLInputElement>): void => {
    setClientId(event.currentTarget.value);
  };
  return (
    <>
      <FormRow>
        <TooltipFormCheck
          kind="clientId"
          checked={$enabledClientId.value}
          onChange={onChangeSwitch}
          disabled={disabled}
        >
          clientId
        </TooltipFormCheck>
      </FormRow>
      {$enabledClientId.value ? (
        <FormInput
          type="text"
          placeholder="ClientIdを指定"
          value={$clientId.value}
          onChange={onChangeText}
          disabled={disabled}
          className="w-[500px]"
        />
      ) : null}
    </>
  );
};
