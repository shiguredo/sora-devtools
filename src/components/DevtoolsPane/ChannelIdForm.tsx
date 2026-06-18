import { FormGroup, FormInput } from "@/components/ui";

import { setChannelId } from "@/app/actions";
import { channelId, isFormDisabled } from "@/app/signals";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function ChannelIdForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setChannelId(target.value);
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="channelId">
      <TooltipFormLabel kind="channelId">channelId:</TooltipFormLabel>
      <FormInput
        type="text"
        placeholder="ChannelIdを指定"
        value={channelId.value}
        onChange={onChange}
        disabled={isFormDisabled.value}
      />
    </FormGroup>
  );
}
