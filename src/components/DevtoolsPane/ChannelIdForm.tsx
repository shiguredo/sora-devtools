import { FormControl, FormGroup } from "react-bootstrap";

import { setChannelId } from "@/app/actions";
import { channelId, isFormDisabled } from "@/app/signals";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function ChannelIdForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setChannelId(target.value);
  };
  return (
    <FormGroup className="form-inline" controlId="channelId">
      <TooltipFormLabel kind="channelId">channelId:</TooltipFormLabel>
      <FormControl
        type="text"
        placeholder="ChannelIdを指定"
        value={channelId.value}
        onChange={onChange}
        disabled={isFormDisabled.value}
      />
    </FormGroup>
  );
}
