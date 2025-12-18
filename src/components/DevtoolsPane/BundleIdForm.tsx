import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setBundleId, setEnabledBundleId } from "@/app/actions";
import { $bundleId, $connectionStatus, $enabledBundleId } from "@/app/store";
import { FormRow, FormInput } from "@/components/Form";
import { isFormDisabled } from "@/utils";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const BundleIdForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledBundleId(event.currentTarget.checked);
  };
  const onChangeText = (event: TargetedEvent<HTMLInputElement>): void => {
    setBundleId(event.currentTarget.value);
  };
  return (
    <>
      <FormRow>
        <TooltipFormCheck
          kind="bundleId"
          checked={$enabledBundleId.value}
          onChange={onChangeSwitch}
          disabled={disabled}
        >
          bundleId
        </TooltipFormCheck>
      </FormRow>
      {$enabledBundleId.value ? (
        <FormInput
          type="text"
          placeholder="bundleIdを指定"
          value={$bundleId.value}
          onChange={onChangeText}
          disabled={disabled}
          className="w-[500px]"
        />
      ) : null}
    </>
  );
};
