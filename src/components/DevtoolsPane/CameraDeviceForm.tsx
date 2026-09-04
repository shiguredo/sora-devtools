import { FormGroup } from "@/components/ui";

import { setCameraDeviceAction } from "@/app/actions";
import {
  cameraDevice,
  connectionStatus,
  mediaType,
  setCameraDevice,
  sora,
  video,
} from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function CameraDeviceForm() {
  const disabled = !(sora.value && connectionStatus.value === "connected"
    ? sora.value.video
    : video.value);
  const onChange = async (event: Event): Promise<void> => {
    const target = event.target as HTMLInputElement;
    if (mediaType.value === "getUserMedia" || mediaType.value === "fakeMedia") {
      try {
        await setCameraDeviceAction(target.checked);
      } catch {
        // アラートは setCameraDeviceAction 内で表示済みのため、ここでは reject のみ処理する
      }
      return;
    }
    setCameraDevice(target.checked);
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="cameraDevice">
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
