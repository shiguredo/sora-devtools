import { FormGroup, FormSelect } from "@/components/ui";

import { setVideoInput, updateMediaStream } from "@/app/actions";
import { videoInput, videoInputDevices } from "@/app/signals";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function VideoInputForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    setVideoInput(target.value);
    void updateMediaStream();
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="videoInput">
      <TooltipFormLabel kind="videoInput">videoInput:</TooltipFormLabel>
      <FormSelect
        name="videoInput"
        value={videoInput.value}
        onChange={onChange}
        disabled={videoInputDevices.value.length === 0}
      >
        <option value="">未指定</option>
        {videoInputDevices.value.map((deviceInfo) => {
          return (
            <option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>
              {deviceInfo.label}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
}
