import { FormGroup } from "react-bootstrap";

import { audio, connectionStatus, micDevice, setMicDevice, sora } from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function MicDeviceForm() {
  const disabled = !(sora.value && connectionStatus.value === "connected"
    ? sora.value.audio
    : audio.value);
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setMicDevice(target.checked);
  };
  return (
    <FormGroup className="form-inline" controlId="micDevice">
      <TooltipFormCheck
        kind="micDevice"
        checked={micDevice.value}
        onChange={onChange}
        disabled={disabled}
      >
        Enable mic device
      </TooltipFormCheck>
    </FormGroup>
  );
}
