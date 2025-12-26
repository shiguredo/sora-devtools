import { FormGroup } from "react-bootstrap";

import { cameraDevice, connectionStatus, setCameraDevice, sora, video } from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function CameraDeviceForm() {
  const disabled = !(sora.value && connectionStatus.value === "connected"
    ? sora.value.video
    : video.value);
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setCameraDevice(target.checked);
  };
  return (
    <FormGroup className="form-inline" controlId="cameraDevice">
      <TooltipFormCheck
        kind="cameraDevice"
        checked={cameraDevice.value}
        onChange={onChange}
        disabled={disabled}
      >
        Enable camera device
      </TooltipFormCheck>
    </FormGroup>
  );
}
