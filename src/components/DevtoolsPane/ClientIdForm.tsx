import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setClientId, setEnabledClientId } from "@/app/actions";
import { $clientId, $connectionStatus } from "@/app/store";
import { FormInput } from "@/components/Form";
import { isFormDisabled } from "@/utils";

export const ClientIdForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChangeText = (event: TargetedEvent<HTMLInputElement>): void => {
    const value = event.currentTarget.value;
    setClientId(value);
    setEnabledClientId(value !== "");
  };
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-slate-700 whitespace-nowrap">clientId:</label>
      <FormInput
        type="text"
        placeholder="空白=未指定"
        value={$clientId.value}
        onChange={onChangeText}
        disabled={disabled}
        className="flex-1"
      />
    </div>
  );
};
