import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setChannelId } from "@/app/actions";
import { $channelId, $connectionStatus } from "@/app/store";
import { FormRow, FormInput } from "@/components/Form";
import { isFormDisabled } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const ChannelIdForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setChannelId(event.currentTarget.value);
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="channelId">channelId:</TooltipFormLabel>
      <FormInput
        type="text"
        placeholder="ChannelIdを指定"
        value={$channelId.value}
        onChange={onChange}
        disabled={disabled}
        className="flex-1 min-w-80"
      />
    </FormRow>
  );
};
