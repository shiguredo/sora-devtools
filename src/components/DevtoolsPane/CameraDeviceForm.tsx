import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setCameraDevice } from "@/app/actions";
import { $cameraDevice, $connectionStatus, $sora, $video } from "@/app/store";
import { FormRow } from "@/components/Form";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const CameraDeviceForm: FunctionComponent = () => {
  const disabled = !($sora.value && $connectionStatus.value === "connected"
    ? $sora.value.video
    : $video.value);
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setCameraDevice(event.currentTarget.checked);
  };
  return (
    <FormRow>
      <TooltipFormCheck
        kind="cameraDevice"
        checked={$cameraDevice.value}
        onChange={onChange}
        disabled={disabled}
      >
        Enable camera device
      </TooltipFormCheck>
    </FormRow>
  );
};
