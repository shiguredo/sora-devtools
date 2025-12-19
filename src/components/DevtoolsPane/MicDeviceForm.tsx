import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setMicDevice } from "@/app/actions";
import { $audio, $connectionStatus, $micDevice, $sora } from "@/app/store";
import { FormRow } from "@/components/Form";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const MicDeviceForm: FunctionComponent = () => {
  const disabled = !($sora.value && $connectionStatus.value === "connected"
    ? $sora.value.audio
    : $audio.value);
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setMicDevice(event.currentTarget.checked);
  };
  return (
    <FormRow>
      <TooltipFormCheck
        kind="micDevice"
        checked={$micDevice.value}
        onChange={onChange}
        disabled={disabled}
      >
        Enable mic device
      </TooltipFormCheck>
    </FormRow>
  );
};
