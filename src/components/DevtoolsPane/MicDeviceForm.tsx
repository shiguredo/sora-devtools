import { FormGroup } from "@/components/ui";

import { setMicDeviceAction } from "@/app/actions";
import { audio, connectionStatus, mediaType, micDevice, setMicDevice, sora } from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function MicDeviceForm() {
  const disabled = !(sora.value && connectionStatus.value === "connected"
    ? sora.value.audio
    : audio.value);
  const onChange = async (event: Event): Promise<void> => {
    const target = event.target as HTMLInputElement;
    if (mediaType.value === "getUserMedia" || mediaType.value === "fakeMedia") {
      try {
        await setMicDeviceAction(target.checked);
      } catch {
        // アラートは setMicDeviceAction 内で表示済みのため、ここでは reject のみ処理する
      }
      return;
    }
    setMicDevice(target.checked);
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="micDevice">
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
