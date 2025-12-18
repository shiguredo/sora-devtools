import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setReconnect } from "@/app/actions";
import { $connectionStatus, $reconnect } from "@/app/store";
import { FormRow } from "@/components/Form";
import { isFormDisabled } from "@/utils";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const ReconnectForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setReconnect(event.currentTarget.checked);
  };
  return (
    <FormRow>
      <TooltipFormCheck
        kind="reconnect"
        checked={$reconnect.value}
        onChange={onChange}
        disabled={disabled}
      >
        reconnect
      </TooltipFormCheck>
    </FormRow>
  );
};
